import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'react-lottie-player/dist/LottiePlayerLight';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter/index.tsx';
import Base1000Text from '@/components/common/Base1000Text/index.tsx';
import Base1300Text from '@/components/common/Base1300Text/index.tsx';
import Button from '@/components/common/Button/index.tsx';
import Image from '@/components/common/Image/index.tsx';
import TextButton from '@/components/common/TextButton/index.tsx';
import { TX_CONFIRMED_STATUS } from '@/constants/txStatus.ts';
import { useTxInfo } from '@/hooks/cosmos/useTxInfo.ts';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset.ts';
import { Route as Dashboard } from '@/pages';
import { Route as AddAddress } from '@/pages/general-setting/address-book/add-address';
import { isAxiosError } from '@/utils/axios.ts';
import { getUniqueChainId } from '@/utils/queryParamGenerator.ts';

import { Container, ExplorerIconContainer, FooterContainer, StyledOutlinedChipButton, TxHashTextContainer, TxResultContainer } from './styled.tsx';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';

import txFailedImage from '@/assets/images/tx/txFailed.png';
import txSuccessImage from '@/assets/images/tx/txSuccess.png';

import animationData from '@/assets/animation/loading.json';

type CosmosProps = {
  coinId: string;
  txHash?: string;
  address?: string;
};

export default function Cosmos({ coinId, txHash, address }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const txInfo = useTxInfo({
    coinId,
    txHash,
  });

  const selectedAsset = getCosmosAccountAsset();

  const txExplorerUrl = selectedAsset?.chain.explorer?.account && txHash ? selectedAsset.chain.explorer.tx.replace('${hash}', txHash) : '';

  const txConfirmedStatus = useMemo(() => {
    if (isAxiosError(txInfo.error) && txInfo.error?.response?.status && txInfo.error.response.status >= 400 && txInfo.error.response.status < 500) {
      return TX_CONFIRMED_STATUS.PENDING;
    }

    if (txInfo.data?.tx_response?.code !== undefined) {
      if (txInfo.data.tx_response?.code !== 0) return TX_CONFIRMED_STATUS.FAILED;

      if (txInfo.data.tx_response?.code === 0) return TX_CONFIRMED_STATUS.CONFIRMED;
    }

    return undefined;
  }, [txInfo.data?.tx_response?.code, txInfo.error]);

  const isTxConfirmed = txConfirmedStatus === TX_CONFIRMED_STATUS.CONFIRMED;
  const isTxFailed = txConfirmedStatus === TX_CONFIRMED_STATUS.FAILED || !txHash || txInfo.error;

  const title = (() => {
    if (isTxFailed) return t('pages.wallet.tx-result.entry.txFailTitle');

    if (isTxConfirmed) return t('pages.wallet.tx-result.entry.txSuccessTitle');

    return t('pages.wallet.tx-result.entry.txPendingTitle');
  })();

  const subTitle = (() => {
    if (isTxFailed) return t('pages.wallet.tx-result.entry.txFailSubTitle');

    if (isTxConfirmed) return txHash;

    return t('pages.wallet.tx-result.entry.txPendingSubTitle');
  })();

  const txStatusIndicator = (() => {
    if (isTxConfirmed) {
      return <Image src={txSuccessImage} />;
    }
    if (isTxFailed) {
      return <Image src={txFailedImage} />;
    }

    return (
      <Lottie
        play
        style={{
          width: '8.2rem',
          height: '8.2rem',
        }}
        animationData={animationData}
        loop={true}
      />
    );
  })();

  return (
    <>
      <BaseBody>
        <Container>
          <TxResultContainer>
            {txStatusIndicator}
            <Base1300Text variant="b1_B">{title}</Base1300Text>
            <TxHashTextContainer>
              <Base1000Text variant="b3_R_Multiline">{subTitle}</Base1000Text>
            </TxHashTextContainer>
            {isTxConfirmed && txExplorerUrl && (
              <StyledOutlinedChipButton onClick={() => window.open(txExplorerUrl, '_blank')}>
                <ExplorerIconContainer>
                  <ExplorerIcon />
                </ExplorerIconContainer>

                <Base1300Text variant="b3_M">{t('pages.wallet.tx-result.entry.goToExplorer')}</Base1300Text>
              </StyledOutlinedChipButton>
            )}
          </TxResultContainer>
        </Container>
      </BaseBody>
      <BaseFooter>
        {isTxConfirmed && address && (
          <FooterContainer>
            <Base1300Text variant="b3_R">{t('pages.wallet.tx-result.entry.addAddresstoBook')}</Base1300Text>
            <TextButton
              onClick={() => {
                navigate({
                  to: AddAddress.to,
                  search: {
                    address: address,
                    chainId: selectedAsset?.chain && getUniqueChainId(selectedAsset?.chain),
                  },
                });
              }}
              variant="hyperlink"
              typoVarient="b2_M"
            >
              {t('pages.wallet.tx-result.entry.addToAddress')}
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
          {t('pages.wallet.tx-result.entry.confirm')}
        </Button>
      </BaseFooter>
    </>
  );
}
