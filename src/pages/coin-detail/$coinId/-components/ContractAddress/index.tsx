import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';

import IconTextButton from '@/components/common/IconTextButton';
import { toastSuccess } from '@/utils/toast';

import { Container, FullContractAddressText, IconContainer, TitleText } from './styled';

import PasteIcon from '@/assets/images/icons/Paste18.svg';

type ContractAddressProps = {
  contractAddress: string;
};

export default function ContractAddress({ contractAddress }: ContractAddressProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <IconTextButton
        onClick={() => {
          copy(contractAddress);
          toastSuccess(t('pages.coin-detail.components.ContractAddress.index.copied'));
        }}
        trailingIcon={
          <IconContainer>
            <PasteIcon />
          </IconContainer>
        }
      >
        <TitleText variant="h3_B">{t('pages.coin-detail.components.ContractAddress.index.contract')}</TitleText>
      </IconTextButton>
      <FullContractAddressText variant="b3_M">{contractAddress}</FullContractAddressText>
    </Container>
  );
}
