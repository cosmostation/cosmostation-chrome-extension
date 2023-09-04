import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { COSMOS_DEFAULT_REWARD_GAS } from '~/constants/chain';
import { EVMOS } from '~/constants/chain/cosmos/evmos';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { ACCENT_COLORS } from '~/constants/theme';
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
import { useValidatorsSWR } from '~/Popup/hooks/SWR/useValidatorsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getDisplayMaxDecimals, getKeyPair } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { cosmos } from '~/proto/cosmos-v0.44.2.js';
import type { CosmosChain } from '~/types/chain';
import type { MsgCommission, MsgReward, SignAminoDoc } from '~/types/cosmos/amino';
import type { Path } from '~/types/route';

import ClaimButton from './components/ClaimButton';
import {
  ButtonContainer,
  ClaimButtonContainer,
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
} from './styled';

import BottomArrow20Icon from '~/images/icons/BottomArrow20.svg';
import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import RetryIcon from '~/images/icons/Retry.svg';
import Reward16Icon from '~/images/icons/Reward16.svg';
import SendIcon from '~/images/icons/Send.svg';
import SwapIcon16 from '~/images/icons/Swap16.svg';

type NativeChainCardProps = {
  chain: CosmosChain;
  isCustom?: boolean;
};

const EXPANDED_KEY = 'wallet-cosmos-expanded';

