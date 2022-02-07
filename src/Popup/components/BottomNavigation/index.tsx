import { useState } from 'react';

import { StyledBottomNavigation, StyledBottomNavigationAction } from './styled';

import IconDashboard from '~/images/icons/Dashboard.svg';
import IconSetting from '~/images/icons/Setting.svg';
import IconWallet from '~/images/icons/Wallet.svg';

export default function BottomNavigation() {
  const [value, setValue] = useState('dashboard');

  return (
    <StyledBottomNavigation
      value={value}
      onChange={(_, newValue: string) => {
        setValue(newValue);
      }}
    >
      <StyledBottomNavigationAction icon={<IconDashboard />} value="dashboard" />
      <StyledBottomNavigationAction icon={<IconWallet />} value="wallet" />
      <StyledBottomNavigationAction icon={<IconSetting />} value="setting" />
    </StyledBottomNavigation>
  );
}
