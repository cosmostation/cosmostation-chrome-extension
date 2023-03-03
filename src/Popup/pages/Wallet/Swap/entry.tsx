import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { ONEINCH_SUPPORTED_CHAINS } from '~/constants/1inch';
import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { AXELAR } from '~/constants/chain/cosmos/axelar';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { FETCH_AI } from '~/constants/chain/cosmos/fetchAi';
import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { KI } from '~/constants/chain/cosmos/ki';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import AmountInput from '~/Popup/components/common/AmountInput';
import Button from '~/Popup/components/common/Button';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import WarningContainer from '~/Popup/components/common/WarningContainer';
import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useTokenAssetsSWR } from '~/Popup/hooks/SWR/1inch/useTokenAssetsSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useSquidAssetsSWR } from '~/Popup/hooks/SWR/squid/useSquidAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, lt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { calcOutGivenIn, calcSpotPrice, decimalScaling } from '~/Popup/utils/osmosis';
import { protoTx } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { AssetV3 } from '~/types/cosmos/asset';
import type { IntegratedSwapChain } from '~/types/swap/supportedChain';
import type { IntegratedSwapToken } from '~/types/swap/supportedToken';

import SlippageSettingDialog from './components/SlippageSettingDialog';
import SwapCoinContainer from './components/SwapCoinContainer';
import {
  BodyContainer,
  BottomContainer,
  Container,
  MaxButton,
  SideButton,
  SwapCoinInputAmountContainer,
  SwapCoinOutputAmountContainer,
  SwapContainer,
  SwapIconButton,
  SwapInfoBodyContainer,
  SwapInfoBodyLeftContainer,
  SwapInfoBodyRightContainer,
  SwapInfoBodyRightTextContainer,
  SwapInfoBodyTextContainer,
  SwapInfoContainer,
  SwapInfoHeaderContainer,
  SwapInfoHeaderRightContainer,
} from './styled';

import Management24Icon from '~/images/icons/Mangement24.svg';
import SwapIcon from '~/images/icons/Swap.svg';

export type ChainAssetInfo = AssetV3 & { chainName: string; availableAmount?: string };

type EntryProps = {
  chain: CosmosChain;
};

const STABLE_POOL_TYPE = '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool';
const WEIGHTED_POOL_TYPE = '/osmosis.gamm.v1beta1.Pool';

