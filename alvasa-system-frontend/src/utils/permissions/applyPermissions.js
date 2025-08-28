const DEFAULT_TOOLTIP = 'Tu rol no cuenta con permisos para ejecutar esta acción';

function blockInteraction(ev) { ev.preventDefault(); ev.stopPropagation(); }

function disableElement(el, tooltipMsg) {
  if (!el.dataset.permBound) {
    el.addEventListener('click', blockInteraction, { capture: true });
    el.dataset.permBound = '1';
  }
  el.classList.add('perm-disabled', 'perm-has-tooltip');
  el.setAttribute('aria-disabled', 'true');
  el.setAttribute('tabindex', '-1');
  el.setAttribute('data-perm-tooltip', tooltipMsg || DEFAULT_TOOLTIP);
}

function enableElement(el) {
  if (el.dataset.permBound) {
    el.removeEventListener('click', blockInteraction, { capture: true });
    delete el.dataset.permBound;
  }
  el.classList.remove('perm-disabled', 'perm-has-tooltip');
  el.removeAttribute('aria-disabled');
  el.removeAttribute('tabindex');
  el.removeAttribute('data-perm-tooltip');
  el.removeAttribute('title');
}

// --- NUEVO: matching de rutas con comodines y :params ---
function patternToRegex(pattern) {
  // '/cotizaciones*' -> startsWith
  if (pattern.endsWith('*')) {
    const base = pattern.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${base}`);
  }
  // '/cotizaciones/:id' -> '/cotizaciones/[^/]+' (exacto)
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const withParams = escaped.replace(/:\\w+/g, '[^/]+');
  return new RegExp(`^${withParams}$`);
}

export function applyPermissions({ path, permissions, config, isMaster = false }) {
  // normaliza permisos (cliente puede mandarlos en MAY/MIN)
  const permSet = new Set((permissions || []).map(p => String(p).toLowerCase().trim()));
  const allRules = [];

  // recolecta reglas que hagan match con la ruta actual
  for (const [pattern, rules] of Object.entries(config || {})) {
    const rx = patternToRegex(pattern);
    if (rx.test(path)) allRules.push(...(rules || []));
  }

  // si no hubo match exacto, intenta fallback por prefijo de segmento mayor
  if (allRules.length === 0) {
    for (const [pattern, rules] of Object.entries(config || {})) {
      if (path.startsWith(pattern)) allRules.push(...(rules || []));
    }
  }

  // aplica
  allRules.forEach(rule => {
    const nodes = document.querySelectorAll(rule.selector);
    const required = String(rule.perm || '').toLowerCase().trim();
    nodes.forEach(el => {
      if (isMaster || permSet.has(required)) {
        enableElement(el);
      } else {
        disableElement(el, rule.tooltip);
      }
    });
  });
}
