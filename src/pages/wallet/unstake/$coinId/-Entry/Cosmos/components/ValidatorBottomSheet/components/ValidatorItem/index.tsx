import { forwardRef } from 'react';

import Base1300Text from '@/components/common/Base1300Text';
import type { BaseOptionButtonProps } from '@/components/common/BaseOptionButton';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import { toDisplayDenomAmount } from '@/utils/numbers';

import { ImageContainer, StakedAmountTextContainer } from './styled';

type ValidatorButtonProps = BaseOptionButtonProps & {
  validatorName: string;
  validatorAddress: string;
  stakedAmount: string;
  decimals: number;
  validatorImage?: string;
};

const ValidatorButton = forwardRef<HTMLButtonElement, ValidatorButtonProps>(({ validatorName, validatorImage, stakedAmount, decimals, ...remainder }, ref) => {
  const displayStakedAmount = toDisplayDenomAmount(stakedAmount, decimals);

  return (
    <BaseOptionButton
      {...remainder}
      ref={ref}
      disableRightChevron
      leftContent={
        <ImageContainer>
          <Image src={validatorImage} />
        </ImageContainer>
      }
      leftSecondHeader={<Base1300Text variant="b2_M">{validatorName}</Base1300Text>}
      rightContent={
        <StakedAmountTextContainer>
          <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
            {displayStakedAmount}
          </NumberTypo>
        </StakedAmountTextContainer>
      }
    />
  );
});

ValidatorButton.displayName = 'ValidatorButton';

export default ValidatorButton;
