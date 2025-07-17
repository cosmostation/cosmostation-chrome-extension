import type { LinearProgressProps } from '@mui/material/LinearProgress';

import { StyledLinearProgressBar } from './styled';

export default function LinearProgressBar({ ...remainder }: LinearProgressProps) {
  return <StyledLinearProgressBar {...remainder} />;
}
