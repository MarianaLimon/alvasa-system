// src/components/procesoOperativo/EstatusProcesoBadge.jsx
export default function EstatusProcesoBadge({ estatus, estatusCodigo, total = 10 }) {
  const code = Number(estatusCodigo || 0);
  // const pct = Math.round((code / total) * 100);

  // Color personalizado para la barra
  // const PROGRESS_COLOR = '#5751AB';

  // (opcional) tono del badge, lo dejo igual
  const tone =
    code >= 9 ? 'success' :
    code >= 7 ? 'primary' :
    code >= 4 ? 'warning' : 'secondary';

  return (
    <div>
      <span className={`badge bg-${tone} estatus`} style={{ fontSize: '0.8rem' }}>
        {estatus || '—'}
      </span>
      {/* <div className="progress mt-2" style={{ height: 8 }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{
            width: `${pct}%`,
            backgroundColor: PROGRESS_COLOR  
          }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div> */}
    </div>
  );
}
