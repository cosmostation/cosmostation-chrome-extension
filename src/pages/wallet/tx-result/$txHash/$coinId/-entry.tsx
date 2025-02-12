import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter/index.tsx';
import Base1000Text from '@/components/common/Base1000Text/index.tsx';
import Base1300Text from '@/components/common/Base1300Text/index.tsx';
import Button from '@/components/common/Button/index.tsx';
import Image from '@/components/common/Image/index.tsx';
import TextButton from '@/components/common/TextButton/index.tsx';
import { Route as Dashboard } from '@/pages';
import animationData from '@/assets/animation/loading.json';

import { Container, ExplorerIconContainer, FooterContainer, StyledOutlinedChipButton, TxHashTextContainer, TxResultContainer } from './-styled.tsx';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';

import TxSuccessImage from '@/assets/images/tx/TxSuccess.png';
import { useState } from 'react';
import Lottie from 'lottie-react';

type EntryProps = {
  coinId: string;
  txHash: string;
};

export default function Entry({ coinId, txHash }: EntryProps) {
  console.log('🚀 ~ Entry ~ coinId:', coinId);

  const [showResult, setShowResult] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const title = (() => {
    if (!showResult) return 'Checking the transaction status...';

    return t('pages.wallet.tx-result.$txHash.$coinId.entry.txSuccess');
  })();

  const subTitle = (() => {
    if (!showResult) return 'The transaction is currently in progress.\nPlease wait a moment';

    return txHash;
  })();

  setTimeout(() => {
    setShowResult(true);
  }, 3000);

  return (
    <>
      <BaseBody>
        <Container>
          <TxResultContainer>
            {showResult ? (
              <Image src={TxSuccessImage} />
            ) : (
              <Lottie
                style={{
                  width: '8.2rem',
                  height: '8.2rem',
                }}
                animationData={animationData}
                loop={true}
              />
            )}
            <Base1300Text variant="b1_B">{title}</Base1300Text>
            <TxHashTextContainer>
              <Base1000Text variant="b3_R_Multiline">{subTitle}</Base1000Text>
            </TxHashTextContainer>
            {showResult && (
              <StyledOutlinedChipButton>
                <ExplorerIconContainer>
                  <ExplorerIcon />
                </ExplorerIconContainer>

                <Base1300Text variant="b3_M">{t('pages.wallet.tx-result.$txHash.$coinId.entry.goToExplorer')}</Base1300Text>
              </StyledOutlinedChipButton>
            )}
          </TxResultContainer>
        </Container>
      </BaseBody>
      <BaseFooter>
        {showResult && (
          <FooterContainer>
            <Base1300Text variant="b3_R">{t('pages.wallet.tx-result.$txHash.$coinId.entry.addAddresstoBook')}</Base1300Text>
            <TextButton variant="hyperlink" typoVarient="b2_M">
              {t('pages.wallet.tx-result.$txHash.$coinId.entry.addToAddress')}
            </TextButton>
          </FooterContainer>
        )}
        <Button
          onClick={() => {
            navigate({
              to: Dashboard.to,
              replace: true,
            });
          }}
        >
          {t('pages.wallet.tx-result.$txHash.$coinId.entry.confirm')}
        </Button>
      </BaseFooter>
    </>
  );
}
