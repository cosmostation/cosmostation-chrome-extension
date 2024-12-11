import { useTranslation } from 'react-i18next';
import Image from 'components/common/Image';
import copy from 'copy-to-clipboard';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { toastSuccess } from '@/utils/toast';

import {
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

import CopyIcon from '@/assets/images/icons/Paste20.svg';

type PrivateKeyAccordion = {
  name: string;
  image: string | null;
  hdPath: string;
  privateKey: string;
  arialControls: string;
  id: string;
};

export default function PrivateKeyAccordion({ name, image, hdPath, privateKey, arialControls, id }: PrivateKeyAccordion) {
  const { t } = useTranslation();

  const copyToClipboard = () => {
    copy(privateKey);
    toastSuccess(t('pages.view.multi-chain-privateKey.components.index.copied'));
  };

  return (
    <StyledChainAccordion>
      <StyledChainAccordionSummary aria-controls={arialControls} id={id}>
        <ItemLeftContainer>
          <ItemLeftImageContainer>
            <Image src={image} />
          </ItemLeftImageContainer>
          <ItemLeftTextContainer>
            <Base1300Text variant="b2_M">{name}</Base1300Text>
            <ItemLeftHdPathTextContainer>
              <Base1000Text variant="b4_R">{t('pages.view.multi-chain-privateKey.components.index.hdPath')}</Base1000Text>
              &nbsp;
              <Base1000Text variant="h7n_M">{hdPath}</Base1000Text>
            </ItemLeftHdPathTextContainer>
          </ItemLeftTextContainer>
        </ItemLeftContainer>
      </StyledChainAccordionSummary>
      <StyledChainAccordionDetails>
        <PrivateKeyViewer>
          <PrivateKeyText variant="b3_M_Multiline">{privateKey}</PrivateKeyText>

          <StyledIconButton onClick={copyToClipboard}>
            <CopyIcon />
          </StyledIconButton>
        </PrivateKeyViewer>
      </StyledChainAccordionDetails>
    </StyledChainAccordion>
  );
}
