import { Typography } from '@mui/material';

import { SideTextButton } from './styled';

import WalletIcon from 'assets/images/icons/Wallet14.svg';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  children?: JSX.Element;
};

export default function BalanceButton({ ...remainder }: IconTextButtonProps) {
  return (
    <SideTextButton {...remainder} type="button">
      <WalletIcon />
      <Typography variant="b4_R">1,000.000000 USDT</Typography>
    </SideTextButton>
  );
}
