import { Typography } from '@mui/material';

import NumberTypo from '@/components/common/NumberTypo';

import { AmountContainer, SideTextButton } from './styled';

import WalletIcon from 'assets/images/icons/Wallet14.svg';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  children?: JSX.Element;
};

export default function BalanceButton({ ...remainder }: IconTextButtonProps) {
  const displayAmount = '1000';
  const decimal = 6;
  const symbol = 'USDT';

  return (
    <SideTextButton {...remainder} type="button">
      <WalletIcon />
      <AmountContainer>
        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimal}>
          {displayAmount}
        </NumberTypo>
        &nbsp;
        <Typography variant="h8n_R">{symbol}</Typography>
      </AmountContainer>
    </SideTextButton>
  );
}
