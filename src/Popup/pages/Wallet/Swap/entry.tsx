import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import type { GetRoute } from '@0xsquid/sdk';
import { InputAdornment, Typography } from '@mui/material';

import { ONEINCH_SUPPORTED_CHAINS } from '~/constants/1inch';
import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import { ETHEREUM, EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import { SQUID_SUPPORTED_COSMOS_CHAINS, SQUID_SUPPORTED_EVM_CHAINS } from '~/constants/squid';
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
import { useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useBalanceSWR as useNativeBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
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
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';
import type { IntegratedSwapAPI } from '~/types/swap/integratedSwap';

import ChainFeeInfo from './components/ChainFeeInfo';
import SlippageSettingDialog from './components/SlippageSettingDialog';
import SwapCoinContainer from './components/SwapCoinContainer';
import {
  BodyContainer,
  BottomContainer,
  Container,
  GasInfoStyledTooltip,
  MaxButton,
  MinimumReceivedCircularProgressContainer,
  OutputAmountCircularProgressContainer,
  SideButton,
  StyledCircularProgress,
  StyledTooltipBodyContainer,
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
  SwapInfoHeaderTextContainer,
  SwapInfoStyledTooltip,
  SwapInfoSubHeaderContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';
import Management24Icon from '~/images/icons/Mangement24.svg';
import Permission16Icon from '~/images/icons/Permission16.svg';
import SwapIcon from '~/images/icons/Swap.svg';

import evm_assets from './assets/evm_assets.json';

const STABLE_POOL_TYPE = '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool';
const WEIGHTED_POOL_TYPE = '/osmosis.gamm.v1beta1.Pool';

export default function Entry() {
  const osmosisChain = OSMOSIS;
  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(osmosisChain, true);
  const accounts = useAccounts(true);
  const { vestingRelatedAvailable } = useAmountSWR(osmosisChain);

  const params = useParams();

  const { enQueue } = useCurrentQueue();
  const nodeInfo = useNodeInfoSWR(osmosisChain);
  const { chromeStorage } = useChromeStorage();
  const { ethereumTokens } = chromeStorage;
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const osmosisAssets = useCosmosAssetsSWR(osmosisChain);
  const osmosisBalance = useBalanceSWR(osmosisChain);
  const { currentEthereumNetwork, setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

  const { squidChainList, filteredSquidTokenList } = useSquidAssetsSWR();

  const allowedOneInchTokens = useAllowedTokensSWR();

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[osmosisChain.id] || '',
    [accounts.data, osmosisChain.id, currentAccount.id],
  );

  const [currentSlippage, setCurrentSlippage] = useState('1');

  const [currentSwapAPI, setCurrentSwapAPI] = useState<IntegratedSwapAPI>();

  const [isFromSelected, setIsFromSelected] = useState<boolean>();
  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const filteredFromChainList: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMList = ETHEREUM_NETWORKS.filter(
      (item) =>
        SQUID_SUPPORTED_EVM_CHAINS.find((squidChain) => squidChain.chainId === item.chainId) &&
        squidChainList?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === String(squidChain.chainId)),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const squidCosmosList = COSMOS_CHAINS.filter(
      (item) =>
        osmosisChain.chainId === item.chainId &&
        SQUID_SUPPORTED_COSMOS_CHAINS.find((squidChain) => squidChain.chainId === item.chainId) &&
        squidChainList?.find((squidChain) => squidChain.chainType === 'cosmos' && item.chainId === String(squidChain.chainId)),
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

    if (currentToChain?.chainId === osmosisChain.chainId) {
      return [...squidEVMList, ...squidCosmosList];
    }

    if (
      currentToChain &&
      ONEINCH_SUPPORTED_CHAINS.filter((item) => !squidEVMList.find((evmChain) => evmChain.chainId === String(parseInt(item.chainId, 16)))).find(
        (item) => String(parseInt(item.chainId, 16)) === currentToChain.chainId,
      )
    ) {
      return [currentToChain];
    }
    return [...integratedEVMList, ...squidCosmosList];
  }, [currentToChain, isFromSelected, osmosisChain.chainId, squidChainList]);

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain | undefined>(filteredFromChainList.find((item) => item.id === params.id));

  const filteredToChainList: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMList = ETHEREUM_NETWORKS.filter(
      (item) =>
        SQUID_SUPPORTED_EVM_CHAINS.find((squidChain) => squidChain.chainId === item.chainId) &&
        squidChainList?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === String(squidChain.chainId)),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const squidCosmosList = COSMOS_CHAINS.filter(
      (item) =>
        SQUID_SUPPORTED_COSMOS_CHAINS.find((squidChain) => squidChain.chainId === item.chainId) &&
        squidChainList?.find((squidChain) => squidChain.chainType === 'cosmos' && item.chainId === String(squidChain.chainId)),
    ).map((item) => ({
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
        ONEINCH_SUPPORTED_CHAINS.filter((item) => !squidEVMList.find((evmChain) => evmChain.chainId === String(parseInt(item.chainId, 16)))).find(
          (item) => String(parseInt(item.chainId, 16)) === currentFromChain.chainId,
        )) ||
      currentFromChain?.chainId === osmosisChain.chainId
    ) {
      return [currentFromChain];
    }
    return [...squidEVMList, ...squidCosmosList];
  }, [currentFromChain, isFromSelected, osmosisChain.chainId, squidChainList]);

  const [isSwapConfigDiabled, setIsSwapInfoDisabled] = useState<boolean>(false);

  const [currentFromToken, setCurrentFromCoin] = useState<IntegratedSwapToken>();
  const [currentToToken, setCurrentToCoin] = useState<IntegratedSwapToken>();

  const [inputDisplayAmount, setInputDisplayAmount] = useState<string>('');
  const [debouncedInputDisplayAmount] = useDebounce(inputDisplayAmount, 400);

  const currentInputBaseAmount = useMemo(
    () => toBaseDenomAmount(debouncedInputDisplayAmount || 0, currentFromToken?.decimals || 0),
    [currentFromToken?.decimals, debouncedInputDisplayAmount],
  );

  const poolsAssetData = usePoolsAssetSWR(osmosisChain.chainName.toLowerCase());
  const poolDenomList = useMemo(
    () => (poolsAssetData.data ? [...poolsAssetData.data.map((item) => item.adenom), ...poolsAssetData.data.map((item) => item.bdenom)] : []),
    [poolsAssetData.data],
  );

  const uniquePoolDenomList = poolDenomList.filter((denom, idx, arr) => arr.findIndex((item) => item === denom) === idx);

  const currentPool = useMemo(
    () =>
      poolsAssetData.data?.find(
        (item) =>
          (isEqualsIgnoringCase(item.adenom, currentToToken?.address) && isEqualsIgnoringCase(item.bdenom, currentFromToken?.address)) ||
          (isEqualsIgnoringCase(item.adenom, currentFromToken?.address) && isEqualsIgnoringCase(item.bdenom, currentToToken?.address)),
      ),
    [currentFromToken?.address, currentToToken?.address, poolsAssetData.data],
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
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, currentFromToken?.address))?.amount,
    [currentFromToken?.address, poolAssetsTokenList],
  );

  const tokenWeightIn = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, currentFromToken?.address))?.weight
        : undefined,
    [currentFromToken?.address, poolData.data],
  );

  const tokenBalanceOut = useMemo(
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, currentToToken?.address))?.amount,
    [currentToToken?.address, poolAssetsTokenList],
  );

  const tokenWeightOut = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, currentToToken?.address))?.weight
        : undefined,
    [currentToToken?.address, poolData.data],
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
        currentToToken?.address,
        currentFromToken?.address,
        scalingFactors,
      );
    } catch {
      return '0';
    }
  }, [
    currentToToken?.address,
    currentFromToken?.address,
    poolAssetsTokenList,
    scalingFactors,
    osmoSwapFeeRate,
    tokenBalanceIn,
    tokenBalanceOut,
    tokenWeightIn,
    tokenWeightOut,
  ]);

  const swapCoin = useCallback(() => {
    const tmpFromToken = currentFromToken;
    const tmpFromChain = currentFromChain;

    if (currentSwapAPI === 'squid' && currentToChain?.line === 'ETHEREUM') {
      setCurrentFromChain(currentToChain);
      setCurrentToChain(tmpFromChain);
    }

    setCurrentFromCoin(currentToToken);
    setCurrentToCoin(tmpFromToken);

    setInputDisplayAmount('');
  }, [currentFromChain, currentFromToken, currentSwapAPI, currentToChain, currentToToken]);

  const currentFromAddress = useMemo(
    () => (currentFromChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentFromChain.addressId]) || '',
    [accounts?.data, currentAccount.id, currentFromChain],
  );
  const currentToAddress = useMemo(
    () => (currentToChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentToChain.addressId]) || '',
    [accounts?.data, currentAccount.id, currentToChain],
  );

  const currentFromEVMNativeBalance = useNativeBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined);
  const currentFromEVMTokenBalance = useTokenBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined, currentFromToken);

  const currentToEVMNativeBalance = useNativeBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined);
  const currentToEVMTokenBalance = useTokenBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined, currentToToken);

  const currentFromBalance = useMemo(
    () =>
      gt(currentFromToken?.availableAmount || '0', '0')
        ? currentFromToken?.availableAmount || '0'
        : isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentFromToken?.address)
        ? BigInt(currentFromEVMNativeBalance?.data?.result || '0').toString(10)
        : BigInt(currentFromEVMTokenBalance.data || '0').toString(10),
    [currentFromToken?.address, currentFromToken?.availableAmount, currentFromEVMNativeBalance?.data?.result, currentFromEVMTokenBalance.data],
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
        ? BigInt(currentToEVMNativeBalance?.data?.result || '0').toString(10)
        : BigInt(currentToEVMTokenBalance.data || '0').toString(10),
    [currentToToken?.address, currentToToken?.availableAmount, currentToEVMNativeBalance?.data?.result, currentToEVMTokenBalance.data],
  );
  const currentToDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentToBalance, currentToToken?.decimals || 0),
    [currentToToken?.decimals, currentToBalance],
  );

  const oneinchSupportedTokenList = useTokenAssetsSWR((currentSwapAPI === '1inch' && String(parseInt(currentEthereumNetwork.chainId, 16))) || '');

  const filteredAllowedOneInchTokenList = useMemo(
    () =>
      currentSwapAPI === '1inch' && allowedOneInchTokens.data
        ? Object.values(allowedOneInchTokens.data[String(parseInt(currentEthereumNetwork.chainId, 16))])
        : [],
    [allowedOneInchTokens.data, currentEthereumNetwork.chainId, currentSwapAPI],
  );

  const filteredFromTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentFromEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentFromChain?.id);

    if (currentSwapAPI === 'osmo') {
      const filteredTokenList = osmosisAssets.data
        .filter((item) => uniquePoolDenomList.includes(item.denom))
        .map((item) => ({
          ...item,
          address: item.denom,
          availableAmount: osmosisBalance.data?.balance ? osmosisBalance.data?.balance.find((coin) => coin.denom === item.denom)?.amount : '0',
          logoURI: item.image,
          name: getCapitalize(item.prevChain || item.origin_chain),
        }));

      return [
        ...filteredTokenList.filter(
          (item) => gt(item?.availableAmount || 0, 0) && (item.type === 'staking' || item.type === 'native' || item.type === 'bridge'),
        ),
        ...filteredTokenList.filter((item) => gt(item?.availableAmount || 0, 0) && item.type === 'ibc').sort((a, b) => a.symbol.localeCompare(b.symbol)),
        ...filteredTokenList.filter((item) => !gt(item?.availableAmount || 0, 0)).sort((a, b) => a.symbol.localeCompare(b.symbol)),
      ];
    }

    if (currentSwapAPI === '1inch' && oneinchSupportedTokenList.data) {
      const filteredTokenList = Object.values(oneinchSupportedTokenList.data.tokens);

      return [
        ...filteredTokenList.filter((item) => item.tags.includes('native')),
        ...filteredTokenList.filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            filteredAllowedOneInchTokenList.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredTokenList.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !filteredAllowedOneInchTokenList.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ];
    }

    if (currentSwapAPI === 'squid') {
      const filteredTokenList = filteredSquidTokenList(currentFromChain?.chainId);
      return [
        ...filteredTokenList.filter((item) => isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address)),
        ...filteredTokenList.filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address) &&
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ].map((item) => ({ ...item, coinGeckoId: item.coingeckoId }));
    }

    return [];
  }, [
    osmosisBalance.data?.balance,
    osmosisAssets.data,
    currentFromChain?.chainId,
    currentFromChain?.id,
    currentSwapAPI,
    ethereumTokens,
    filteredAllowedOneInchTokenList,
    filteredSquidTokenList,
    oneinchSupportedTokenList.data,
    uniquePoolDenomList,
  ]);

  const filteredToTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentToEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentToChain?.id);

    if (currentSwapAPI === 'osmo') {
      return filteredFromTokenList.filter((token) =>
        poolsAssetData.data?.find(
          (item) =>
            (isEqualsIgnoringCase(item.adenom, token.address) && isEqualsIgnoringCase(item.bdenom, currentFromToken?.address)) ||
            (isEqualsIgnoringCase(item.adenom, currentFromToken?.address) && isEqualsIgnoringCase(item.bdenom, token.address)),
        ),
      );
    }

    if (currentSwapAPI === '1inch' && oneinchSupportedTokenList.data) {
      const filteredTokenList = Object.values(oneinchSupportedTokenList.data.tokens);

      return [
        ...filteredTokenList.filter((item) => item.tags.includes('native')),
        ...filteredTokenList.filter((item) => currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            filteredAllowedOneInchTokenList.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredTokenList.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !filteredAllowedOneInchTokenList.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ];
    }

    if (currentSwapAPI === 'squid' && currentToChain?.line === 'ETHEREUM') {
      const filteredTokenList = filteredSquidTokenList(currentToChain?.chainId);

      return [
        ...filteredTokenList.filter((item) => isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address)),
        ...filteredTokenList.filter((item) => currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address) &&
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ].map((item) => ({
        ...item,
        coinGeckoId: item.coingeckoId,
      }));
    }

    if (currentSwapAPI === 'squid' && currentToChain?.line === 'COSMOS') {
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
        coinGeckoId: osmosisAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.coinGeckoId || item.coingeckoId,
        availableAmount: osmosisBalance.data?.balance
          ? osmosisBalance.data?.balance.find((coin) =>
              isEqualsIgnoringCase(coin.denom, osmosisAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.denom),
            )?.amount
          : '0',
      }));
    }

    return [];
  }, [
    ethereumTokens,
    currentSwapAPI,
    currentToChain,
    oneinchSupportedTokenList.data,
    filteredSquidTokenList,
    osmosisAssets.data,
    currentFromToken?.address,
    osmosisBalance.data?.balance,
    filteredAllowedOneInchTokenList,
    filteredFromTokenList,
    poolsAssetData.data,
  ]);

  const currentFromTokenPrice = useMemo(
    () => (currentFromToken?.coinGeckoId && coinGeckoPrice.data?.[currentFromToken?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentFromToken?.coinGeckoId],
  );

  const currentToTokenPrice = useMemo(
    () => (currentToToken?.coinGeckoId && coinGeckoPrice.data?.[currentToToken.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentToToken?.coinGeckoId],
  );

  const currentFeeToken = useMemo(
    () =>
      filteredFromTokenList.find((item) => {
        if (currentFromChain?.line === 'ETHEREUM') {
          return isEqualsIgnoringCase(item.address, EVM_NATIVE_TOKEN_ADDRESS);
        }

        if (currentFromChain?.line === 'COSMOS') {
          return isEqualsIgnoringCase(item.address, osmosisChain.baseDenom);
        }

        return undefined;
      }),
    [currentFromChain?.line, filteredFromTokenList, osmosisChain.baseDenom],
  );

  const currentFeeTokenBalance = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
      return vestingRelatedAvailable;
    }

    if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid') {
      return BigInt(currentFromEVMNativeBalance?.data?.result || '0').toString(10);
    }

    return '0';
  }, [currentSwapAPI, vestingRelatedAvailable, currentFromEVMNativeBalance?.data?.result]);

  const currentFeeTokenPrice = useMemo(
    () => (currentFeeToken?.coinGeckoId && coinGeckoPrice.data?.[currentFeeToken.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, currentFeeToken?.coinGeckoId],
  );

  const inputTokenAmountPrice = useMemo(() => times(inputDisplayAmount || '0', currentFromTokenPrice), [inputDisplayAmount, currentFromTokenPrice]);

  const squidRouteParam = useMemo<GetRoute | undefined>(() => {
    if (
      currentSwapAPI === 'squid' &&
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
  }, [currentFromChain, currentFromToken, currentInputBaseAmount, currentSlippage, currentSwapAPI, currentToAddress, currentToChain, currentToToken]);

  const squidRoute = useSquidRouteSWR(squidRouteParam);

  const squidProcessingTime = useMemo(() => divide(squidRoute.data?.route.estimate.estimatedRouteDuration || '0', '60'), [squidRoute.data]);

  const squidSourceChainFeeAmount = useMemo(
    () => squidRoute.data?.route.estimate.gasCosts.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0',
    [squidRoute.data],
  );

  const squidCrossChainFeeAmount = useMemo(
    () => squidRoute.data?.route.estimate.feeCosts.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0',
    [squidRoute.data],
  );

  const allowance = useAllowanceSWR(
    currentSwapAPI === '1inch' && currentFromToken?.address && currentFromChain?.chainId
      ? {
          tokenAddress: currentFromToken.address,
          walletAddress: currentFromAddress,
          chainId: currentFromChain.chainId,
        }
      : undefined,
  );

  const allowanceTxData = useAllowanceTxSWR(
    allowance.data && !gt(allowance.data.allowance, currentInputBaseAmount) && currentFromToken?.address && currentFromChain?.chainId
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

  const allowanceBaseFeePerGas = useMemo(() => {
    if (allowanceFee.type === 'BASIC') return allowanceFee.currentGasPrice || '0';
    if (allowanceFee.type === 'EIP-1559') return allowanceFee.currentFee?.average.maxBaseFeePerGas || '0';

    return '0';
  }, [allowanceFee.currentFee?.average.maxBaseFeePerGas, allowanceFee.currentGasPrice, allowanceFee.type]);

  const allowanceTxBaseFee = useMemo(() => times(allowanceBaseFeePerGas, allowanceBaseEstimatedGas), [allowanceBaseEstimatedGas, allowanceBaseFeePerGas]);

  const oneInchRouteParam = useMemo<UseOneInchSwapSWRProps | undefined>(() => {
    if (
      currentSwapAPI === '1inch' &&
      currentFromToken?.address &&
      currentToToken?.address &&
      currentFromChain?.chainId &&
      gt(currentInputBaseAmount, 0) &&
      gt(allowance.data?.allowance || '0', currentInputBaseAmount)
    ) {
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
  }, [
    allowance.data?.allowance,
    currentFromAddress,
    currentFromChain?.chainId,
    currentFromToken?.address,
    currentInputBaseAmount,
    currentSlippage,
    currentSwapAPI,
    currentToToken?.address,
  ]);

  const oneInchRoute = useOneInchSwapTxSWR(oneInchRouteParam);

  const isLoadingSwapData = useMemo(() => {
    if (currentSwapAPI === '1inch') return oneInchRoute.isValidating;

    if (currentSwapAPI === 'squid') return squidRoute.isValidating;

    return false;
  }, [currentSwapAPI, oneInchRoute.isValidating, squidRoute.isValidating]);

  const estimatedToTokenBaseAmount = useMemo(() => {
    if (currentSwapAPI === 'osmo')
      try {
        return calcOutGivenIn(
          currentInputBaseAmount,
          osmoSwapFeeRate,
          poolAssetsTokenList,
          tokenBalanceIn,
          tokenWeightIn,
          tokenBalanceOut,
          tokenWeightOut,
          currentFromToken?.address,
          currentToToken?.address,
          scalingFactors,
        );
      } catch {
        return '0';
      }

    if (currentSwapAPI === '1inch' && oneInchRoute.data) {
      return oneInchRoute.data.toTokenAmount;
    }

    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return squidRoute.data.route.estimate.toAmount;
    }

    return '0';
  }, [
    currentFromToken?.address,
    currentInputBaseAmount,
    currentSwapAPI,
    currentToToken?.address,
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

  const estimatedToTokenDisplayAmount = useMemo(
    () => toDisplayDenomAmount(estimatedToTokenBaseAmount, currentToToken?.decimals || 0),
    [currentToToken?.decimals, estimatedToTokenBaseAmount],
  );

  const estimatedToTokenDisplayAmountPrice = useMemo(
    () => times(estimatedToTokenDisplayAmount, currentToTokenPrice),
    [estimatedToTokenDisplayAmount, currentToTokenPrice],
  );

  const estimatedToTokenBaseMinAmount = useMemo(
    () => minus(estimatedToTokenBaseAmount, times(estimatedToTokenBaseAmount, divide(currentSlippage, '100'))),
    [currentSlippage, estimatedToTokenBaseAmount],
  );

  const estimatedToTokenDisplayMinAmount = useMemo(
    () => toDisplayDenomAmount(estimatedToTokenBaseMinAmount, currentToToken?.decimals || 0),
    [currentToToken?.decimals, estimatedToTokenBaseMinAmount],
  );

  const outputAmountOf1Coin = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
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
    if (currentSwapAPI === 'squid' && squidRoute.data?.route.estimate.exchangeRate) {
      return squidRoute.data.route.estimate.exchangeRate;
    }
    return '0';
  }, [currentSwapAPI, squidRoute.data, beforeSpotPriceInOverOut, osmoSwapFeeRate, currentToToken?.decimals, currentFromToken?.decimals]);

  const priceImpactPercent = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
      try {
        const effective = divide(currentInputBaseAmount, estimatedToTokenBaseAmount);
        return times(minus(divide(effective, beforeSpotPriceInOverOut), '1'), '100', 18);
      } catch {
        return '0';
      }
    }

    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return squidRoute.data.route.estimate.aggregatePriceImpact;
    }

    return '0';
  }, [beforeSpotPriceInOverOut, currentInputBaseAmount, currentSwapAPI, estimatedToTokenBaseAmount, squidRoute.data]);

  const integratedSwapTx = useMemo(() => {
    if (currentSwapAPI === '1inch' && gt(allowance.data?.allowance || '0', currentInputBaseAmount) && oneInchRoute.data) {
      return {
        from: oneInchRoute.data.tx.from,
        to: oneInchRoute.data.tx.to,
        data: oneInchRoute.data.tx.data,
        value: toHex(oneInchRoute.data.tx.value, { addPrefix: true, isStringNumber: true }),
        gas: toHex(times(oneInchRoute.data.tx.gas, getDefaultAV(), 0), { addPrefix: true, isStringNumber: true }),
      };
    }
    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return {
        from: currentFromAddress,
        to: squidRoute.data.route.transactionRequest.targetAddress,
        data: squidRoute.data.route.transactionRequest.data,
        value: toHex(squidRoute.data.route.transactionRequest.value, { addPrefix: true, isStringNumber: true }),
        gas: toHex(squidRoute.data.route.transactionRequest.gasLimit, { addPrefix: true, isStringNumber: true }),
      };
    }
    return undefined;
  }, [allowance.data?.allowance, currentFromAddress, currentInputBaseAmount, currentSwapAPI, oneInchRoute.data, squidRoute.data]);

  const memoizedOsmoSwapAminoTx = useMemo(() => {
    if (currentSwapAPI === 'osmo' && inputDisplayAmount && account.data?.value.account_number && currentFeeToken?.address) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.node_info?.network ?? osmosisChain.chainId,
        fee: { amount: [{ amount: '1', denom: currentFeeToken.address }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: [
          {
            type: 'osmosis/gamm/swap-exact-amount-in',
            value: {
              routes: [
                {
                  pool_id: currentPoolId,
                  token_out_denom: currentToToken?.address,
                },
              ],
              sender: address,
              token_in: {
                amount: currentInputBaseAmount,
                denom: currentFromToken?.address,
              },
              token_out_min_amount: fix(estimatedToTokenBaseMinAmount, 0),
            },
          },
        ],
      };
    }

    return undefined;
  }, [
    currentSwapAPI,
    inputDisplayAmount,
    account.data?.value.account_number,
    account.data?.value.sequence,
    currentFeeToken?.address,
    nodeInfo.data?.node_info?.network,
    osmosisChain.chainId,
    currentPoolId,
    currentToToken?.address,
    address,
    currentInputBaseAmount,
    currentFromToken?.address,
    estimatedToTokenBaseMinAmount,
  ]);

  const [osmoSwapAminoTx] = useDebounce(memoizedOsmoSwapAminoTx, 700);

  const osmoSwapProtoTx = useMemo(() => {
    if (osmoSwapAminoTx) {
      const pTx = protoTx(osmoSwapAminoTx, Buffer.from(new Uint8Array(64)).toString('base64'), { type: getPublicKeyType(osmosisChain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [osmosisChain, osmoSwapAminoTx]);

  const osmoSwapSimulate = useSimulateSWR({ chain: osmosisChain, txBytes: osmoSwapProtoTx?.tx_bytes });

  const osmoSwapSimulatedGas = useMemo(
    () => (osmoSwapSimulate.data?.gas_info?.gas_used ? times(osmoSwapSimulate.data.gas_info.gas_used, getDefaultAV(osmosisChain), 0) : undefined),
    [osmosisChain, osmoSwapSimulate.data?.gas_info?.gas_used],
  );

  const estimatedGas = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
      return osmoSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS;
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data) {
      return times(oneInchRoute.data.tx.gas, getDefaultAV(), 0);
    }

    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return squidRoute.data.route.transactionRequest.gasLimit;
    }

    return '0';
  }, [currentSwapAPI, oneInchRoute.data, osmoSwapSimulatedGas, squidRoute.data]);

  const estimatedFeeBaseAmount = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
      return ceil(times(estimatedGas, osmosisChain.gasRate.low));
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data) {
      return times(estimatedGas, oneInchRoute.data.tx.gasPrice);
    }

    if (currentSwapAPI === 'squid') {
      if (
        squidRoute.data?.route.estimate.gasCosts.every(
          (item, idx) =>
            isEqualsIgnoringCase(item.token.address, squidRoute.data?.route.estimate.feeCosts[idx].token.address) &&
            isEqualsIgnoringCase(item.token.address, EVM_NATIVE_TOKEN_ADDRESS),
        )
      ) {
        return plus(squidSourceChainFeeAmount, squidCrossChainFeeAmount);
      }
      return squidSourceChainFeeAmount;
    }

    return '0';
  }, [
    currentSwapAPI,
    oneInchRoute.data,
    estimatedGas,
    osmosisChain.gasRate.low,
    squidRoute.data?.route.estimate.gasCosts,
    squidRoute.data?.route.estimate.feeCosts,
    squidSourceChainFeeAmount,
    squidCrossChainFeeAmount,
  ]);

  const estimatedFeeDisplayAmount = useMemo(
    () => toDisplayDenomAmount(estimatedFeeBaseAmount, currentFeeToken?.decimals || 0),
    [currentFeeToken?.decimals, estimatedFeeBaseAmount],
  );

  const squidSourceChainTotalFeePrice = useMemo(
    () =>
      squidRoute.data?.route.estimate.gasCosts.reduce(
        (ac, cu) =>
          plus(
            ac,
            times(toDisplayDenomAmount(cu.amount || '0', cu.token.decimals || 0), coinGeckoPrice.data?.[cu.token.coingeckoId]?.[chromeStorage.currency] || 0),
          ),
        '0',
      ) || '0',
    [chromeStorage.currency, coinGeckoPrice.data, squidRoute.data?.route.estimate.gasCosts],
  );

  const squidCrossChainTotalFeePrice = useMemo(
    () =>
      squidRoute.data?.route.estimate.feeCosts?.reduce(
        (ac, cu) =>
          plus(
            ac,
            times(
              toDisplayDenomAmount(cu.amount || '0', cu.token.decimals || 0),
              coinGeckoPrice.data?.[
                osmosisAssets.data.find(
                  (asset) =>
                    asset.counter_party?.denom ===
                    evm_assets.mainnet.find((evmAsset) => evmAsset.contracts.find((contract) => isEqualsIgnoringCase(contract.address, cu.token.address)))?.id,
                )?.coinGeckoId || cu.token.coingeckoId
              ]?.[chromeStorage.currency] || 0,
            ),
          ),
        '0',
      ) || '0',
    [chromeStorage.currency, coinGeckoPrice.data, osmosisAssets.data, squidRoute.data?.route.estimate.feeCosts],
  );

  const estimatedFeePrice = useMemo(() => {
    if (currentSwapAPI === 'squid') {
      return plus(squidSourceChainTotalFeePrice, squidCrossChainTotalFeePrice);
    }
    return times(estimatedFeeDisplayAmount, currentFeeTokenPrice);
  }, [currentSwapAPI, estimatedFeeDisplayAmount, currentFeeTokenPrice, squidSourceChainTotalFeePrice, squidCrossChainTotalFeePrice]);

  const currentOsmoSwapFeeDisplayAmount = useMemo(
    () => (inputDisplayAmount ? times(inputDisplayAmount, osmoSwapFeeRate) : '0'),
    [inputDisplayAmount, osmoSwapFeeRate],
  );

  const osmoSwapFeePrice = useMemo(() => times(currentFeeTokenPrice, currentOsmoSwapFeeDisplayAmount), [currentFeeTokenPrice, currentOsmoSwapFeeDisplayAmount]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentFromDisplayBalance, estimatedFeeDisplayAmount);

    if (isEqualsIgnoringCase(currentFromToken?.address, currentFeeToken?.address)) {
      if (currentSwapAPI === 'osmo') {
        return gt(maxAmount, '0') ? maxAmount : '0';
      }

      if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid') {
        return gt(maxAmount, '0') && gt(estimatedFeeDisplayAmount, '0') ? maxAmount : '0';
      }
    }
    return currentFromDisplayBalance;
  }, [currentFromDisplayBalance, estimatedFeeDisplayAmount, currentSwapAPI, currentFromToken?.address, currentFeeToken?.address]);

  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  const errorMessage = useMemo(() => {
    if (
      filteredFromChainList.length < 1 ||
      filteredToChainList.length < 1 ||
      (currentSwapAPI && (filteredFromTokenList.length < 1 || filteredToTokenList.length < 1))
    ) {
      return t('pages.Wallet.Swap.entry.networkError');
    }
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentFromDisplayBalance, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }

    if (isEqualsIgnoringCase(currentFromToken?.address, currentFeeToken?.address)) {
      if (gt(estimatedFeeBaseAmount, currentFromBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
      }

      if (gt(plus(currentInputBaseAmount, estimatedFeeBaseAmount), currentFromBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientAmount');
      }
    }

    if (gt(estimatedFeeBaseAmount, currentFeeTokenBalance)) {
      return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
    }

    if (currentSwapAPI === 'osmo') {
      if (!poolData.data || !poolsAssetData.data) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (gt(currentInputBaseAmount, tokenBalanceIn || '0')) {
        return t('pages.Wallet.Swap.entry.excessiveSwap');
      }
      if (gt(priceImpactPercent, '10')) {
        return t('pages.Wallet.Swap.entry.invalidPriceImpact');
      }
      if (!osmoSwapAminoTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }

    if (currentSwapAPI === '1inch') {
      if (!oneInchRoute?.data || !allowance.data) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (!integratedSwapTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }

    if (currentSwapAPI === 'squid') {
      if (!squidRoute.data) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (gt(estimatedToTokenDisplayAmountPrice, '100000')) {
        return t('pages.Wallet.Swap.entry.invalidTxSize');
      }
      if (gt(priceImpactPercent, '3')) {
        return t('pages.Wallet.Swap.entry.invalidPriceImpact');
      }
      if (!integratedSwapTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }
    if (!gt(estimatedToTokenDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidOutputAmount');
    }
    return '';
  }, [
    filteredFromChainList.length,
    filteredToChainList.length,
    currentSwapAPI,
    filteredFromTokenList.length,
    filteredToTokenList.length,
    inputDisplayAmount,
    currentFromDisplayBalance,
    estimatedToTokenDisplayAmount,
    t,
    poolData.data,
    poolsAssetData.data,
    currentInputBaseAmount,
    tokenBalanceIn,
    currentFromToken?.address,
    currentFeeToken?.address,
    priceImpactPercent,
    osmoSwapAminoTx,
    oneInchRoute?.data,
    allowance.data,
    integratedSwapTx,
    estimatedFeeBaseAmount,
    currentFeeTokenBalance,
    currentFromBalance,
    squidRoute.data,
    estimatedToTokenDisplayAmountPrice,
  ]);

  const swapInfoMessage = useMemo(() => {
    if (currentToToken) {
      return `${t('pages.Wallet.Swap.entry.swapInfoDescription1')} (${currentSlippage}%)${t('pages.Wallet.Swap.entry.swapInfoDescription2')} ${String(
        parseFloat(fix(estimatedToTokenDisplayMinAmount, 5)),
      )} ${currentToToken.symbol} ${
        gt(estimatedToTokenDisplayAmountPrice, '0') ? `(${CURRENCY_SYMBOL[currency]}${fix(estimatedToTokenDisplayAmountPrice, 3)})` : ''
      } ${t('pages.Wallet.Swap.entry.swapInfoDescription3')}`;
    }

    return '';
  }, [currency, currentSlippage, currentToToken, estimatedToTokenDisplayAmountPrice, estimatedToTokenDisplayMinAmount, t]);

  const warningMessage = useMemo(() => {
    if (gt(estimatedFeeBaseAmount, currentFeeTokenBalance)) {
      return `${t('pages.Wallet.Swap.entry.lessThanFeeWarningDescription1')} ${fix(
        estimatedFeeDisplayAmount,
        getDisplayMaxDecimals(currentFeeToken?.decimals),
      )} ${currentFeeToken?.symbol || ''} ${t('pages.Wallet.Swap.entry.lessThanFeeWarningDescription2')}`;
    }

    if (currentFeeToken && isEqualsIgnoringCase(currentFromToken?.address, currentFeeToken.address)) {
      if (gt(plus(currentInputBaseAmount, estimatedFeeBaseAmount), currentFromBalance)) {
        return `${t('pages.Wallet.Swap.entry.balanceWarningDescription1')} ${currentFeeToken.symbol}${t(
          'pages.Wallet.Swap.entry.balanceWarningDescription2',
        )} ${fix(minus(currentFromDisplayBalance, estimatedFeeDisplayAmount), getDisplayMaxDecimals(currentFeeToken.decimals))} ${currentFeeToken.symbol} ${t(
          'pages.Wallet.Swap.entry.balanceWarningDescription3',
        )}`;
      }
    }

    if (currentSwapAPI === '1inch') {
      if (allowance.data && !gt(allowance.data.allowance, currentInputBaseAmount)) {
        return t('pages.Wallet.Swap.entry.allowanceWarning');
      }
      if (oneInchRoute.error) {
        return oneInchRoute.error.description;
      }
    }

    if (currentSwapAPI === 'squid') {
      if (gt(estimatedToTokenDisplayAmountPrice, '100000')) {
        return t('pages.Wallet.Swap.entry.txSizeWarning');
      }
      if (gt(priceImpactPercent, '3')) {
        return t('pages.Wallet.Swap.entry.liquidityWarning');
      }
      if (squidRoute.error) {
        return squidRoute.error.errors.map(({ message }) => message).join('\n');
      }

      if (!errorMessage && !isDisabled) {
        return t('pages.Wallet.Swap.entry.receiveWarningMessage');
      }
    }

    return '';
  }, [
    currentSwapAPI,
    allowance.data,
    currentInputBaseAmount,
    oneInchRoute.error,
    t,
    estimatedFeeBaseAmount,
    currentFeeTokenBalance,
    currentFeeToken,
    currentFromToken?.address,
    estimatedToTokenDisplayAmountPrice,
    priceImpactPercent,
    squidRoute.error,
    errorMessage,
    isDisabled,
    estimatedFeeDisplayAmount,
    currentFromBalance,
    currentFromDisplayBalance,
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
    if (allowance.data && !gt(allowance.data.allowance, currentInputBaseAmount) && gte(allowanceTxBaseFee, currentFeeTokenBalance)) {
      return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
    }
    return '';
  }, [allowance.data, allowanceTxBaseFee, currentFeeTokenBalance, currentInputBaseAmount, t]);

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
  }, [filteredFromChainList, currentFromChain, currentToChain, params.id]);

  useEffect(() => {
    if (filteredFromChainList.length < 2) {
      setCurrentFromChain(filteredFromChainList[0]);
    }
    if (filteredToChainList.length < 2) {
      setCurrentToChain(filteredToChainList[0]);
    }
  }, [filteredFromChainList, filteredToChainList, currentSwapAPI]);

  useEffect(() => {
    if ((currentSwapAPI === 'squid' && currentToChain?.line === 'COSMOS') || !currentSwapAPI) {
      setIsSwapInfoDisabled(true);
    } else {
      setIsSwapInfoDisabled(false);
    }
  }, [osmosisChain.chainId, currentSwapAPI, currentToChain?.chainId, currentToChain?.line]);

  useEffect(() => {
    if (!currentFromChain || !currentToChain) {
      setCurrentSwapAPI(undefined);
    }
    if (currentFromChain?.id === osmosisChain.id && currentToChain?.id === osmosisChain.id) {
      setCurrentSwapAPI('osmo');
    }
    if (currentFromChain?.id === currentToChain?.id && currentFromChain?.line === ETHEREUM.line) {
      setCurrentSwapAPI('1inch');
    }
    if (currentFromChain?.line === 'ETHEREUM' && currentToChain && currentFromChain.chainId !== currentToChain?.chainId) {
      setCurrentSwapAPI('squid');
    }
  }, [osmosisChain.id, currentFromChain, currentFromChain?.id, currentToChain, currentToChain?.id]);

  useEffect(() => {
    if (!currentSwapAPI) {
      setCurrentFromCoin(undefined);
      setCurrentToCoin(undefined);
    }

    if (!currentFromToken && currentFromChain?.id === osmosisChain.id && currentSwapAPI === 'osmo') {
      setCurrentFromCoin(filteredFromTokenList[0]);
    }
    if (!currentToToken && currentToChain?.id === osmosisChain.id && currentSwapAPI === 'osmo') {
      setCurrentToCoin(filteredToTokenList[0]);
    }
  }, [currentFromChain?.id, currentFromToken, currentSwapAPI, currentToChain?.id, currentToToken, filteredFromTokenList, filteredToTokenList, osmosisChain.id]);

  useEffect(() => {
    if (currentSwapAPI === '1inch' && currentFromToken) {
      void allowance.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSwapAPI, currentFromToken]);

  useEffect(() => {
    if (currentFromChain?.line === 'ETHEREUM') {
      void setCurrentEthereumNetwork(currentFromChain);
    }
  }, [currentFromChain, currentSwapAPI, setCurrentEthereumNetwork]);

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
              balance={currentFromDisplayBalance}
              tokenAmountPrice={inputTokenAmountPrice}
              currentSelectedChain={currentFromChain}
              currentSelectedCoin={currentFromToken}
              onClickChain={(clickedChain) => {
                setCurrentFromChain(clickedChain);
                if (isFromSelected) {
                  setCurrentToChain(undefined);
                }

                setCurrentFromCoin(undefined);
                setCurrentToCoin(undefined);
                setInputDisplayAmount('');
              }}
              onClickCoin={(clickedCoin) => {
                if (currentSwapAPI === 'osmo' && currentToToken) {
                  setCurrentToCoin(undefined);
                }

                if (
                  currentSwapAPI === '1inch' &&
                  isEqualsIgnoringCase(clickedCoin.address, currentToToken?.address) &&
                  clickedCoin.symbol === currentToToken?.symbol
                ) {
                  void swapCoin();
                } else {
                  setCurrentFromCoin(clickedCoin);
                }
              }}
              availableChainList={filteredFromChainList}
              availableTokenList={filteredFromTokenList}
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
              balance={currentToDisplayBalance}
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
              onClickCoin={(clickedCoin) => {
                if (currentSwapAPI === '1inch' && clickedCoin.address === currentFromToken?.address && clickedCoin.symbol === currentFromToken?.symbol) {
                  void swapCoin();
                } else {
                  setCurrentToCoin(clickedCoin);
                }
              }}
              availableChainList={filteredToChainList}
              availableTokenList={filteredToTokenList}
              address={currentToAddress}
              isChainSelected={!!currentFromChain && !!currentToChain}
            >
              {isLoadingSwapData ? (
                <OutputAmountCircularProgressContainer>
                  <StyledCircularProgress size={20} />
                </OutputAmountCircularProgressContainer>
              ) : (
                <SwapCoinOutputAmountContainer data-is-active={gt(estimatedToTokenDisplayAmount, '0')}>
                  <Tooltip title={estimatedToTokenDisplayAmount} arrow placement="top">
                    <span>
                      <NumberText typoOfIntegers="h3n" fixed={gt(estimatedToTokenDisplayAmount, '0') ? getDisplayMaxDecimals(currentToToken?.decimals) : 0}>
                        {estimatedToTokenDisplayAmount}
                      </NumberText>
                    </span>
                  </Tooltip>
                </SwapCoinOutputAmountContainer>
              )}
            </SwapCoinContainer>
            {!isSwapConfigDiabled && (
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
              <SwapInfoHeaderTextContainer>
                <Typography variant="h6n">
                  {t('pages.Wallet.Swap.entry.minimumReceived')} ({currentSlippage}%)
                </Typography>
                {swapInfoMessage && (
                  <SwapInfoStyledTooltip title={swapInfoMessage} placement="bottom" arrow>
                    <SwapInfoBodyLeftIconContainer>
                      <Info16Icon />
                    </SwapInfoBodyLeftIconContainer>
                  </SwapInfoStyledTooltip>
                )}
              </SwapInfoHeaderTextContainer>
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
              {(currentSwapAPI === 'osmo' || currentSwapAPI === 'squid') && (
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
                        <SwapInfoBodyRightTextContainer data-is-invalid={gt(priceImpactPercent, currentSwapAPI === 'osmo' ? 10 : 5)}>
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

              {currentSwapAPI === 'osmo' && (
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

              {(currentSwapAPI === 'osmo' || currentSwapAPI === '1inch') && (
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

              {currentSwapAPI === 'squid' && (
                <>
                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.gasFees')}</Typography>
                      <GasInfoStyledTooltip
                        title={
                          <StyledTooltipTitleContainer>
                            <Typography variant="h7">{t('pages.Wallet.Swap.entry.gasFeesInfo')}</Typography>
                            <StyledTooltipBodyContainer>
                              <ChainFeeInfo title="Source Chain Gas" feeInfo={squidRoute.data?.route.estimate.gasCosts} />
                              <ChainFeeInfo
                                title="Cross-Chain fees"
                                feeInfo={squidRoute.data?.route.estimate.feeCosts.map((item) => ({
                                  ...item,
                                  token: {
                                    ...item.token,
                                    coingeckoId:
                                      osmosisAssets.data.find(
                                        (asset) =>
                                          asset.counter_party?.denom ===
                                          evm_assets.mainnet.find((evmAsset) =>
                                            evmAsset.contracts.find((contract) => isEqualsIgnoringCase(contract.address, item.token.address)),
                                          )?.id,
                                      )?.coinGeckoId || item.token.coingeckoId,
                                  },
                                }))}
                              />
                            </StyledTooltipBodyContainer>
                          </StyledTooltipTitleContainer>
                        }
                        placement="top"
                        arrow
                      >
                        <SwapInfoBodyLeftIconContainer>
                          <Info16Icon />
                        </SwapInfoBodyLeftIconContainer>
                      </GasInfoStyledTooltip>
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
          {currentSwapAPI === '1inch' && allowance.data && !gt(allowance.data.allowance, currentInputBaseAmount) && allowanceTx ? (
            <Tooltip varient="error" title={allowanceErrorMessage} placement="top" arrow>
              <div>
                <Button
                  Icon={Permission16Icon}
                  type="button"
                  disabled={!allowanceTx || !!allowanceErrorMessage}
                  onClick={async () => {
                    if (currentSwapAPI === '1inch' && allowanceTx) {
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
                    if (currentSwapAPI === '1inch' || (currentSwapAPI === 'squid' && integratedSwapTx)) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'eth_sendTransaction',
                          params: [
                            {
                              ...integratedSwapTx,
                              gas: toHex(estimatedGas, { addPrefix: true, isStringNumber: true }),
                            },
                          ],
                        },
                      });

                      if (currentAccount.type === 'LEDGER') {
                        await openWindow();
                        window.close();
                      }
                    }
                    if (currentSwapAPI === 'osmo' && osmoSwapAminoTx && currentFeeToken?.address) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'cos_signAmino',
                          params: {
                            chainName: osmosisChain.chainName,
                            doc: {
                              ...osmoSwapAminoTx,
                              fee: { amount: [{ denom: currentFeeToken.address, amount: estimatedFeeBaseAmount }], gas: estimatedGas },
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

type EntryErrorProps = {
  errorMessage: string;
};

export function EntryError({ errorMessage }: EntryErrorProps) {
  const { t } = useTranslation();

  return (
    <>
      <Container>
        <SubSideHeader title={t('pages.Wallet.Swap.entry.title')}>
          <SideButton disabled>
            <Management24Icon />
          </SideButton>
        </SubSideHeader>
        <BodyContainer>
          <SwapContainer>
            <SwapCoinContainer headerLeftText="From" balance="0" tokenAmountPrice="0" address="" isError isChainSelected={false}>
              <SwapCoinOutputAmountContainer data-is-active={false}>
                <NumberText typoOfIntegers="h3n" fixed={0}>
                  0
                </NumberText>
              </SwapCoinOutputAmountContainer>
            </SwapCoinContainer>
            <SwapCoinContainer headerLeftText="To" balance="0" tokenAmountPrice="0" address="" isError isChainSelected={false}>
              <SwapCoinOutputAmountContainer data-is-active={false}>
                <NumberText typoOfIntegers="h3n" fixed={0}>
                  0
                </NumberText>
              </SwapCoinOutputAmountContainer>
            </SwapCoinContainer>
          </SwapContainer>
          <SwapInfoContainer>
            <SwapInfoHeaderContainer>
              <SwapInfoHeaderTextContainer>
                <Typography variant="h6n">{t('pages.Wallet.Swap.entry.minimumReceived')}</Typography>
              </SwapInfoHeaderTextContainer>
              <SwapInfoSubHeaderContainer>
                <Typography variant="h4">-</Typography>
              </SwapInfoSubHeaderContainer>
            </SwapInfoHeaderContainer>
          </SwapInfoContainer>
        </BodyContainer>
        <BottomContainer>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button type="button" disabled>
                {t('pages.Wallet.Swap.Entry.swapButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      );
    </>
  );
}