export default function NativeChainCard({ chain, isCustom = false }: NativeChainCardProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { extensionStorage } = useExtensionStorage();
  const reward = useRewardSWR(chain);
  const validators = useValidatorsSWR();

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

  const price = useMemo(() => (coinGeckoId && data?.[coinGeckoId]?.[extensionStorage.currency]) || 0, [extensionStorage.currency, coinGeckoId, data]);

  const displayAmount = useMemo(() => toDisplayDenomAmount(totalAmount, decimals), [decimals, totalAmount]);

  const value = useMemo(() => times(displayAmount, price), [displayAmount, price]);

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const operatorAddress = useMemo(() => validators.data?.find((item) => item.address === currentAddress)?.operatorAddress, [currentAddress, validators.data]);

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
      const pTx = protoTx(rewardAminoTx, '', { type: getPublicKeyType(chain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : undefined;
    }

    return undefined;
  }, [chain, rewardAminoTx]);

  const rewardSimulate = useSimulateSWR({ chain, txBytes: rewardProtoTx?.tx_bytes });

  const commissionAminoTx = useMemo<SignAminoDoc<MsgCommission> | undefined>(() => {
    if (operatorAddress && account.data?.value.account_number && account.data.value.sequence) {
      return {
        account_number: account.data.value.account_number,
        sequence: account.data.value.sequence,
        chain_id: chain.chainId,
        fee: {
          amount: [{ amount: chain.type === 'ETHERMINT' ? times(chain.gasRate.low, COSMOS_DEFAULT_REWARD_GAS, 0) : '1', denom: chain.baseDenom }],
          gas: COSMOS_DEFAULT_REWARD_GAS,
        },
        msgs: [
          {
            type: 'cosmos-sdk/MsgWithdrawValidatorCommission',
            value: { validator_address: operatorAddress },
          },
        ],
        memo: '',
      };
    }
    return undefined;
  }, [account.data?.value.account_number, account.data?.value.sequence, chain.baseDenom, chain.chainId, chain.gasRate.low, chain.type, operatorAddress]);

  const commissionProtoTx = useMemo(() => {
    if (commissionAminoTx) {
      const pTx = protoTx(commissionAminoTx, '', { type: getPublicKeyType(chain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : undefined;
    }

    return undefined;
  }, [chain, commissionAminoTx]);

  const commissionSimulate = useSimulateSWR({ chain, txBytes: commissionProtoTx?.tx_bytes });

  const commissionDirectTx = useMemo(() => {
    if (
      operatorAddress &&
      chain.id === EVMOS.id &&
      account.data?.value.account_number &&
      account.data.value.sequence &&
      !!commissionSimulate.data?.gas_info?.gas_used
    ) {
      const commissionSimulatedAminoTx = {
        account_number: account.data.value.account_number,
        sequence: account.data.value.sequence,
        chain_id: chain.chainId,
        fee: {
          amount: [{ amount: '0', denom: chain.baseDenom }],
          gas: times(commissionSimulate.data.gas_info.gas_used, getDefaultAV(chain), 0),
        },
        msgs: [
          {
            type: 'cosmos-sdk/MsgWithdrawValidatorCommission',
            value: { validator_address: operatorAddress },
          },
        ],
        memo: '',
      };

      const keyPair = getKeyPair(currentAccount, chain, currentPassword);

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey).toString('base64') : '';

      const publicKeyType = getPublicKeyType(chain);

      const pTx = protoTx(commissionSimulatedAminoTx, '', { type: publicKeyType, value: base64PublicKey }, cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT);

      return pTx
        ? {
            chain_id: chain.chainId,
            account_number: account.data.value.account_number,
            auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
            body_bytes: [...Array.from(pTx.txBodyBytes)],
          }
        : undefined;
    }
    return undefined;
  }, [
    operatorAddress,
    chain,
    account.data?.value.account_number,
    account.data?.value.sequence,
    commissionSimulate.data?.gas_info?.gas_used,
    currentAccount,
    currentPassword,
  ]);

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

  const estimatedRewardDisplayFeeAmount = useMemo(
    () => toDisplayDenomAmount(times(chain.gasRate.low, rewardSimulate.data?.gas_info?.gas_used || '0'), decimals),
    [chain.gasRate.low, decimals, rewardSimulate.data?.gas_info?.gas_used],
  );

  const estimatedCommissionDisplayFeeAmount = useMemo(
    () => toDisplayDenomAmount(times(chain.gasRate.low, commissionSimulate.data?.gas_info?.gas_used || '0'), decimals),
    [chain.gasRate.low, commissionSimulate.data?.gas_info?.gas_used, decimals],
  );

  const isPossibleClaimReward = useMemo(
    () =>
      !!rewardAminoTx && rewardSimulate.data?.gas_info?.gas_used && gt(displayRewardAmount, '0') && gt(displayAvailableAmount, estimatedRewardDisplayFeeAmount),
    [displayAvailableAmount, displayRewardAmount, estimatedRewardDisplayFeeAmount, rewardAminoTx, rewardSimulate.data?.gas_info?.gas_used],
  );

  const isPossibleClaimCommission = useMemo(
    () =>
      chain.id === EVMOS.id
        ? !!commissionDirectTx && gt(displayAvailableAmount, estimatedCommissionDisplayFeeAmount) && currentAccount.type !== 'LEDGER'
        : !!commissionAminoTx && !!commissionSimulate.data?.gas_info?.gas_used && gt(displayAvailableAmount, estimatedCommissionDisplayFeeAmount),
    [
      chain.id,
      commissionAminoTx,
      commissionDirectTx,
      commissionSimulate.data?.gas_info?.gas_used,
      currentAccount.type,
      displayAvailableAmount,
      estimatedCommissionDisplayFeeAmount,
    ],
  );

  return (
    <Container data-is-no-expanded={chain.custom === 'no-stake'}>
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
        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={extensionStorage.currency}>
          {value}
        </Number>
      </ThirdLineContainer>

      {chain.custom !== 'no-stake' && (
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
            <ClaimButtonContainer>
              <ClaimButton
                Icon={Reward16Icon}
                type="button"
                disabled={!isPossibleClaimReward}
                onClick={async () => {
                  if (rewardAminoTx && rewardSimulate.data?.gas_info?.gas_used && isPossibleClaimReward) {
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
                            fee: {
                              amount: [{ amount: '0', denom: chain.baseDenom }],
                              gas: times(rewardSimulate.data.gas_info.gas_used, getDefaultAV(chain), 0),
                            },
                          },
                          isEditFee: true,
                          isEditMemo: true,
                          isCheckBalance: true,
                        },
                      },
                    });

                    if (currentAccount.type === 'LEDGER') {
                      await debouncedOpenTab();
                    }
                  }
                }}
              >
                {t('pages.Wallet.components.cosmos.NativeChainCard.index.claimRewardButton')}
              </ClaimButton>
              {operatorAddress && (
                <ClaimButton
                  Icon={Reward16Icon}
                  type="button"
                  disabled={!isPossibleClaimCommission}
                  onClick={async () => {
                    if (chain.id === EVMOS.id && commissionDirectTx && isPossibleClaimCommission) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'cos_signDirect',
                          params: {
                            chainName: chain.chainName,
                            doc: {
                              ...commissionDirectTx,
                            },
                            isEditFee: true,
                            isEditMemo: true,
                            isCheckBalance: true,
                          },
                        },
                      });
                    }

                    if (chain.id !== EVMOS.id && commissionAminoTx && commissionSimulate.data?.gas_info?.gas_used && isPossibleClaimCommission) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'cos_signAmino',
                          params: {
                            chainName: chain.chainName,
                            doc: {
                              ...commissionAminoTx,
                              fee: {
                                amount: [{ amount: '0', denom: chain.baseDenom }],
                                gas: times(commissionSimulate.data.gas_info.gas_used, getDefaultAV(chain), 0),
                              },
                            },
                            isEditFee: true,
                            isEditMemo: true,
                            isCheckBalance: true,
                          },
                        },
                      });

                      if (currentAccount.type === 'LEDGER') {
                        await debouncedOpenTab();
                      }
                    }
                  }}
                >
                  {t('pages.Wallet.components.cosmos.NativeChainCard.index.claimCommissionButton')}
                </ClaimButton>
              )}
            </ClaimButtonContainer>
          </StyledAccordionDetails>
        </StyledAccordion>
      )}

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" onClick={() => navigate('/wallet/receive')}>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" onClick={() => navigate('/wallet/send')}>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.sendButton')}
        </Button>
        <Button
          Icon={SwapIcon16}
          accentColor={ACCENT_COLORS.GREEN01}
          hoverAccentColor={ACCENT_COLORS.GREEN02}
          typoVarient="h5"
          onClick={() => navigate(`/wallet/swap/${chain.id}` as unknown as Path)}
        >
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.swapButton')}
        </Button>
      </ButtonContainer>

      {chain.custom !== 'no-stake' && (
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
      )}
    </Container>
  );
}

