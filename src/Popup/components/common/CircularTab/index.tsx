import type { TabProps, TabsProps } from '@mui/material';

import { CircularTabPanelContainer, StyledCircularTab, StyledCircularTabs } from './styled';

export function CircularTabs(props: TabsProps) {
  return <StyledCircularTabs {...props} />;
}

export function CircularTab(props: TabProps) {
  return <StyledCircularTab disableRipple {...props} />;
}

type CircularTabPanelProps = {
  children?: React.ReactNode;
  className?: string;
  dir?: string;
  index: number;
  value: number;
};

export function CircularTabPanel(props: CircularTabPanelProps) {
  const { children, value, index, ...remainder } = props;

  return (
    <CircularTabPanelContainer
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...remainder}
    >
      {value === index && children}
    </CircularTabPanelContainer>
  );
}
