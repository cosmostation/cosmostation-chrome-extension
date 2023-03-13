import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import type { GetRoute } from '@0xsquid/sdk';
import { InputAdornment, Typography } from '@mui/material';

import { ONEINCH_SUPPORTED_CHAINS } from '~/constants/1inch';
import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { AXELAR } from '~/constants/chain/cosmos/axelar';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { FETCH_AI } from '~/constants/chain/cosmos/fetchAi';
import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { KI } from '~/constants/chain/cosmos/ki';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import AmountInput from '~/Popup/components/common/AmountInput';
import Button from '~/Popup/components/common/Button';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import WarningContainer from '~/Popup/components/common/WarningContainer';
import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useAllowanceSWR } from '~/Popup/hooks/SWR/1inch/useAllowanceSWR';
import { useAllowanceTxSWR } from '~/Popup/hooks/SWR/1inch/useAllowanceTxSWR';
import type { UseOneInchSwapSWRProps } from '~/Popup/hooks/SWR/1inch/useOneInchSwapTxSWR';
import { useOneInchSwapTxSWR } from '~/Popup/hooks/SWR/1inch/useOneInchSwapTxSWR';
import { useTokenAssetsSWR } from '~/Popup/hooks/SWR/1inch/useTokenAssetsSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/1inch/useTokenBalanceSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useBalanceSWR as useETHBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useEstimateGasSWR } from '~/Popup/hooks/SWR/ethereum/useEstimateGasSWR';
import { useSquidAssetsSWR } from '~/Popup/hooks/SWR/squid/useSquidAssetsSWR';
import { useSquidRouteSWR } from '~/Popup/hooks/SWR/squid/useSquidRouteSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, lt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { calcOutGivenIn, calcSpotPrice } from '~/Popup/utils/osmosis';
import { protoTx } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { AssetV3 } from '~/types/cosmos/asset';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';
import type { IntegratedSwapAPI } from '~/types/swap/integratedSwap';

