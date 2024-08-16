import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';

import { DEVNET } from '~/constants/chain/sui/network/devnet';
import { TESTNET } from '~/constants/chain/sui/network/testnet';
import { SUI_COIN } from '~/constants/sui';
import { ACCENT_COLORS } from '~/constants/theme';
import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAmountSWR } from '~/Popup/hooks/SWR/sui/useAmountSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getAddressKey, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
import type { SuiChain } from '~/types/chain';
import type { Path } from '~/types/route';

import FaucetButton from './components/FaucetButton';
import {
  ButtonContainer,
  Container,
  ErrorDescriptionContainer,
  ExpandedButton,
  FaucetButtonContainer,
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

import BottomArrow20Icon from '~/images/icons/BottomArrow20.svg';
import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import RetryIcon from '~/images/icons/Retry.svg';
import Reward16Icon from '~/images/icons/Reward16.svg';
import SendIcon from '~/images/icons/Send.svg';
import SwapIcon16 from '~/images/icons/Swap16.svg';

type NativeChainCardProps = {
  chain: SuiChain;
  isCustom?: boolean;
};

const EXPANDED_KEY = 'wallet-sui-expanded';

export default function NativeChainCard({ chain, isCustom }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { extensionStorage } = useExtensionStorage();
  const { data } = useCoinGeckoPriceSWR();
  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const accounts = useAccounts(true);

  const [isDiabledFaucet, setIsDiabledFaucet] = useState(false);

  const storageExpanded = localStorage.getItem(EXPANDED_KEY) === null ? true : !!localStorage.getItem(EXPANDED_KEY);

  const [expanded, setExpanded] = useState(storageExpanded);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { mutateTokenBalanceObjects } = useTokenBalanceObjectsSWR({ address: currentAddress });

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: SUI_COIN });

  const { availableAmount, delegationAmount, rewardAmount, totalAmount } = useAmountSWR({ address: currentAddress });

  const decimals = useMemo(
    () => coinMetadata?.result?.decimals || currentSuiNetwork.decimals || 0,
    [coinMetadata?.result?.decimals, currentSuiNetwork.decimals],
  );

  const displayTotalAmount = useMemo(() => toDisplayDenomAmount(totalAmount, decimals), [decimals, totalAmount]);
  const displayAvailableAmount = useMemo(() => toDisplayDenomAmount(availableAmount, decimals), [availableAmount, decimals]);
  const displayDelegationAmount = useMemo(() => toDisplayDenomAmount(delegationAmount, decimals), [decimals, delegationAmount]);
  const displayTotalReward = useMemo(() => toDisplayDenomAmount(rewardAmount, decimals), [decimals, rewardAmount]);

  const { t } = useTranslation();

  const { navigate } = useNavigate();

  const { explorerURL, coinGeckoId } = currentSuiNetwork;

  const imageURL = useMemo(
    () => currentSuiNetwork.tokenImageURL || coinMetadata?.result?.iconUrl || undefined,
    [coinMetadata?.result?.iconUrl, currentSuiNetwork.tokenImageURL],
  );

  const price = useMemo(() => (coinGeckoId && data?.[coinGeckoId]?.[extensionStorage.currency]) || 0, [extensionStorage.currency, coinGeckoId, data]);

  const cap = useMemo(
    () => (coinGeckoId && data?.[coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [coinGeckoId, data, extensionStorage.currency],
  );

  const value = times(price, displayTotalAmount);

  const displayDenom = useMemo(() => coinMetadata?.result?.symbol || 'SUI', [coinMetadata?.result?.symbol]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.sui.NativeChainCard.index.copied'));
    }
  };

  const handleOnFaucet = async () => {
    try {
      if (!currentAddress) {
        throw new Error('Failed, wallet address not found.');
      }
      setIsDiabledFaucet(true);

      const networkName = currentSuiNetwork.id === DEVNET.id ? 'devnet' : 'testnet';

      const response = await requestSuiFromFaucetV1({
        host: getFaucetHost(networkName),
        recipient: currentAddress,
      });

      if (!response.error) {
        setTimeout(() => {
          enqueueSnackbar('success faucet');
          void mutateTokenBalanceObjects();
          setIsDiabledFaucet(false);
        }, 5000);
      }
    } catch (e) {
      setIsDiabledFaucet(false);
      enqueueSnackbar('Failed faucet', { variant: 'error' });
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
                window.open(`${explorerURL}/account/${currentAddress}`);
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
            <Tooltip title={displayTotalAmount} arrow placement="bottom-end">
              <span>
                <Number typoOfIntegers="h4n" typoOfDecimals="h5n" fixed={getDisplayMaxDecimals(decimals)}>
                  {displayTotalAmount}
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
                <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.available')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayAvailableAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={decimals}>
                      {displayAvailableAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.staked')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayDelegationAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={decimals}>
                      {displayDelegationAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>

            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.earned')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayTotalReward} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={decimals}>
                      {displayTotalReward}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
          </FourthLineContainer>
        </StyledAccordionDetails>
      </StyledAccordion>

      {[TESTNET.id, DEVNET.id].includes(currentSuiNetwork.id) && (
        <FaucetButtonContainer>
          <FaucetButton Icon={Reward16Icon} onClick={handleOnFaucet} disabled={isDiabledFaucet}>
            Faucet
          </FaucetButton>
        </FaucetButtonContainer>
      )}
      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.sui.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.sui.NativeChainCard.index.sendButton')}
        </Button>
        <Button
          Icon={SwapIcon16}
          accentColor={ACCENT_COLORS.GREEN01}
          hoverAccentColor={ACCENT_COLORS.GREEN02}
          typoVarient="h5"
          onClick={() => navigate(`/wallet/swap/${chain.id}` as unknown as Path)}
        >
          {t('pages.Wallet.components.sui.NativeChainCard.index.swapButton')}
        </Button>
      </ButtonContainer>

      <ExpandedButton
        data-is-expanded={expanded ? 1 : 0}
        type="button"
        onClick={() => {
          setExpanded((prev) => {
            localStorage.setItem(EXPANDED_KEY, !prev ? '1' : '');
            return !prev;
          });
        }}
      >
        <BottomArrow20Icon />
      </ExpandedButton>
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain, isCustom }: NativeChainCardProps) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { extensionStorage } = useExtensionStorage();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, tokenImageURL } = currentSuiNetwork;

  const storageExpanded = localStorage.getItem(EXPANDED_KEY) === null ? true : !!localStorage.getItem(EXPANDED_KEY);

  const [expanded, setExpanded] = useState(storageExpanded);

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
                window.open(`${explorerURL}/account/${address}`);
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
            <Typography variant="h4">SUI</Typography>

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
                <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.available')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.staked')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.earned')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
          </FourthLineContainer>
        </StyledAccordionDetails>
      </StyledAccordion>

      {[TESTNET.id, DEVNET.id].includes(currentSuiNetwork.id) && (
        <FaucetButtonContainer>
          <FaucetButton Icon={Reward16Icon} disabled>
            Faucet
          </FaucetButton>
        </FaucetButtonContainer>
      )}

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.sendButton')}
        </Button>
        <Button Icon={SwapIcon16} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.swapButton')}
        </Button>
      </ButtonContainer>

      <ExpandedButton
        data-is-expanded={expanded ? 1 : 0}
        type="button"
        onClick={() => {
          setExpanded((prev) => {
            localStorage.setItem(EXPANDED_KEY, !prev ? '1' : '');
            return !prev;
          });
        }}
      >
        <BottomArrow20Icon />
      </ExpandedButton>
    </Container>
  );
}

