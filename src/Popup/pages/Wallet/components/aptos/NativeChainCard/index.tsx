import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { APTOS_COIN } from '~/constants/aptos';
import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
import type { AptosChain } from '~/types/chain';
import type { Path } from '~/types/route';

import {
  Container,
  ErrorDescriptionContainer,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  FourthLineCenterContainer,
  FourthLineContainer,
  SecondLineContainer,
  SecondLineLeftAbsoluteImageContainer,
  SecondLineLeftContainer,
  SecondLineLeftImageContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  StyledAbsoluteLoading,
  StyledIconButton,
  StyledRetryIconButton,
  ThirdLineContainer,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import RetryIcon from '~/images/icons/Retry.svg';
import SendIcon from '~/images/icons/Send.svg';
import SwapIcon16 from '~/images/icons/Swap16.svg';

type NativeChainCardProps = {
  chain: AptosChain;
  isCustom?: boolean;
};

export default function NativeChainCard({ chain, isCustom }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { extensionStorage } = useExtensionStorage();
  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const accounts = useAccounts(true);
  const { data: aptosCoin } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinStore', resourceTarget: APTOS_COIN }, { suspense: true });
  const { data: aptosInfo } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: APTOS_COIN, address: '0x1' }, { suspense: true });

  const assets = useAssetsSWR();

  const asset = useMemo(() => assets.data.find((item) => item.address === APTOS_COIN), [assets.data]);

  const { t } = useTranslation();

  const { navigate } = useNavigate();

  const { explorerURL } = currentAptosNetwork;

  const decimals = useMemo(() => aptosInfo?.data.decimals || 0, [aptosInfo?.data.decimals]);

  const imageURL = useMemo(() => currentAptosNetwork.imageURL || asset?.image, [asset?.image, currentAptosNetwork.imageURL]);

  const { data } = useCoinGeckoPriceSWR();

  const amount = aptosCoin?.data.coin.value || '0';

  const price = (asset?.coinGeckoId && data?.[asset.coinGeckoId]?.[extensionStorage.currency]) || 0;

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const value = times(price, displayAmount);

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const displayDenom = useMemo(() => asset?.symbol || aptosInfo?.data.symbol || '', [aptosInfo?.data.symbol, asset?.symbol]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.aptos.NativeChainCard.index.copied'));
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{currentAddress}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton
              onClick={() => {
                window.open(`${explorerURL}/address/${currentAddress}`);
              }}
            >
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{displayDenom}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Tooltip title={displayAmount} arrow placement="bottom-end">
            <span>
              <Number fixed={getDisplayMaxDecimals(decimals)}>{displayAmount}</Number>
            </span>
          </Tooltip>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={extensionStorage.currency}>
          {value}
        </Number>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.sendButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SwapIcon16} accentColor="green" typoVarient="h5" onClick={() => navigate(`/wallet/swap/${chain.id}` as unknown as Path)}>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.swapButton')}
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain, isCustom }: NativeChainCardProps) {
  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, imageURL } = currentAptosNetwork;

  const address = useMemo(() => {
    const key = `${currentAccount.id}${chain.id}`;

    const storageAddress = localStorage.getItem(key);

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword]);

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(`copied!`);
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{address}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton
              onClick={() => {
                window.open(`${explorerURL}/address/${address}`);
              }}
            >
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Skeleton width="8rem" height="2.2rem" />
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Skeleton width="12rem" height="2.6rem" />
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Skeleton width="8rem" height="1.9rem" />
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.sendButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SwapIcon16} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.swapButton')}
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardError({ chain, isCustom, resetErrorBoundary }: NativeChainCardProps & FallbackProps) {
  const [isLoading, setIsloading] = useState(false);

  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, imageURL } = currentAptosNetwork;

  const address = useMemo(() => {
    const key = `${currentAccount.id}${chain.id}`;

    const storageAddress = localStorage.getItem(key);

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword]);

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(`copied!`);
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{address}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton
              onClick={() => {
                window.open(`${explorerURL}/address/${address}`);
              }}
            >
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3" />
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <StyledRetryIconButton
            onClick={() => {
              setIsloading(true);

              setTimeout(() => {
                resetErrorBoundary();
                setIsloading(false);
              }, 500);
            }}
          >
            <RetryIcon />
          </StyledRetryIconButton>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <ErrorDescriptionContainer>
          <Typography variant="h6">{t('pages.Wallet.components.aptos.NativeChainCard.index.networkError')}</Typography>
        </ErrorDescriptionContainer>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.sendButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SwapIcon16} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.swapButton')}
        </Button>
      </FourthLineContainer>
      {isLoading && <StyledAbsoluteLoading size="2.5rem" />}
    </Container>
  );
}

type DisplayDenomImageProps = {
  imageURL?: string;
  isCustom?: boolean;
};

function SecondLineLeftImage({ imageURL, isCustom = false }: DisplayDenomImageProps) {
  return (
    <SecondLineLeftImageContainer>
      <SecondLineLeftAbsoluteImageContainer>
        <Image src={imageURL} />
      </SecondLineLeftAbsoluteImageContainer>
      {isCustom && (
        <SecondLineLeftAbsoluteImageContainer>
          <Image src={customBeltImg} />
        </SecondLineLeftAbsoluteImageContainer>
      )}
    </SecondLineLeftImageContainer>
  );
}
