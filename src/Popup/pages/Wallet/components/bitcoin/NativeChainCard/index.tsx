import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useBalanceSWR } from '~/Popup/hooks/SWR/bitcoin/useBalanceSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getAddressKey, getKeyPair } from '~/Popup/utils/common';
import type { BitcoinChain } from '~/types/chain';

import {
  ButtonContainer,
  Container,
  ErrorDescriptionContainer,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  FourthLineContainer,
  FourthLineContainerItem,
  FourthLineContainerItemLeft,
  FourthLineContainerItemRight,
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
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
  StyledDivider,
  StyledIconButton,
  StyledRetryIconButton,
  TextChangeRateContainer,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import RetryIcon from '~/images/icons/Retry.svg';
import SendIcon from '~/images/icons/Send.svg';

type NativeChainCardProps = {
  chain: BitcoinChain;
  isCustom?: boolean;
};

export default function NativeChainCard({ chain, isCustom = false }: NativeChainCardProps) {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { decimals } = chain;

  const { extensionStorage } = useExtensionStorage();

  const { currentAccount } = useCurrentAccount();

  const { data } = useCoinGeckoPriceSWR();

  const accounts = useAccounts(true);

  const balance = useBalanceSWR(chain, { suspense: true });

  const expanded = true;

  const availableAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.chain_stats.funded_txo_sum - balance.data.chain_stats.spent_txo_sum - balance.data.mempool_stats.spent_txo_sum;
  }, [balance.data]);

  const pendingSpentAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.mempool_stats.spent_txo_sum;
  }, [balance.data]);

  const pendingFundedAmount = useMemo(() => {
    if (!balance.data) {
      return 0;
    }

    return balance.data.mempool_stats.funded_txo_sum;
  }, [balance.data]);

  const availableDisplayAmount = useMemo(() => toDisplayDenomAmount(availableAmount, decimals), [availableAmount, decimals]);
  const pendingSpentDisplayAmount = useMemo(() => toDisplayDenomAmount(pendingSpentAmount, decimals), [pendingSpentAmount, decimals]);
  const pendingFundedDisplayAmount = useMemo(() => toDisplayDenomAmount(pendingFundedAmount, decimals), [pendingFundedAmount, decimals]);

  const coinGeckoId = useMemo(() => chain.coinGeckoId, [chain.coinGeckoId]);

  const price = useMemo(() => (coinGeckoId && data?.[coinGeckoId]?.[extensionStorage.currency]) || 0, [extensionStorage.currency, coinGeckoId, data]);

  const cap = useMemo(
    () => (coinGeckoId && data?.[coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [coinGeckoId, data, extensionStorage.currency],
  );

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const explorerAccountURL = useMemo(() => {
    if (!chain.explorerURL) {
      return '';
    }

    return `${chain.explorerURL}/address/${currentAddress}`;
  }, [currentAddress, chain.explorerURL]);

  const displayMaxDecimals = decimals;

  const value = useMemo(() => times(availableDisplayAmount, price), [availableDisplayAmount, price]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.bitcoin.NativeChainCard.index.copied'));
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
            <StyledIconButton onClick={() => window.open(explorerAccountURL)}>
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={chain.tokenImageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h4">{chain.displayDenom}</Typography>
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
            <Tooltip title={availableDisplayAmount} arrow placement="bottom-end">
              <span>
                <Number typoOfIntegers="h4n" typoOfDecimals="h5n" fixed={displayMaxDecimals}>
                  {availableDisplayAmount}
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

      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary />
        <StyledAccordionDetails>
          <StyledDivider />
          <FourthLineContainer>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.bitcoin.NativeChainCard.index.mempoolSpent')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={pendingSpentDisplayAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                      {pendingSpentDisplayAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.bitcoin.NativeChainCard.index.mempoolFunded')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={pendingFundedDisplayAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                      {pendingFundedDisplayAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
          </FourthLineContainer>
        </StyledAccordionDetails>
      </StyledAccordion>

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.bitcoin.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')} disabled={!availableAmount}>
          {t('pages.Wallet.components.bitcoin.NativeChainCard.index.sendButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain, isCustom }: NativeChainCardProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { extensionStorage } = useExtensionStorage();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const expanded = true;

  const address = useMemo(() => {
    const key = getAddressKey(currentAccount, chain);

    const storageAddress = extensionStorage.address?.[key];

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword, extensionStorage.address]);

  const explorerAccountURL = useMemo(() => {
    if (!chain.explorerURL) {
      return '';
    }

    return `${chain.explorerURL}/address/${address}`;
  }, [address, chain.explorerURL]);

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(t('pages.Wallet.components.bitcoin.NativeChainCard.index.copied'));
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
            <StyledIconButton onClick={() => window.open(explorerAccountURL)}>
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={chain.tokenImageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h4">{chain.displayDenom}</Typography>
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

      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary />
        <StyledAccordionDetails>
          <StyledDivider />
          <FourthLineContainer>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.bitcoin.NativeChainCard.index.mempoolSpent')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.bitcoin.NativeChainCard.index.mempoolFunded')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
          </FourthLineContainer>
        </StyledAccordionDetails>
      </StyledAccordion>

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.bitcoin.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.bitcoin.NativeChainCard.index.sendButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}

export function NativeChainCardError({ chain, isCustom, resetErrorBoundary }: NativeChainCardProps & FallbackProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { extensionStorage } = useExtensionStorage();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isLoading, setIsloading] = useState(false);

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
      enqueueSnackbar(t('pages.Wallet.components.bitcoin.NativeChainCard.index.copied'));
    }
  };

  const explorerAccountURL = useMemo(() => {
    if (!chain.explorerURL) {
      return '';
    }

    return `${chain.explorerURL}/address/${address}`;
  }, [address, chain.explorerURL]);

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{address}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerAccountURL && (
            <StyledIconButton onClick={() => window.open(explorerAccountURL)}>
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={chain.tokenImageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h4">{chain.displayDenom}</Typography>
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
            <Typography variant="h6">{t('pages.Wallet.components.bitcoin.NativeChainCard.index.networkError')}</Typography>
          </ErrorDescriptionContainer>
        </SecondLineRightContainer>
      </SecondLineContainer>

      <ButtonContainer sx={{ paddingBottom: '1.6rem' }}>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.bitcoin.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.bitcoin.NativeChainCard.index.sendButton')}
        </Button>
      </ButtonContainer>
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
