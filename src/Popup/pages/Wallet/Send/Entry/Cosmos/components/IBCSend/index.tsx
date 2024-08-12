import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_DEFAULT_IBC_SEND_GAS, COSMOS_DEFAULT_IBC_TRANSFER_GAS } from '~/constants/chain';
import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import unknownChainImg from '~/images/chainImgs/unknown.png';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import AssetBottomSheetButton from '~/Popup/components/common/AssetBottomSheetButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useArchIDSWR } from '~/Popup/hooks/SWR/cosmos/useArchIDSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useBlockLatestSWR } from '~/Popup/hooks/SWR/cosmos/useBlockLatestSWR';
import { useClientStateSWR } from '~/Popup/hooks/SWR/cosmos/useClientStateSWR';
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useGasMultiplySWR } from '~/Popup/hooks/SWR/cosmos/useGasMultiplySWR';
import { useICNSSWR } from '~/Popup/hooks/SWR/cosmos/useICNSSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useParamsSWR } from '~/Popup/hooks/SWR/cosmos/useParamsSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useTokensBalanceSWR as useCosmosTokensBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokensBalanceSWR';
import { useChainIdToAssetNameMapsSWR } from '~/Popup/hooks/SWR/useChainIdToAssetNameMapsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { convertAssetNameToCosmos, convertCosmosToAssetName, getPublicKeyType } from '~/Popup/utils/cosmos';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain, GasRateKey } from '~/types/chain';

import RecipientIBCListBottomSheet from './components/RecipientIBCBottomSheet';
import {
  Address,
  AddressContainer,
  BottomContainer,
  CheckAddressIconContainer,
  Container,
  ContentContainer,
  ExchangeWarningContainer,
  ExchangeWarningIconContainer,
  ExchangeWarningTextContainer,
  LeftChainImageContainer,
  LeftChainInfoContainer,
  LeftContainer,
  LeftHeaderTitleContainer,
  LeftImageContainer,
  LeftInfoContainer,
  MarginTop8Div,
  MaxButton,
  StyledInput,
  StyledTextarea,
  TitleContainer,
} from './styled';
import type { CoinOrTokenInfo } from '../..';
import CoinListBottomSheet from '../CoinListBottomSheet';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import CheckAddress16Icon from '~/images/icons/CheckAddress16.svg';
import Info16Icon from '~/images/icons/Info16.svg';

export const TYPE = {
  COIN: 'coin',
  TOKEN: 'token',
} as const;

type IBCSendProps = {
  chain: CosmosChain;
};

