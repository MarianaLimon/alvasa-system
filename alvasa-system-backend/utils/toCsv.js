function escapeCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  const mustQuote = /[",\n\r]/.test(s) || s.startsWith('=');
  if (!mustQuote) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * @param {Array<Object>} rows
 * @param {Array<{key:string,label:string,transform?:(v:any,row:any)=>any}>} columns
 * @returns {string} CSV con BOM UTF-8
 */
function toCsv(rows, columns) {
  const header = columns.map(c => escapeCell(c.label)).join(',');
  const lines = rows.map(row =>
    columns.map(c => {
      const raw = row[c.key];
      const val = typeof c.transform === 'function' ? c.transform(raw, row) : raw;
      return escapeCell(val ?? '');
    }).join(',')
  );
  return '\uFEFF' + [header, ...lines].join('\r\n');
}

module.exports = { toCsv };
