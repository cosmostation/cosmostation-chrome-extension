import { Typography } from '@mui/material';

import NumberTypo from '@/components/common/NumberTypo';
import type { Asset } from '@/types/asset';
import { toDisplayDenomAmount } from '@/utils/numbers';

import { AmountContainer, SideTextButton } from './styled';

import WalletIcon from 'assets/images/icons/Wallet14.svg';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  coin: Asset;
  balance: string;
  leftComponent?: JSX.Element;
  children?: JSX.Element;
};

export default function BalanceButton({ coin, balance, leftComponent, ...remainder }: IconTextButtonProps) {
  const { symbol, decimals } = coin;

  const displayAvailableAmount = toDisplayDenomAmount(balance, decimals);

  return (
    <SideTextButton {...remainder} type="button">
      {leftComponent ? leftComponent : <WalletIcon />}
      <AmountContainer>
        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
          {displayAvailableAmount}
        </NumberTypo>
        &nbsp;
        <Typography variant="h8n_M">{symbol}</Typography>
      </AmountContainer>
    </SideTextButton>
  );
}
