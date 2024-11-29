import { useState } from 'react';

// import { useTranslation } from 'react-i18next';
import MnemonicWord from './components/MnemonicWord';
import { BottomChevronIconContainer, Container, MarginRightTypography, MnemonicContainer, TopContainer, ViewIconContainer } from './styled';
import IconTextButton from '../common/IconTextButton';

import BottomChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

type MnemonicBoxProps = {
  rawMnemonic: string;
  onClickMnemonicBits?: () => void;
};

export default function MnemonicBox({ rawMnemonic }: MnemonicBoxProps) {
  // const { t } = useTranslation();
  const [isViewMnemonic, setIsViewMnemonic] = useState(false);

  const splitedMnemonic = rawMnemonic.split(' ');

  const mnemonicWordCounts = splitedMnemonic.length;

  return (
    <Container>
      <TopContainer>
        <IconTextButton
          trailingIcon={<ViewIconContainer>{isViewMnemonic ? <ViewHideIcon /> : <ViewIcon />}</ViewIconContainer>}
          onClick={() => {
            setIsViewMnemonic(!isViewMnemonic);
          }}
        >
          {/* <MarginRightTypography variant="b2_M">{t('components.Mnemonic.index.seedPhrase')}</MarginRightTypography> */}
          <MarginRightTypography variant="b2_M">{'Seed Phrase'}</MarginRightTypography>
        </IconTextButton>
        <IconTextButton
          trailingIcon={
            <BottomChevronIconContainer>
              <BottomChevronIcon />
            </BottomChevronIconContainer>
          }
        >
          <MarginRightTypography variant="b3_M">
            {/* {mnemonicWordCounts === 12 ? t('components.Mnemonic.index.twelveWords') : t('components.Mnemonic.index.twentyFourWords')} */}
            {mnemonicWordCounts === 12 ? '12 words' : '24 words'}
          </MarginRightTypography>
        </IconTextButton>
      </TopContainer>
      <MnemonicContainer>
        {splitedMnemonic.map((item, index) => (
          <MnemonicWord key={index} index={index} word={item} />
        ))}
      </MnemonicContainer>
    </Container>
  );
}
