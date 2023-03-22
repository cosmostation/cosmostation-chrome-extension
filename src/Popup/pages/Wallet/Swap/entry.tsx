import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { ETHEREUM, EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import AmountInput from '~/Popup/components/common/AmountInput';
import Button from '~/Popup/components/common/Button';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import WarningContainer from '~/Popup/components/common/WarningContainer';
import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useAllowanceSWR } from '~/Popup/hooks/SWR/1inch/useAllowanceSWR';
import { useAllowanceTxSWR } from '~/Popup/hooks/SWR/1inch/useAllowanceTxSWR';
import { useAllowedTokensSWR } from '~/Popup/hooks/SWR/1inch/useAllowedTokensSWR';
import type { UseOneInchSwapSWRProps } from '~/Popup/hooks/SWR/1inch/useOneInchSwapTxSWR';
import { useOneInchSwapTxSWR } from '~/Popup/hooks/SWR/1inch/useOneInchSwapTxSWR';
import { useTokenAssetsSWR } from '~/Popup/hooks/SWR/1inch/useTokenAssetsSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/1inch/useTokenBalanceSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useBalanceSWR as useETHBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useEstimateGasSWR } from '~/Popup/hooks/SWR/ethereum/useEstimateGasSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
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
import { calcOutGivenIn, calcSpotPrice, decimalScaling } from '~/Popup/utils/osmosis';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
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
  MinimumReceivedCircularProgressContainer,
  OutputAmountCircularProgressContainer,
  SideButton,
  StyledCircularProgress,
  StyledTooltip,
  StyledTooltipBodyContainer,
  StyledTooltipBodyLeftTextContainer,
  StyledTooltipBodyRightTextContainer,
  StyledTooltipBodyTextContainer,
  StyledTooltipTitleContainer,
  SwapCoinInputAmountContainer,
  SwapCoinOutputAmountContainer,
  SwapContainer,
  SwapIconButton,
  SwapInfoBodyContainer,
  SwapInfoBodyLeftContainer,
  SwapInfoBodyLeftIconContainer,
  SwapInfoBodyRightContainer,
  SwapInfoBodyRightTextContainer,
  SwapInfoBodyTextContainer,
  SwapInfoContainer,
  SwapInfoHeaderContainer,
  SwapInfoSubHeaderContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';
import Management24Icon from '~/images/icons/Mangement24.svg';
import Permission16Icon from '~/images/icons/Permission16.svg';
import SwapIcon from '~/images/icons/Swap.svg';

import evm_assets from './evm_assets.json';

export type ChainAssetInfo = AssetV3 & { chainName: string; availableAmount?: string };

const STABLE_POOL_TYPE = '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool';
const WEIGHTED_POOL_TYPE = '/osmosis.gamm.v1beta1.Pool';

