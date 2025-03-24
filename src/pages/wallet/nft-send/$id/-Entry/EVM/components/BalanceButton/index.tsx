import NumberTypo from '@/components/common/NumberTypo';

import { AmountContainer, SideTextButton } from './styled';

import WalletIcon from 'assets/images/icons/Wallet14.svg';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  balance: string;
  leftComponent?: JSX.Element;
  children?: JSX.Element;
};

export default function BalanceButton({ balance, leftComponent, ...remainder }: IconTextButtonProps) {
  return (
    <SideTextButton {...remainder} type="button">
      {leftComponent ? leftComponent : <WalletIcon />}
      <AmountContainer>
        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R">
          {balance}
        </NumberTypo>
      </AmountContainer>
    </SideTextButton>
  );
}
