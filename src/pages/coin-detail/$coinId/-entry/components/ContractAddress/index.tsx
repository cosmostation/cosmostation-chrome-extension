import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';

import IconTextButton from '@/components/common/IconTextButton';
import { toastSuccess } from '@/utils/toast';

import { Container, FullContractAddressText, FullContractAddressTextContainer, IconContainer, TitleText } from './styled';

import PasteIcon from '@/assets/images/icons/Paste18.svg';

type ContractAddressProps = {
  contractAddress: string;
  title?: string;
  toastText?: string;
};

export default function ContractAddress({ contractAddress, title, toastText }: ContractAddressProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <IconTextButton
        onClick={() => {
          copy(contractAddress);
          toastSuccess(toastText || t('pages.coin-detail.components.ContractAddress.index.copied'));
        }}
        trailingIcon={
          <IconContainer>
            <PasteIcon />
          </IconContainer>
        }
      >
        <TitleText variant="h3_B">{title || t('pages.coin-detail.components.ContractAddress.index.contract')}</TitleText>
      </IconTextButton>
      <FullContractAddressTextContainer>
        <FullContractAddressText variant="b3_M">{contractAddress}</FullContractAddressText>
      </FullContractAddressTextContainer>
    </Container>
  );
}