import SlippageSettingDialog from './components/SlippageSettingDialog';
import SwapCoinContainer from './components/SwapCoinContainer';
import {
  BodyContainer,
  BottomContainer,
  Container,
  MaxButton,
  OutputAmountCircularProgressContainer,
  SideButton,
  StyledCircularProgress,
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
import Permission16Icon from '~/images/icons/Permission16.svg';
import SwapIcon from '~/images/icons/Swap.svg';

export type ChainAssetInfo = AssetV3 & { chainName: string; availableAmount?: string };

const STABLE_POOL_TYPE = '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool';
const WEIGHTED_POOL_TYPE = '/osmosis.gamm.v1beta1.Pool';

export default function Entry() {
  const chain = OSMOSIS;
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
  // NOTE Tx컴포넌트 쪽이 전부 currentEthereumNetwork로 되어있어
  // 기존안대로 currentEthereumNetwork를 건드리지 않고 구현하는 방향을 고수하기에는
  // 어렵다고 판단, 기존 새로 만든 훅을 모두 삭제하고 현재 이더리움 네트워크를 변경하는 방안으로 진행
  const { setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

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

  const [currentSwapApi, setCurrentSwapApi] = useState<IntegratedSwapAPI>();

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain>();
  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const [isFromSelected, setIsFromSelected] = useState<boolean>();

  const [currentFromCoin, setCurrentFromCoin] = useState<IntegratedSwapToken>();
  const [currentToCoin, setCurrentToCoin] = useState<IntegratedSwapToken>();

  const currentPool = useMemo(
    () =>
      poolsAssetData.data?.find(
        (item) =>
          (isEqualsIgnoringCase(item.adenom, currentToCoin?.denom) && isEqualsIgnoringCase(item.bdenom, currentFromCoin?.denom)) ||
          (isEqualsIgnoringCase(item.adenom, currentFromCoin?.denom) && isEqualsIgnoringCase(item.bdenom, currentToCoin?.denom)),
      ),
    [currentFromCoin?.denom, currentToCoin?.denom, poolsAssetData.data],
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
  // NOTE 디바운싱 후 쿼리가 날라가서 디바운싱 타임 동안 프로그레스가 안보이는 문제발생
  const [debouncedInputDisplayAmount] = useDebounce(inputDisplayAmount, 400);

  const availableSwapOutputCoinList = useMemo(
    () =>
      availableSwapCoinList.filter((coin) =>
        poolsAssetData.data?.find(
          (item) =>
            (isEqualsIgnoringCase(item.adenom, coin.denom) && isEqualsIgnoringCase(item.bdenom, currentFromCoin?.denom)) ||
            (isEqualsIgnoringCase(item.adenom, currentFromCoin?.denom) && isEqualsIgnoringCase(item.bdenom, coin.denom)),
        ),
      ),
    [availableSwapCoinList, currentFromCoin?.denom, poolsAssetData.data],
  );

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
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, currentFromCoin?.denom))?.amount,
    [currentFromCoin?.denom, poolAssetsTokenList],
  );

  const tokenWeightIn = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, currentFromCoin?.denom))?.weight
        : undefined,
    [currentFromCoin?.denom, poolData.data],
  );

  const tokenBalanceOut = useMemo(
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, currentToCoin?.denom))?.amount,
    [currentToCoin?.denom, poolAssetsTokenList],
  );

  const tokenWeightOut = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, currentToCoin?.denom))?.weight
        : undefined,
    [currentToCoin?.denom, poolData.data],
  );

  const scalingFactors = useMemo(
    () => (poolData.data && poolData.data.pool['@type'] === STABLE_POOL_TYPE ? poolData.data.pool.scaling_factors : undefined),
    [poolData.data],
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
        currentToCoin?.denom,
        currentFromCoin?.denom,
        scalingFactors,
      );
    } catch {
      return '0';
    }
  }, [
    currentToCoin?.denom,
    currentFromCoin?.denom,
    poolAssetsTokenList,
    scalingFactors,
    swapFeeRate,
    tokenBalanceIn,
    tokenBalanceOut,
    tokenWeightIn,
    tokenWeightOut,
  ]);

  const currentInputCoinAvailableAmount = useMemo(() => currentFromCoin?.availableAmount || '0', [currentFromCoin]);

  const currentInputCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentInputCoinAvailableAmount, currentFromCoin?.decimals || 0),
    [currentInputCoinAvailableAmount, currentFromCoin],
  );

  const currentFeeCoin = chain;

  const swapCoin = useCallback(() => {
    // NOTE 추후 구현
    // const tmpInputCoinBaseDenom = currentFromCoin?.denom;
    // setInputCoinBaseDenom(currentToCoin?.denom || '');
    // setOutputCoinBaseDenom(tmpInputCoinBaseDenom);
    setInputDisplayAmount('');
  }, []);

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);

  // NOTE Squid SDK Test codes
  const { squidChainList, filteredSquidTokenList } = useSquidAssetsSWR();

  const currentFromAddress = useMemo(
    () => (currentFromChain ? accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentFromChain.addressId] || '' : ''),
    [accounts?.data, currentAccount.id, currentFromChain],
  );
  const currentToAddress = useMemo(
    () => (currentToChain ? accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentToChain.addressId] || '' : ''),
    [accounts?.data, currentAccount.id, currentToChain],
  );

  // FIXME unsupported chains filtering logc refactor

  // TODO 스왑 후에는 스왑해서 나온 토큰을 자동으로 추가하기

  const availableFromChainList: IntegratedSwapChain[] = useMemo(() => {
    const exceptedEVMChainIds = ['42220', '1284'];
    const supportedCosmosChainIdList = [OSMOSIS.chainId];

    const squidEVMChainIDList = squidChainList
      ?.filter((item) => item.chainType === 'evm' && !exceptedEVMChainIds.includes(String(item.chainId)))
      .map((item) => String(item.chainId));

    const squidCosmosChainIDList = squidChainList
      ?.filter((item) => supportedCosmosChainIdList.includes(String(item.chainId)))
      .map((item) => String(item.chainId));

    const squidEVMList = ETHEREUM_NETWORKS.filter((item) => squidEVMChainIDList?.includes(String(parseInt(item.chainId, 16)))).map((item) => ({
      ...item,
      chainId: String(parseInt(item.chainId, 16)),
      supportedApi: 'squid',
      line: ETHEREUM.line,
      addressId: ETHEREUM.id,
    }));

    const squidCosmosList = COSMOS_CHAINS.filter((item) => squidCosmosChainIDList?.includes(item.chainId)).map((item) => ({
      ...item,
      supportedApi: 'squid',
      addressId: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMList = [
      ...squidEVMList,
      ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
        ...item,
        chainId: String(parseInt(item.chainId, 16)),
        supportedApi: '1inch',
        line: ETHEREUM.line,
        addressId: ETHEREUM.id,
      })),
    ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);

    // FIXME if 조건문 수정하거나 날려버리기
    if (isFromSelected && squidChainList) {
      return [...integratedEVMList, ...squidCosmosList];
    }
    if (currentToChain?.supportedApi === '1inch') {
      return [currentToChain];
    }
    if (squidChainList) {
      if (currentToChain?.chainId === 'osmosis-1') {
        return [...squidEVMList, ...squidCosmosList];
      }
      if (currentToChain?.line === 'COSMOS') {
        return [...squidEVMList];
      }
      if (currentToChain?.line === 'ETHEREUM') {
        return [...squidEVMList];
      }
      return [...integratedEVMList, ...squidCosmosList];
    }
    return [];
  }, [currentToChain, isFromSelected, squidChainList]);

  const availableToChainList: IntegratedSwapChain[] = useMemo(() => {
    const exceptedEVMChainIds = ['42220', '1284'];
    const exceptedCosmosChainIds = [COSMOS.chainId, AXELAR.chainId, FETCH_AI.chainId, INJECTIVE.chainId, KI.chainId, 'phoenix-1', 'agoric-3'];

    const squidEVMChainIDList = squidChainList?.filter((item) => !exceptedEVMChainIds.includes(String(item.chainId))).map((item) => String(item.chainId));

    const squidCosmosChainIDList = squidChainList?.filter((item) => !exceptedCosmosChainIds.includes(String(item.chainId))).map((item) => String(item.chainId));

    const squidEVMList = ETHEREUM_NETWORKS.filter((item) => squidEVMChainIDList?.includes(String(parseInt(item.chainId, 16)))).map((item) => ({
      ...item,
      chainId: String(parseInt(item.chainId, 16)),
      supportedApi: 'squid',
      line: ETHEREUM.line,
      addressId: ETHEREUM.id,
    }));

    const squidCosmosList = COSMOS_CHAINS.filter((item) => squidCosmosChainIDList?.includes(String(item.chainId))).map((item) => ({
      ...item,
      supportedApi: 'squid',
      addressId: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMList = [
      ...squidEVMList,
      ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
        ...item,
        chainId: String(parseInt(item.chainId, 16)),
        supportedApi: '1inch',
        line: ETHEREUM.line,
        addressId: ETHEREUM.id,
      })),
    ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);

    if (!isFromSelected && squidChainList) {
      return [...integratedEVMList, ...squidCosmosList];
    }
    if (currentFromChain?.supportedApi === '1inch' || currentFromChain?.chainId === 'osmosis-1') {
      return [currentFromChain];
    }
    if (currentFromChain?.supportedApi === 'squid' && squidChainList) {
      return [...squidEVMList, ...squidCosmosList];
    }
    return [];
  }, [currentFromChain, isFromSelected, squidChainList]);

  const oneinchFromTokenList = useTokenAssetsSWR(currentFromChain?.chainId || '');
  const oneinchToTokenList = useTokenAssetsSWR(currentToChain?.chainId || '');

  const { ethereumTokens } = chromeStorage;

  const currentFromEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentFromChain?.id);
  const currentToEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentToChain?.id);

  // FIXME 기존에 커런트 체인으로 값 가져오게 되어있어서 그냥 새로 만들어야할듯
  const currentFromETHNativeBalance = useETHBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined);
  const currentFromETHTokenBalance = useTokenBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined, currentFromCoin);

  const currentFromBalance = useMemo(
    () =>
      currentFromCoin?.denom
        ? currentFromCoin?.availableAmount || '0'
        : isEqualsIgnoringCase('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', currentFromCoin?.address)
        ? BigInt(currentFromETHNativeBalance?.data?.result || '0').toString(10)
        : BigInt(currentFromETHTokenBalance.data || '0').toString(10),
    [
      currentFromCoin?.address,
      currentFromCoin?.availableAmount,
      currentFromCoin?.denom,
      currentFromETHNativeBalance?.data?.result,
      currentFromETHTokenBalance.data,
    ],
  );
  const currentFromDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentFromBalance, currentFromCoin?.decimals || 0),
    [currentFromCoin?.decimals, currentFromBalance],
  );

  const currentToETHNativeBalance = useETHBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined);
  const currentToETHTokenBalance = useTokenBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined, currentToCoin);

  const currentToBalance = useMemo(
    () =>
      currentToCoin?.denom
        ? currentToCoin?.availableAmount || '0'
        : isEqualsIgnoringCase('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', currentToCoin?.address)
        ? BigInt(currentToETHNativeBalance?.data?.result || '0').toString(10)
        : BigInt(currentToETHTokenBalance.data || '0').toString(10),
    [currentToCoin?.address, currentToCoin?.availableAmount, currentToCoin?.denom, currentToETHNativeBalance?.data?.result, currentToETHTokenBalance.data],
  );

  const currentToDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentToBalance, currentToCoin?.decimals || 0),
    [currentToCoin?.decimals, currentToBalance],
  );

  const filteredFromTokenList: IntegratedSwapToken[] = useMemo(() => {
    if (currentSwapApi === 'squid') {
      return [
        ...filteredSquidTokenList(currentFromChain?.chainId).filter((item) => isEqualsIgnoringCase('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', item.address)),
        ...filteredSquidTokenList(currentFromChain?.chainId).filter((item) =>
          currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredSquidTokenList(currentFromChain?.chainId).filter(
          (item) =>
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !isEqualsIgnoringCase('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', item.address),
        ),
      ];
    }
    if (currentSwapApi === '1inch' && oneinchFromTokenList.data) {
      return currentToCoin
        ? [
            ...Object.values(oneinchFromTokenList.data.tokens).filter((item) => item.address !== currentToCoin.address && item.tags.includes('native')),
            ...Object.values(oneinchFromTokenList.data.tokens).filter(
              (item) => item.address !== currentToCoin.address && currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
            ),
            ...Object.values(oneinchFromTokenList.data.tokens).filter(
              (item) =>
                item.address !== currentToCoin.address &&
                !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
                !item.tags.includes('native'),
            ),
          ]
        : [
            ...Object.values(oneinchFromTokenList.data.tokens).filter((item) => item.tags.includes('native')),
            ...Object.values(oneinchFromTokenList.data.tokens).filter((item) =>
              currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
            ),
            ...Object.values(oneinchFromTokenList.data.tokens).filter(
              (item) => !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) && !item.tags.includes('native'),
            ),
          ];
    }
    if (currentSwapApi === 'osmo') {
      return availableSwapCoinList.map((item) => ({
        ...item,
        name: item.chainName,
        coingeckoId: item.coinGeckoId,
        logoURI: item.image,
      }));
    }
    return [];
  }, [
    availableSwapCoinList,
    currentFromChain?.chainId,
    currentFromEthereumTokens,
    currentSwapApi,
    currentToCoin,
    filteredSquidTokenList,
    oneinchFromTokenList.data,
  ]);

  // FIXME 토큰 선,후 선택에 따라 토큰 리스팅에 영향을 줘서 이거 손 봐야할 듯
  const filteredToTokenList: IntegratedSwapToken[] = useMemo(() => {
    if (currentSwapApi === 'squid') {
      return [
        ...filteredSquidTokenList(currentToChain?.chainId).filter((item) => isEqualsIgnoringCase('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', item.address)),
        ...filteredSquidTokenList(currentToChain?.chainId).filter((item) =>
          currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredSquidTokenList(currentToChain?.chainId).filter(
          (item) =>
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !isEqualsIgnoringCase('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', item.address),
        ),
      ];
    }
    if (currentSwapApi === '1inch' && oneinchToTokenList.data) {
      return currentFromCoin
        ? [
            ...Object.values(oneinchToTokenList.data.tokens).filter((item) => item.address !== currentFromCoin.address && item.tags.includes('native')),
            ...Object.values(oneinchToTokenList.data.tokens).filter(
              (item) => item.address !== currentFromCoin.address && currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
            ),
            ...Object.values(oneinchToTokenList.data.tokens).filter(
              (item) =>
                item.address !== currentFromCoin.address &&
                !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
                !item.tags.includes('native'),
            ),
          ]
        : [
            ...Object.values(oneinchToTokenList.data.tokens).filter((item) => item.tags.includes('native')),
            ...Object.values(oneinchToTokenList.data.tokens).filter((item) =>
              currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
            ),
            ...Object.values(oneinchToTokenList.data.tokens).filter(
              (item) => !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) && !item.tags.includes('native'),
            ),
          ];
    }
    if (currentSwapApi === 'osmo') {
      return availableSwapOutputCoinList.map((item) => ({
        ...item,
        name: item.chainName,
        coingeckoId: item.coinGeckoId,
        logoURI: item.image,
      }));
    }
    return [];
  }, [
    currentSwapApi,
    oneinchToTokenList.data,
    currentToChain?.chainId,
    filteredSquidTokenList,
    currentToEthereumTokens,
    currentFromCoin,
    availableSwapOutputCoinList,
  ]);

  const fromTokenPrice = useMemo(
    () => (currentFromCoin?.coingeckoId && coinGeckoPrice.data?.[currentFromCoin?.coingeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentFromCoin?.coingeckoId],
  );
  const toTokenPrice = useMemo(
    () => (currentToCoin?.coingeckoId && coinGeckoPrice.data?.[currentToCoin.coingeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentToCoin?.coingeckoId],
  );

  const inputTokenAmountPrice = useMemo(() => times(inputDisplayAmount || '0', fromTokenPrice), [inputDisplayAmount, fromTokenPrice]);

  const currentInputBaseAmount = useMemo(
    () => toBaseDenomAmount(debouncedInputDisplayAmount || 0, currentFromCoin?.decimals || 0),
    [currentFromCoin?.decimals, debouncedInputDisplayAmount],
  );

  const squidRouteParam = useMemo<GetRoute | undefined>(() => {
    if (
      currentSwapApi === 'squid' &&
      currentFromChain &&
      currentFromCoin &&
      currentToChain &&
      currentToCoin &&
      currentFromCoin?.address &&
      currentToCoin?.address &&
      currentToAddress &&
      currentInputBaseAmount
    ) {
      return {
        fromChain: currentFromChain.chainId,
        fromToken: currentFromCoin.address,
        fromAmount: currentInputBaseAmount,
        toChain: currentToChain.chainId,
        toToken: currentToCoin.address,
        toAddress: currentToAddress,
        slippage: Number(currentSlippage),
      };
    }
    return undefined;
  }, [currentFromChain, currentFromCoin, currentInputBaseAmount, currentSlippage, currentSwapApi, currentToAddress, currentToChain, currentToCoin]);

  const squidRoute = useSquidRouteSWR(squidRouteParam);

  const allowance = useAllowanceSWR({
    tokenAddress: currentFromCoin?.address || '',
    walletAddress: currentFromAddress,
    chainId: currentFromChain?.chainId || '',
  });
  const allowanceTxData = useAllowanceTxSWR(
    allowance.data && !gt(allowance.data?.allowance, '0')
      ? {
          tokenAddress: currentFromCoin?.address || '',
          chainId: currentFromChain?.chainId || '',
        }
      : {
          tokenAddress: '',
          chainId: '',
        },
  );

  const allowanceTx = useMemo(() => {
    if (allowanceTxData.data) {
      return {
        from: currentFromAddress,
        to: allowanceTxData.data.to,
        data: allowanceTxData.data.data,
        value: toHex(allowanceTxData.data.value, { addPrefix: true, isStringNumber: true }),
      };
    }
    return {
      from: '',
      to: '',
      data: '',
      value: '',
    };
  }, [allowanceTxData, currentFromAddress]);

  const allowanceEstimateGas = useEstimateGasSWR([allowanceTx]);

  const allowanceBaseEstimateGas = useMemo(() => BigInt(allowanceEstimateGas.data?.result || '21000').toString(10), [allowanceEstimateGas.data?.result]);

  // NOTE NULL safety가 ''로 이상함 useOneInchSwapTxSWR안에도 수정할 필요가 있어보임
  const oneInchRouteParam = useMemo<UseOneInchSwapSWRProps | undefined>(() => {
    if (currentSwapApi === '1inch' && currentFromCoin && currentToCoin && currentFromChain) {
      return {
        fromTokenAddress: currentFromCoin.address || '',
        toTokenAddress: currentToCoin.address || '',
        fromAddress: currentFromAddress,
        slippage: currentSlippage,
        amount: currentInputBaseAmount,
        chainId: currentFromChain.chainId || '',
      };
    }
    return undefined;
  }, [currentFromAddress, currentFromChain, currentFromCoin, currentInputBaseAmount, currentSlippage, currentSwapApi, currentToCoin]);

  const oneInchRoute = useOneInchSwapTxSWR(oneInchRouteParam);

  const oneInchSwapTx = useMemo(() => {
    if (allowance.data && gt(allowance?.data?.allowance, '0') && oneInchRoute.data) {
      return {
        from: oneInchRoute.data.tx.from,
        to: oneInchRoute.data.tx.to,
        data: oneInchRoute.data.tx.data,
        value: toHex(oneInchRoute.data.tx.value, { addPrefix: true, isStringNumber: true }),
        gas: toHex(oneInchRoute.data.tx.gas, { addPrefix: true, isStringNumber: true }),
      };
    }
    return undefined;
  }, [allowance.data, oneInchRoute.data]);

  const squidProcessingTime = useMemo(
    () => (squidRoute.data ? divide(squidRoute.data?.route.estimate.estimatedRouteDuration || 0, 60) : '0'),
    [squidRoute.data],
  );

  // FIXME 각각 다른 isValidaiting변수 이걸로 교체
  const isLoadingSwapData = useMemo(() => {
    if (currentSwapApi === '1inch') {
      return oneInchRoute.isValidating;
    }
    if (currentSwapApi === 'squid') {
      return squidRoute.isValidating;
    }
    return false;
  }, [currentSwapApi, oneInchRoute.isValidating, squidRoute.isValidating]);

  // NOTE 현재는 외부에 선언되어있지만  estimatedToTokenDisplayAmount안으로 다 집어넣을 것
  const currentOutputBaseAmount = useMemo(() => {
    if (currentFromCoin?.denom && currentToCoin?.denom)
      try {
        return calcOutGivenIn(
          currentInputBaseAmount,
          swapFeeRate,
          poolAssetsTokenList,
          tokenBalanceIn,
          tokenWeightIn,
          tokenBalanceOut,
          tokenWeightOut,
          currentFromCoin?.denom,
          currentToCoin?.denom,
          scalingFactors,
        );
      } catch {
        return '0';
      }
    return '0';
  }, [
    currentFromCoin?.denom,
    currentInputBaseAmount,
    currentToCoin?.denom,
    poolAssetsTokenList,
    scalingFactors,
    swapFeeRate,
    tokenBalanceIn,
    tokenBalanceOut,
    tokenWeightIn,
    tokenWeightOut,
  ]);

  const tokenOutMinAmount = useMemo(
    () => (currentSlippage && currentOutputBaseAmount ? minus(currentOutputBaseAmount, times(currentOutputBaseAmount, divide(currentSlippage, 100))) : '0'),
    [currentSlippage, currentOutputBaseAmount],
  );

  const estimatedToTokenDisplayAmount = useMemo(() => {
    if (inputDisplayAmount === '') {
      return '0';
    }
    if (currentSwapApi === 'osmo') {
      return toDisplayDenomAmount(currentOutputBaseAmount, currentToCoin?.decimals || 0);
    }
    if (currentSwapApi === '1inch' && oneInchRoute.data) {
      return toDisplayDenomAmount(oneInchRoute.data.toTokenAmount, currentToCoin?.decimals || 0);
    }
    if (currentSwapApi === 'squid' && squidRoute.data) {
      return toDisplayDenomAmount(squidRoute.data.route.estimate.toAmount || '0', currentToCoin?.decimals || 0);
    }
    return '0';
  }, [inputDisplayAmount, currentSwapApi, oneInchRoute.data, squidRoute.data, currentToCoin?.decimals, currentOutputBaseAmount]);

  const estimatedToTokenDisplayMinAmount = useMemo(() => {
    if (currentSwapApi === 'osmo') {
      return toDisplayDenomAmount(tokenOutMinAmount, currentToCoin?.decimals || 0);
    }
    if (currentSwapApi === '1inch' && oneInchRoute.data && currentSlippage) {
      return minus(oneInchRoute.data.toTokenAmount, times(oneInchRoute.data.toTokenAmount, divide(currentSlippage, 100)));
    }
    if (currentSwapApi === 'squid' && squidRoute.data) {
      return toDisplayDenomAmount(squidRoute.data.route.estimate.toAmountMin || '0', currentToCoin?.decimals || 0);
    }
    return '0';
  }, [currentSwapApi, oneInchRoute.data, currentSlippage, squidRoute.data, currentToCoin?.decimals, tokenOutMinAmount]);

  // NOTE 현재 squid 쪽만 고려중
  const estimatedToTokenDisplayAmountPrice = useMemo(
    () => (estimatedToTokenDisplayAmount ? times(estimatedToTokenDisplayAmount, toTokenPrice) : '0'),
    [estimatedToTokenDisplayAmount, toTokenPrice],
  );

  // NOTE OSMO SWAP ZONE

  const currentOutputDisplayAmount = useMemo(
    () => toDisplayDenomAmount(currentOutputBaseAmount, inputDisplayAmount ? currentToCoin?.decimals || 0 : 0),
    [currentOutputBaseAmount, inputDisplayAmount, currentToCoin?.decimals],
  );

  const tokenOutMinDisplayAmount = useMemo(
    () => toDisplayDenomAmount(tokenOutMinAmount, currentToCoin?.decimals || 0),
    [currentToCoin?.decimals, tokenOutMinAmount],
  );

  const priceImpact = useMemo(() => {
    try {
      const effective = divide(currentInputBaseAmount, currentOutputBaseAmount);
      return minus(divide(effective, beforeSpotPriceInOverOut), '1');
    } catch {
      return '0';
    }
  }, [currentInputBaseAmount, currentOutputBaseAmount, beforeSpotPriceInOverOut]);

  const priceImpactPercent = useMemo(() => times(priceImpact, '100'), [priceImpact]);

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
                  token_out_denom: currentToCoin?.denom,
                },
              ],
              sender: address,
              token_in: {
                amount: currentInputBaseAmount,
                denom: currentFromCoin?.denom,
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
    currentFromCoin?.denom,
    inputDisplayAmount,
    nodeInfo.data?.node_info?.network,
    currentToCoin?.denom,
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

  const swapFeePrice = useMemo(() => times(fromTokenPrice, currentDisplaySwapFeeAmount), [fromTokenPrice, currentDisplaySwapFeeAmount]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount);
    if (isEqualsIgnoringCase(currentFromCoin?.denom, currentFeeCoin.baseDenom)) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentInputCoinDisplayAvailableAmount;
  }, [currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount, currentFromCoin?.denom, currentFeeCoin.baseDenom]);

  // const testTxStatus = useSquidTxStatusSWR({ transactionId: '0x26b279240c73f5841eb9e0ce11b13ad280f4cf612c653b43bd9083672da63ec0' });

  const errorMessage = useMemo(() => {
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentFromDisplayBalance, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }

    if (currentSwapApi === 'osmo') {
      if (!poolData.data || !poolsAssetData.data) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (gt(currentInputBaseAmount, tokenBalanceIn || '0')) {
        return t('pages.Wallet.Swap.entry.excessiveSwap');
      }
      if (!gt(estimatedToTokenDisplayAmount, 0)) {
        return t('pages.Wallet.Swap.entry.invalidOutputAmount');
      }
      if (currentFromCoin?.denom === currentFeeCoin.baseDenom) {
        if (!gte(currentFromDisplayBalance, plus(inputDisplayAmount, currentDisplayFeeAmount))) {
          return t('pages.Wallet.Swap.entry.insufficientAmount');
        }
        if (!gte(currentFromDisplayBalance, currentDisplayFeeAmount)) {
          return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
        }
      }
      if (gt(priceImpactPercent, 10)) {
        return t('pages.Wallet.Swap.entry.invalidPriceImpact');
      }
    }
    if (currentSwapApi === '1inch') {
      // NOTE 아웃풋 검증과정에서 어차피 걸러질거같은데 흠 이 조건문 필요없을지도
      if (oneInchRoute && !oneInchRoute?.data && allowance.data && gt(allowance.data?.allowance, '0')) {
        return t('pages.Wallet.Swap.entry.getOneInchSwapError');
      }
    }
    return '';
  }, [
    inputDisplayAmount,
    currentFromDisplayBalance,
    estimatedToTokenDisplayAmount,
    currentSwapApi,
    t,
    poolData.data,
    poolsAssetData.data,
    currentInputBaseAmount,
    tokenBalanceIn,
    currentFromCoin?.denom,
    currentFeeCoin.baseDenom,
    priceImpactPercent,
    currentDisplayFeeAmount,
    oneInchRoute,
    allowance.data,
  ]);

  const warningMessage = useMemo(() => {
    if (filteredFromTokenList) {
      return t('pages.Wallet.Swap.entry.txSizeWarning');
    }
    return '';
  }, [filteredFromTokenList, t]);

  const inputHelperMessage = useMemo(() => {
    if (inputDisplayAmount) {
      if (gte(inputDisplayAmount, currentFromDisplayBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientAmount');
      }
    }
    return '';
  }, [currentFromDisplayBalance, inputDisplayAmount, t]);

  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  // NOTE Handling exception
  // useEffect(() => {
  //   if (!currentToCoin) {
  //     setOutputCoinBaseDenom(availableSwapOutputCoinList[0]?.denom);
  //   }
  // }, [availableSwapOutputCoinList, currentToCoin, currentToCoin?.denom]);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedSwapAminoTx]);

  useEffect(() => {
    if (!currentFromChain || !currentToChain) {
      setCurrentSwapApi(undefined);
    }
    if (currentFromChain?.supportedApi === 'squid' && currentToChain?.supportedApi === 'squid' && currentFromChain.chainId !== currentToChain.chainId) {
      setCurrentSwapApi('squid');
    }
    if (
      (currentFromChain?.supportedApi === '1inch' && currentToChain?.supportedApi === '1inch') ||
      (currentFromChain?.chainId === currentToChain?.chainId && currentFromChain?.line === ETHEREUM.line)
    ) {
      setCurrentSwapApi('1inch');
    }
    if (currentFromChain?.chainId === 'osmosis-1' && currentToChain?.chainId === 'osmosis-1') {
      setCurrentSwapApi('osmo');
    }
  }, [currentFromChain, currentFromChain?.chainId, currentFromChain?.supportedApi, currentToChain, currentToChain?.chainId, currentToChain?.supportedApi]);

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
              headerLeftText="From"
              availableAmount={currentFromDisplayBalance}
              coinAmountPrice={inputTokenAmountPrice}
              currentSelectedChain={currentFromChain}
              currentSelectedCoin={currentFromCoin}
              onClickChain={async (clickedChain) => {
                setCurrentFromChain(clickedChain);
                if (isFromSelected) {
                  setCurrentToChain(undefined);
                }
                if (isFromSelected === undefined) {
                  setIsFromSelected(true);
                }
                setCurrentFromCoin(undefined);
                setCurrentToCoin(undefined);
                setInputDisplayAmount('');
                if (clickedChain.line === 'ETHEREUM') {
                  await setCurrentEthereumNetwork(clickedChain);
                }
              }}
              onClickCoin={(clickedCoin) => setCurrentFromCoin(clickedCoin)}
              availableChainList={availableFromChainList}
              availableCoinList={filteredFromTokenList}
              address={currentFromAddress}
              isChainSelected={!!currentFromChain && !!currentToChain}
            >
              <SwapCoinInputAmountContainer data-is-error>
                <AmountInput
                  error
                  helperText={inputHelperMessage}
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
              headerLeftText="To"
              availableAmount={currentToDisplayBalance}
              coinAmountPrice={estimatedToTokenDisplayAmountPrice}
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
                setInputDisplayAmount('');
              }}
              onClickCoin={(clickedCoin) => setCurrentToCoin(clickedCoin)}
              availableChainList={availableToChainList}
              availableCoinList={filteredToTokenList}
              address={currentToAddress}
              isChainSelected={!!currentFromChain && !!currentToChain}
            >
              {isLoadingSwapData ? (
                <OutputAmountCircularProgressContainer>
                  <StyledCircularProgress size={20} />
                </OutputAmountCircularProgressContainer>
              ) : (
                <SwapCoinOutputAmountContainer data-is-active={estimatedToTokenDisplayAmount !== '0'}>
                  <Tooltip title={estimatedToTokenDisplayAmount} arrow placement="top">
                    <span>
                      <NumberText typoOfIntegers="h3n" fixed={estimatedToTokenDisplayAmount !== '0' ? getDisplayMaxDecimals(currentToCoin?.decimals) : 0}>
                        {estimatedToTokenDisplayAmount}
                      </NumberText>
                    </span>
                  </Tooltip>
                </SwapCoinOutputAmountContainer>
              )}
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
                {isLoadingSwapData ? (
                  <StyledCircularProgress size={15} />
                ) : (
                  <>
                    <Tooltip title={estimatedToTokenDisplayMinAmount} arrow placement="top">
                      <span>
                        <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(currentToCoin?.decimals || 0)}>
                          {estimatedToTokenDisplayMinAmount}
                        </NumberText>
                      </span>
                    </Tooltip>
                    &nbsp;
                    <Typography variant="h6n">{currentToCoin?.symbol}</Typography>
                  </>
                )}
              </SwapInfoHeaderRightContainer>
            </SwapInfoHeaderContainer>
            <SwapInfoBodyContainer>
              {/* NOTE 스왑비율 컴포넌트 추가 */}
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
                          <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(currentToCoin?.decimals)}>
                            {currentOutputDisplayAmount}
                          </NumberText>
                        </span>
                      </Tooltip>
                      &nbsp;
                      <Typography variant="h6n">{currentToCoin?.symbol}</Typography>
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
                          <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(currentToCoin?.decimals)}>
                            {tokenOutMinDisplayAmount}
                          </NumberText>
                        </span>
                      </Tooltip>
                      &nbsp;
                      <Typography variant="h6n">{currentToCoin?.symbol}</Typography>
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
                    {inputDisplayAmount ? (
                      isLoadingSwapData ? (
                        <StyledCircularProgress size={15} />
                      ) : (
                        <SwapInfoBodyRightTextContainer>
                          <NumberText typoOfIntegers="h6n">{`~ ${squidProcessingTime}`}</NumberText>
                          &nbsp;
                          <Typography variant="h6n">{t('pages.Wallet.Swap.entry.minutes')}</Typography>
                        </SwapInfoBodyRightTextContainer>
                      )
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
              {inputDisplayAmount && allowance.data && !gt(allowance.data?.allowance, '0') && allowanceTx ? (
                <Button
                  Icon={Permission16Icon}
                  isProgress={currentSwapApi === '1inch' && oneInchRoute.isValidating}
                  type="button"
                  disabled={!allowanceTx}
                  onClick={async () => {
                    if (currentSwapApi === '1inch' && allowanceTx) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'eth_sendTransaction',
                          params: [
                            {
                              ...allowanceTx,
                              gas: toHex(allowanceBaseEstimateGas, { addPrefix: true, isStringNumber: true }),
                            },
                          ],
                        },
                      });

                      if (currentAccount.type === 'LEDGER') {
                        await openWindow();
                        window.close();
                      }
                    }
                  }}
                >
                  {t('pages.Wallet.Swap.Entry.permissionButton')}
                </Button>
              ) : (
                <Button
                  isProgress={isLoadingSwapData}
                  type="button"
                  disabled={!!errorMessage || !swapAminoTx || isDisabled}
                  onClick={async () => {
                    if (currentSwapApi === '1inch' && oneInchSwapTx) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'eth_sendTransaction',
                          params: [
                            {
                              ...oneInchSwapTx,
                            },
                          ],
                        },
                      });

                      if (currentAccount.type === 'LEDGER') {
                        await openWindow();
                        window.close();
                      }
                    }
                    if (currentSwapApi === 'osmo' && swapAminoTx) {
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
              )}
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
