import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import NumberTypo from '@/components/common/NumberTypo';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AmountContainer, LeftBottomContainer, LeftContainer, RightContainer, ValueContainer } from './styled';

type FeeOption = {
  id: number;
  title: string;
  amount: string;
  symbol: string;
  value: string;
};

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  fee: FeeOption;
  isActive?: boolean;
};

export default function OptionButton({ fee, isActive, ...remainder }: OptionButtonProps) {
  const { t } = useTranslation();
  const { currency } = useExtensionStorageStore((state) => state);

  const amount = fee.amount;
  const value = fee.value;
  const symbol = fee.symbol;
  const title = fee.title;

  return (
    <BaseOptionButton
      leftContent={
        <LeftContainer>
          <Base1300Text variant="b2_M">{title}</Base1300Text>
          <LeftBottomContainer>
            <Base1000Text variant="b3_R">{`${t('components.Fee.EVMFee.components.FeeSettingBottomSheet.components.OptionButton.index.feeToken')}`}</Base1000Text>
            &nbsp;
            <Base1000Text variant="b3_M">{symbol}</Base1000Text>
          </LeftBottomContainer>
        </LeftContainer>
      }
      rightContent={
        <RightContainer>
          <AmountContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {amount}
            </NumberTypo>
            &nbsp;
            <Base1300Text variant="b4_M">{symbol}</Base1300Text>
          </AmountContainer>
          <ValueContainer>
            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency}>
              {value}
            </NumberTypo>
          </ValueContainer>
        </RightContainer>
      }
      isActive={isActive}
      disableRightChevron
      {...remainder}
    />
  );
}
