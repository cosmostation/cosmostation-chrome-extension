import type { NavigateOptions } from 'react-router-dom';
import { useNavigate as useBaseNavigate } from 'react-router-dom';

import type { Path } from '~/types/route';

export function useNavigate() {
  const baseNavigate = useBaseNavigate();

  const navigate = (to: Path, options?: NavigateOptions) => {
    baseNavigate(to, options);
  };

  const navigateBack = (delta = -1) => {
    baseNavigate(delta);
  };

  return { navigate, navigateBack };
}
