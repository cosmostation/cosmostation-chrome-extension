import type { TabProps, TabsProps } from '@mui/material';

import { StyledTab, StyledTabs, TabPanelContainer, TabsContainer, TabsIndicator } from './styled';

export function Tabs(props: TabsProps) {
  return (
    <TabsContainer>
      <StyledTabs {...props} />
      <TabsIndicator />
    </TabsContainer>
  );
}

export function Tab(props: TabProps) {
  return <StyledTab {...props} />;
}

type TabPanelProps = {
  children?: React.ReactNode;
  className?: string;
  dir?: string;
  index: number;
  value: number;
};

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...remainder } = props;

  return (
    <TabPanelContainer role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`} aria-labelledby={`full-width-tab-${index}`} {...remainder}>
      {value === index && children}
    </TabPanelContainer>
  );
}