export default function Entry() {
  const chain = OSMOSIS;
  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const accounts = useAccounts(true);
  const { vestingRelatedAvailable } = useAmountSWR(chain);

  const params = useParams();

  const { enQueue } = useCurrentQueue();
  const nodeInfo = useNodeInfoSWR(chain);
  const { chromeStorage } = useChromeStorage();
  const { ethereumTokens } = chromeStorage;
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const balance = useBalanceSWR(chain);
  const { currentEthereumNetwork, setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

  const { squidChainList, filteredSquidTokenList } = useSquidAssetsSWR();

  const allowedOneInchTokens = useAllowedTokensSWR();

  // FIXME 토큰 리스팅 자동으로 끝쪽 도달하면 늘어나도록

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const [currentSlippage, setCurrentSlippage] = useState('1');

  const [currentSwapApi, setCurrentSwapApi] = useState<IntegratedSwapAPI>();

  const [isFromSelected, setIsFromSelected] = useState<boolean>();
  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const availableFromChainList: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMList = ETHEREUM_NETWORKS.filter((item) =>
      squidChainList?.find(
        (squidChain) => squidChain.chainType === 'evm' && isEqualsIgnoringCase(String(parseInt(item.chainId, 16)), String(squidChain.chainId)),
      ),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const squidCosmosList = COSMOS_CHAINS.filter(
      (item) =>
        isEqualsIgnoringCase(OSMOSIS.chainId, item.chainId) &&
        squidChainList?.find((squidChain) => squidChain.chainType === 'cosmos' && isEqualsIgnoringCase(item.chainId, String(squidChain.chainId))),
    ).map((item) => ({
      ...item,
      addressId: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMList = [
      ...squidEVMList,
      ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
        ...item,
        chainId: String(parseInt(item.chainId, 16)),
        line: ETHEREUM.line,
        addressId: ETHEREUM.id,
      })),
    ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);

    if (isFromSelected) {
      return [...integratedEVMList, ...squidCosmosList];
    }

    if (currentToChain?.chainId === OSMOSIS.chainId) {
      return [...squidEVMList, ...squidCosmosList];
    }

    if (
      currentToChain &&
      ONEINCH_SUPPORTED_CHAINS.filter(
        (item) => !squidEVMList.find((evmChain) => isEqualsIgnoringCase(evmChain.chainId, String(parseInt(item.chainId, 16)))),
      ).find((item) => isEqualsIgnoringCase(String(parseInt(item.chainId, 16)), currentToChain.chainId))
    ) {
      return [currentToChain];
    }
    return [...integratedEVMList, ...squidCosmosList];
  }, [currentToChain, isFromSelected, squidChainList]);

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain | undefined>(availableFromChainList.find((item) => item.id === params.id));

  const availableToChainList: IntegratedSwapChain[] = useMemo(() => {
    // NOTE 제외보다는 지원하는(깃헙에 지원하는 체인을 등록) 방향으로 +evm,cosmos둘다
    // NOTE 데이터 스키마 생각해서 말씀 드리기
    const exceptedCosmosChainIds = [COSMOS.chainId, AXELAR.chainId, FETCH_AI.chainId, INJECTIVE.chainId, KI.chainId, 'phoenix-1', 'agoric-3'];

    const squidCosmosChainIDList = squidChainList?.filter((item) => !exceptedCosmosChainIds.includes(String(item.chainId))).map((item) => String(item.chainId));

    const squidEVMList = ETHEREUM_NETWORKS.filter((item) =>
      squidChainList?.find(
        (squidChain) => squidChain.chainType === 'evm' && isEqualsIgnoringCase(String(parseInt(item.chainId, 16)), String(squidChain.chainId)),
      ),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const squidCosmosList = COSMOS_CHAINS.filter((item) => squidCosmosChainIDList?.includes(String(item.chainId))).map((item) => ({
      ...item,
      addressId: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMList = [
      ...squidEVMList,
      ...ONEINCH_SUPPORTED_CHAINS.map((item) => ({
        ...item,
        addressId: ETHEREUM.id,
        chainId: String(parseInt(item.chainId, 16)),
        line: ETHEREUM.line,
      })),
    ].filter((chainItem, idx, arr) => arr.findIndex((item) => item.chainId === chainItem.chainId) === idx);

    if (!isFromSelected) {
      return [...integratedEVMList, ...squidCosmosList];
    }

    if (
      (currentFromChain &&
        ONEINCH_SUPPORTED_CHAINS.filter(
          (item) => !squidEVMList.find((evmChain) => isEqualsIgnoringCase(evmChain.chainId, String(parseInt(item.chainId, 16)))),
        ).find((item) => isEqualsIgnoringCase(String(parseInt(item.chainId, 16)), currentFromChain.chainId))) ||
      currentFromChain?.chainId === OSMOSIS.chainId
    ) {
      return [currentFromChain];
    }
    return [...squidEVMList, ...squidCosmosList];
  }, [currentFromChain, isFromSelected, squidChainList]);

  const [isSwapInfoDiabled, setIsSwapInfoDisabled] = useState<boolean>(false);

  const [currentFromToken, setCurrentFromCoin] = useState<IntegratedSwapToken>();
  const [currentToToken, setCurrentToCoin] = useState<IntegratedSwapToken>();

  const [inputDisplayAmount, setInputDisplayAmount] = useState<string>('');
  const [debouncedInputDisplayAmount] = useDebounce(inputDisplayAmount, 400);

  const currentInputBaseAmount = useMemo(
    () => toBaseDenomAmount(debouncedInputDisplayAmount || 0, currentFromToken?.decimals || 0),
    [currentFromToken?.decimals, debouncedInputDisplayAmount],
  );

  const poolsAssetData = usePoolsAssetSWR(chain.chainName.toLowerCase());
  const poolDenomList = useMemo(
    () => (poolsAssetData.data ? [...poolsAssetData.data.map((item) => item.adenom), ...poolsAssetData.data.map((item) => item.bdenom)] : []),
    [poolsAssetData.data],
  );

  const uniquePoolDenomList = poolDenomList.filter((denom, idx, arr) => arr.findIndex((item) => item === denom) === idx);

  const currentPool = useMemo(
    () =>
      poolsAssetData.data?.find(
        (item) =>
          (isEqualsIgnoringCase(item.adenom, currentToToken?.denom) && isEqualsIgnoringCase(item.bdenom, currentFromToken?.denom)) ||
          (isEqualsIgnoringCase(item.adenom, currentFromToken?.denom) && isEqualsIgnoringCase(item.bdenom, currentToToken?.denom)),
      ),
    [currentFromToken?.denom, currentToToken?.denom, poolsAssetData.data],
  );

  const currentPoolId = useMemo(() => currentPool?.id, [currentPool?.id]);

  const poolData = usePoolSWR(currentPoolId);

  const osmoSwapFeeRate = useMemo(() => poolData.data?.pool.pool_params.swap_fee || '0', [poolData.data?.pool.pool_params.swap_fee]);

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
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, currentFromToken?.denom))?.amount,
    [currentFromToken?.denom, poolAssetsTokenList],
  );

  const tokenWeightIn = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, currentFromToken?.denom))?.weight
        : undefined,
    [currentFromToken?.denom, poolData.data],
  );

  const tokenBalanceOut = useMemo(
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, currentToToken?.denom))?.amount,
    [currentToToken?.denom, poolAssetsTokenList],
  );

  const tokenWeightOut = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, currentToToken?.denom))?.weight
        : undefined,
    [currentToToken?.denom, poolData.data],
  );

  const scalingFactors = useMemo(
    () => (poolData.data && poolData.data.pool['@type'] === STABLE_POOL_TYPE ? poolData.data.pool.scaling_factors : undefined),
    [poolData.data],
  );

  const beforeSpotPriceInOverOut = useMemo(() => {
    try {
      return calcSpotPrice(
        osmoSwapFeeRate,
        poolAssetsTokenList,
        tokenBalanceIn,
        tokenWeightIn,
        tokenBalanceOut,
        tokenWeightOut,
        currentToToken?.denom,
        currentFromToken?.denom,
        scalingFactors,
      );
    } catch {
      return '0';
    }
  }, [
    currentToToken?.denom,
    currentFromToken?.denom,
    poolAssetsTokenList,
    scalingFactors,
    osmoSwapFeeRate,
    tokenBalanceIn,
    tokenBalanceOut,
    tokenWeightIn,
    tokenWeightOut,
  ]);

  const swapCoin = useCallback(async () => {
    const tmpFromToken = currentFromToken;
    const tmpFromChain = currentFromChain;

    if (currentSwapApi === 'squid' && currentToChain?.line === 'ETHEREUM') {
      await setCurrentEthereumNetwork(currentToChain);

      setCurrentFromChain(currentToChain);
      setCurrentToChain(tmpFromChain);
    }

    setCurrentFromCoin(currentToToken);
    setCurrentToCoin(tmpFromToken);

    setInputDisplayAmount('');
  }, [currentFromChain, currentFromToken, currentSwapApi, currentToChain, currentToToken, setCurrentEthereumNetwork]);

  const currentFromAddress = useMemo(
    () => (currentFromChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentFromChain.addressId]) || '',
    [accounts?.data, currentAccount.id, currentFromChain],
  );
  const currentToAddress = useMemo(
    () => (currentToChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentToChain.addressId]) || '',
    [accounts?.data, currentAccount.id, currentToChain],
  );

  // FIXME 기존에 커런트 체인으로 값 가져오게 되어있어서 그냥 새로 만들어야할듯
  const currentFromETHNativeBalance = useETHBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined);
  const currentFromETHTokenBalance = useTokenBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined, currentFromToken);

  const currentToETHNativeBalance = useETHBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined);
  const currentToETHTokenBalance = useTokenBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined, currentToToken);

  const currentFromBalance = useMemo(
    () =>
      gt(currentFromToken?.availableAmount || '0', '0')
        ? currentFromToken?.availableAmount || '0'
        : // NOTE Need research is right
        isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentFromToken?.address)
        ? BigInt(currentFromETHNativeBalance?.data?.result || '0').toString(10)
        : BigInt(currentFromETHTokenBalance.data || '0').toString(10),
    [currentFromToken?.address, currentFromToken?.availableAmount, currentFromETHNativeBalance?.data?.result, currentFromETHTokenBalance.data],
  );
  const currentFromDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentFromBalance, currentFromToken?.decimals || 0),
    [currentFromToken?.decimals, currentFromBalance],
  );

  const currentToBalance = useMemo(
    () =>
      gt(currentToToken?.availableAmount || '0', '0')
        ? currentToToken?.availableAmount || '0'
        : isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentToToken?.address)
        ? BigInt(currentToETHNativeBalance?.data?.result || '0').toString(10)
        : BigInt(currentToETHTokenBalance.data || '0').toString(10),
    [currentToToken?.address, currentToToken?.availableAmount, currentToETHNativeBalance?.data?.result, currentToETHTokenBalance.data],
  );
  const currentToDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentToBalance, currentToToken?.decimals || 0),
    [currentToToken?.decimals, currentToBalance],
  );

  const oneinchSupportedTokenList = useTokenAssetsSWR((currentSwapApi === '1inch' && String(parseInt(currentEthereumNetwork.chainId, 16))) || '');

  const filteredAllowedOneInchTokens = useMemo(
    () =>
      currentSwapApi === '1inch' && allowedOneInchTokens.data
        ? Object.values(allowedOneInchTokens.data[String(parseInt(currentEthereumNetwork.chainId, 16))])
        : [],
    [allowedOneInchTokens.data, currentEthereumNetwork.chainId, currentSwapApi],
  );

  const filteredFromTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentFromEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentFromChain?.id);

    if (currentSwapApi === 'squid') {
      const filteredTokenList = filteredSquidTokenList(currentFromChain?.chainId);
      return [
        ...filteredTokenList.filter((item) => isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address)),
        ...filteredTokenList.filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address),
        ),
      ];
    }
    if (currentSwapApi === '1inch' && oneinchSupportedTokenList.data) {
      const filteredTokenList = Object.values(oneinchSupportedTokenList.data.tokens);
      return [
        ...filteredTokenList.filter((item) => item.tags.includes('native')),
        ...filteredTokenList.filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !item.tags.includes('native') &&
            filteredAllowedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredTokenList.filter(
          (item) =>
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !item.tags.includes('native') &&
            !filteredAllowedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ];
    }
    if (currentSwapApi === 'osmo') {
      const filteredTokenList =
        currentChainAssets.data
          .filter((item) => uniquePoolDenomList.includes(item.denom))
          .map((item) => ({
            ...item,
            name: getCapitalize(item.prevChain || item.origin_chain),
            availableAmount: balance.data?.balance ? balance.data?.balance.find((coin) => isEqualsIgnoringCase(coin.denom, item.denom))?.amount : '0',
            coingeckoId: item.coinGeckoId,
            logoURI: item.image,
          })) || [];

      return [
        ...filteredTokenList.filter(
          (item) => gt(item?.availableAmount || 0, 0) && (item.type === 'staking' || item.type === 'native' || item.type === 'bridge'),
        ),
        ...filteredTokenList.filter((item) => gt(item?.availableAmount || 0, 0) && item.type === 'ibc').sort((a, b) => a.symbol.localeCompare(b.symbol)),
        ...filteredTokenList.filter((item) => !gt(item?.availableAmount || 0, 0)).sort((a, b) => a.symbol.localeCompare(b.symbol)),
      ];
    }
    return [];
  }, [
    balance.data?.balance,
    currentChainAssets.data,
    currentFromChain?.chainId,
    currentFromChain?.id,
    currentSwapApi,
    ethereumTokens,
    filteredAllowedOneInchTokens,
    filteredSquidTokenList,
    oneinchSupportedTokenList.data,
    uniquePoolDenomList,
  ]);

  const filteredToTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentToEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentToChain?.id);

    if (currentSwapApi === 'squid' && currentToChain?.line === 'ETHEREUM') {
      const filteredTokenList = filteredSquidTokenList(currentToChain?.chainId);
      return [
        ...filteredTokenList.filter((item) => isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address)),
        ...filteredTokenList.filter((item) => currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address),
        ),
      ].map((item) => ({
        ...item,
        coingeckoId: currentChainAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.coinGeckoId || item.coingeckoId,
      }));
    }

    if (currentSwapApi === 'squid' && currentToChain?.line === 'COSMOS') {
      const filteredTokenList = filteredSquidTokenList(currentToChain?.chainId);

      return [
        ...filteredTokenList.filter((item) => item.address === 'uusdc'),
        ...filteredTokenList.filter(
          (item) =>
            item.address !== 'uusdc' &&
            isEqualsIgnoringCase(
              item.address,
              evm_assets.mainnet.find((asset) => asset.contracts.find((contract) => isEqualsIgnoringCase(contract.address, currentFromToken?.address)))?.id,
            ),
        ),
      ].map((item) => ({
        ...item,
        coingeckoId: currentChainAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.coinGeckoId || item.coingeckoId,
        availableAmount: balance.data?.balance
          ? balance.data?.balance.find((coin) =>
              isEqualsIgnoringCase(coin.denom, currentChainAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.denom),
            )?.amount
          : '0',
      }));
    }
    if (currentSwapApi === '1inch' && oneinchSupportedTokenList.data) {
      const filteredTokenList = Object.values(oneinchSupportedTokenList.data.tokens);

      return [
        ...filteredTokenList.filter((item) => item.tags.includes('native')),
        ...filteredTokenList.filter((item) => currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !item.tags.includes('native') &&
            filteredAllowedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredTokenList.filter(
          (item) =>
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !item.tags.includes('native') &&
            !filteredAllowedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ];
    }
    if (currentSwapApi === 'osmo') {
      return filteredFromTokenList.filter((coin) =>
        poolsAssetData.data?.find(
          (item) =>
            (isEqualsIgnoringCase(item.adenom, coin.denom) && isEqualsIgnoringCase(item.bdenom, currentFromToken?.denom)) ||
            (isEqualsIgnoringCase(item.adenom, currentFromToken?.denom) && isEqualsIgnoringCase(item.bdenom, coin.denom)),
        ),
      );
    }
    return [];
  }, [
    ethereumTokens,
    currentSwapApi,
    currentToChain,
    oneinchSupportedTokenList.data,
    filteredSquidTokenList,
    currentChainAssets.data,
    currentFromToken?.address,
    currentFromToken?.denom,
    balance.data?.balance,
    filteredAllowedOneInchTokens,
    filteredFromTokenList,
    poolsAssetData.data,
  ]);

  const currentFromTokenPrice = useMemo(
    () => (currentFromToken?.coingeckoId && coinGeckoPrice.data?.[currentFromToken?.coingeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentFromToken?.coingeckoId],
  );
  const currentToTokenPrice = useMemo(
    () => (currentToToken?.coingeckoId && coinGeckoPrice.data?.[currentToToken.coingeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentToToken?.coingeckoId],
  );

  const currentFeeToken = useMemo<IntegratedSwapChain | undefined>(() => currentFromChain, [currentFromChain]);

  const currentEVMFeeTokenBalance = useETHBalanceSWR();

  const currentFeeTokenBalance = useMemo(() => {
    if (currentSwapApi === 'osmo') {
      return vestingRelatedAvailable;
    }
    if (currentSwapApi === '1inch' || currentSwapApi === 'squid') {
      return BigInt(currentEVMFeeTokenBalance?.data?.result || '0').toString(10);
    }

    return '0';
  }, [currentEVMFeeTokenBalance?.data?.result, currentSwapApi, vestingRelatedAvailable]);

  const currentFeeTokenPrice = useMemo(
    () => (currentFeeToken?.coinGeckoId && coinGeckoPrice.data?.[currentFeeToken.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentFeeToken?.coinGeckoId],
  );

  const inputTokenAmountPrice = useMemo(() => times(inputDisplayAmount || '0', currentFromTokenPrice), [inputDisplayAmount, currentFromTokenPrice]);

  const squidRouteParam = useMemo<GetRoute | undefined>(() => {
    if (
      currentSwapApi === 'squid' &&
      currentFromChain?.chainId &&
      currentToChain?.chainId &&
      currentFromToken?.address &&
      currentToToken?.address &&
      currentToAddress &&
      gt(currentInputBaseAmount, 0)
    ) {
      return {
        fromChain: currentFromChain.chainId,
        fromToken: currentFromToken.address,
        fromAmount: currentInputBaseAmount,
        toChain: currentToChain.chainId,
        toToken: currentToToken.address,
        toAddress: currentToAddress,
        slippage: Number(currentSlippage),
      };
    }
    return undefined;
  }, [currentFromChain, currentFromToken, currentInputBaseAmount, currentSlippage, currentSwapApi, currentToAddress, currentToChain, currentToToken]);

  const squidRoute = useSquidRouteSWR(squidRouteParam);

  const squidProcessingTime = useMemo(() => divide(squidRoute.data?.route.estimate.estimatedRouteDuration || 0, 60), [squidRoute.data]);

  const squidSourceChainGas = useMemo(() => squidRoute.data?.route.estimate.gasCosts.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0', [squidRoute.data]);

  const squidSourceChainFeeDisplayAmount = useMemo(
    () => toDisplayDenomAmount(squidSourceChainGas, currentFeeToken?.decimals || 0),
    [currentFeeToken?.decimals, squidSourceChainGas],
  );

  const squidSourceChainFeePrice = useMemo(
    () => times(squidSourceChainFeeDisplayAmount, currentFeeTokenPrice),
    [currentFeeTokenPrice, squidSourceChainFeeDisplayAmount],
  );

  const squidCrossChainGas = useMemo(() => squidRoute.data?.route.estimate.feeCosts.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0', [squidRoute.data]);

  const squidCrossChainFeeDisplayAmount = useMemo(
    () => toDisplayDenomAmount(squidCrossChainGas, currentFeeToken?.decimals || 0),
    [currentFeeToken?.decimals, squidCrossChainGas],
  );

  const squidCrossChainFeePrice = useMemo(
    () => times(squidCrossChainFeeDisplayAmount, currentFeeTokenPrice),
    [currentFeeTokenPrice, squidCrossChainFeeDisplayAmount],
  );

  const allowance = useAllowanceSWR(
    currentSwapApi === '1inch' && currentFromToken?.address && currentFromChain?.chainId
      ? {
          tokenAddress: currentFromToken.address,
          walletAddress: currentFromAddress,
          chainId: currentFromChain.chainId,
        }
      : undefined,
  );

  const allowanceTxData = useAllowanceTxSWR(
    allowance.data && !gt(allowance.data.allowance, '0') && currentFromToken?.address && currentFromChain?.chainId
      ? {
          tokenAddress: currentFromToken.address,
          chainId: currentFromChain.chainId,
        }
      : undefined,
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
    };
  }, [allowanceTxData, currentFromAddress]);

  const allowanceFee = useFeeSWR();

  const allowanceEstimatedGas = useEstimateGasSWR([allowanceTx]);

  const allowanceBaseEstimatedGas = useMemo(() => BigInt(allowanceEstimatedGas.data?.result || '21000').toString(10), [allowanceEstimatedGas.data?.result]);

  const baseFeePerGas = useMemo(() => {
    if (allowanceFee.type === 'BASIC') return allowanceFee.currentGasPrice || '0';
    if (allowanceFee.type === 'EIP-1559') return allowanceFee.currentFee?.average.maxBaseFeePerGas || '0';

    return '0';
  }, [allowanceFee.currentFee?.average.maxBaseFeePerGas, allowanceFee.currentGasPrice, allowanceFee.type]);

  const allowanceTxBaseFee = useMemo(() => times(baseFeePerGas, allowanceBaseEstimatedGas), [allowanceBaseEstimatedGas, baseFeePerGas]);

  const oneInchRouteParam = useMemo<UseOneInchSwapSWRProps | undefined>(() => {
    if (currentSwapApi === '1inch' && currentFromToken?.address && currentToToken?.address && currentFromChain?.chainId && gt(currentInputBaseAmount, 0)) {
      return {
        fromTokenAddress: currentFromToken.address,
        toTokenAddress: currentToToken.address,
        fromAddress: currentFromAddress,
        slippage: currentSlippage,
        amount: currentInputBaseAmount,
        chainId: currentFromChain.chainId,
      };
    }
    return undefined;
  }, [currentFromAddress, currentFromChain, currentFromToken, currentInputBaseAmount, currentSlippage, currentSwapApi, currentToToken]);

  const oneInchRoute = useOneInchSwapTxSWR(oneInchRouteParam);

  const isLoadingSwapData = useMemo(() => {
    if (currentSwapApi === '1inch') return oneInchRoute.isValidating;

    if (currentSwapApi === 'squid') return squidRoute.isValidating;

    return false;
  }, [currentSwapApi, oneInchRoute.isValidating, squidRoute.isValidating]);

  const estimatedToTokenBaseAmount = useMemo(() => {
    if (currentSwapApi === 'osmo')
      try {
        return calcOutGivenIn(
          currentInputBaseAmount,
          osmoSwapFeeRate,
          poolAssetsTokenList,
          tokenBalanceIn,
          tokenWeightIn,
          tokenBalanceOut,
          tokenWeightOut,
          currentFromToken?.denom,
          currentToToken?.denom,
          scalingFactors,
        );
      } catch {
        return '0';
      }
    if (currentSwapApi === '1inch' && oneInchRoute.data) {
      return oneInchRoute.data.toTokenAmount;
    }
    if (currentSwapApi === 'squid' && squidRoute.data) {
      return squidRoute.data.route.estimate.toAmount;
    }
    return '0';
  }, [
    currentFromToken?.denom,
    currentInputBaseAmount,
    currentSwapApi,
    currentToToken?.denom,
    oneInchRoute.data,
    poolAssetsTokenList,
    scalingFactors,
    squidRoute.data,
    osmoSwapFeeRate,
    tokenBalanceIn,
    tokenBalanceOut,
    tokenWeightIn,
    tokenWeightOut,
  ]);

  const estimatedToTokenBaseMinAmount = useMemo(
    () => minus(estimatedToTokenBaseAmount, times(estimatedToTokenBaseAmount, divide(currentSlippage, '100'))),
    [currentSlippage, estimatedToTokenBaseAmount],
  );

  const estimatedToTokenDisplayAmount = useMemo(
    () => toDisplayDenomAmount(estimatedToTokenBaseAmount, currentToToken?.decimals || 0),
    [currentToToken?.decimals, estimatedToTokenBaseAmount],
  );

  const estimatedToTokenDisplayMinAmount = useMemo(
    () => toDisplayDenomAmount(estimatedToTokenBaseMinAmount, currentToToken?.decimals || 0),
    [currentToToken?.decimals, estimatedToTokenBaseMinAmount],
  );

  const estimatedToTokenDisplayAmountPrice = useMemo(
    () => (estimatedToTokenDisplayAmount ? times(estimatedToTokenDisplayAmount, currentToTokenPrice) : '0'),
    [estimatedToTokenDisplayAmount, currentToTokenPrice],
  );

  const outputAmountOf1Coin = useMemo(() => {
    if (currentSwapApi === 'osmo') {
      try {
        const beforeSpotPriceWithoutSwapFeeInOverOutDec = times(beforeSpotPriceInOverOut, minus(1, osmoSwapFeeRate));
        const multiplicationInOverOut = minus(currentToToken?.decimals || 0, currentFromToken?.decimals || 0);

        return multiplicationInOverOut === '0'
          ? divide(1, beforeSpotPriceWithoutSwapFeeInOverOutDec)
          : decimalScaling(divide(1, beforeSpotPriceWithoutSwapFeeInOverOutDec, 18), Number(multiplicationInOverOut), currentToToken?.decimals);
      } catch {
        return '0';
      }
    }
    if (currentSwapApi === 'squid' && squidRoute.data?.route.estimate.exchangeRate) {
      return squidRoute.data.route.estimate.exchangeRate;
    }
    return '0';
  }, [currentSwapApi, squidRoute.data, beforeSpotPriceInOverOut, osmoSwapFeeRate, currentToToken?.decimals, currentFromToken?.decimals]);

  const priceImpactPercent = useMemo(() => {
    if (currentSwapApi === 'osmo') {
      try {
        const effective = divide(currentInputBaseAmount, estimatedToTokenBaseAmount);
        return times(minus(divide(effective, beforeSpotPriceInOverOut), '1'), '100', 18);
      } catch {
        return '0';
      }
    }
    if (currentSwapApi === 'squid' && squidRoute.data) {
      return squidRoute.data.route.estimate.aggregatePriceImpact;
    }
    return '0';
  }, [beforeSpotPriceInOverOut, currentInputBaseAmount, currentSwapApi, estimatedToTokenBaseAmount, squidRoute.data]);

  const integratedSwapTx = useMemo(() => {
    if (currentSwapApi === '1inch' && allowance.data && gt(allowance.data.allowance, '0') && oneInchRoute.data) {
      return {
        from: oneInchRoute.data.tx.from,
        to: oneInchRoute.data.tx.to,
        data: oneInchRoute.data.tx.data,
        value: toHex(oneInchRoute.data.tx.value, { addPrefix: true, isStringNumber: true }),
        gas: toHex(times(oneInchRoute.data.tx.gas, 1.2, 0), { addPrefix: true, isStringNumber: true }),
      };
    }
    if (currentSwapApi === 'squid' && squidRoute.data) {
      return {
        from: currentFromAddress,
        to: squidRoute.data.route.transactionRequest.targetAddress,
        data: squidRoute.data.route.transactionRequest.data,
        value: toHex(squidRoute.data.route.transactionRequest.value, { addPrefix: true, isStringNumber: true }),
        gas: toHex(times(squidRoute.data.route.transactionRequest.gasLimit, 1.2, 0), { addPrefix: true, isStringNumber: true }),
      };
    }
    return undefined;
  }, [allowance.data, currentFromAddress, currentSwapApi, oneInchRoute.data, squidRoute.data]);

  const memoizedOsmoSwapAminoTx = useMemo(() => {
    if (currentSwapApi === 'osmo' && inputDisplayAmount && account.data?.value.account_number && currentFeeToken?.baseDenom) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
        fee: { amount: [{ amount: '1', denom: currentFeeToken.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: [
          {
            type: 'osmosis/gamm/swap-exact-amount-in',
            value: {
              routes: [
                {
                  pool_id: currentPoolId,
                  token_out_denom: currentToToken?.denom,
                },
              ],
              sender: address,
              token_in: {
                amount: currentInputBaseAmount,
                denom: currentFromToken?.denom,
              },
              token_out_min_amount: fix(estimatedToTokenBaseMinAmount, 0),
            },
          },
        ],
      };
    }

    return undefined;
  }, [
    currentSwapApi,
    inputDisplayAmount,
    account.data?.value.account_number,
    account.data?.value.sequence,
    currentFeeToken?.baseDenom,
    nodeInfo.data?.node_info?.network,
    chain.chainId,
    currentPoolId,
    currentToToken?.denom,
    address,
    currentInputBaseAmount,
    currentFromToken?.denom,
    estimatedToTokenBaseMinAmount,
  ]);

  const [osmoSwapAminoTx] = useDebounce(memoizedOsmoSwapAminoTx, 700);

  const osmoSwapProtoTx = useMemo(() => {
    if (osmoSwapAminoTx) {
      const pTx = protoTx(osmoSwapAminoTx, Buffer.from(new Uint8Array(64)).toString('base64'), { type: getPublicKeyType(chain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [chain, osmoSwapAminoTx]);

  const osmoSwapSimulate = useSimulateSWR({ chain, txBytes: osmoSwapProtoTx?.tx_bytes });

  const osmoSwapSimulatedGas = useMemo(
    () => (osmoSwapSimulate.data?.gas_info?.gas_used ? times(osmoSwapSimulate.data.gas_info.gas_used, getDefaultAV(chain), 0) : undefined),
    [chain, osmoSwapSimulate.data?.gas_info?.gas_used],
  );

  const estimatedGas = useMemo(() => {
    if (currentSwapApi === 'osmo') {
      return osmoSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS;
    }
    if (currentSwapApi === '1inch' && oneInchRoute.data) {
      return times(oneInchRoute.data.tx.gas, 1.2, 0);
    }
    return '0';
  }, [currentSwapApi, oneInchRoute.data, osmoSwapSimulatedGas]);

  const estimatedFeeBaseAmount = useMemo(() => {
    if (currentSwapApi === 'osmo') {
      return ceil(times(estimatedGas, chain.gasRate.low));
    }
    if (currentSwapApi === '1inch' && oneInchRoute.data) {
      return times(estimatedGas, oneInchRoute.data.tx.gasPrice);
    }
    if (currentSwapApi === 'squid') {
      return plus(squidSourceChainGas, squidCrossChainGas);
    }
    return '0';
  }, [chain.gasRate.low, currentSwapApi, estimatedGas, oneInchRoute.data, squidCrossChainGas, squidSourceChainGas]);

  const estimatedDisplayFeeAmount = useMemo(
    () => toDisplayDenomAmount(estimatedFeeBaseAmount, currentFeeToken?.decimals || 0),
    [currentFeeToken?.decimals, estimatedFeeBaseAmount],
  );

  const estimatedFeePrice = useMemo(() => times(estimatedDisplayFeeAmount, currentFeeTokenPrice), [estimatedDisplayFeeAmount, currentFeeTokenPrice]);

  const currentDisplayOsmoSwapFeeAmount = useMemo(
    () => (inputDisplayAmount ? times(inputDisplayAmount, osmoSwapFeeRate) : '0'),
    [inputDisplayAmount, osmoSwapFeeRate],
  );

  const osmoSwapFeePrice = useMemo(() => times(currentFeeTokenPrice, currentDisplayOsmoSwapFeeAmount), [currentFeeTokenPrice, currentDisplayOsmoSwapFeeAmount]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentFromDisplayBalance, estimatedDisplayFeeAmount);

    if (currentSwapApi === 'osmo') {
      if (isEqualsIgnoringCase(currentFromToken?.denom, currentFeeToken?.baseDenom)) {
        return gt(maxAmount, '0') ? maxAmount : '0';
      }
    }
    if (currentSwapApi === '1inch' || currentSwapApi === 'squid') {
      if (isEqualsIgnoringCase(currentFromToken?.address, EVM_NATIVE_TOKEN_ADDRESS)) {
        return gt(maxAmount, '0') && gt(estimatedDisplayFeeAmount, '0') ? maxAmount : '0';
      }
    }
    return currentFromDisplayBalance;
  }, [currentFromDisplayBalance, estimatedDisplayFeeAmount, currentSwapApi, currentFromToken?.denom, currentFromToken?.address, currentFeeToken?.baseDenom]);

  const errorMessage = useMemo(() => {
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentFromDisplayBalance, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }
    if (!gt(estimatedToTokenDisplayAmount, 0)) {
      return t('pages.Wallet.Swap.entry.invalidOutputAmount');
    }

    if (isEqualsIgnoringCase(currentFromToken?.address, EVM_NATIVE_TOKEN_ADDRESS)) {
      if (!gte(currentFromDisplayBalance, plus(inputDisplayAmount, estimatedDisplayFeeAmount))) {
        return t('pages.Wallet.Swap.entry.insufficientAmount');
      }
      if (!gte(currentFromDisplayBalance, estimatedDisplayFeeAmount)) {
        return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
      }
    }

    if (currentSwapApi === 'osmo') {
      if (!poolData.data || !poolsAssetData.data) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (gt(currentInputBaseAmount, tokenBalanceIn || '0')) {
        return t('pages.Wallet.Swap.entry.excessiveSwap');
      }

      if (currentFromToken?.denom === currentFeeToken?.baseDenom) {
        if (!gte(currentFromDisplayBalance, plus(inputDisplayAmount, estimatedDisplayFeeAmount))) {
          return t('pages.Wallet.Swap.entry.insufficientAmount');
        }
        if (!gte(currentFromDisplayBalance, estimatedDisplayFeeAmount)) {
          return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
        }
      }
      if (gt(priceImpactPercent, 10)) {
        return t('pages.Wallet.Swap.entry.invalidPriceImpact');
      }
      if (!osmoSwapAminoTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }
    if (currentSwapApi === '1inch') {
      if (!oneInchRoute?.data || !allowance.data) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (!integratedSwapTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }
    if (currentSwapApi === 'squid') {
      if (gt(estimatedToTokenDisplayAmountPrice, 100000)) {
        return t('pages.Wallet.Swap.entry.invalidTxSize');
      }
      if (gt(priceImpactPercent, 3)) {
        return t('pages.Wallet.Swap.entry.invalidPriceImpact');
      }
      if (!integratedSwapTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }
    return '';
  }, [
    inputDisplayAmount,
    currentFromDisplayBalance,
    estimatedToTokenDisplayAmount,
    currentFromToken?.address,
    currentFromToken?.denom,
    currentSwapApi,
    t,
    estimatedDisplayFeeAmount,
    poolData.data,
    poolsAssetData.data,
    currentInputBaseAmount,
    tokenBalanceIn,
    currentFeeToken?.baseDenom,
    priceImpactPercent,
    osmoSwapAminoTx,
    oneInchRoute?.data,
    allowance.data,
    integratedSwapTx,
    estimatedToTokenDisplayAmountPrice,
  ]);

  const warningMessage = useMemo(() => {
    if (currentSwapApi === '1inch') {
      if (allowance.data && !gt(allowance.data.allowance, '0')) {
        return t('pages.Wallet.Swap.entry.allowanceWarning');
      }
    }
    if (currentSwapApi === 'squid') {
      if (squidRoute.error) {
        return squidRoute.error.errors[0].message;
      }
      if (gt(estimatedFeeBaseAmount, currentFeeTokenBalance)) {
        return `${t('pages.Wallet.Swap.entry.amountLowThanFee')} ${fix(estimatedDisplayFeeAmount, getDisplayMaxDecimals(currentEthereumNetwork.decimals))} ${
          currentEthereumNetwork.displayDenom
        } ${t('pages.Wallet.Swap.entry.tryAgain')}`;
      }
      if (gt(estimatedToTokenDisplayAmountPrice, '100000')) {
        return t('pages.Wallet.Swap.entry.txSizeWarning');
      }
      if (gt(priceImpactPercent, 3)) {
        return t('pages.Wallet.Swap.entry.liquidityWarning');
      }
      if (currentFeeToken && isEqualsIgnoringCase(currentFromToken?.address, EVM_NATIVE_TOKEN_ADDRESS)) {
        // FIXME 번역 요청드리고 어쩔 수 없다면 선택된 언어에 따라 분기처리 - 번역에 맞춰서 구성할 것
        if (gt(currentInputBaseAmount, minus(currentFeeTokenBalance, estimatedFeeBaseAmount))) {
          return `${t('pages.Wallet.Swap.entry.notEnoughBalance')} ${currentFeeToken.displayDenom}${t('pages.Wallet.Swap.entry.notEnoughCoverAmount')} ${fix(
            toDisplayDenomAmount(minus(currentFeeTokenBalance, estimatedFeeBaseAmount), currentFeeToken.decimals),
            getDisplayMaxDecimals(currentFeeToken.decimals),
          )} ${currentFeeToken.displayDenom} ${t('pages.Wallet.Swap.entry.setAmountBelowGas')}`;
        }
      }
      if (currentInputBaseAmount && currentToToken) {
        return `${t('pages.Wallet.Swap.entry.dueToSlippage')} (${currentSlippage}%)${t('pages.Wallet.Swap.entry.finalReceiveInfo')} ${fix(
          estimatedToTokenDisplayMinAmount,
          gt(estimatedToTokenDisplayMinAmount, '0') ? getDisplayMaxDecimals(currentToToken.decimals) : 0,
        )} ${currentToToken.symbol} (${CURRENCY_SYMBOL[currency]}${fix(estimatedToTokenDisplayAmountPrice, 3)})`;
      }
    }

    return '';
  }, [
    currentSwapApi,
    allowance.data,
    t,
    squidRoute.error,
    estimatedFeeBaseAmount,
    currentFeeTokenBalance,
    estimatedToTokenDisplayAmountPrice,
    priceImpactPercent,
    currentFeeToken,
    currentFromToken?.address,
    currentInputBaseAmount,
    currentToToken,
    estimatedDisplayFeeAmount,
    currentEthereumNetwork.decimals,
    currentEthereumNetwork.displayDenom,
    currentSlippage,
    estimatedToTokenDisplayMinAmount,
    currency,
  ]);

  const inputHelperMessage = useMemo(() => {
    if (inputDisplayAmount) {
      if (gt(inputDisplayAmount, currentFromDisplayBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientAmount');
      }
    }
    return '';
  }, [currentFromDisplayBalance, inputDisplayAmount, t]);

  const allowanceErrorMessage = useMemo(() => {
    if (allowance.data && !gt(allowance.data.allowance, 0)) {
      if (gte(allowanceTxBaseFee, currentFeeTokenBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
      }
    }
    return '';
  }, [allowance.data, allowanceTxBaseFee, currentFeeTokenBalance, t]);

  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedOsmoSwapAminoTx]);

  useEffect(() => {
    if (currentFromChain && !currentToChain) {
      setIsFromSelected(true);
    }
    if (!currentFromChain && currentToChain) {
      setIsFromSelected(false);
    }
  }, [availableFromChainList, currentFromChain, currentToChain, params.id]);

  useEffect(() => {
    if (availableFromChainList.length < 2) {
      setCurrentFromChain(availableFromChainList[0]);
    }
    if (availableToChainList.length < 2) {
      setCurrentToChain(availableToChainList[0]);
    }
  }, [availableFromChainList, availableToChainList, currentSwapApi]);

  useEffect(() => {
    if (!currentSwapApi) {
      setCurrentFromCoin(undefined);
      setCurrentToCoin(undefined);
    }
  }, [currentSwapApi]);

  useEffect(() => {
    if ((currentSwapApi === 'squid' && currentToChain?.line === 'COSMOS') || !currentSwapApi) {
      setIsSwapInfoDisabled(true);
    } else {
      setIsSwapInfoDisabled(false);
    }
  }, [chain.chainId, currentSwapApi, currentToChain?.chainId, currentToChain?.line]);

  useEffect(() => {
    if (!currentFromChain || !currentToChain) {
      setCurrentSwapApi(undefined);
    }
    if (currentFromChain?.line === 'ETHEREUM' && currentToChain && currentFromChain.chainId !== currentToChain?.chainId) {
      setCurrentSwapApi('squid');
    }
    if (currentFromChain?.id === currentToChain?.id && currentFromChain?.line === ETHEREUM.line) {
      setCurrentSwapApi('1inch');
    }
    if (currentFromChain?.id === OSMOSIS.id && currentToChain?.id === OSMOSIS.id) {
      setCurrentSwapApi('osmo');
    }
  }, [chain.id, currentFromChain, currentFromChain?.id, currentToChain, currentToChain?.id]);

  useEffect(() => {
    if (!currentFromToken && currentFromChain?.id === OSMOSIS.id && currentSwapApi === 'osmo') {
      setCurrentFromCoin(filteredFromTokenList[0]);
    }
    if (!currentToToken && currentToChain?.id === OSMOSIS.id && currentSwapApi === 'osmo') {
      setCurrentToCoin(filteredToTokenList[0]);
    }
  }, [currentFromChain?.id, currentFromToken, currentSwapApi, currentToChain?.id, currentToToken, filteredFromTokenList, filteredToTokenList]);

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
              tokenAmountPrice={inputTokenAmountPrice}
              currentSelectedChain={currentFromChain}
              currentSelectedCoin={currentFromToken}
              onClickChain={async (clickedChain) => {
                setCurrentFromChain(clickedChain);
                if (isFromSelected) {
                  setCurrentToChain(undefined);
                }

                setCurrentFromCoin(undefined);
                setCurrentToCoin(undefined);
                setInputDisplayAmount('');
                if (clickedChain.line === 'ETHEREUM') {
                  await setCurrentEthereumNetwork(clickedChain);
                }
              }}
              onClickCoin={(clickedCoin) => {
                if (currentSwapApi === 'osmo' && currentToToken) {
                  setCurrentToCoin(undefined);
                }
                if (currentSwapApi === '1inch' && clickedCoin.address === currentToToken?.address && clickedCoin.symbol === currentToToken?.symbol) {
                  void swapCoin();
                } else {
                  setCurrentFromCoin(clickedCoin);
                }
              }}
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
                    gt(maxDisplayAmount, 0) && (
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
                    )
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
              tokenAmountPrice={estimatedToTokenDisplayAmountPrice}
              currentSelectedChain={currentToChain}
              currentSelectedCoin={currentToToken}
              onClickChain={(clickedChain) => {
                setCurrentToChain(clickedChain);
                if (!isFromSelected) {
                  setCurrentFromChain(undefined);
                }

                setCurrentFromCoin(undefined);
                setCurrentToCoin(undefined);
                setInputDisplayAmount('');
              }}
              onClickCoin={(clickedCoin) =>
                currentSwapApi === '1inch' && clickedCoin.address === currentFromToken?.address && clickedCoin.symbol === currentFromToken?.symbol
                  ? swapCoin()
                  : setCurrentToCoin(clickedCoin)
              }
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
                <SwapCoinOutputAmountContainer data-is-active={gt(estimatedToTokenDisplayAmount, 0)}>
                  <Tooltip title={estimatedToTokenDisplayAmount} arrow placement="top">
                    <span>
                      <NumberText typoOfIntegers="h3n" fixed={gt(estimatedToTokenDisplayAmount, 0) ? getDisplayMaxDecimals(currentToToken?.decimals) : 0}>
                        {estimatedToTokenDisplayAmount}
                      </NumberText>
                    </span>
                  </Tooltip>
                </SwapCoinOutputAmountContainer>
              )}
            </SwapCoinContainer>
            {!isSwapInfoDiabled && (
              <SwapIconButton onClick={swapCoin}>
                <SwapIcon />
              </SwapIconButton>
            )}
          </SwapContainer>
          {warningMessage && (
            <WarningContainer>
              <Typography variant="h6">{warningMessage}</Typography>
            </WarningContainer>
          )}

          <SwapInfoContainer>
            <SwapInfoHeaderContainer>
              <Typography variant="h6n">
                {t('pages.Wallet.Swap.entry.minimumReceived')} ({currentSlippage}%)
              </Typography>
              <SwapInfoSubHeaderContainer>
                {isLoadingSwapData ? (
                  <MinimumReceivedCircularProgressContainer>
                    <StyledCircularProgress size={15} />
                  </MinimumReceivedCircularProgressContainer>
                ) : debouncedInputDisplayAmount && gt(estimatedToTokenDisplayMinAmount, 0) ? (
                  <>
                    <Tooltip title={estimatedToTokenDisplayMinAmount} arrow placement="top">
                      <span>
                        <NumberText typoOfIntegers="h4n" typoOfDecimals="h5n" fixed={getDisplayMaxDecimals(currentToToken?.decimals || 0)}>
                          {estimatedToTokenDisplayMinAmount}
                        </NumberText>
                      </span>
                    </Tooltip>
                    &nbsp;
                    <Typography variant="h4n">{currentToToken?.symbol}</Typography>
                  </>
                ) : (
                  <Typography variant="h4">-</Typography>
                )}
              </SwapInfoSubHeaderContainer>
            </SwapInfoHeaderContainer>
            <SwapInfoBodyContainer>
              {(currentSwapApi === 'osmo' || currentSwapApi === 'squid') && (
                <>
                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.exchangeRate')}</Typography>
                    </SwapInfoBodyLeftContainer>
                    <SwapInfoBodyRightContainer>
                      {isLoadingSwapData ? (
                        <StyledCircularProgress size={15} />
                      ) : debouncedInputDisplayAmount && gt(outputAmountOf1Coin, 0) ? (
                        <SwapInfoBodyRightTextContainer>
                          <NumberText typoOfIntegers="h6n">1</NumberText>
                          &nbsp;
                          <Typography variant="h6n">{currentFromToken?.symbol} ≈</Typography>
                          &nbsp;
                          <Tooltip title={outputAmountOf1Coin} arrow placement="top">
                            <span>
                              <NumberText
                                typoOfIntegers="h6n"
                                typoOfDecimals="h7n"
                                fixed={gt(outputAmountOf1Coin, 0) ? getDisplayMaxDecimals(currentToToken?.decimals) : 0}
                              >
                                {outputAmountOf1Coin}
                              </NumberText>
                            </span>
                          </Tooltip>
                          &nbsp;
                          <Typography variant="h6n">{currentToToken?.symbol}</Typography>
                        </SwapInfoBodyRightTextContainer>
                      ) : (
                        <Typography variant="h6">-</Typography>
                      )}
                    </SwapInfoBodyRightContainer>
                  </SwapInfoBodyTextContainer>

                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.priceImpact')}</Typography>
                    </SwapInfoBodyLeftContainer>
                    <SwapInfoBodyRightContainer>
                      {isLoadingSwapData ? (
                        <StyledCircularProgress size={15} />
                      ) : inputDisplayAmount && priceImpactPercent !== '0' ? (
                        <SwapInfoBodyRightTextContainer data-is-invalid={gt(priceImpactPercent, currentSwapApi === 'osmo' ? 10 : 5)}>
                          <Typography variant="h6n">{` ${gt(priceImpactPercent, 0) ? `-` : ``} ${
                            lt(priceImpactPercent.replace('-', ''), 0.01) ? `<` : ``
                          }`}</Typography>
                          &nbsp;
                          <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                            {priceImpactPercent.replace('-', '')}
                          </NumberText>
                          <Typography variant="h6n">%</Typography>
                        </SwapInfoBodyRightTextContainer>
                      ) : (
                        <Typography variant="h6">-</Typography>
                      )}
                    </SwapInfoBodyRightContainer>
                  </SwapInfoBodyTextContainer>
                </>
              )}

              {currentSwapApi === 'osmo' && (
                <SwapInfoBodyTextContainer>
                  <SwapInfoBodyLeftContainer>
                    <Typography variant="h6">
                      {t('pages.Wallet.Swap.entry.swapFee')} ({times(osmoSwapFeeRate, 100)}%)
                    </Typography>
                  </SwapInfoBodyLeftContainer>
                  <SwapInfoBodyRightContainer>
                    {inputDisplayAmount && osmoSwapFeePrice ? (
                      <SwapInfoBodyRightTextContainer>
                        <Typography variant="h6n">{` ≈ ${lt(osmoSwapFeePrice, 0.01) ? `<` : ``} ${currency ? CURRENCY_SYMBOL[currency] : ``}`}</Typography>
                        &nbsp;
                        <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                          {osmoSwapFeePrice}
                        </NumberText>
                      </SwapInfoBodyRightTextContainer>
                    ) : (
                      <Typography variant="h6">-</Typography>
                    )}
                  </SwapInfoBodyRightContainer>
                </SwapInfoBodyTextContainer>
              )}

              {(currentSwapApi === 'osmo' || currentSwapApi === '1inch') && (
                <SwapInfoBodyTextContainer>
                  <SwapInfoBodyLeftContainer>
                    <Typography variant="h6">{t('pages.Wallet.Swap.entry.txCost')}</Typography>
                  </SwapInfoBodyLeftContainer>
                  <SwapInfoBodyRightContainer>
                    {isLoadingSwapData ? (
                      <StyledCircularProgress size={15} />
                    ) : inputDisplayAmount && estimatedFeePrice ? (
                      <SwapInfoBodyRightTextContainer>
                        <Typography variant="h6n">{` ≈ ${lt(estimatedFeePrice, 0.01) ? `<` : ``} ${currency ? CURRENCY_SYMBOL[currency] : ``}`}</Typography>
                        &nbsp;
                        <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                          {estimatedFeePrice}
                        </NumberText>
                      </SwapInfoBodyRightTextContainer>
                    ) : (
                      <Typography variant="h6">-</Typography>
                    )}
                  </SwapInfoBodyRightContainer>
                </SwapInfoBodyTextContainer>
              )}

              {currentSwapApi === 'squid' && (
                <>
                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.gasFees')}</Typography>
                      <StyledTooltip
                        title={
                          <StyledTooltipTitleContainer>
                            <Typography variant="h7">{t('pages.Wallet.Swap.entry.gasFeesInfo')}</Typography>
                            <StyledTooltipBodyContainer>
                              <StyledTooltipBodyTextContainer>
                                <StyledTooltipBodyLeftTextContainer>
                                  <Typography variant="h7n">Source Chain gas</Typography>
                                </StyledTooltipBodyLeftTextContainer>
                                <StyledTooltipBodyRightTextContainer>
                                  <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n" fixed={gt(squidSourceChainFeeDisplayAmount, '0') ? 5 : 0}>
                                    {squidSourceChainFeeDisplayAmount}
                                  </NumberText>
                                  &nbsp;
                                  <Typography variant="h7n">{currentFeeToken?.displayDenom}</Typography> (
                                  <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n" fixed={2} currency={currency}>
                                    {squidSourceChainFeePrice}
                                  </NumberText>
                                  )
                                </StyledTooltipBodyRightTextContainer>
                              </StyledTooltipBodyTextContainer>
                              <StyledTooltipBodyTextContainer>
                                <StyledTooltipBodyLeftTextContainer>
                                  <Typography variant="h7n">Cross-Chain gas</Typography>
                                </StyledTooltipBodyLeftTextContainer>
                                <StyledTooltipBodyRightTextContainer>
                                  <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n" fixed={gt(squidCrossChainFeeDisplayAmount, '0') ? 5 : 0}>
                                    {squidCrossChainFeeDisplayAmount}
                                  </NumberText>
                                  &nbsp;
                                  <Typography variant="h7n">{currentFeeToken?.displayDenom}</Typography>(
                                  <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n" fixed={2} currency={currency}>
                                    {squidCrossChainFeePrice}
                                  </NumberText>
                                  )
                                </StyledTooltipBodyRightTextContainer>
                              </StyledTooltipBodyTextContainer>
                            </StyledTooltipBodyContainer>
                          </StyledTooltipTitleContainer>
                        }
                        placement="bottom"
                        arrow
                      >
                        <span>
                          <SwapInfoBodyLeftIconContainer>
                            <Info16Icon />
                          </SwapInfoBodyLeftIconContainer>
                        </span>
                      </StyledTooltip>
                    </SwapInfoBodyLeftContainer>
                    <SwapInfoBodyRightContainer>
                      {isLoadingSwapData ? (
                        <StyledCircularProgress size={15} />
                      ) : estimatedFeePrice !== '0' ? (
                        <SwapInfoBodyRightTextContainer>
                          <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2} currency={currency}>
                            {estimatedFeePrice}
                          </NumberText>
                        </SwapInfoBodyRightTextContainer>
                      ) : (
                        <Typography variant="h6">-</Typography>
                      )}
                    </SwapInfoBodyRightContainer>
                  </SwapInfoBodyTextContainer>

                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.processingTime')}</Typography>
                    </SwapInfoBodyLeftContainer>

                    <SwapInfoBodyRightContainer>
                      {isLoadingSwapData ? (
                        <StyledCircularProgress size={15} />
                      ) : squidProcessingTime !== '0' ? (
                        <SwapInfoBodyRightTextContainer>
                          <NumberText typoOfIntegers="h6n" typoOfDecimals="h6n">{`~ ${squidProcessingTime}`}</NumberText>
                          &nbsp;
                          <Typography variant="h6n">{t('pages.Wallet.Swap.entry.minutes')}</Typography>
                        </SwapInfoBodyRightTextContainer>
                      ) : (
                        <Typography variant="h6">-</Typography>
                      )}
                    </SwapInfoBodyRightContainer>
                  </SwapInfoBodyTextContainer>
                </>
              )}
            </SwapInfoBodyContainer>
          </SwapInfoContainer>
        </BodyContainer>
        <BottomContainer>
          {currentSwapApi === '1inch' && allowance.data && !gt(allowance.data.allowance, '0') && allowanceTx ? (
            <Tooltip varient="error" title={allowanceErrorMessage} placement="top" arrow>
              <div>
                <Button
                  Icon={Permission16Icon}
                  type="button"
                  disabled={!allowanceTx || !!allowanceErrorMessage}
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
                              gas: toHex(allowanceBaseEstimatedGas, { addPrefix: true, isStringNumber: true }),
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
              </div>
            </Tooltip>
          ) : (
            <Tooltip varient="error" title={errorMessage} placement="top" arrow>
              <div>
                <Button
                  isProgress={isLoadingSwapData}
                  type="button"
                  disabled={!!errorMessage || isDisabled}
                  onClick={async () => {
                    if (currentSwapApi === '1inch' || (currentSwapApi === 'squid' && integratedSwapTx)) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'eth_sendTransaction',
                          params: [
                            {
                              ...integratedSwapTx,
                            },
                          ],
                        },
                      });

                      if (currentAccount.type === 'LEDGER') {
                        await openWindow();
                        window.close();
                      }
                    }
                    if (currentSwapApi === 'osmo' && osmoSwapAminoTx && currentFeeToken?.baseDenom) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'cos_signAmino',
                          params: {
                            chainName: chain.chainName,
                            doc: {
                              ...osmoSwapAminoTx,
                              fee: { amount: [{ denom: currentFeeToken.baseDenom, amount: estimatedFeeBaseAmount }], gas: estimatedGas },
                            },
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
          )}
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
