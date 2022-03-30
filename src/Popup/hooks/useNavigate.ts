import type { NavigateOptions } from 'react-router-dom';
import { useLocation, useNavigate as useBaseNavigate } from 'react-router-dom';

import type { Path } from '~/types/route';

export function useNavigate() {
  const baseNavigate = useBaseNavigate();
  const { pathname } = useLocation();

  const navigate = (to: Path, options?: NavigateOptions & { isDuplicateCheck?: boolean }) => {
    if (options?.isDuplicateCheck && pathname === to) {
      return;
    }

    baseNavigate(to, options);
  };

  const navigateBack = (delta = -1) => {
    if (window.history.length + delta > 2) {
      baseNavigate(delta);
    } else {
      navigate('/');
    }
  };

  return { navigate, navigateBack };
}
