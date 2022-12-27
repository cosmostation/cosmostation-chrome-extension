import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { COSMOS_DEFAULT_REWARD_GAS } from '~/constants/chain';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import customBeltImg from '~/images/etc/customBelt.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useRewardSWR } from '~/Popup/hooks/SWR/cosmos/useRewardSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getAddress, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { protoTx } from '~/Popup/utils/proto';
import type { CosmosChain } from '~/types/chain';
import type { MsgReward, SignAminoDoc } from '~/types/cosmos/amino';

import ClaimRewardButton from './components/ClaimRewardButton';
import {
  ButtonCenterContainer,
  ButtonContainer,
  Container,
  ErrorDescriptionContainer,
  ExpandedButton,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  FourthLineContainer,
  FourthLineContainerItem,
  FourthLineContainerItemLeft,
  FourthLineContainerItemRight,
  IconButtonContainer,
  SecondLineContainer,
  SecondLineLeftAbsoluteImageContainer,
  SecondLineLeftContainer,
  SecondLineLeftImageContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  StyledAbsoluteLoading,
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
  StyledIconButton,
  StyledRetryIconButton,
  ThirdLineContainer,
  UnitIconButton,
} from './styled';

import BottomArrow20Icon from '~/images/icons/BottomArrow20.svg';
import BuyIcon from '~/images/icons/Buy.svg';
import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import RetryIcon from '~/images/icons/Retry.svg';
import Reward16Icon from '~/images/icons/Reward16.svg';
import SendIcon from '~/images/icons/Send.svg';
import SwapIcon from '~/images/icons/Swap.svg';

type NativeChainCardProps = {
  chain: CosmosChain;
  isCustom?: boolean;
};

const EXPANDED_KEY = 'wallet-cosmos-expanded';

