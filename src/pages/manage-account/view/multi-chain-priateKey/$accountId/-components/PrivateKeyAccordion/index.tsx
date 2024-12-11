import { useTranslation } from 'react-i18next';
import Image from 'components/common/Image';
import copy from 'copy-to-clipboard';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { toastSuccess } from '@/utils/toast';

import {
  CopyIconContainer,
  ItemLeftContainer,
  ItemLeftHdPathTextContainer,
  ItemLeftImageContainer,
  ItemLeftTextContainer,
  PrivateKeyText,
  PrivateKeyViewer,
  StyledChainAccordion,
  StyledChainAccordionDetails,
  StyledChainAccordionSummary,
  StyledIconButton,
} from './styled';

import CopyIcon from '@/assets/images/icons/Paste18.svg';

type PrivateKeyAccordion = {
  isExpand: boolean;
  id: string;
  ariaControls: string;
  name: string;
  image: string | null;
  privateKey: string;
  handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
};

export default function PrivateKeyAccordion({ isExpand, ariaControls, id, name, image, privateKey, handleChange }: PrivateKeyAccordion) {
  const { t } = useTranslation();

  const copyToClipboard = () => {
    copy(privateKey);
    toastSuccess(t('pages.view.multi-chain-privateKey.components.index.copied'));
  };

  return (
    <StyledChainAccordion expanded={isExpand} onChange={handleChange('ethereum')}>
      <StyledChainAccordionSummary data-is-expanded={isExpand} data-is-exists={false} aria-controls={ariaControls} id={id}>
        <ItemLeftContainer>
          <ItemLeftImageContainer>
            <Image src={image} />
          </ItemLeftImageContainer>
          <ItemLeftTextContainer>
            <Base1300Text variant="b2_M">{name}</Base1300Text>
            <ItemLeftHdPathTextContainer>
              <Base1000Text variant="b4_R">{t('pages.view.multi-chain-privateKey.components.index.hdPath')}</Base1000Text>
              <Base1000Text variant="h7n_M">{'m/44’/118’/0’/0/1'}</Base1000Text>
            </ItemLeftHdPathTextContainer>
          </ItemLeftTextContainer>
        </ItemLeftContainer>
      </StyledChainAccordionSummary>
      {/* <StyledChainAccordionDetails data-is-exists={!!filteredEthereumNetworks.length}> */}
      <StyledChainAccordionDetails data-is-exists={false}>
        <PrivateKeyViewer>
          <PrivateKeyText variant="b3_M_Multiline">{privateKey}</PrivateKeyText>

          {/* TODO 아이콘 버튼 색상 조절 피쳐 추가 */}
          <StyledIconButton onClick={copyToClipboard}>
            <CopyIconContainer>
              <CopyIcon />
            </CopyIconContainer>
          </StyledIconButton>
        </PrivateKeyViewer>
      </StyledChainAccordionDetails>
    </StyledChainAccordion>
  );
}
