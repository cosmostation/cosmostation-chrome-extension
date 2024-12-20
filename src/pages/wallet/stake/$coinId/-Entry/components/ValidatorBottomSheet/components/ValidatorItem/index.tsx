import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import type { BaseOptionButtonProps } from '@/components/common/BaseOptionButton';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';

import { ImageContainer, VotinPowerContainer } from './styled';

type ValidatorButtonProps = BaseOptionButtonProps & {
  validatorName: string;
  validatorAddress: string;
  votingPower: string;
  commission: string;
  validatorImage?: string;
};

export default function ValidatorButton({ validatorName, votingPower, commission, validatorImage, ...remainder }: ValidatorButtonProps) {
  const { t } = useTranslation();

  return (
    <BaseOptionButton
      {...remainder}
      disableRightChevron
      leftContent={
        <ImageContainer>
          <Image src={validatorImage} />
        </ImageContainer>
      }
      leftSecondHeader={<Base1300Text variant="b2_M">{validatorName}</Base1300Text>}
      leftSecondBody={
        <VotinPowerContainer>
          <Base1000Text variant="b4_R">
            {`${t('pages.wallet.stake.$coinId.components.ValidatorBottomSheet.components.ValidatorItem.index.votingPower')} :`}
          </Base1000Text>
          &nbsp;
          <Base1300Text variant="h7n_M">{votingPower}</Base1300Text>
        </VotinPowerContainer>
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
}