export default function NativeChainCard({ chain, isCustom = false }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage } = useChromeStorage();
  const reward = useRewardSWR(chain);
  const account = useAccountSWR(chain);
  const accounts = useAccounts(true);
  const { enQueue } = useCurrentQueue();
  const { totalAmount, delegationAmount, rewardAmount, unbondingAmount, vestingNotDelegate, vestingRelatedAvailable, incentiveAmount } = useAmountSWR(
    chain,
    true,
  );
  const { data } = useCoinGeckoPriceSWR();

  const storageExpanded = localStorage.getItem(EXPANDED_KEY) === null ? true : !!localStorage.getItem(EXPANDED_KEY);

  const [expanded, setExpanded] = useState(storageExpanded);

  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const { navigate } = useNavigate();

  const { decimals, coinGeckoId, explorerURL } = chain;

  const price = (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0;

  const displayAmount = toDisplayDenomAmount(totalAmount, decimals);

  const value = times(displayAmount, price);

  const currentAddress = accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[chain.id] || '';

  const rewardAminoTx = useMemo<SignAminoDoc<MsgReward> | undefined>(() => {
    if (reward.data?.rewards?.length && account.data?.value.account_number && account.data.value.sequence) {
      return {
        account_number: account.data.value.account_number,
        sequence: account.data.value.sequence,
        chain_id: chain.chainId,
        fee: {
          amount: [{ amount: chain.type === 'ETHERMINT' ? times(chain.gasRate.low, COSMOS_DEFAULT_REWARD_GAS, 0) : '1', denom: chain.baseDenom }],
          gas: COSMOS_DEFAULT_REWARD_GAS,
        },
        msgs: reward.data.rewards.map((item) => ({
          type: 'cosmos-sdk/MsgWithdrawDelegationReward',
          value: { delegator_address: currentAddress, validator_address: item.validator_address },
        })),
        memo: '',
      };
    }
    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    chain.baseDenom,
    chain.chainId,
    chain.gasRate.low,
    chain.type,
    currentAddress,
    reward.data?.rewards,
  ]);

  const rewardProtoTx = useMemo(() => {
    if (rewardAminoTx) {
      return protoTx(rewardAminoTx, '', { type: getPublicKeyType(chain), value: '' });
    }

    return undefined;
  }, [chain, rewardAminoTx]);

  const simulate = useSimulateSWR({ chain, txBytes: rewardProtoTx?.tx_bytes });

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.components.cosmos.NativeChainCard.index.copied'));
    }
  };

  const displayAvailableAmount = toDisplayDenomAmount(vestingRelatedAvailable, decimals);
  const displayDelegationAmount = toDisplayDenomAmount(delegationAmount, decimals);
  const displayUnDelegationAmount = toDisplayDenomAmount(unbondingAmount, decimals);
  const displayRewardAmount = toDisplayDenomAmount(rewardAmount, decimals);
  const displayVestingNotDelegationAmount = toDisplayDenomAmount(vestingNotDelegate, decimals);
  const displayIncentiveAmount = toDisplayDenomAmount(incentiveAmount, decimals);

  const displayMaxDecimals = getDisplayMaxDecimals(decimals);

  const estimatedDisplayFeeAmount = useMemo(
    () => toDisplayDenomAmount(times(chain.gasRate.low, simulate.data?.gas_info?.gas_used || '0'), decimals),
    [chain.gasRate.low, decimals, simulate.data?.gas_info?.gas_used],
  );

  const isPossibleClaimReward = useMemo(
    () => !!rewardAminoTx && simulate.data?.gas_info?.gas_used && gt(displayRewardAmount, '0') && gt(displayAvailableAmount, estimatedDisplayFeeAmount),
    [displayAvailableAmount, displayRewardAmount, estimatedDisplayFeeAmount, rewardAminoTx, simulate.data?.gas_info?.gas_used],
  );

  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton onClick={handleOnClickCopy}>{currentAddress}</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          {explorerURL && (
            <StyledIconButton onClick={() => window.open(`${explorerURL}/account/${currentAddress}`)}>
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={chain.imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{chain.displayDenom}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Tooltip title={displayAmount} arrow placement="bottom-end">
            <span>
              <Number fixed={displayMaxDecimals}>{displayAmount}</Number>
            </span>
          </Tooltip>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={chromeStorage.currency}>
          {value}
        </Number>
      </ThirdLineContainer>

      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary />
        <StyledAccordionDetails>
          <FourthLineContainer>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.available')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayAvailableAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                      {displayAvailableAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.delegated')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayDelegationAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                      {displayDelegationAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.unbonding')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayUnDelegationAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                      {displayUnDelegationAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.reward')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayRewardAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                      {displayRewardAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.vesting')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Tooltip title={displayVestingNotDelegationAmount} arrow placement="bottom-end">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                      {displayVestingNotDelegationAmount}
                    </Number>
                  </span>
                </Tooltip>
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            {chain.id === KAVA.id && (
              <FourthLineContainerItem>
                <FourthLineContainerItemLeft>
                  <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.incentive')}</Typography>
                </FourthLineContainerItemLeft>
                <FourthLineContainerItemRight>
                  <Tooltip title={displayIncentiveAmount} arrow placement="bottom-end">
                    <span>
                      <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={displayMaxDecimals}>
                        {displayIncentiveAmount}
                      </Number>
                    </span>
                  </Tooltip>
                </FourthLineContainerItemRight>
              </FourthLineContainerItem>
            )}
          </FourthLineContainer>
          <ClaimRewardButton
            Icon={Reward16Icon}
            type="button"
            disabled={!isPossibleClaimReward}
            onClick={async () => {
              if (rewardAminoTx && simulate.data?.gas_info?.gas_used && isPossibleClaimReward) {
                await enQueue({
                  messageId: '',
                  origin: '',
                  channel: 'inApp',
                  message: {
                    method: 'cos_signAmino',
                    params: {
                      chainName: chain.chainName,
                      doc: {
                        ...rewardAminoTx,
                        fee: { amount: [{ amount: '0', denom: chain.baseDenom }], gas: times(simulate.data.gas_info.gas_used, getDefaultAV(chain), 0) },
                      },
                      isEditFee: true,
                      isEditMemo: true,
                    },
                  },
                });

                if (currentAccount.type === 'LEDGER') {
                  await openWindow();
                  window.close();
                }
              }
            }}
          >
            {t('pages.Wallet.components.cosmos.NativeChainCard.index.claimRewardButton')}
          </ClaimRewardButton>
        </StyledAccordionDetails>
      </StyledAccordion>

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.depositButton')}
        </Button>
        <ButtonCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled={!gt(vestingRelatedAvailable, '0')} onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.sendButton')}
        </Button>
        <ButtonCenterContainer />
        {chain.id === OSMOSIS.id && (
          <IconButtonContainer>
            <UnitIconButton disabled={!gt(vestingRelatedAvailable, '0')} onClick={() => navigate('/wallet/swap')}>
              <SwapIcon />
            </UnitIconButton>
            <UnitIconButton onClick={() => navigate('/wallet/send')}>
              <BuyIcon />
            </UnitIconButton>
          </IconButtonContainer>
        )}
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
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const { currentPassword } = useCurrentPassword();

  const { explorerURL } = chain;

  const storageExpanded = localStorage.getItem(EXPANDED_KEY) === null ? true : !!localStorage.getItem(EXPANDED_KEY);

  const [expanded, setExpanded] = useState(storageExpanded);

  const address = useMemo(() => {
    const key = `${currentAccount.id}${chain.id}`;

    const storageAddress = localStorage.getItem(key);

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword]);

  const { enqueueSnackbar } = useSnackbar();

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(t('pages.Wallet.components.cosmos.NativeChainCard.index.copied'));
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
            <StyledIconButton onClick={() => window.open(`${explorerURL}/account/${address}`)}>
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={chain.imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{chain.displayDenom}</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Skeleton width="12rem" height="2.6rem" />
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Skeleton width="8rem" height="1.9rem" />
      </ThirdLineContainer>

      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary />
        <StyledAccordionDetails>
          <FourthLineContainer>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.available')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.delegated')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.unbonding')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.reward')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            <FourthLineContainerItem>
              <FourthLineContainerItemLeft>
                <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.vesting')}</Typography>
              </FourthLineContainerItemLeft>
              <FourthLineContainerItemRight>
                <Skeleton width="8rem" height="1.9rem" />
              </FourthLineContainerItemRight>
            </FourthLineContainerItem>
            {chain.id === KAVA.id && (
              <FourthLineContainerItem>
                <FourthLineContainerItemLeft>
                  <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.incentive')}</Typography>
                </FourthLineContainerItemLeft>
                <FourthLineContainerItemRight>
                  <Skeleton width="8rem" height="1.9rem" />
                </FourthLineContainerItemRight>
              </FourthLineContainerItem>
            )}
          </FourthLineContainer>
          <ClaimRewardButton Icon={Reward16Icon} type="button" disabled>
            {t('pages.Wallet.components.cosmos.NativeChainCard.index.claimRewardButton')}
          </ClaimRewardButton>
        </StyledAccordionDetails>
      </StyledAccordion>

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.depositButton')}
        </Button>
        <ButtonCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.sendButton')}
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
  useAmountSWR(chain);

  const [isLoading, setIsloading] = useState(false);

  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const { currentPassword } = useCurrentPassword();

  const { explorerURL } = chain;

  const address = useMemo(() => {
    const key = `${currentAccount.id}${chain.id}`;

    const storageAddress = localStorage.getItem(key);

    if (storageAddress) {
      return storageAddress;
    }

    const keyPair = getKeyPair(currentAccount, chain, currentPassword);

    return getAddress(chain, keyPair?.publicKey);
  }, [chain, currentAccount, currentPassword]);

  const { enqueueSnackbar } = useSnackbar();

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(t('pages.Wallet.components.cosmos.NativeChainCard.index.copied'));
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
            <StyledIconButton onClick={() => window.open(`${explorerURL}/account/${address}`)}>
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImage imageURL={chain.imageURL} isCustom={isCustom} />
          <SecondLineLeftTextContainer>
            <Typography variant="h3">{chain.displayDenom}</Typography>
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
          <Typography variant="h6">{t('pages.Wallet.components.cosmos.NativeChainCard.index.networkError')}</Typography>
        </ErrorDescriptionContainer>
      </ThirdLineContainer>

      <ButtonContainer sx={{ paddingBottom: '1.6rem' }}>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.depositButton')}
        </Button>
        <ButtonCenterContainer />
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.sendButton')}
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
