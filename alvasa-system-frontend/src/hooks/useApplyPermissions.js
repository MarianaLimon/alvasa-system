import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPermissions } from '../utils/permissions/applyPermissions';
import permisosConfig from '../utils/permissions/config';

export default function useApplyPermissions({ permissions = [], isMaster = false, loading = false }) {
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // <-- espera a tener usuario

    const apply = () => {
      applyPermissions({
        path: location.pathname,
        permissions,
        config: permisosConfig,
        isMaster,
      });
    };

    apply();

    const observer = new MutationObserver(() => Promise.resolve().then(apply));
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [location.pathname, permissions, isMaster, loading]);
}
