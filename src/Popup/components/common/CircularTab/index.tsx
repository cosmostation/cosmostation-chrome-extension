import type { TabProps, TabsProps } from '@mui/material';

import { CircularStyledTab, CircularStyledTabs, CircularTabPanelContainer } from './styled';

export function CircularTabs(props: TabsProps) {
  return <CircularStyledTabs {...props} />;
}

export function CircularTab(props: TabProps) {
  return <CircularStyledTab disableRipple {...props} />;
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
