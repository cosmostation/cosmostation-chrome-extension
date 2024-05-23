import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { APTOS_COIN } from '~/constants/aptos';
import { ACCENT_COLORS } from '~/constants/theme';
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
import { getAddress, getAddressKey, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
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
  SecondLineLeftSubTextContainer,
  SecondLineLeftSubTextEmptyContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  SecondLineRightSubTextContainer,
  SecondLineRightTextContainer,
  StyledAbsoluteLoading,
  StyledIconButton,
  StyledRetryIconButton,
  TextChangeRateContainer,
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

  const { explorerURL, networkName } = currentAptosNetwork;

  const decimals = useMemo(() => aptosInfo?.data.decimals || 0, [aptosInfo?.data.decimals]);

  const imageURL = useMemo(() => currentAptosNetwork.tokenImageURL || asset?.image, [asset?.image, currentAptosNetwork.tokenImageURL]);

  const { data } = useCoinGeckoPriceSWR();

  const amount = useMemo(() => aptosCoin?.data.coin.value || '0', [aptosCoin?.data.coin.value]);

  const price = useMemo(
    () => (asset?.coinGeckoId && data?.[asset.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [asset?.coinGeckoId, data, extensionStorage.currency],
  );

  const cap = useMemo(
    () => (asset?.coinGeckoId && data?.[asset?.coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [asset?.coinGeckoId, data, extensionStorage.currency],
  );

  const displayAmount = useMemo(() => toDisplayDenomAmount(amount, decimals), [amount, decimals]);

  const value = useMemo(() => times(price, displayAmount), [displayAmount, price]);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

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
                window.open(`${explorerURL}/account/${currentAddress}?network=${networkName.toLowerCase()}`);
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
            <Typography variant="h4">{displayDenom}</Typography>

            <SecondLineLeftSubTextContainer>
              <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={extensionStorage.currency}>
                {String(price)}
              </Number>

              <TextChangeRateContainer data-color={cap > 0 ? 'green' : cap < 0 ? 'red' : 'grey'}>
                <Typography variant="h5n">{cap > 0 ? '+' : ''}</Typography>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={2}>
                  {String(cap)}
                </Number>
                <Typography variant="h7n">%</Typography>
              </TextChangeRateContainer>
            </SecondLineLeftSubTextContainer>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <SecondLineRightTextContainer>
            <Tooltip title={displayAmount} arrow placement="bottom-end">
              <span>
                <Number typoOfIntegers="h4n" typoOfDecimals="h5n" fixed={getDisplayMaxDecimals(decimals)}>
                  {displayAmount}
                </Number>
              </span>
            </Tooltip>
          </SecondLineRightTextContainer>
          <SecondLineRightSubTextContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={extensionStorage.currency}>
              {value}
            </Number>
          </SecondLineRightSubTextContainer>
        </SecondLineRightContainer>
      </SecondLineContainer>

      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.aptos.NativeChainCard.index.sendButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button
          Icon={SwapIcon16}
          accentColor={ACCENT_COLORS.GREEN01}
          hoverAccentColor={ACCENT_COLORS.GREEN02}
          typoVarient="h5"
          onClick={() => navigate(`/wallet/swap/${chain.id}` as unknown as Path)}
        >
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
  const { extensionStorage } = useExtensionStorage();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, tokenImageURL } = currentAptosNetwork;

  const address = useMemo(() => {
    const key = getAddressKey(currentAccount, chain);

    const storageAddress = extensionStorage.address?.[key];

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword, extensionStorage.address]);

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
          <SecondLineLeftImage imageURL={tokenImageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h4">APT</Typography>
            <SecondLineLeftSubTextContainer>
              <Skeleton width="7rem" height="1.9rem" />
            </SecondLineLeftSubTextContainer>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <SecondLineRightTextContainer>
            <Skeleton width="12rem" height="2.2rem" />
          </SecondLineRightTextContainer>
          <SecondLineRightSubTextContainer>
            <Skeleton width="8rem" height="1.9rem" />
          </SecondLineRightSubTextContainer>
        </SecondLineRightContainer>
      </SecondLineContainer>

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
  useAccountResourceSWR({ resourceType: '0x1::coin::CoinStore', resourceTarget: APTOS_COIN });
  useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: APTOS_COIN, address: '0x1' });

  const [isLoading, setIsloading] = useState(false);

  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { extensionStorage } = useExtensionStorage();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, tokenImageURL } = currentAptosNetwork;

  const address = useMemo(() => {
    const key = getAddressKey(currentAccount, chain);

    const storageAddress = extensionStorage.address?.[key];

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword, extensionStorage.address]);

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
          <SecondLineLeftImage imageURL={tokenImageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h4">APT</Typography>
            <SecondLineLeftSubTextEmptyContainer />
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
          <ErrorDescriptionContainer>
            <Typography variant="h6">{t('pages.Wallet.components.aptos.NativeChainCard.index.networkError')}</Typography>
          </ErrorDescriptionContainer>
        </SecondLineRightContainer>
      </SecondLineContainer>

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
