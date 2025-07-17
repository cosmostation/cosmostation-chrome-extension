import type { TabProps } from '@mui/material/Tab';
import type { TabsProps } from '@mui/material/Tabs';

import { StyledTab, StyledTabs, TabPanelContainer, TabsContainer, TabsWrapper } from './styled';

export function FilledTabs(props: TabsProps) {
  return (
    <TabsWrapper>
      <TabsContainer>
        <StyledTabs {...props} />
      </TabsContainer>
    </TabsWrapper>
  );
}

export function FilledTab(props: TabProps) {
  return <StyledTab {...props} disableRipple />;
}

type TabPanelProps = {
  children?: React.ReactNode;
  className?: string;
  dir?: string;
  index: number;
  value: number;
};

export function FilledTabPanel(props: TabPanelProps) {
  const { children, value, index, ...remainder } = props;

  return (
    <TabPanelContainer role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`} aria-labelledby={`full-width-tab-${index}`} {...remainder}>
      {value === index && children}
    </TabPanelContainer>
  );
}
