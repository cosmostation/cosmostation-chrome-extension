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
import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '@/constants/error.ts';
import { TRANSACTION_RESULT } from '@/constants/iota/index.ts';
import { TX_CONFIRMED_STATUS } from '@/constants/txStatus.ts';
import { useTxInfo } from '@/hooks/iota/useTxInfo.ts';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets.ts';
import { Route as Dashboard } from '@/pages';
import { Route as AddAddress } from '@/pages/general-setting/address-book/add-address';
import { getUniqueChainId, isMatchingCoinId } from '@/utils/queryParamGenerator.ts';

import { Container, ExplorerIconContainer, FooterContainer, StyledOutlinedChipButton, TxHashTextContainer, TxResultContainer } from './styled.tsx';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';

import txFailedImage from '@/assets/images/tx/txFailed.png';
import txSuccessImage from '@/assets/images/tx/txSuccess.png';

import animationData from '@/assets/animation/loading.json';

type IotaProps = {
  coinId: string;
  txHash?: string;
  address?: string;
};

export default function Iota({ coinId, txHash, address }: IotaProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const txInfo = useTxInfo({
    coinId,
    digest: txHash,
  });

  const selectedAsset = accountAllAssets?.iotaAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));

  const txExplorerUrl = selectedAsset?.chain.explorer.account && txHash ? selectedAsset.chain.explorer.tx.replace('${hash}', txHash) : '';

  const txConfirmedStatus = (() => {
    if (txInfo.error?.message === TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING) return TX_CONFIRMED_STATUS.PENDING;

    if (txInfo.data?.result?.effects?.status.status) {
      if (txInfo.data.result.effects.status.status === TRANSACTION_RESULT.FAILURE) return TX_CONFIRMED_STATUS.FAILED;

      if (txInfo.data.result.effects.status.status === TRANSACTION_RESULT.SUCCESS) return TX_CONFIRMED_STATUS.CONFIRMED;
    }

    return undefined;
  })();

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
