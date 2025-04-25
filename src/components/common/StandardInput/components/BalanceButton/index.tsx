import { Typography } from '@mui/material';

import NumberTypo from '@/components/common/NumberTypo';
import type { Asset } from '@/types/asset';
import { gt, toDisplayDenomAmount } from '@/utils/numbers';

import { AmountContainer, SideTextButton } from './styled';

import WalletIcon from 'assets/images/icons/Wallet14.svg';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  coin: Asset;
  balance: string;
  leftComponent?: JSX.Element;
  variant?: 'default' | 'zeroAsDash';
  children?: JSX.Element;
};

export default function BalanceButton({ coin, balance, leftComponent, variant = 'default', ...remainder }: IconTextButtonProps) {
  const { symbol, decimals } = coin;

  const displayAvailableAmount = toDisplayDenomAmount(balance, decimals);
  const isZero = !gt(displayAvailableAmount, '0');
  const showAsDash = variant === 'zeroAsDash' && isZero;

  return (
    <SideTextButton {...remainder} type="button">
      {leftComponent ? leftComponent : <WalletIcon />}
      <AmountContainer>
        {showAsDash ? (
          <Typography variant="h6n_M">-</Typography>
        ) : (
          <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
            {displayAvailableAmount}
          </NumberTypo>
        )}
        &nbsp;
        <Typography variant="h8n_M">{symbol}</Typography>
      </AmountContainer>
    </SideTextButton>
  );
}
