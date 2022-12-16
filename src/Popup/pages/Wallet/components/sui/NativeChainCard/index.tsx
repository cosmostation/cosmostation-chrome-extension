import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { SUI_COIN } from '~/constants/sui';
import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useGetObjectsOwnedByAddressSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
import { getCoinAddress, isExists } from '~/Popup/utils/sui';
import type { SuiChain } from '~/types/chain';

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

type NativeChainCardProps = {
  chain: SuiChain;
  isCustom?: boolean;
};

export default function NativeChainCard({ chain, isCustom }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage } = useChromeStorage();
  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const accounts = useAccounts(true);

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address: currentAddress }, { suspense: true });
  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: SUI_COIN }, { suspense: true });

  const { data: objects } = useGetObjectsSWR({ objectIds: objectsOwnedByAddress?.result?.map((object) => object.objectId) }, { suspense: true });

  const suiCoinObjects = useMemo(
    () => objects?.filter(isExists).filter((object) => getCoinAddress(object.result?.details.data.type || '') === SUI_COIN) || [],
    [objects],
  );

  const amount = useMemo(() => suiCoinObjects.reduce((ac, cu) => plus(ac, cu.result?.details.data.fields.balance || '0'), '0'), [suiCoinObjects]);

  const decimals = useMemo(() => coinMetadata?.result?.decimals || 0, [coinMetadata?.result?.decimals]);

  const displayAmount = useMemo(() => toDisplayDenomAmount(amount, decimals), [amount, decimals]);

  const { t } = useTranslation();

  const { navigate } = useNavigate();

  const { explorerURL } = currentSuiNetwork;

  const imageURL = useMemo(
    () => currentSuiNetwork.imageURL || coinMetadata?.result?.iconUrl || undefined,
    [coinMetadata?.result?.iconUrl, currentSuiNetwork.imageURL],
  );

  const price = 0;

  const value = times(price, displayAmount);

  const displayDenom = useMemo(() => coinMetadata?.result?.symbol || 'SUI', [coinMetadata?.result?.symbol]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.sui.NativeChainCard.index.copied'));
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
                window.open(`${explorerURL}/address/${currentAddress}?network=${currentSuiNetwork.networkName === 'Testnet' ? 'testnet' : 'devnet'}`);
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
        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={chromeStorage.currency}>
          {value}
        </Number>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.sui.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.sui.NativeChainCard.index.sendButton')}
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain, isCustom }: NativeChainCardProps) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, imageURL } = currentSuiNetwork;

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
          {t('pages.Wallet.components.sui.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.sendButton')}
        </Button>
      </FourthLineContainer>
    </Container>
  );
}

export function NativeChainCardError({ chain, isCustom, resetErrorBoundary }: NativeChainCardProps & FallbackProps) {
  const [isLoading, setIsloading] = useState(false);

  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, imageURL } = currentSuiNetwork;

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
          <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.networkError')}</Typography>
        </ErrorDescriptionContainer>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.depositButton')}
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.sendButton')}
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
