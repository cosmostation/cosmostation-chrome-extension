import { useTranslation } from 'react-i18next';

import CopyButton from '@/components/CopyButton';

import { Container, FullContractAddressText, FullContractAddressTextContainer, TitleText } from './styled';

type ContractAddressProps = {
  contractAddress: string;
  title?: string;
  toastText?: string;
};

export default function ContractAddress({ contractAddress, title }: ContractAddressProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <CopyButton
        varient="dark"
        iconSize={{
          width: 1.6,
          height: 1.6,
        }}
        copyString={contractAddress}
        leading={<TitleText variant="h3_B">{title || t('pages.coin-detail.components.ContractAddress.index.contract')}</TitleText>}
      />
      <FullContractAddressTextContainer>
        <FullContractAddressText variant="b3_M">{contractAddress}</FullContractAddressText>
      </FullContractAddressTextContainer>
    </Container>
  );
}
