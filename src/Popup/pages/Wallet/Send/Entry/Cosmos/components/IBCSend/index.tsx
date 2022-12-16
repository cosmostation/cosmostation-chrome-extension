import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_DEFAULT_IBC_SEND_GAS, COSMOS_DEFAULT_IBC_TRANSFER_GAS } from '~/constants/chain';
import { SHENTU } from '~/constants/chain/cosmos/shentu';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import DropdownButton from '~/Popup/components/common/DropdownButton';
import IconButton from '~/Popup/components/common/IconButton';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useClientStateSWR } from '~/Popup/hooks/SWR/cosmos/useClientStateSWR';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentFees } from '~/Popup/hooks/useCurrent/useCurrentFees';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { convertAssetNameToCosmos, convertCosmosToAssetName, getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { protoTx } from '~/Popup/utils/proto';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain, CosmosToken as BaseCosmosToken, GasRateKey } from '~/types/chain';

import ReceiverIBCPopover from './components/ReceiverIBCPopover';
import {
  BottomContainer,
  Container,
  ContentContainer,
  ExchangeWarningContainer,
  ExchangeWarningIconContainer,
  ExchangeWarningTextContainer,
  MarginTop8Div,
  MaxButton,
  StyledInput,
  StyledTextarea,
  WarningContainer,
  WarningContentsContainer,
  WarningTextContainer,
} from './styled';
import CoinOrTokenPopover from '../CoinOrTokenPopover';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import IBCWarningIcon from '~/images/icons/IBCWarning.svg';
import Info16Icon from '~/images/icons/Info16.svg';

export const TYPE = {
  COIN: 'coin',
  TOKEN: 'token',
} as const;

export type CoinInfo = BaseCoinInfo & { type: typeof TYPE.COIN };
export type TokenInfo = BaseCosmosToken & { type: typeof TYPE.TOKEN };

export type CoinOrTokenInfo = CoinInfo | TokenInfo;

type IBCSendProps = {
  chain: CosmosChain;
};

const cosmosAssetNames = COSMOS_CHAINS.map((item) => convertCosmosToAssetName(item));

