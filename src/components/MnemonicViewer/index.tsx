import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';

import type { MnemonicBits } from '@/pages/account/create-wallet/mnemonic/-entry';

import MnemonicBitsPopover from './components/MnemonicBitsPopover';
import MnemonicWord from './components/MnemonicWord';
import {
  BottomChevronIconContainer,
  Container,
  ControlInputButtonContainer,
  ControlInputText,
  IconContainer,
  MarginRightTypography,
  MnemonicContainer,
  StyledIconTextButton,
  TopContainer,
  ViewIconContainer,
} from './styled';
import IconTextButton from '../common/IconTextButton';

import BottomChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import PasteIcon from '@/assets/images/icons/Paste18.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

type MnemonicViewerProp = {
  rawMnemonic: string;
  onClickMnemonicBits?: (bits: MnemonicBits) => void;
};

export default function MnemonicViewer({ rawMnemonic, onClickMnemonicBits }: MnemonicViewerProp) {
  const { t } = useTranslation();

  const [isViewMnemonic, setIsViewMnemonic] = useState(false);

  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);

  const splitedMnemonic = rawMnemonic.split(' ');

  const displayMnemonic = (() => {
    if (!isViewMnemonic) {
      return new Array(splitedMnemonic.length).fill('****');
    }
    return splitedMnemonic;
  })();

  const mnemonicWordCounts = displayMnemonic.length;

  const copyToClipboard = () => {
    copy(rawMnemonic);
  };

  return (
    <>
      <Container>
        <TopContainer>
          <IconTextButton
            trailingIcon={<ViewIconContainer>{isViewMnemonic ? <ViewHideIcon /> : <ViewIcon />}</ViewIconContainer>}
            onClick={() => {
              setIsViewMnemonic(!isViewMnemonic);
            }}
          >
            <MarginRightTypography variant="b2_M">{t('components.MnemonicViewer.index.seedPhrase')}</MarginRightTypography>
          </IconTextButton>
          <IconTextButton
            onClick={(event) => {
              setIsOpenPopover(true);
              setPopoverAnchorEl(event.currentTarget);
            }}
            trailingIcon={
              <BottomChevronIconContainer>
                <BottomChevronIcon />
              </BottomChevronIconContainer>
            }
          >
            <MarginRightTypography variant="b3_M">
              {mnemonicWordCounts === 12 ? t('components.MnemonicViewer.index.twelveWords') : t('components.MnemonicViewer.index.twentyFourWords')}
            </MarginRightTypography>
          </IconTextButton>
        </TopContainer>
        <MnemonicContainer>
          {displayMnemonic.map((item, index) => (
            <MnemonicWord key={index} index={index} word={item} isViewMnemonic={isViewMnemonic} />
          ))}
        </MnemonicContainer>
        <ControlInputButtonContainer>
          <StyledIconTextButton
            leadingIcon={
              <IconContainer>
                <PasteIcon />
              </IconContainer>
            }
            onClick={copyToClipboard}
          >
            <ControlInputText variant="b3_R">{t('components.MnemonicViewer.index.copy')}</ControlInputText>
          </StyledIconTextButton>
        </ControlInputButtonContainer>
      </Container>
      <MnemonicBitsPopover
        open={isOpenPopover}
        onClose={() => {
          setIsOpenPopover(false);
        }}
        onClickMnemonicBits={(bits) => {
          onClickMnemonicBits?.(bits);
        }}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
    </>
  );
}