export function NativeChainCardError({ chain, isCustom, resetErrorBoundary }: NativeChainCardProps & FallbackProps) {
  const [isLoading, setIsloading] = useState(false);

  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { extensionStorage } = useExtensionStorage();

  const accounts = useAccounts(true);

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  useTokenBalanceObjectsSWR({ address: currentAddress });
  useGetCoinMetadataSWR({ coinType: SUI_COIN });

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { explorerURL, tokenImageURL } = currentSuiNetwork;

  const storageExpanded = localStorage.getItem(EXPANDED_KEY) === null ? true : !!localStorage.getItem(EXPANDED_KEY);

  const [expanded, setExpanded] = useState(storageExpanded);

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
                window.open(`${explorerURL}/account/${address}`);
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
            <Typography variant="h4">SUI</Typography>
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
            <Typography variant="h6">{t('pages.Wallet.components.sui.NativeChainCard.index.networkError')}</Typography>
          </ErrorDescriptionContainer>
        </SecondLineRightContainer>
      </SecondLineContainer>

      {[TESTNET.id, DEVNET.id].includes(currentSuiNetwork.id) && (
        <FaucetButtonContainer>
          <FaucetButton Icon={Reward16Icon} disabled>
            Faucet
          </FaucetButton>
        </FaucetButtonContainer>
      )}
      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.sendButton')}
        </Button>
        <Button Icon={SwapIcon16} typoVarient="h5" disabled>
          {t('pages.Wallet.components.sui.NativeChainCard.index.swapButton')}
        </Button>
      </ButtonContainer>

      <ExpandedButton
        data-is-expanded={expanded ? 1 : 0}
        type="button"
        onClick={() => {
          setExpanded((prev) => {
            localStorage.setItem(EXPANDED_KEY, !prev ? '1' : '');
            return !prev;
          });
        }}
      >
        <BottomArrow20Icon />
      </ExpandedButton>

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