export default function IBCSend({ chain }: IBCSendProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const accounts = useAccounts(true);
  const cosmosChainsAssets = useAssetsSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const nodeInfo = useNodeInfoSWR(chain);
  const { enQueue } = useCurrentQueue();
  const params = useParams();

  const { t } = useTranslation();
  const { currentCosmosTokens } = useCurrentCosmosTokens();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [recipientPopoverAnchorEl, setReceiverIBCPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);
  const isRecipientOpenPopover = Boolean(recipientPopoverAnchorEl);
  const senderAddress = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { decimals, gas, gasRate } = chain;

  const filteredCosmosChainAssets = useMemo(() => cosmosChainsAssets.data.filter((item) => cosmosAssetNames.includes(item.chain)), [cosmosChainsAssets.data]);
  const filteredCurrentChainAssets = useMemo(
    () => currentChainAssets.data.filter((item) => convertAssetNameToCosmos(item.prevChain || '')),
    [currentChainAssets.data],
  );
  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        coinType: 'staking',
        decimals: chain.decimals,
        imageURL: chain.imageURL,
        displayDenom: chain.displayDenom,
        baseDenom: chain.baseDenom,
        coinGeckoId: chain.coinGeckoId,
      },
      ...coinList.coins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
      ...coinList.ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
    ],
    [
      chain.baseDenom,
      chain.coinGeckoId,
      chain.decimals,
      chain.displayDenom,
      chain.imageURL,
      coinList.coins,
      coinList.ibcCoins,
      totalAmount,
      vestingRelatedAvailable,
    ],
  );
  const availableCoinOrTokenList: CoinOrTokenInfo[] = useMemo(
    () => [
      ...coinAll.filter((item) => gt(item.availableAmount, '0')).map((item) => ({ ...item, type: TYPE.COIN })),
      ...currentCosmosTokens.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item, type: TYPE.TOKEN })),
    ],
    [coinAll, currentCosmosTokens],
  );

  const [currentCoinOrTokenId, setCurrentCoinOrTokenId] = useState(params.id || chain.baseDenom);

  const [receiverAddress, setReceiverAddress] = useState('');
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const currentCoinOrToken = useMemo(
    () =>
      availableCoinOrTokenList.find(
        (item) => (item.type === 'coin' && item.baseDenom === currentCoinOrTokenId) || (item.type === 'token' && item.address === currentCoinOrTokenId),
      )!,
    [availableCoinOrTokenList, currentCoinOrTokenId],
  );

  const sendGas = currentCoinOrToken.type === 'coin' ? gas.ibcSend || COSMOS_DEFAULT_IBC_SEND_GAS : gas.ibcTransfer || COSMOS_DEFAULT_IBC_TRANSFER_GAS;

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [currentGasRateKey, setCurrentGasRateKey] = useState<GasRateKey>('low');

  const [currentFeeAmount, setCurrentFeeAmount] = useState(times(sendGas, gasRate[currentGasRateKey]));

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentFeeAmount, decimals);

  const tokenBalance = useTokenBalanceSWR(chain, currentCoinOrTokenId, senderAddress);

  const currentCoinOrTokenAvailableAmount = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      return currentCoinOrToken.availableAmount;
    }

    return tokenBalance.data?.balance || '0';
  }, [currentCoinOrToken, tokenBalance.data?.balance]);

  const currentCoinOrTokenDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentCoinOrTokenAvailableAmount, currentCoinOrToken.decimals),
    [currentCoinOrToken.decimals, currentCoinOrTokenAvailableAmount],
  );

  const senderCoinAndTokenList = useMemo(
    () =>
      availableCoinOrTokenList.filter((item) => {
        if (item.type === 'coin' && (item.coinType === 'native' || item.coinType === 'staking')) {
          return !!filteredCosmosChainAssets.filter((asset) => asset.counter_party?.denom === item.baseDenom).length;
        }

        if (item.type === 'coin' && item.coinType === 'ibc') {
          return !!(
            filteredCurrentChainAssets.filter((asset) => asset.channel && asset.port && asset.denom === item.baseDenom).length +
            filteredCosmosChainAssets.filter((asset) => asset.counter_party?.denom === item.baseDenom).length
          );
        }

        if (item.type === 'token') {
          return !!filteredCosmosChainAssets.filter((asset) => asset.counter_party?.denom === item.address).length;
        }

        return false;
      }),
    [availableCoinOrTokenList, filteredCosmosChainAssets, filteredCurrentChainAssets],
  );

  const receiverIBCList = useMemo(() => {
    if (currentCoinOrToken.type === 'coin' && (currentCoinOrToken.coinType === 'native' || currentCoinOrToken.coinType === 'staking')) {
      const assets = filteredCosmosChainAssets.filter((asset) => asset.counter_party?.denom === currentCoinOrToken.baseDenom);
      return assets.map((item) => ({ chain: convertAssetNameToCosmos(item.chain)!, channel: item.counter_party!.channel, port: item.counter_party!.port }));
    }

    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.coinType === 'ibc') {
      const assets = filteredCurrentChainAssets.filter((asset) => asset.denom === currentCoinOrToken.baseDenom && asset.channel && asset.port);
      const counterPartyAssets = filteredCosmosChainAssets.filter((asset) => asset.counter_party?.denom === currentCoinOrToken.baseDenom);
      return [
        ...assets.map((item) => ({ chain: convertAssetNameToCosmos(item.prevChain || '')!, channel: item.channel!, port: item.port! })),
        ...counterPartyAssets.map((item) => ({ chain: convertAssetNameToCosmos(item.chain || '')!, channel: item.counter_party!.channel, port: item.port! })),
      ];
    }

    if (currentCoinOrToken.type === 'token') {
      const assets = filteredCosmosChainAssets.filter((asset) => asset.counter_party?.denom === currentCoinOrToken.address);
      return assets.map((item) => ({ chain: convertAssetNameToCosmos(item.chain)!, channel: item.counter_party!.channel, port: item.counter_party!.port }));
    }

    return [];
  }, [currentCoinOrToken, filteredCosmosChainAssets, filteredCurrentChainAssets]);

  const [selectedReceiverIBC, setReceiverIBC] = useState(receiverIBCList.length ? receiverIBCList[0] : undefined);

  const addressRegex = useMemo(
    () => getCosmosAddressRegex(selectedReceiverIBC?.chain?.bech32Prefix.address || '', [39]),
    [selectedReceiverIBC?.chain?.bech32Prefix.address],
  );

  const clientState = useClientStateSWR({ chain, channelId: selectedReceiverIBC?.channel ?? '', port: selectedReceiverIBC?.port });

  const latestHeight = clientState.data?.identified_client_state?.client_state?.latest_height;

  const revisionHeight = latestHeight?.revision_height ? String(1000 + parseInt(latestHeight?.revision_height, 10)) : undefined;
  const revisionNumber = latestHeight?.revision_number;

  const { feeCoins } = useCurrentFees(chain);

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(feeCoins[0].baseDenom);

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom)!, [currentFeeBaseDenom, feeCoins]);

  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentFeeCoin.availableAmount, currentFeeCoin.decimals),
    [currentFeeCoin.availableAmount, currentFeeCoin.decimals],
  );

  const currentFeeGasRate = useMemo(() => currentFeeCoin.gasRate ?? chain.gasRate, [chain.gasRate, currentFeeCoin.gasRate]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount);
    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentCoinOrTokenDisplayAvailableAmount;
  }, [currentCoinOrToken, currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount, currentFeeCoin.baseDenom]);

  const currentCoinOrTokenDecimals = currentCoinOrToken.decimals || 0;
  const currentCoinOrTokenDisplayDenom = currentCoinOrToken.displayDenom;
  const currentDisplayMaxDecimals = getDisplayMaxDecimals(currentCoinOrTokenDecimals);
  const errorMessage = useMemo(() => {
    if (!latestHeight) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.timeoutHeightError');
    }
    if (!addressRegex.test(receiverAddress)) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.invalidAddress');
    }

    if (!currentDisplayAmount || !gt(currentDisplayAmount, '0')) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.invalidAmount');
    }

    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, plus(currentDisplayAmount, currentDisplayFeeAmount))) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.insufficientAmount');
      }
    }

    if ((currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom !== currentFeeCoin.baseDenom) || currentCoinOrToken.type === 'token') {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, currentDisplayAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.insufficientAmount');
      }

      if (!gte(currentFeeCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.insufficientFeeAmount');
      }
    }

    return '';
  }, [
    addressRegex,
    receiverAddress,
    currentCoinOrToken,
    currentCoinOrTokenDisplayAvailableAmount,
    currentDisplayAmount,
    currentDisplayFeeAmount,
    currentFeeCoin.baseDenom,
    currentFeeCoinDisplayAvailableAmount,
    t,
    latestHeight,
  ]);

  const memoizedIBCSendAminoTx = useMemo(() => {
    if (account.data?.value.account_number && selectedReceiverIBC && currentDisplayAmount) {
      const sequence = String(account.data?.value.sequence || '0');

      if (currentCoinOrToken.type === 'coin' && revisionNumber && revisionHeight) {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
          fee: {
            amount: [
              {
                denom: currentFeeCoin.baseDenom,
                amount: chain.type === 'ETHERMINT' ? times(currentFeeGasRate[currentGasRateKey], COSMOS_DEFAULT_IBC_SEND_GAS, 0) : '1',
              },
            ],
            gas: COSMOS_DEFAULT_IBC_SEND_GAS,
          },
          memo: currentMemo,
          msgs: [
            {
              type: chain.chainName === SHENTU.chainName ? 'bank/MsgTransfer' : 'cosmos-sdk/MsgTransfer',
              value: {
                receiver: receiverAddress,
                sender: senderAddress,
                source_channel: selectedReceiverIBC.channel,
                source_port: selectedReceiverIBC.port || 'transfer',
                timeout_height: {
                  revision_height: revisionHeight,
                  revision_number: revisionNumber === '0' ? undefined : revisionNumber,
                },
                token: {
                  amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0),
                  denom: currentCoinOrToken.baseDenom,
                },
              },
            },
          ],
        };
      }

      if (currentCoinOrToken.type === 'token') {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
          fee: {
            amount: [
              {
                denom: currentFeeCoin.baseDenom,
                amount: chain.type === 'ETHERMINT' ? times(currentFeeGasRate[currentGasRateKey], COSMOS_DEFAULT_IBC_TRANSFER_GAS, 0) : '1',
              },
            ],
            gas: COSMOS_DEFAULT_IBC_TRANSFER_GAS,
          },
          memo: currentMemo,
          msgs: [
            {
              type: 'wasm/MsgExecuteContract',
              value: {
                sender: senderAddress,
                contract: currentCoinOrToken.address,
                msg: {
                  send: {
                    amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0),
                    contract: selectedReceiverIBC.port.split('.')?.[1],
                    msg: Buffer.from(JSON.stringify({ channel: selectedReceiverIBC.channel, remote_address: receiverAddress, timeout: 900 }), 'utf8').toString(
                      'base64',
                    ),
                  },
                },
                funds: [],
              },
            },
          ],
        };
      }
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    chain.chainId,
    chain.chainName,
    chain.type,
    currentCoinOrToken,
    currentDisplayAmount,
    currentFeeCoin.baseDenom,
    currentFeeGasRate,
    currentGasRateKey,
    currentMemo,
    nodeInfo.data?.node_info?.network,
    receiverAddress,
    revisionHeight,
    revisionNumber,
    selectedReceiverIBC,
    senderAddress,
  ]);

  const [ibcSendAminoTx] = useDebounce(memoizedIBCSendAminoTx, 1000);

  const ibcSendProtoTx = useMemo(() => {
    if (ibcSendAminoTx) {
      return protoTx(ibcSendAminoTx, '', { type: getPublicKeyType(chain), value: '' });
    }
    return null;
  }, [chain, ibcSendAminoTx]);

  const simulate = useSimulateSWR({ chain, txBytes: ibcSendProtoTx?.tx_bytes });

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, getDefaultAV(chain), 0) : undefined),
    [chain, simulate.data?.gas_info?.gas_used],
  );

  const currentGas = useMemo(() => customGas || simulatedGas || sendGas, [customGas, sendGas, simulatedGas]);

  useEffect(() => {
    if (receiverIBCList.length === 0 && senderCoinAndTokenList.length > 0) {
      setCurrentCoinOrTokenId(senderCoinAndTokenList[0].type === 'coin' ? senderCoinAndTokenList[0].baseDenom : senderCoinAndTokenList[0].address);
    } else {
      setReceiverIBC(receiverIBCList[0]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCoinOrTokenId]);

  useEffect(() => {
    setCurrentFeeAmount(times(currentGas, currentFeeGasRate[currentGasRateKey]));
  }, [currentGas, currentGasRateKey, currentFeeGasRate]);

  if (senderCoinAndTokenList.length === 0) {
    return (
      <WarningContainer>
        <WarningContentsContainer>
          <IBCWarningIcon />
          <WarningTextContainer>
            <Typography variant="h4">{t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.ibcWarningHeadertitle')}</Typography>
            <Typography variant="h6">{t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.ibcWarningSubtitle')}</Typography>
          </WarningTextContainer>
        </WarningContentsContainer>
      </WarningContainer>
    );
  }

  return (
    <Container>
      <ContentContainer>
        <ExchangeWarningContainer>
          <ExchangeWarningIconContainer>
            <Info16Icon />
          </ExchangeWarningIconContainer>
          <ExchangeWarningTextContainer>
            <Typography variant="h6">{t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.exchangeWarning')}</Typography>
          </ExchangeWarningTextContainer>
        </ExchangeWarningContainer>

        <MarginTop8Div>
          <DropdownButton
            imgSrc={selectedReceiverIBC?.chain.imageURL}
            title={selectedReceiverIBC?.chain.chainName || ''}
            leftHeaderTitle={selectedReceiverIBC?.channel}
            isOpenPopover={isRecipientOpenPopover}
            onClickDropdown={(currentTarget) => setReceiverIBCPopoverAnchorEl(currentTarget)}
          />
        </MarginTop8Div>
        <MarginTop8Div>
          <StyledInput
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setIsOpenedMyAddressBook(true)} edge="end">
                  <AccountAddressIcon />
                </IconButton>
                <IconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                  <AddressBook24Icon />
                </IconButton>
              </InputAdornment>
            }
            placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.recipientAddressPlaceholder')}
            onChange={(e) => setReceiverAddress(e.currentTarget.value)}
            value={receiverAddress}
          />
        </MarginTop8Div>
        <MarginTop8Div>
          <DropdownButton
            imgSrc={currentCoinOrToken.imageURL}
            title={currentCoinOrTokenDisplayDenom}
            leftHeaderTitle={t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.available')}
            leftSubTitle={currentCoinOrTokenDisplayAvailableAmount}
            isOpenPopover={isOpenPopover}
            decimals={currentDisplayMaxDecimals}
            onClickDropdown={(currentTarget) => setPopoverAnchorEl(currentTarget)}
          />
        </MarginTop8Div>
        <MarginTop8Div>
          <StyledInput
            endAdornment={
              <InputAdornment position="end">
                <MaxButton
                  type="button"
                  onClick={() => {
                    setCurrentDisplayAmount(maxDisplayAmount);
                  }}
                >
                  <Typography variant="h7">MAX</Typography>
                </MaxButton>
              </InputAdornment>
            }
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, currentCoinOrToken.decimals || 0) && e.currentTarget.value) {
                return;
              }

              setCurrentDisplayAmount(e.currentTarget.value);
            }}
            value={currentDisplayAmount}
            placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.amountPlaceholder')}
          />
        </MarginTop8Div>

        <MarginTop8Div>
          <StyledTextarea
            multiline
            minRows={1}
            maxRows={1}
            placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.memoPlaceholder')}
            onChange={(e) => setCurrentMemo(e.currentTarget.value)}
            value={currentMemo}
          />
        </MarginTop8Div>

        <MarginTop8Div>
          <Fee
            feeCoin={currentFeeCoin}
            feeCoinList={feeCoins}
            gasRate={currentFeeGasRate}
            baseFee={currentFeeAmount}
            gas={currentGas}
            onChangeFeeCoin={(feeCoinBaseDenom) => {
              setCurrentFeeBaseDenom(feeCoinBaseDenom);
            }}
            onChangeGas={(g) => setCustomGas(g)}
            onChangeGasRateKey={(gasRateKey) => setCurrentGasRateKey(gasRateKey)}
            isEdit
          />
        </MarginTop8Div>
      </ContentContainer>

      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={!!errorMessage || !ibcSendAminoTx}
              onClick={async () => {
                if (ibcSendAminoTx) {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'cos_signAmino',
                      params: {
                        chainName: chain.chainName,
                        doc: {
                          ...ibcSendAminoTx,
                          fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: currentCeilFeeAmount }], gas: currentGas },
                        },
                      },
                    },
                  });
                }

                if (currentAccount.type === 'LEDGER') {
                  await openWindow();
                  window.close();
                }
              }}
            >
              {t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.sendButton')}
            </Button>
          </div>
        </Tooltip>
      </BottomContainer>

      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        chain={selectedReceiverIBC?.chain}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setReceiverAddress(a.address);
          setCurrentMemo(a.memo || '');
        }}
      />

      <AccountAddressBookBottomSheet
        open={isOpenedMyAddressBook}
        chain={selectedReceiverIBC?.chain}
        onClose={() => setIsOpenedMyAddressBook(false)}
        onClickAddress={(a) => {
          setReceiverAddress(a);
        }}
      />

      <CoinOrTokenPopover
        chain={chain}
        address={senderAddress}
        marginThreshold={0}
        currentCoinOrTokenInfo={currentCoinOrToken}
        coinOrTokenInfos={senderCoinAndTokenList}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          setCurrentCoinOrTokenId(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.baseDenom : clickedCoinOrToken.address);
          setCurrentDisplayAmount('');
          setReceiverAddress('');
          setCurrentMemo('');
        }}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />

      <ReceiverIBCPopover
        recipientList={receiverIBCList}
        marginThreshold={0}
        selectedReceiverIBC={selectedReceiverIBC}
        onClickChain={(clickedChain) => {
          setReceiverIBC(clickedChain);
          setCurrentDisplayAmount('');
          setReceiverAddress('');
          setCurrentMemo('');
        }}
        open={isRecipientOpenPopover}
        onClose={() => setReceiverIBCPopoverAnchorEl(null)}
        anchorEl={recipientPopoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />
    </Container>
  );
}
