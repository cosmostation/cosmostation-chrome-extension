import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { ACCENT_COLORS } from '~/constants/theme';
import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useBlockExplorerURLSWR } from '~/Popup/hooks/SWR/ethereum/useBlockExplorerURLSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getAddressKey, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
import type { EthereumChain } from '~/types/chain';
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
  chain: EthereumChain;
  isCustom?: boolean;
};

export default function NativeChainCard({ chain, isCustom }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { extensionStorage } = useExtensionStorage();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const { getExplorerAccountURL } = useBlockExplorerURLSWR(currentEthereumNetwork);
  const accounts = useAccounts(true);
  const balance = useBalanceSWR(undefined, { suspense: true });

  const { t } = useTranslation();

  const { navigate } = useNavigate();

  const { coinGeckoId, decimals, tokenImageURL } = currentEthereumNetwork;

  const { data } = useCoinGeckoPriceSWR();

  const amount = useMemo(() => BigInt(balance?.data?.result || '0').toString(), [balance?.data?.result]);

  const price = useMemo(() => (coinGeckoId && data?.[coinGeckoId]?.[extensionStorage.currency]) || 0, [coinGeckoId, data, extensionStorage.currency]);

  const cap = useMemo(
    () => (coinGeckoId && data?.[coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [coinGeckoId, data, extensionStorage.currency],
  );

  const displayAmount = useMemo(() => toDisplayDenomAmount(amount, decimals), [amount, decimals]);

  const value = useMemo(() => times(price, displayAmount), [displayAmount, price]);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const explorerAccountURL = useMemo(() => getExplorerAccountURL(currentAddress), [currentAddress, getExplorerAccountURL]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.ethereum.NativeChainCard.index.copied'));
    }
  };

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{currentAddress}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerAccountURL && (
            <StyledIconButton
              onClick={() => {
                window.open(explorerAccountURL);
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
            <Typography variant="h4">{currentEthereumNetwork.displayDenom}</Typography>
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
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.sendButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button
          Icon={SwapIcon16}
          accentColor={ACCENT_COLORS.GREEN01}
          hoverAccentColor={ACCENT_COLORS.GREEN02}
          typoVarient="h5"
          onClick={() => navigate(`/wallet/swap/${currentEthereumNetwork.id}` as unknown as Path)}
        >
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.swapButton')}
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain, isCustom }: NativeChainCardProps) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { extensionStorage } = useExtensionStorage();

  const { getExplorerAccountURL } = useBlockExplorerURLSWR(currentEthereumNetwork);

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { displayDenom, tokenImageURL } = currentEthereumNetwork;

  const address = useMemo(() => {
    const key = getAddressKey(currentAccount, chain);

    const storageAddress = extensionStorage.address?.[key];

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword, extensionStorage.address]);

  const explorerAccountURL = useMemo(() => getExplorerAccountURL(address), [address, getExplorerAccountURL]);

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
          {explorerAccountURL && (
            <StyledIconButton
              onClick={() => {
                window.open(explorerAccountURL);
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
            <Typography variant="h4">{displayDenom}</Typography>
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
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.sendButton')}
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
  useBalanceSWR();

  const [isLoading, setIsloading] = useState(false);

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { extensionStorage } = useExtensionStorage();

  const { getExplorerAccountURL } = useBlockExplorerURLSWR(currentEthereumNetwork);

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { displayDenom, tokenImageURL } = currentEthereumNetwork;

  const address = useMemo(() => {
    const key = getAddressKey(currentAccount, chain);

    const storageAddress = extensionStorage.address?.[key];

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword, extensionStorage.address]);

  const explorerAccountURL = useMemo(() => getExplorerAccountURL(address), [address, getExplorerAccountURL]);

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
          {explorerAccountURL && (
            <StyledIconButton
              onClick={() => {
                window.open(explorerAccountURL);
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
            <Typography variant="h4">{displayDenom}</Typography>
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
            <Typography variant="h6">{t('pages.Wallet.components.ethereum.NativeChainCard.index.networkError')}</Typography>
          </ErrorDescriptionContainer>
        </SecondLineRightContainer>
      </SecondLineContainer>

      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.ethereum.NativeChainCard.index.sendButton')}
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
