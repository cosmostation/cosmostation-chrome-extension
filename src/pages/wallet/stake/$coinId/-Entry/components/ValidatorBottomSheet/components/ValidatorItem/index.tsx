import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import type { BaseOptionButtonProps } from '@/components/common/BaseOptionButton';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import NumberTypo from '@/components/common/NumberTypo';
import type { ValidatorStatus } from '@/types/cosmos/validator';

import { StyledValidatorImage, ValidatorNameContainer, VotingPowerContainer } from './styled';

type ValidatorButtonProps = BaseOptionButtonProps & {
  validatorName: string;
  validatorAddress: string;
  votingPower: string;
  commission: string;
  validatorImage?: string;
  status?: ValidatorStatus;
};

const ValidatorButton = forwardRef<HTMLButtonElement, ValidatorButtonProps>(
  ({ validatorName, votingPower, commission, validatorImage, status, ...remainder }, ref) => {
    const { t } = useTranslation();

    return (
      <BaseOptionButton
        {...remainder}
        ref={remainder.isActive ? ref : undefined}
        disableRightChevron
        leftContent={<StyledValidatorImage imageURL={validatorImage} status={status} />}
        leftSecondHeader={
          <ValidatorNameContainer>
            <Base1300Text variant="b2_M">{validatorName}</Base1300Text>
          </ValidatorNameContainer>
        }
        leftSecondBody={
          <VotingPowerContainer>
            <Base1000Text variant="b4_R">
              {`${t('pages.wallet.stake.$coinId.components.ValidatorBottomSheet.components.ValidatorItem.index.votingPower')} :`}
            </Base1000Text>
            &nbsp;
            <NumberTypo typoOfIntegers="h7n_M">{votingPower}</NumberTypo>
          </VotingPowerContainer>
        }
        rightContent={
          <Base1300Text variant="b2_M">
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={2}>
              {commission}
            </NumberTypo>
            &nbsp; %
          </Base1300Text>
        }
      />
    );
  },
);

ValidatorButton.displayName = 'ValidatorButton';

export default ValidatorButton;