export function NativeChainCardSkeleton({ chain, isCustom }: NativeChainCardProps) {
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const validators = useValidatorsSWR();

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

  const operatorAddress = useMemo(() => validators.data?.find((item) => item.address === address)?.operatorAddress, [address, validators.data]);

  const { enqueueSnackbar } = useSnackbar();

  const handleOnClickCopy = () => {
    if (copy(address)) {
      enqueueSnackbar(t('pages.Wallet.components.cosmos.NativeChainCard.index.copied'));
    }
  };

  return (
    <Container data-is-no-expanded={chain.custom === 'no-stake'}>
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

      {chain.custom !== 'no-stake' && (
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
            <ClaimButtonContainer>
              <ClaimButton Icon={Reward16Icon} type="button" disabled>
                {t('pages.Wallet.components.cosmos.NativeChainCard.index.claimRewardButton')}
              </ClaimButton>
              {operatorAddress && (
                <ClaimButton Icon={Reward16Icon} type="button" disabled>
                  {t('pages.Wallet.components.cosmos.NativeChainCard.index.claimCommissionButton')}
                </ClaimButton>
              )}
            </ClaimButtonContainer>
          </StyledAccordionDetails>
        </StyledAccordion>
      )}

      <ButtonContainer>
        <Button Icon={ReceiveIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.depositButton')}
        </Button>
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.sendButton')}
        </Button>
        <Button Icon={SwapIcon16} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.swapButton')}
        </Button>
      </ButtonContainer>

      {chain.custom !== 'no-stake' && (
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
      )}
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
        <Button Icon={SendIcon} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.sendButton')}
        </Button>
        <Button Icon={SwapIcon16} typoVarient="h5" disabled>
          {t('pages.Wallet.components.cosmos.NativeChainCard.index.swapButton')}
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