export default function IBCSend({ chain }: IBCSendProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const accounts = useAccounts(true);
  const cosmosChainsAssets = useAssetsSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const nodeInfo = useNodeInfoSWR(chain);
  const { enQueue } = useCurrentQueue();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { extensionStorage } = useExtensionStorage();
  const { currency, additionalChains } = extensionStorage;
  const params = useParams();

  const chainParams = useParamsSWR(chain);
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR();

  const [isDisabled, setIsDisabled] = useState(false);

  const { t } = useTranslation();
  const { currentCosmosTokens } = useCurrentCosmosTokens(chain);

  const senderAddress = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const { gas, gasRate } = chain;

  const cosmosAssetNames = useMemo(() => COSMOS_CHAINS.map((item) => convertCosmosToAssetName(item, chainIdToAssetNameMaps)), [chainIdToAssetNameMaps]);

  const filteredCosmosChainAssets = useMemo(
    () => cosmosChainsAssets.data.filter((item) => cosmosAssetNames.includes(item.chain)),
    [cosmosAssetNames, cosmosChainsAssets.data],
  );
  const filteredCurrentChainAssets = useMemo(
    () => currentChainAssets.data.filter((item) => convertAssetNameToCosmos(item.prevChain || '', chainIdToAssetNameMaps)),
    [chainIdToAssetNameMaps, currentChainAssets.data],
  );

  const { data: coinsBalance } = useBalanceSWR(chain);

  const cosmosTokensBalance = useCosmosTokensBalanceSWR({ chain, contractAddresses: currentCosmosTokens.map((item) => item.address), address: senderAddress });

  const [currentCoinOrTokenId, setCurrentCoinOrTokenId] = useState(params.id || chain.baseDenom);

  const [currentAddress, setCurrentAddress] = useState('');
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const [isOpenedRecipientIBCList, setIsOpenedRecipientIBCList] = useState(false);
  const [isOpenedCoinList, setIsOpenedCoinList] = useState(false);

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [debouncedCurrentAddress] = useDebounce(currentAddress, 500);

  const cosmosAdditionalChains = useMemo(() => additionalChains.filter((item) => item.line === 'COSMOS') as CosmosChain[], [additionalChains]);

  const senderCoinAndTokenList: CoinOrTokenInfo[] = useMemo(() => {
    if (cosmosAdditionalChains.some((item) => item.id === chain.id)) {
      return [];
    }

    const coinOrTokenList = [
      ...currentChainAssets.data
        .filter((item) => {
          if (item.type === 'native' || item.type === 'staking' || item.type === 'bridge') {
            return !!filteredCosmosChainAssets.filter(
              (asset) =>
                isEqualsIgnoringCase(asset.counter_party?.denom, item.denom) &&
                isEqualsIgnoringCase(convertAssetNameToCosmos(asset.prevChain || '', chainIdToAssetNameMaps)?.id, chain.id) &&
                cosmosAssetNames.includes(asset.prevChain || ''),
            ).length;
          }

          if (item.type === 'ibc') {
            return !!(
              filteredCurrentChainAssets.filter((asset) => asset.channel && asset.port && isEqualsIgnoringCase(asset.denom, item.denom)).length +
              filteredCosmosChainAssets.filter(
                (asset) =>
                  isEqualsIgnoringCase(asset.counter_party?.denom, item.denom) &&
                  isEqualsIgnoringCase(convertAssetNameToCosmos(asset.prevChain || '', chainIdToAssetNameMaps)?.id, chain.id),
              ).length
            );
          }
          return false;
        })
        .map((item) => {
          const name = convertAssetNameToCosmos(item.prevChain || item.origin_chain, chainIdToAssetNameMaps)?.chainName || item.prevChain?.toUpperCase() || '';

          const availableAmount = coinsBalance?.balance?.find((coin) => coin.denom === item.denom)?.amount || '0';
          const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[currency] || '0' : '0';
          const price = times(toDisplayDenomAmount(availableAmount, item.decimals), coinPrice);

          return {
            coinType: item.type,
            decimals: item.decimals,
            originBaseDenom: item.origin_denom,
            baseDenom: item.denom,
            displayDenom: item.symbol,
            imageURL: item.image,
            channelId: item.channel,
            availableAmount,
            coinGeckoId: item.coinGeckoId,
            totalAmount: '',
            name,
            type: TYPE.COIN,
            price,
          };
        }),
      ...currentCosmosTokens
        .filter((item) => !!filteredCosmosChainAssets.filter((asset) => isEqualsIgnoringCase(asset.counter_party?.denom, item.address)).length)
        .map((item) => {
          const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[currency] || '0' : '0';
          const availableAmount = cosmosTokensBalance.data.find((tokenBalances) => tokenBalances.contractAddress === item.address)?.balance || '0';
          const price = times(toDisplayDenomAmount(availableAmount, item.decimals), coinPrice);

          return {
            ...item,
            type: TYPE.TOKEN,
            availableAmount,
            name: chain.chainName,
            price,
          };
        }),
    ];

    return coinOrTokenList
      .sort((a, b) => a.displayDenom.localeCompare(b.displayDenom))
      .sort((a, b) => (gt(a.price, b.price) ? -1 : 1))
      .sort((a) => (a.displayDenom === chain.displayDenom ? -1 : 1));
  }, [
    chain.chainName,
    chain.displayDenom,
    chain.id,
    chainIdToAssetNameMaps,
    coinGeckoPrice.data,
    coinsBalance?.balance,
    cosmosAdditionalChains,
    cosmosAssetNames,
    cosmosTokensBalance.data,
    currency,
    currentChainAssets.data,
    currentCosmosTokens,
    filteredCosmosChainAssets,
    filteredCurrentChainAssets,
  ]);

  const currentCoinOrToken = useMemo(() => {
    if (!senderCoinAndTokenList.some((item) => (item.type === 'coin' ? item.baseDenom === currentCoinOrTokenId : item.address === currentCoinOrTokenId))) {
      setCurrentCoinOrTokenId(senderCoinAndTokenList[0].type === 'coin' ? senderCoinAndTokenList[0].baseDenom : senderCoinAndTokenList[0].address);
    }

    const selectedCoinOrToken =
      senderCoinAndTokenList.find(
        (item) =>
          (item.type === 'coin' && isEqualsIgnoringCase(item.baseDenom, currentCoinOrTokenId)) ||
          (item.type === 'token' && isEqualsIgnoringCase(item.address, currentCoinOrTokenId)),
      ) || senderCoinAndTokenList[0];

    return selectedCoinOrToken;
  }, [senderCoinAndTokenList, currentCoinOrTokenId]);

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

  const receiverIBCList = useMemo(() => {
    if (
      currentCoinOrToken.type === 'coin' &&
      (currentCoinOrToken.coinType === 'native' || currentCoinOrToken.coinType === 'staking' || currentCoinOrToken.coinType === 'bridge')
    ) {
      const assets = filteredCosmosChainAssets.filter(
        (asset) =>
          isEqualsIgnoringCase(asset.counter_party?.denom, currentCoinOrToken.baseDenom) &&
          isEqualsIgnoringCase(convertAssetNameToCosmos(asset.prevChain || '', chainIdToAssetNameMaps)?.id, chain.id) &&
          cosmosAssetNames.includes(asset.prevChain || ''),
      );
      return assets
        .map((item) => ({
          chain: convertAssetNameToCosmos(item.chain, chainIdToAssetNameMaps)!,
          channel: item.counter_party!.channel,
          port: item.counter_party!.port,
        }))
        .filter(
          (receiverIBC, idx, arr) =>
            arr.findIndex((item) => item.chain.id === receiverIBC.chain.id && item.channel === receiverIBC.channel && item.port === receiverIBC.port) === idx,
        );
    }

    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.coinType === 'ibc') {
      const assets = filteredCurrentChainAssets.filter(
        (asset) => isEqualsIgnoringCase(asset.denom, currentCoinOrToken.baseDenom) && asset.channel && asset.port,
      );

      const counterPartyAssets = filteredCosmosChainAssets.filter(
        (asset) =>
          isEqualsIgnoringCase(asset.counter_party?.denom, currentCoinOrToken.baseDenom) &&
          isEqualsIgnoringCase(convertAssetNameToCosmos(asset.prevChain || '', chainIdToAssetNameMaps)?.id, chain.id),
      );

      return [
        ...assets.map((item) => ({ chain: convertAssetNameToCosmos(item.prevChain || '', chainIdToAssetNameMaps)!, channel: item.channel!, port: item.port! })),
        ...counterPartyAssets.map((item) => ({
          chain: convertAssetNameToCosmos(item.chain || '', chainIdToAssetNameMaps)!,
          channel: item.counter_party!.channel,
          port: item.port!,
        })),
      ].filter(
        (receiverIBC, idx, arr) =>
          arr.findIndex((item) => item.chain.id === receiverIBC.chain.id && item.channel === receiverIBC.channel && item.port === receiverIBC.port) === idx,
      );
    }

    if (currentCoinOrToken.type === 'token') {
      const assets = filteredCosmosChainAssets.filter((asset) => isEqualsIgnoringCase(asset.counter_party?.denom, currentCoinOrToken.address));
      return assets
        .map((item) => ({
          chain: convertAssetNameToCosmos(item.chain, chainIdToAssetNameMaps)!,
          channel: item.counter_party!.channel,
          port: item.counter_party!.port,
        }))
        .filter(
          (receiverIBC, idx, arr) =>
            arr.findIndex((item) => item.chain.id === receiverIBC.chain.id && item.channel === receiverIBC.channel && item.port === receiverIBC.port) === idx,
        );
    }

    return [];
  }, [chain.id, chainIdToAssetNameMaps, cosmosAssetNames, currentCoinOrToken, filteredCosmosChainAssets, filteredCurrentChainAssets]);

  const [selectedReceiverChainId, setSelectedReceiverChainId] = useState(receiverIBCList.length ? receiverIBCList[0].chain.id : undefined);

  const selectedReceiverIBC = useMemo(() => {
    const selectedReceiveChain = receiverIBCList.find((item) => isEqualsIgnoringCase(item.chain.id, selectedReceiverChainId));

    if (
      !receiverIBCList.some(
        (item) =>
          isEqualsIgnoringCase(item.chain.id, selectedReceiveChain?.chain.id) &&
          item.channel === selectedReceiveChain?.channel &&
          item.port === selectedReceiveChain?.port,
      )
    ) {
      setSelectedReceiverChainId(receiverIBCList[0].chain.id);
    }

    return selectedReceiveChain;
  }, [selectedReceiverChainId, receiverIBCList]);

  const addressRegex = useMemo(
    () => getCosmosAddressRegex(selectedReceiverIBC?.chain?.bech32Prefix.address || '', [39]),
    [selectedReceiverIBC?.chain?.bech32Prefix.address],
  );

  const { data: ICNS } = useICNSSWR({
    name: addressRegex.test(debouncedCurrentAddress) || selectedReceiverIBC?.chain.id === ARCHWAY.id ? '' : debouncedCurrentAddress,
    cosmosChain: selectedReceiverIBC?.chain,
  });

  const { data: ArchID } = useArchIDSWR({
    archID: addressRegex.test(debouncedCurrentAddress) || selectedReceiverIBC?.chain.id !== ARCHWAY.id ? '' : debouncedCurrentAddress,
    cosmosChain: selectedReceiverIBC?.chain,
  });

  const nameResolvedAddress = useMemo(() => {
    if (selectedReceiverIBC?.chain.id === ARCHWAY.id) {
      return ArchID?.data.address;
    }
    return ICNS?.data.bech32_address;
  }, [ArchID?.data?.address, ICNS?.data.bech32_address, selectedReceiverIBC?.chain.id]);

  const currentDepositAddress = useMemo(() => nameResolvedAddress || currentAddress, [nameResolvedAddress, currentAddress]);

  const clientState = useClientStateSWR({ chain, channelId: selectedReceiverIBC?.channel ?? '', port: selectedReceiverIBC?.port });

  const receiverLatestBlock = useBlockLatestSWR(selectedReceiverIBC?.chain);

  const latestHeight = useMemo(() => receiverLatestBlock.data?.block?.header?.height, [receiverLatestBlock.data?.block?.header?.height]);

  const revisionHeight = useMemo(() => (latestHeight ? String(100 + parseInt(latestHeight, 10)) : undefined), [latestHeight]);
  const revisionNumber = useMemo(
    () => clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number,
    [clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number],
  );

  const { feeCoins, defaultGasRateKey } = useCurrentFeesSWR(chain);

  const sendGas = useMemo(
    () => (currentCoinOrToken.type === 'coin' ? gas.ibcSend || COSMOS_DEFAULT_IBC_SEND_GAS : gas.ibcTransfer || COSMOS_DEFAULT_IBC_TRANSFER_GAS),
    [currentCoinOrToken.type, gas.ibcSend, gas.ibcTransfer],
  );

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [customGasRateKey, setCustomGasRateKey] = useState<GasRateKey | undefined>();

  const currentGasRateKey = useMemo(() => customGasRateKey || defaultGasRateKey, [defaultGasRateKey, customGasRateKey]);

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(feeCoins[0].baseDenom);

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom) ?? feeCoins[0], [currentFeeBaseDenom, feeCoins]);

  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentFeeCoin.availableAmount, currentFeeCoin.decimals),
    [currentFeeCoin.availableAmount, currentFeeCoin.decimals],
  );

  const currentFeeGasRate = useMemo(() => currentFeeCoin.gasRate ?? gasRate, [currentFeeCoin.gasRate, gasRate]);

  const currentCoinOrTokenDecimals = useMemo(() => currentCoinOrToken.decimals || 0, [currentCoinOrToken.decimals]);
  const currentCoinOrTokenDisplayDenom = currentCoinOrToken.displayDenom;
  const currentDisplayMaxDecimals = useMemo(() => getDisplayMaxDecimals(currentCoinOrTokenDecimals), [currentCoinOrTokenDecimals]);

  const memoizedIBCSendAminoTx = useMemo(() => {
    if (account.data?.value.account_number && selectedReceiverIBC && currentDisplayAmount) {
      const sequence = String(account.data?.value.sequence || '0');

      if (currentCoinOrToken.type === 'coin' && revisionNumber && revisionHeight) {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? chain.chainId,
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
              type: 'cosmos-sdk/MsgTransfer',
              value: {
                receiver: currentDepositAddress,
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
          chain_id: nodeInfo.data?.default_node_info?.network ?? chain.chainId,
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
                    msg: Buffer.from(
                      JSON.stringify({ channel: selectedReceiverIBC.channel, remote_address: currentDepositAddress, timeout: 900 }),
                      'utf8',
                    ).toString('base64'),
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
    chain.type,
    currentCoinOrToken,
    currentDisplayAmount,
    currentFeeCoin.baseDenom,
    currentFeeGasRate,
    currentGasRateKey,
    currentMemo,
    nodeInfo.data?.default_node_info?.network,
    currentDepositAddress,
    revisionHeight,
    revisionNumber,
    selectedReceiverIBC,
    senderAddress,
  ]);

  const [ibcSendAminoTx] = useDebounce(memoizedIBCSendAminoTx, 700);

  const ibcSendProtoTx = useMemo(() => {
    if (ibcSendAminoTx) {
      const pTx = protoTx(ibcSendAminoTx, [''], { type: getPublicKeyType(chain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [chain, ibcSendAminoTx]);

  const simulate = useSimulateSWR({ chain, txBytes: ibcSendProtoTx?.tx_bytes });

  const { data: gasMultiply } = useGasMultiplySWR(chain);

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasMultiply, 0) : undefined),
    [simulate.data?.gas_info?.gas_used, gasMultiply],
  );

  const currentGas = useMemo(() => customGas || simulatedGas || sendGas, [customGas, sendGas, simulatedGas]);

  const currentFeeAmount = useMemo(() => times(currentGas, currentFeeGasRate[currentGasRateKey]), [currentFeeGasRate, currentGas, currentGasRateKey]);

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentFeeAmount, currentFeeCoin.decimals);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount);
    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentCoinOrTokenDisplayAvailableAmount;
  }, [currentCoinOrToken, currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount, currentFeeCoin.baseDenom]);

  const errorMessage = useMemo(() => {
    if (chainParams.data?.params?.chainlist_params?.isBankLocked) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.bankLocked');
    }

    if (!latestHeight) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.timeoutHeightError');
    }
    if (!addressRegex.test(currentDepositAddress)) {
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
    currentDepositAddress,
    chainParams.data?.params?.chainlist_params?.isBankLocked,
    currentCoinOrToken,
    currentCoinOrTokenDisplayAvailableAmount,
    currentDisplayAmount,
    currentDisplayFeeAmount,
    currentFeeCoin.baseDenom,
    currentFeeCoinDisplayAvailableAmount,
    t,
    latestHeight,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedIBCSendAminoTx]);

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
          <AssetBottomSheetButton
            leftProps={
              <LeftContainer>
                <LeftChainImageContainer>
                  <Image src={selectedReceiverIBC?.chain.imageURL} defaultImgSrc={unknownChainImg} />
                </LeftChainImageContainer>
                <LeftChainInfoContainer>
                  <TitleContainer>
                    <Typography variant="h5">{selectedReceiverIBC?.chain.chainName || ''}</Typography>
                  </TitleContainer>
                  <LeftHeaderTitleContainer>
                    <Typography variant="h6n">{selectedReceiverIBC?.channel || ''}</Typography>
                  </LeftHeaderTitleContainer>
                </LeftChainInfoContainer>
              </LeftContainer>
            }
            isOpenBottomSheet={isOpenedRecipientIBCList}
            onClick={() => {
              setIsOpenedRecipientIBCList(true);
            }}
          />
        </MarginTop8Div>
        <MarginTop8Div>
          <StyledInput
            endAdornment={
              <>
                <InputAdornment position="end">
                  <InputAdornmentIconButton onClick={() => setIsOpenedMyAddressBook(true)}>
                    <AccountAddressIcon />
                  </InputAdornmentIconButton>
                </InputAdornment>
                <InputAdornment position="start">
                  <InputAdornmentIconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                    <AddressBook24Icon />
                  </InputAdornmentIconButton>
                </InputAdornment>
              </>
            }
            placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.recipientAddressPlaceholder')}
            onChange={(e) => setCurrentAddress(e.currentTarget.value)}
            value={currentAddress}
          />
        </MarginTop8Div>
        {nameResolvedAddress && (
          <MarginTop8Div>
            <AddressContainer>
              <CheckAddressIconContainer>
                <CheckAddress16Icon />
              </CheckAddressIconContainer>
              <Address>
                <Typography variant="h7">{nameResolvedAddress}</Typography>
              </Address>
            </AddressContainer>
          </MarginTop8Div>
        )}
        <MarginTop8Div>
          <AssetBottomSheetButton
            leftProps={
              <LeftContainer>
                <LeftImageContainer>
                  <Image src={currentCoinOrToken.imageURL} />
                </LeftImageContainer>
                <LeftInfoContainer>
                  <TitleContainer>
                    <Typography variant="h5">{currentCoinOrTokenDisplayDenom}</Typography>
                  </TitleContainer>
                  <LeftHeaderTitleContainer>
                    <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.available')}</Typography>
                    {currentDisplayMaxDecimals && currentCoinOrTokenDisplayAvailableAmount && (
                      <>
                        <Typography variant="h6n"> :</Typography>{' '}
                        <Tooltip title={currentCoinOrTokenDisplayAvailableAmount} arrow placement="top">
                          <span>
                            <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={currentDisplayMaxDecimals}>
                              {currentCoinOrTokenDisplayAvailableAmount}
                            </Number>
                          </span>
                        </Tooltip>
                      </>
                    )}
                  </LeftHeaderTitleContainer>
                </LeftInfoContainer>
              </LeftContainer>
            }
            isOpenBottomSheet={isOpenedCoinList}
            onClick={() => {
              setIsOpenedCoinList(true);
            }}
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
            onChangeFeeCoin={(selectedFeeCoin) => {
              setCurrentFeeBaseDenom(selectedFeeCoin.baseDenom);
            }}
            onChangeGas={(g) => setCustomGas(g)}
            onChangeGasRateKey={(gasRateKey) => setCustomGasRateKey(gasRateKey)}
            isEdit
          />
        </MarginTop8Div>
      </ContentContainer>

      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={!!errorMessage || !ibcSendAminoTx || isDisabled}
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
                        isEditFee: false,
                        isEditMemo: false,
                        isCheckBalance: true,
                      },
                    },
                  });
                }

                if (currentAccount.type === 'LEDGER') {
                  await debouncedOpenTab();
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
        onClickAddress={(addressInfo) => {
          setCurrentAddress(addressInfo.address);
          setCurrentMemo(addressInfo.memo || '');
        }}
      />

      <AccountAddressBookBottomSheet
        open={isOpenedMyAddressBook}
        chain={selectedReceiverIBC?.chain}
        onClose={() => setIsOpenedMyAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a);
        }}
      />

      <CoinListBottomSheet
        currentCoinOrTokenInfo={currentCoinOrToken}
        coinOrTokenInfos={senderCoinAndTokenList}
        open={isOpenedCoinList}
        onClose={() => setIsOpenedCoinList(false)}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          setCurrentCoinOrTokenId(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.baseDenom : clickedCoinOrToken.address);
          setCurrentDisplayAmount('');
        }}
      />

      <RecipientIBCListBottomSheet
        recipientList={receiverIBCList}
        selectedRecipientIBC={selectedReceiverIBC}
        onClickChain={(clickedChain) => {
          setSelectedReceiverChainId(clickedChain.chain.id);
          setCurrentDisplayAmount('');
          setCurrentAddress('');
          setCurrentMemo('');
        }}
        open={isOpenedRecipientIBCList}
        onClose={() => setIsOpenedRecipientIBCList(false)}
      />
    </Container>
  );
}