export default function Entry({ chain }: EntryProps) {
  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const accounts = useAccounts(true);

  const { enQueue } = useCurrentQueue();
  const nodeInfo = useNodeInfoSWR(chain);
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const balance = useBalanceSWR(chain);
  const [currentSlippage, setCurrentSlippage] = useState('1');

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const poolsAssetData = usePoolsAssetSWR(chain.chainName.toLowerCase());
  const poolDenomList = useMemo(
    () => (poolsAssetData.data ? [...poolsAssetData.data.map((item) => item.adenom), ...poolsAssetData.data.map((item) => item.bdenom)] : []),
    [poolsAssetData.data],
  );
  const uniquePoolDenomList = poolDenomList.filter((denom, idx, arr) => arr.findIndex((item) => item === denom) === idx);

  const [inputCoinBaseDenom, setInputCoinBaseDenom] = useState<string>(chain.baseDenom);
  const [outputCoinBaseDenom, setOutputCoinBaseDenom] = useState<string>('');

  const currentPool = useMemo(
    () =>
      poolsAssetData.data?.find(
        (item) =>
          (isEqualsIgnoringCase(item.adenom, outputCoinBaseDenom) && isEqualsIgnoringCase(item.bdenom, inputCoinBaseDenom)) ||
          (isEqualsIgnoringCase(item.adenom, inputCoinBaseDenom) && isEqualsIgnoringCase(item.bdenom, outputCoinBaseDenom)),
      ),
    [inputCoinBaseDenom, outputCoinBaseDenom, poolsAssetData.data],
  );

  const availableSwapCoinList: ChainAssetInfo[] = useMemo(() => {
    const swapCoinList =
      currentChainAssets.data
        .filter((item) => uniquePoolDenomList.includes(item.denom))
        .map((item) => ({
          ...item,
          chainName: getCapitalize(item.prevChain || item.origin_chain),
          availableAmount: balance.data?.balance ? balance.data?.balance.find((coin) => isEqualsIgnoringCase(coin.denom, item.denom))?.amount : '0',
        })) || [];

    const sortedAvailableSwapCoinList = [
      ...swapCoinList.filter((item) => gt(item?.availableAmount || 0, 0) && (item.type === 'staking' || item.type === 'native' || item.type === 'bridge')),
      ...swapCoinList.filter((item) => gt(item?.availableAmount || 0, 0) && item.type === 'ibc').sort((a, b) => a.symbol.localeCompare(b.symbol)),
      ...swapCoinList.filter((item) => !gt(item?.availableAmount || 0, 0)).sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ];
    return sortedAvailableSwapCoinList;
  }, [balance, currentChainAssets.data, uniquePoolDenomList]);

  const [inputDisplayAmount, setInputDisplayAmount] = useState<string>('');

  const availableSwapOutputCoinList = useMemo(
    () =>
      availableSwapCoinList.filter((coin) =>
        poolsAssetData.data?.find(
          (item) =>
            (isEqualsIgnoringCase(item.adenom, coin.denom) && isEqualsIgnoringCase(item.bdenom, inputCoinBaseDenom)) ||
            (isEqualsIgnoringCase(item.adenom, inputCoinBaseDenom) && isEqualsIgnoringCase(item.bdenom, coin.denom)),
        ),
      ),
    [availableSwapCoinList, inputCoinBaseDenom, poolsAssetData.data],
  );

  const inputCoin = useMemo(
    () => availableSwapCoinList.find((item) => isEqualsIgnoringCase(item.denom, inputCoinBaseDenom)),
    [availableSwapCoinList, inputCoinBaseDenom],
  );
  const outputCoin = useMemo(
    () => availableSwapOutputCoinList.find((item) => isEqualsIgnoringCase(item.denom, outputCoinBaseDenom)),
    [availableSwapOutputCoinList, outputCoinBaseDenom],
  );

  const currentInputBaseAmount = useMemo(() => toBaseDenomAmount(inputDisplayAmount || 0, inputCoin?.decimals || 0), [inputCoin?.decimals, inputDisplayAmount]);

  const currentPoolId = useMemo(() => currentPool?.id, [currentPool?.id]);

  const poolData = usePoolSWR(currentPoolId);

  const swapFeeRate = useMemo(() => poolData.data?.pool.pool_params.swap_fee || '0', [poolData.data?.pool.pool_params.swap_fee]);

  const poolAssetsTokenList = useMemo(() => {
    if (poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE) {
      const poolAssets = poolData.data.pool.pool_assets;
      return poolAssets?.map((item) => item.token);
    }
    if (poolData.data && poolData.data.pool['@type'] === STABLE_POOL_TYPE) {
      return poolData.data.pool.pool_liquidity;
    }
    return [];
  }, [poolData.data]);

  const tokenBalanceIn = useMemo(
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, inputCoinBaseDenom))?.amount,
    [inputCoinBaseDenom, poolAssetsTokenList],
  );

  const tokenWeightIn = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, inputCoinBaseDenom))?.weight
        : undefined,
    [inputCoinBaseDenom, poolData.data],
  );

  const tokenBalanceOut = useMemo(
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, outputCoinBaseDenom))?.amount,
    [outputCoinBaseDenom, poolAssetsTokenList],
  );

  const tokenWeightOut = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, outputCoinBaseDenom))?.weight
        : undefined,
    [outputCoinBaseDenom, poolData.data],
  );

  const scalingFactors = useMemo(
    () => (poolData.data && poolData.data.pool['@type'] === STABLE_POOL_TYPE ? poolData.data.pool.scaling_factors : undefined),
    [poolData.data],
  );

  const currentOutputBaseAmount = useMemo(() => {
    try {
      return calcOutGivenIn(
        currentInputBaseAmount,
        swapFeeRate,
        poolAssetsTokenList,
        tokenBalanceIn,
        tokenWeightIn,
        tokenBalanceOut,
        tokenWeightOut,
        inputCoin?.denom,
        outputCoin?.denom,
        scalingFactors,
      );
    } catch {
      return '0';
    }
  }, [
    currentInputBaseAmount,
    inputCoin?.denom,
    outputCoin?.denom,
    poolAssetsTokenList,
    scalingFactors,
    swapFeeRate,
    tokenBalanceIn,
    tokenBalanceOut,
    tokenWeightIn,
    tokenWeightOut,
  ]);

  const currentOutputDisplayAmount = useMemo(
    () => toDisplayDenomAmount(currentOutputBaseAmount, inputDisplayAmount ? outputCoin?.decimals || 0 : 0),
    [currentOutputBaseAmount, inputDisplayAmount, outputCoin?.decimals],
  );

  const beforeSpotPriceInOverOut = useMemo(() => {
    try {
      return calcSpotPrice(
        swapFeeRate,
        poolAssetsTokenList,
        tokenBalanceIn,
        tokenWeightIn,
        tokenBalanceOut,
        tokenWeightOut,
        inputCoin?.denom,
        outputCoin?.denom,
        scalingFactors,
      );
    } catch {
      return '0';
    }
  }, [inputCoin?.denom, outputCoin?.denom, poolAssetsTokenList, scalingFactors, swapFeeRate, tokenBalanceIn, tokenBalanceOut, tokenWeightIn, tokenWeightOut]);

  const outputAmountOf1Coin = useMemo(() => {
    try {
      const beforeSpotPriceWithoutSwapFeeInOverOutDec = times(beforeSpotPriceInOverOut, minus(1, swapFeeRate));
      const multiplicationInOverOut = minus(outputCoin?.decimals || 0, inputCoin?.decimals || 0);

      return multiplicationInOverOut === '0'
        ? divide(1, beforeSpotPriceWithoutSwapFeeInOverOutDec)
        : decimalScaling(divide(1, beforeSpotPriceWithoutSwapFeeInOverOutDec, 18), Number(multiplicationInOverOut), outputCoin?.decimals);
    } catch {
      return '0';
    }
  }, [beforeSpotPriceInOverOut, inputCoin?.decimals, outputCoin?.decimals, swapFeeRate]);

  const priceImpact = useMemo(() => {
    try {
      const effective = divide(currentInputBaseAmount, currentOutputBaseAmount);
      return minus(divide(effective, beforeSpotPriceInOverOut), '1');
    } catch {
      return '0';
    }
  }, [currentInputBaseAmount, currentOutputBaseAmount, beforeSpotPriceInOverOut]);

  const priceImpactPercent = useMemo(() => times(priceImpact, '100'), [priceImpact]);

  const currentInputCoinAvailableAmount = useMemo(() => inputCoin?.availableAmount || '0', [inputCoin]);

  const currentInputCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentInputCoinAvailableAmount, inputCoin?.decimals || 0),
    [currentInputCoinAvailableAmount, inputCoin],
  );

  const currentFeeCoin = chain;

  const swapCoin = useCallback(() => {
    const tmpInputCoinBaseDenom = inputCoinBaseDenom;
    setInputCoinBaseDenom(outputCoinBaseDenom);
    setOutputCoinBaseDenom(tmpInputCoinBaseDenom);
    setInputDisplayAmount('');
  }, [inputCoinBaseDenom, outputCoinBaseDenom]);

  const tokenOutMinAmount = useMemo(
    () => (currentSlippage && currentOutputBaseAmount ? minus(currentOutputBaseAmount, times(currentOutputBaseAmount, divide(currentSlippage, 100))) : '0'),
    [currentSlippage, currentOutputBaseAmount],
  );

  const tokenOutMinDisplayAmount = useMemo(() => toDisplayDenomAmount(tokenOutMinAmount, outputCoin?.decimals || 0), [outputCoin?.decimals, tokenOutMinAmount]);

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);

  const inputCoinPrice = useMemo(
    () => (inputCoin?.coinGeckoId && coinGeckoPrice.data?.[inputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, inputCoin?.coinGeckoId],
  );
  const outputCoinPrice = useMemo(
    () => (outputCoin?.coinGeckoId && coinGeckoPrice.data?.[outputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, outputCoin?.coinGeckoId],
  );

  const inputCoinAmountPrice = useMemo(() => times(inputDisplayAmount || '0', inputCoinPrice), [inputDisplayAmount, inputCoinPrice]);

  const outputCoinAmountPrice = useMemo(() => times(currentOutputDisplayAmount || '0', outputCoinPrice), [currentOutputDisplayAmount, outputCoinPrice]);

  const memoizedSwapAminoTx = useMemo(() => {
    if (inputDisplayAmount && account.data?.value.account_number) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
        fee: { amount: [{ amount: '1', denom: currentFeeCoin.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: [
          {
            type: 'osmosis/gamm/swap-exact-amount-in',
            value: {
              routes: [
                {
                  pool_id: currentPoolId,
                  token_out_denom: outputCoinBaseDenom,
                },
              ],
              sender: address,
              token_in: {
                amount: currentInputBaseAmount,
                denom: inputCoinBaseDenom,
              },
              token_out_min_amount: fix(tokenOutMinAmount, 0),
            },
          },
        ],
      };
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    address,
    chain.chainId,
    currentFeeCoin.baseDenom,
    currentInputBaseAmount,
    currentPoolId,
    inputCoinBaseDenom,
    inputDisplayAmount,
    nodeInfo.data?.node_info?.network,
    outputCoinBaseDenom,
    tokenOutMinAmount,
  ]);

  const [swapAminoTx] = useDebounce(memoizedSwapAminoTx, 700);

  const swapProtoTx = useMemo(() => {
    if (swapAminoTx) {
      return protoTx(swapAminoTx, Buffer.from(new Uint8Array(64)).toString('base64'), { type: getPublicKeyType(chain), value: '' });
    }
    return null;
  }, [chain, swapAminoTx]);

  const simulate = useSimulateSWR({ chain, txBytes: swapProtoTx?.tx_bytes });

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, getDefaultAV(chain), 0) : undefined),
    [chain, simulate.data?.gas_info?.gas_used],
  );

  const currentGas = useMemo(() => simulatedGas || COSMOS_DEFAULT_SWAP_GAS, [simulatedGas]);

  const currentFeeAmount = useMemo(() => times(currentGas, chain.gasRate.low), [chain.gasRate.low, currentGas]);

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentCeilFeeAmount, chain.decimals);

  const currentDisplaySwapFeeAmount = useMemo(() => (inputDisplayAmount ? times(inputDisplayAmount, swapFeeRate) : '0'), [inputDisplayAmount, swapFeeRate]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount);
    if (isEqualsIgnoringCase(inputCoin?.denom, currentFeeCoin.baseDenom)) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentInputCoinDisplayAvailableAmount;
  }, [currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount, inputCoin?.denom, currentFeeCoin.baseDenom]);

  const swapFeePrice = useMemo(() => times(inputCoinPrice, currentDisplaySwapFeeAmount), [inputCoinPrice, currentDisplaySwapFeeAmount]);

  // NOTE Squid SDK Test codes
  const { squidChainList, filteredSquidTokenList } = useSquidAssetsSWR();

  const [currentSwapApi, setCurrentSwapApi] = useState('');

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain>();
  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const currentFromAddress = useMemo(
    () => (currentFromChain ? accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentFromChain.id] || '' : ''),
    [accounts?.data, currentAccount.id, currentFromChain],
  );
  const currentToAddress = useMemo(
    () => (currentToChain ? accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentToChain.id] || '' : ''),
    [accounts?.data, currentAccount.id, currentToChain],
  );

  const [isFromSelected, setIsFromSelected] = useState<boolean>();

  const [currentFromCoin, setCurrentFromCoin] = useState<IntegratedSwapToken>();
  const [currentToCoin, setCurrentToCoin] = useState<IntegratedSwapToken>();

  // FIXME 체인 리스팅 로직 최적화, 똑같은 리스트를 조건이 다르다고 새로 만들고 있는 느낌
  // FIXME unsupported chains filtering logc refactor

  // TODO 스왑 후에는 스왑해서 나온 토큰을 자동으로 추가하기
  // TODO 토큰 amount 가져오기
  const availableFromChainList: IntegratedSwapChain[] = useMemo(() => {
    const unsupportedChainIdList = ['42220', '1284', '42161'];
    if (isFromSelected && squidChainList) {
      return [
        ...squidChainList
          .filter((item) => (item.chainType === 'evm' && !unsupportedChainIdList.includes(String(item.chainId))) || item.chainId === 'osmosis-1')
          .map((item) => ({
            ...item,
            chainId: String(item.chainId),
            imageURL: item.chainIconURI,
            supportedApi: 'squid',
            id: item.chainType === 'evm' ? '33c328b1-2d5f-43f1-ac88-25be1a5abf6c' : COSMOS_CHAINS.find((c) => c.chainId === item.chainId)?.id || '',
          })),
        ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
          ...item,
          chainId: String(parseInt(item.chainId, 16)),
          supportedApi: '1inch',
          chainType: 'evm',
          id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
        })),
      ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);
    }
    if (currentToChain?.supportedApi === '1inch') {
      return [currentToChain];
    }
    if (squidChainList) {
      if (currentToChain?.chainId === 'osmosis-1') {
        return [
          ...squidChainList
            .filter((item) => (item.chainType === 'evm' && !unsupportedChainIdList.includes(String(item.chainId))) || item.chainId === 'osmosis-1')
            .map((item) => ({
              ...item,
              chainId: String(item.chainId),
              imageURL: item.chainIconURI,
              supportedApi: 'squid',
              id: item.chainType === 'evm' ? '33c328b1-2d5f-43f1-ac88-25be1a5abf6c' : COSMOS_CHAINS.find((c) => c.chainId === item.chainId)?.id || '',
            })),
        ];
      }
      if (currentToChain?.chainType === 'cosmos') {
        return [
          ...squidChainList
            .filter((item) => item.chainType === 'evm' && !unsupportedChainIdList.includes(String(item.chainId)))
            .map((item) => ({
              ...item,
              chainId: String(item.chainId),
              imageURL: item.chainIconURI,
              supportedApi: 'squid',
              id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
            })),
        ];
      }
      if (currentToChain?.chainType === 'evm') {
        return [
          ...squidChainList
            .filter((item) => item.chainType === 'evm' && !unsupportedChainIdList.includes(String(item.chainId)))
            .map((item) => ({
              ...item,
              chainId: String(item.chainId),
              imageURL: item.chainIconURI,
              supportedApi: 'squid',
              id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
            })),
        ];
      }
      return [
        ...squidChainList
          .filter((item) => (item.chainType === 'evm' && !unsupportedChainIdList.includes(String(item.chainId))) || item.chainId === 'osmosis-1')
          .map((item) => ({
            ...item,
            chainId: String(item.chainId),
            imageURL: item.chainIconURI,
            supportedApi: 'squid',
            id: item.chainType === 'evm' ? '33c328b1-2d5f-43f1-ac88-25be1a5abf6c' : COSMOS_CHAINS.find((c) => c.chainId === item.chainId)?.id || '',
          })),
        ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
          ...item,
          chainId: String(parseInt(item.chainId, 16)),
          supportedApi: '1inch',
          chainType: 'evm',
          id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
        })),
      ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);
    }
    return [];
  }, [currentToChain, isFromSelected, squidChainList]);

  const availableToChainList: IntegratedSwapChain[] = useMemo(() => {
    const unsupportedEVMChainIdList = ['42220', '1284', '42161'];
    const unsupportedCosmosChainIdList = [COSMOS.chainId, AXELAR.chainId, FETCH_AI.chainId, INJECTIVE.chainId, KI.chainId, 'phoenix-1', 'agoric-3'];

    if (!isFromSelected && squidChainList) {
      return [
        ...squidChainList
          .filter((item) => !unsupportedCosmosChainIdList.includes(String(item.chainId)) && !unsupportedEVMChainIdList.includes(String(item.chainId)))
          .map((item) => ({
            ...item,
            chainId: String(item.chainId),
            imageURL: item.chainIconURI,
            supportedApi: 'squid',
            id: item.chainType === 'evm' ? '33c328b1-2d5f-43f1-ac88-25be1a5abf6c' : COSMOS_CHAINS.find((c) => c.chainId === item.chainId)?.id || '',
          })),
        ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
          ...item,
          chainId: String(parseInt(item.chainId, 16)),
          supportedApi: '1inch',
          chainType: 'evm',
          id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
        })),
      ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);
    }
    if (currentFromChain?.supportedApi === '1inch' || currentFromChain?.chainId === 'osmosis-1') {
      return [currentFromChain];
    }
    if (squidChainList) {
      return [
        ...squidChainList
          .filter((item) => !unsupportedCosmosChainIdList.includes(String(item.chainId)) && !unsupportedEVMChainIdList.includes(String(item.chainId)))
          .map((item) => ({
            ...item,
            chainId: String(item.chainId),
            imageURL: item.chainIconURI,
            supportedApi: 'squid',
            id: item.chainType === 'evm' ? '33c328b1-2d5f-43f1-ac88-25be1a5abf6c' : COSMOS_CHAINS.find((c) => c.chainId === item.chainId)?.id || '',
          })),
        ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
          ...item,
          chainId: String(parseInt(item.chainId, 16)),
          supportedApi: '1inch',
          chainType: 'evm',
          id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
        })),
      ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);
    }
    return [];
  }, [currentFromChain, isFromSelected, squidChainList]);

  const oneinchFromTokenList = useTokenAssetsSWR(currentFromChain?.chainId || '');
  const oneinchToTokenList = useTokenAssetsSWR(currentToChain?.chainId || '');

  const filteredSquidFromTokenList: IntegratedSwapToken[] = useMemo(() => {
    if (currentSwapApi === 'squid') {
      return filteredSquidTokenList(currentFromChain?.chainId);
    }
    if (currentSwapApi === '1inch' && oneinchFromTokenList.data) {
      return currentToCoin
        ? Object.values(oneinchFromTokenList.data.tokens)
            .filter((item) => item.address !== currentToCoin.address)
            .map((item) => ({
              ...item,
              availableAmount: '123',
            }))
        : Object.values(oneinchFromTokenList.data.tokens);
    }
    return [];
  }, [currentFromChain?.chainId, currentSwapApi, currentToCoin, filteredSquidTokenList, oneinchFromTokenList.data]);

  const filteredSquidToTokenList: IntegratedSwapToken[] = useMemo(() => {
    if (currentSwapApi === 'squid') {
      return filteredSquidTokenList(currentToChain?.chainId);
    }
    if (currentSwapApi === '1inch' && oneinchToTokenList.data) {
      return currentFromCoin
        ? Object.values(oneinchToTokenList.data.tokens).filter((item) => item.address !== currentFromCoin.address)
        : Object.values(oneinchToTokenList.data.tokens);
    }
    return [];
  }, [currentSwapApi, oneinchToTokenList.data, filteredSquidTokenList, currentToChain?.chainId, currentFromCoin]);

  // const sampleparams = {
  //   fromChain: 1, // Goerli testnet
  //   fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // WETH on Goerli
  //   fromAmount: '50000000000000000', // 0.05 WETH
  //   toChain: 43114, // Avalanche Fuji Testnet
  //   toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // aUSDC on Avalanche Fuji Testnet
  //   toAddress: '0xA9b4823ec2718Fb09BD5FC21323B2BE5DD0aDDf6', // the recipient of the trade
  //   slippage: 1.0, // 1.00 = 1% max slippage across the entire route
  //   enableForecall: true, // instant execution service, defaults to true
  //   quoteOnly: false, // optional, defaults to false
  // };

  // const testSquidRoute = useSquidRouteSWR(sampleparams);

  // const testTxStatus = useSquidTxStatusSWR({ transactionId: '0x26b279240c73f5841eb9e0ce11b13ad280f4cf612c653b43bd9083672da63ec0' });

  const errorMessage = useMemo(() => {
    if (!poolData.data || !poolsAssetData.data) {
      return t('pages.Wallet.Swap.entry.networkError');
    }
    if (gt(currentInputBaseAmount, tokenBalanceIn || '0')) {
      return t('pages.Wallet.Swap.entry.excessiveSwap');
    }
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }
    if (inputCoin?.denom === currentFeeCoin.baseDenom) {
      if (!gte(currentInputCoinDisplayAvailableAmount, plus(inputDisplayAmount, currentDisplayFeeAmount))) {
        return t('pages.Wallet.Swap.entry.insufficientAmount');
      }
      if (!gte(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
      }
    }
    if (gt(priceImpactPercent, 10)) {
      return t('pages.Wallet.Swap.entry.invalidPriceImpact');
    }
    if (!gt(currentOutputDisplayAmount, 0)) {
      return t('pages.Wallet.Swap.entry.invalidOutputAmount');
    }
    return '';
  }, [
    poolData.data,
    poolsAssetData.data,
    currentOutputDisplayAmount,
    currentInputBaseAmount,
    tokenBalanceIn,
    inputDisplayAmount,
    currentInputCoinDisplayAvailableAmount,
    inputCoin?.denom,
    currentFeeCoin.baseDenom,
    priceImpactPercent,
    t,
    currentDisplayFeeAmount,
  ]);

  const warningMessage = useMemo(() => {
    if (filteredSquidFromTokenList) {
      return t('pages.Wallet.Swap.entry.txSizeWarning');
    }
    return '';
  }, [filteredSquidFromTokenList, t]);

  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    if (!outputCoin) {
      setOutputCoinBaseDenom(availableSwapOutputCoinList[0]?.denom);
    }
  }, [availableSwapOutputCoinList, outputCoin, outputCoinBaseDenom]);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedSwapAminoTx]);

  useEffect(() => {
    if (!currentFromChain || !currentToChain) {
      setCurrentSwapApi('');
    }
    if (currentFromChain?.supportedApi === 'squid' && currentToChain?.supportedApi === 'squid' && currentFromChain.chainId !== currentToChain.chainId) {
      setCurrentSwapApi('squid');
    }
    if (
      (currentFromChain?.supportedApi === '1inch' && currentToChain?.supportedApi === '1inch') ||
      (currentFromChain?.chainId === currentToChain?.chainId && currentFromChain?.chainType === 'evm')
    ) {
      setCurrentSwapApi('1inch');
    }
    if (currentFromChain?.chainId === 'osmosis-1' && currentToChain?.chainId === 'osmosis-1') {
      setCurrentSwapApi('osmo');
    }
  }, [
    currentFromChain,
    currentFromChain?.chainId,
    currentFromChain?.chainType,
    currentFromChain?.supportedApi,
    currentToChain,
    currentToChain?.chainId,
    currentToChain?.supportedApi,
  ]);
  return (
    <>
      <Container>
        <SubSideHeader title={t('pages.Wallet.Swap.entry.title')}>
          <SideButton onClick={() => setIsOpenSlippageDialog(true)}>
            <Management24Icon />
          </SideButton>
        </SubSideHeader>
        <BodyContainer>
          <SwapContainer>
            <SwapCoinContainer
              headerLeftText="Input coin"
              coinAmountPrice={inputCoinAmountPrice}
              currentSelectedChain={currentFromChain}
              currentSelectedCoin={currentFromCoin}
              onClickChain={(clickedChain) => {
                setCurrentFromChain(clickedChain);
                if (isFromSelected) {
                  setCurrentToChain(undefined);
                }
                if (isFromSelected === undefined) {
                  setIsFromSelected(true);
                }
                setCurrentFromCoin(undefined);
                setCurrentToCoin(undefined);
              }}
              onClickCoin={(clickedCoin) => setCurrentFromCoin(clickedCoin)}
              availableChainList={availableFromChainList}
              availableCoinList={filteredSquidFromTokenList}
              address={currentFromAddress}
              isChainSelected={!!currentFromChain && !!currentToChain}
            >
              <SwapCoinInputAmountContainer data-is-error>
                <AmountInput
                  error
                  helperText="Insufficient balance"
                  endAdornment={
                    <InputAdornment position="end">
                      <MaxButton
                        type="button"
                        onClick={() => {
                          setInputDisplayAmount(maxDisplayAmount);
                        }}
                      >
                        <Typography variant="h7">MAX</Typography>
                      </MaxButton>
                    </InputAdornment>
                  }
                  onChange={(e) => {
                    if (!isDecimal(e.currentTarget.value, 6 || 0) && e.currentTarget.value) {
                      return;
                    }

                    setInputDisplayAmount(e.currentTarget.value);
                  }}
                  value={inputDisplayAmount}
                  placeholder="0"
                />
              </SwapCoinInputAmountContainer>
            </SwapCoinContainer>
            <SwapCoinContainer
              headerLeftText="Output coin"
              coinAmountPrice={outputCoinAmountPrice}
              currentSelectedChain={currentToChain}
              currentSelectedCoin={currentToCoin}
              onClickChain={(clickedChain) => {
                setCurrentToChain(clickedChain);
                if (!isFromSelected) {
                  setCurrentFromChain(undefined);
                }
                if (isFromSelected === undefined) {
                  setIsFromSelected(false);
                }
                setCurrentFromCoin(undefined);
                setCurrentToCoin(undefined);
              }}
              onClickCoin={(clickedCoin) => setCurrentToCoin(clickedCoin)}
              availableChainList={availableToChainList}
              availableCoinList={filteredSquidToTokenList}
              address={currentToAddress}
              isChainSelected={!!currentFromChain && !!currentToChain}
            >
              <SwapCoinOutputAmountContainer data-is-active={currentOutputDisplayAmount !== '0'}>
                <Tooltip title={currentOutputDisplayAmount} arrow placement="top">
                  <span>
                    <NumberText typoOfIntegers="h3n" fixed={currentOutputDisplayAmount !== '0' ? getDisplayMaxDecimals(outputCoin?.decimals) : 0}>
                      {currentOutputDisplayAmount}
                    </NumberText>
                  </span>
                </Tooltip>
              </SwapCoinOutputAmountContainer>
            </SwapCoinContainer>
            <SwapIconButton disabled onClick={swapCoin}>
              <SwapIcon />
            </SwapIconButton>
          </SwapContainer>
          <WarningContainer>
            <Typography variant="h6">{warningMessage}</Typography>
          </WarningContainer>
          <SwapInfoContainer>
            <SwapInfoHeaderContainer>
              <Typography variant="h6n">{t('pages.Wallet.Swap.entry.minimumToReceive')}</Typography>
              <SwapInfoHeaderRightContainer>
                <Tooltip title={outputAmountOf1Coin} arrow placement="top">
                  <span>
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(outputCoin?.decimals)}>
                      {outputAmountOf1Coin}
                    </NumberText>
                  </span>
                </Tooltip>
                &nbsp;
                <Typography variant="h6n">{inputCoin?.symbol}</Typography>
              </SwapInfoHeaderRightContainer>
            </SwapInfoHeaderContainer>
            <SwapInfoBodyContainer>
              <SwapInfoBodyTextContainer>
                <SwapInfoBodyLeftContainer>
                  <Typography variant="h6">{t('pages.Wallet.Swap.entry.priceImpact')}</Typography>
                </SwapInfoBodyLeftContainer>
                <SwapInfoBodyRightContainer>
                  {inputDisplayAmount && priceImpactPercent ? (
                    <SwapInfoBodyRightTextContainer data-is-invalid={gt(priceImpactPercent, 10)}>
                      <Typography variant="h6n">{` - ${lt(priceImpactPercent, 0.01) ? `<` : ``}`}</Typography>
                      &nbsp;
                      <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                        {priceImpactPercent}
                      </NumberText>
                      <Typography variant="h6n">%</Typography>
                    </SwapInfoBodyRightTextContainer>
                  ) : (
                    <Typography variant="h6">-</Typography>
                  )}
                </SwapInfoBodyRightContainer>
              </SwapInfoBodyTextContainer>

              <SwapInfoBodyTextContainer>
                <SwapInfoBodyLeftContainer>
                  <Typography variant="h6">
                    {t('pages.Wallet.Swap.entry.swapFee')} ({times(swapFeeRate, 100)}%)
                  </Typography>
                </SwapInfoBodyLeftContainer>
                <SwapInfoBodyRightContainer>
                  {inputDisplayAmount && swapFeePrice ? (
                    <SwapInfoBodyRightTextContainer>
                      <Typography variant="h6n">{` ≈ ${lt(swapFeePrice, 0.01) ? `<` : ``} ${currency ? CURRENCY_SYMBOL[currency] : ``}`}</Typography>
                      &nbsp;
                      <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                        {swapFeePrice}
                      </NumberText>
                    </SwapInfoBodyRightTextContainer>
                  ) : (
                    <Typography variant="h6">-</Typography>
                  )}
                </SwapInfoBodyRightContainer>
              </SwapInfoBodyTextContainer>

              <SwapInfoBodyTextContainer>
                <SwapInfoBodyLeftContainer>
                  <Typography variant="h6">{t('pages.Wallet.Swap.entry.expectedOutput')}</Typography>
                </SwapInfoBodyLeftContainer>
                <SwapInfoBodyRightContainer>
                  {inputDisplayAmount && currentOutputDisplayAmount ? (
                    <SwapInfoBodyRightTextContainer>
                      <Tooltip title={currentOutputDisplayAmount} arrow placement="top">
                        <span>
                          <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(outputCoin?.decimals)}>
                            {currentOutputDisplayAmount}
                          </NumberText>
                        </span>
                      </Tooltip>
                      &nbsp;
                      <Typography variant="h6n">{outputCoin?.symbol}</Typography>
                    </SwapInfoBodyRightTextContainer>
                  ) : (
                    <Typography variant="h6">-</Typography>
                  )}
                </SwapInfoBodyRightContainer>
              </SwapInfoBodyTextContainer>

              <SwapInfoBodyTextContainer>
                <SwapInfoBodyLeftContainer>
                  <Typography variant="h6">
                    {t('pages.Wallet.Swap.entry.minimumReceived')} ({currentSlippage}%)
                  </Typography>
                </SwapInfoBodyLeftContainer>

                <SwapInfoBodyRightContainer>
                  {inputDisplayAmount && tokenOutMinDisplayAmount ? (
                    <SwapInfoBodyRightTextContainer>
                      <Tooltip title={tokenOutMinDisplayAmount} arrow placement="top">
                        <span>
                          <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(outputCoin?.decimals)}>
                            {tokenOutMinDisplayAmount}
                          </NumberText>
                        </span>
                      </Tooltip>
                      &nbsp;
                      <Typography variant="h6n">{outputCoin?.symbol}</Typography>
                    </SwapInfoBodyRightTextContainer>
                  ) : (
                    <Typography variant="h6">-</Typography>
                  )}
                </SwapInfoBodyRightContainer>
              </SwapInfoBodyTextContainer>

              {currentSwapApi === 'squid' && (
                <SwapInfoBodyTextContainer>
                  <SwapInfoBodyLeftContainer>
                    <Typography variant="h6">{t('pages.Wallet.Swap.entry.processingTime')}</Typography>
                  </SwapInfoBodyLeftContainer>

                  <SwapInfoBodyRightContainer>
                    {inputDisplayAmount && tokenOutMinDisplayAmount ? (
                      <SwapInfoBodyRightTextContainer>
                        <NumberText typoOfIntegers="h6n">~ 16</NumberText>
                        &nbsp;
                        <Typography variant="h6n">minutes</Typography>
                      </SwapInfoBodyRightTextContainer>
                    ) : (
                      <Typography variant="h6">-</Typography>
                    )}
                  </SwapInfoBodyRightContainer>
                </SwapInfoBodyTextContainer>
              )}
            </SwapInfoBodyContainer>
          </SwapInfoContainer>
        </BodyContainer>
        <BottomContainer>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                type="button"
                disabled={!!errorMessage || !swapAminoTx || isDisabled}
                onClick={async () => {
                  if (swapAminoTx) {
                    await enQueue({
                      messageId: '',
                      origin: '',
                      channel: 'inApp',
                      message: {
                        method: 'cos_signAmino',
                        params: {
                          chainName: chain.chainName,
                          doc: { ...swapAminoTx, fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: currentCeilFeeAmount }], gas: currentGas } },
                        },
                      },
                    });
                  }
                }}
              >
                {t('pages.Wallet.Swap.Entry.swapButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      <SlippageSettingDialog
        currentSlippage={currentSlippage}
        open={isOpenSlippageDialog}
        onClose={() => setIsOpenSlippageDialog(false)}
        onSubmitSlippage={(customSlippage) => {
          setCurrentSlippage(customSlippage);
        }}
      />
      );
    </>
  );
}
