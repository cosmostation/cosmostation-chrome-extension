import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import type { GetRoute } from '@0xsquid/sdk';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import { ETHEREUM, EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import AmountInput from '~/Popup/components/common/AmountInput';
import Button from '~/Popup/components/common/Button';
import NumberText from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import WarningContainer from '~/Popup/components/common/WarningContainer';
import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useOsmoSwapMath } from '~/Popup/hooks/osmoSwap/useOsmoSwapMath';
import { useAllowanceSWR } from '~/Popup/hooks/SWR/1inch/useAllowanceSWR';
import { useAllowanceTxSWR } from '~/Popup/hooks/SWR/1inch/useAllowanceTxSWR';
import type { UseOneInchSwapSWRProps } from '~/Popup/hooks/SWR/1inch/useOneInchSwapTxSWR';
import { useOneInchSwapTxSWR } from '~/Popup/hooks/SWR/1inch/useOneInchSwapTxSWR';
import { useOneInchTokensSWR } from '~/Popup/hooks/SWR/1inch/useOneInchTokensSWR';
import { useSupportTokensSWR } from '~/Popup/hooks/SWR/1inch/useSupportTokensSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/1inch/useTokenBalanceSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useSupportChainsSWR } from '~/Popup/hooks/SWR/cosmos/useSupportChainsSWR';
import { useBalanceSWR as useNativeBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useEstimateGasSWR } from '~/Popup/hooks/SWR/ethereum/useEstimateGasSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useSupportSwapChainsSWR } from '~/Popup/hooks/SWR/integratedSwap/useSupportSwapChainsSWR';
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
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { AssetV3 as CosmosAssetV3 } from '~/types/cosmos/asset';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';
import type { IntegratedSwapAPI } from '~/types/swap/integratedSwap';

import ChainFeeInfo from './components/ChainFeeInfo';
import SlippageSettingDialog from './components/SlippageSettingDialog';
import SwapCoinContainer from './components/SwapCoinContainer';
import {
  BodyContainer,
  BottomContainer,
  ButtonTextIconContaier,
  Container,
  FeePriceButton,
  FeePriceButtonTextContainer,
  GasInfoStyledTooltip,
  MaxButton,
  MinimumReceivedCircularProgressContainer,
  OutputAmountCircularProgressContainer,
  SideButton,
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
import OneInchLogoIcon from '~/images/icons/OneInchLogo.svg';
import OsmosisLogoIcon from '~/images/icons/OsmosisLogo.svg';
import Permission16Icon from '~/images/icons/Permission16.svg';
import SquidLogoIcon from '~/images/icons/SquidLogo.svg';
import SwapIcon from '~/images/icons/Swap.svg';

import evm_assets from './assets/evm_assets.json';

export default function Entry() {
  const osmosisChain = OSMOSIS;
  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(osmosisChain, true);
  const accounts = useAccounts(true);
  const params = useParams();

  const { enQueue } = useCurrentQueue();
  const nodeInfo = useNodeInfoSWR(osmosisChain);
  const supportedCosmosChain = useSupportChainsSWR();
  const { chromeStorage } = useChromeStorage();
  const { ethereumTokens } = chromeStorage;
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const osmosisAssets = useCosmosAssetsSWR(osmosisChain);
  const supportedSwapChains = useSupportSwapChainsSWR();

  const { currentEthereumNetwork, setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

  const { squidChains, filterSquidTokens } = useSquidAssetsSWR();

  const SupportedOneInchTokens = useSupportTokensSWR();

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);

  const [isFeePriceCurrencyBase, setIsFeePriceCurrencyBase] = useState(true);
  const [isOsmoSwapFeePriceCurrencyBase, setIsOsmoSwapFeePriceCurrencyBase] = useState(true);

  const [currentSlippage, setCurrentSlippage] = useState('1');

  const [currentSwapAPI, setCurrentSwapAPI] = useState<IntegratedSwapAPI>();

  const [isFromSelected, setIsFromSelected] = useState<boolean>();

  const [isDisabledSwapAssetInfo, setIsDisabledSwapAssetInfo] = useState<boolean>(false);

  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const filteredFromChains: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMChains = ETHEREUM_NETWORKS.filter(
      (item) =>
        supportedSwapChains.data?.squid.evm.send.find((sendChain) => sendChain.chainId === String(parseInt(item.chainId, 16))) &&
        squidChains?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === squidChain.chainId),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const oneInchEVMChains = ETHEREUM_NETWORKS.filter((item) =>
      supportedSwapChains.data?.oneInch.evm.send.find((sendChain) => sendChain.chainId === String(parseInt(item.chainId, 16))),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const squidCosmosChains = COSMOS_CHAINS.filter(
      (item) =>
        supportedSwapChains.data?.squid.cosmos.send.find((send) => send.chainId === item.chainId) &&
        squidChains?.find(
          (squidChain) =>
            squidChain.chainType === 'cosmos' &&
            item.chainId === squidChain.chainId &&
            supportedCosmosChain.data?.chains.find((cosmosChain) => cosmosChain.chain_id === squidChain.chainId),
        ),
    ).map((item) => ({
      ...item,
      addressId: item.id,
      networkName: item.chainName,
    }));

    const osmoSwapChain = COSMOS_CHAINS.filter(
      (item) => osmosisChain.id === item.id && supportedCosmosChain.data?.chains.find((cosmosChain) => cosmosChain.chain_id === item.chainId),
    ).map((item) => ({
      ...item,
      addressId: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMChains = [...squidEVMChains, ...oneInchEVMChains].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    const integratedCosmosChains = [...squidCosmosChains, ...osmoSwapChain].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    if (isFromSelected) {
      return [...integratedEVMChains, ...integratedCosmosChains];
    }

    if (currentToChain) {
      if (osmoSwapChain.find((item) => item.id === currentToChain.id)) {
        return [...squidEVMChains, ...osmoSwapChain];
      }

      if (!squidEVMChains.find((item) => item.id === currentToChain.id) && oneInchEVMChains.find((item) => item.id === currentToChain.id)) {
        return [currentToChain];
      }

      if (squidEVMChains.find((item) => item.id === currentToChain.id) && !oneInchEVMChains.find((item) => item.id === currentToChain.id)) {
        return [...squidEVMChains.filter((item) => item.id !== currentToChain.id)];
      }

      if (squidChains?.find((item) => item.chainId === currentToChain.chainId)) {
        return [...squidEVMChains];
      }
    }

    return [...integratedEVMChains, ...integratedCosmosChains];
  }, [
    currentToChain,
    isFromSelected,
    osmosisChain.id,
    squidChains,
    supportedCosmosChain.data?.chains,
    supportedSwapChains.data?.oneInch.evm.send,
    supportedSwapChains.data?.squid.cosmos.send,
    supportedSwapChains.data?.squid.evm.send,
  ]);

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain | undefined>(filteredFromChains.find((item) => item.id === params.id));

  const filteredToChainList: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMChains = ETHEREUM_NETWORKS.filter(
      (item) =>
        supportedSwapChains.data?.squid.evm.receive.find((receiveChain) => receiveChain.chainId === String(parseInt(item.chainId, 16))) &&
        squidChains?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === squidChain.chainId),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const oneInchEVMChains = ETHEREUM_NETWORKS.filter((item) =>
      supportedSwapChains.data?.oneInch.evm.receive.find((receiveChain) => receiveChain.chainId === String(parseInt(item.chainId, 16))),
    ).map((item) => ({
      ...item,
      addressId: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const osmoSwapChain = COSMOS_CHAINS.filter(
      (item) => osmosisChain.id === item.id && supportedCosmosChain.data?.chains.find((cosmosChain) => cosmosChain.chain_id === item.chainId),
    ).map((item) => ({
      ...item,
      addressId: item.id,
      networkName: item.chainName,
    }));

    const squidCosmosChains = COSMOS_CHAINS.filter(
      (item) =>
        supportedSwapChains.data?.squid.cosmos.receive.find((receiveChain) => receiveChain.chainId === item.chainId) &&
        squidChains?.find(
          (squidChain) =>
            squidChain.chainType === 'cosmos' &&
            item.chainId === squidChain.chainId &&
            supportedCosmosChain.data?.chains.find((cosmosChain) => cosmosChain.chain_id === squidChain.chainId),
        ),
    ).map((item) => ({
      ...item,
      addressId: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMChains = [...squidEVMChains, ...oneInchEVMChains].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    const integratedCosmosChains = [...squidCosmosChains, ...osmoSwapChain].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    if (!isFromSelected) {
      return [...integratedEVMChains, ...integratedCosmosChains];
    }

    if (currentFromChain) {
      if (
        (!squidEVMChains.find((item) => item.id === currentFromChain.id) && oneInchEVMChains.find((item) => item.id === currentFromChain.id)) ||
        currentFromChain.id === osmosisChain.id
      ) {
        return [currentFromChain];
      }

      if (squidEVMChains.find((item) => item.id === currentFromChain.id) && !oneInchEVMChains.find((item) => item.id === currentFromChain.id)) {
        return [...squidEVMChains.filter((item) => item.id !== currentFromChain.id), ...integratedCosmosChains];
      }
    }
    return [...squidEVMChains, ...integratedCosmosChains];
  }, [
    currentFromChain,
    isFromSelected,
    osmosisChain.id,
    squidChains,
    supportedCosmosChain.data?.chains,
    supportedSwapChains.data?.oneInch.evm.receive,
    supportedSwapChains.data?.squid.cosmos.receive,
    supportedSwapChains.data?.squid.evm.receive,
  ]);

  const [currentFromToken, setCurrentFromToken] = useState<IntegratedSwapToken>();
  const [currentToToken, setCurrentToToken] = useState<IntegratedSwapToken>();

  const [inputDisplayAmount, setInputDisplayAmount] = useState<string>('');
  const [debouncedInputDisplayAmount] = useDebounce(inputDisplayAmount, 400);

  const currentInputBaseAmount = useMemo(
    () => toBaseDenomAmount(debouncedInputDisplayAmount || '0', currentFromToken?.decimals || 0),
    [currentFromToken?.decimals, debouncedInputDisplayAmount],
  );

  const osmoSwapMath = useOsmoSwapMath(
    currentSwapAPI === 'osmo'
      ? {
          chainName: osmosisChain.chainName.toLowerCase(),
          inputCoin: currentFromToken as CosmosAssetV3,
          outputCoin: currentToToken as CosmosAssetV3,
          inputBaseAmount: currentInputBaseAmount,
        }
      : undefined,
  );

  const currentFromAddress = useMemo(
    () => (currentFromChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentFromChain.addressId]) || '',
    [accounts?.data, currentAccount.id, currentFromChain],
  );
  const currentToAddress = useMemo(
    () => (currentToChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentToChain.addressId]) || '',
    [accounts?.data, currentAccount.id, currentToChain],
  );

  const cosmosFromChainBalance = useBalanceSWR(currentFromChain as CosmosChain);
  const cosmosToChainBalance = useBalanceSWR(currentToChain as CosmosChain);

  const currentFromEVMNativeBalance = useNativeBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined);
  const currentFromEVMTokenBalance = useTokenBalanceSWR(currentFromChain?.line === 'ETHEREUM' ? currentFromChain : undefined, currentFromToken);

  const currentToEVMNativeBalance = useNativeBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined);
  const currentToEVMTokenBalance = useTokenBalanceSWR(currentToChain?.line === 'ETHEREUM' ? currentToChain : undefined, currentToToken);

  const currentFromTokenBalance = useMemo(
    () =>
      gt(currentFromToken?.balance || '0', '0')
        ? currentFromToken?.balance || '0'
        : isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentFromToken?.address)
        ? BigInt(currentFromEVMNativeBalance.data?.result || '0').toString(10)
        : BigInt(currentFromEVMTokenBalance.data || '0').toString(10),
    [currentFromToken?.address, currentFromToken?.balance, currentFromEVMNativeBalance?.data?.result, currentFromEVMTokenBalance.data],
  );
  const currentFromTokenDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentFromTokenBalance, currentFromToken?.decimals || 0),
    [currentFromToken?.decimals, currentFromTokenBalance],
  );

  const currentToTokenBalance = useMemo(
    () =>
      gt(currentToToken?.balance || '0', '0')
        ? currentToToken?.balance || '0'
        : isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentToToken?.address)
        ? BigInt(currentToEVMNativeBalance.data?.result || '0').toString(10)
        : BigInt(currentToEVMTokenBalance.data || '0').toString(10),
    [currentToToken?.address, currentToToken?.balance, currentToEVMNativeBalance?.data?.result, currentToEVMTokenBalance.data],
  );
  const currentToTokenDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentToTokenBalance, currentToToken?.decimals || 0),
    [currentToToken?.decimals, currentToTokenBalance],
  );

  const oneInchTokens = useOneInchTokensSWR(currentSwapAPI === '1inch' ? String(parseInt(currentEthereumNetwork.chainId, 16)) : undefined);

  const supportedOneInchTokens = useMemo(
    () =>
      currentSwapAPI === '1inch' && SupportedOneInchTokens.data?.[String(parseInt(currentEthereumNetwork.chainId, 16))]
        ? Object.values(SupportedOneInchTokens.data[String(parseInt(currentEthereumNetwork.chainId, 16))])
        : [],
    [SupportedOneInchTokens.data, currentEthereumNetwork.chainId, currentSwapAPI],
  );

  const filteredFromTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentFromEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentFromChain?.id);

    if (currentSwapAPI === 'osmo') {
      const filteredTokens = osmosisAssets.data
        .filter((item) => osmoSwapMath.uniquePoolDenomList.includes(item.denom))
        .map((item) => ({
          ...item,
          address: item.denom,
          balance: cosmosFromChainBalance.data?.balance ? cosmosFromChainBalance.data?.balance.find((coin) => coin.denom === item.denom)?.amount : '0',
          logoURI: item.image,
          name: getCapitalize(item.prevChain || item.origin_chain),
        }));

      return [
        ...filteredTokens.filter((item) => gt(item?.balance || '0', '0') && (item.type === 'staking' || item.type === 'native' || item.type === 'bridge')),
        ...filteredTokens.filter((item) => gt(item?.balance || '0', '0') && item.type === 'ibc').sort((a, b) => a.symbol.localeCompare(b.symbol)),
        ...filteredTokens.filter((item) => !gt(item?.balance || '0', '0')).sort((a, b) => a.symbol.localeCompare(b.symbol)),
      ];
    }

    if (currentSwapAPI === '1inch' && oneInchTokens.data) {
      const filteredTokens = Object.values(oneInchTokens.data.tokens);

      return [
        ...filteredTokens.filter((item) => item.tags.includes('native')).map((item) => ({ ...item, coinGeckoId: currentEthereumNetwork.coinGeckoId })),
        ...filteredTokens.filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokens.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            supportedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredTokens.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !supportedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ];
    }

    if (currentSwapAPI === 'squid') {
      const filteredTokens = filterSquidTokens(currentFromChain?.chainId);

      return [
        ...filteredTokens.filter((item) => isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address)),
        ...filteredTokens.filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokens.filter(
          (item) =>
            !isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address) &&
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ].map((item) => ({ ...item, coinGeckoId: item.coingeckoId }));
    }

    return [];
  }, [
    ethereumTokens,
    currentSwapAPI,
    oneInchTokens.data,
    currentFromChain?.id,
    currentFromChain?.chainId,
    osmosisAssets.data,
    osmoSwapMath.uniquePoolDenomList,
    cosmosFromChainBalance.data?.balance,
    currentEthereumNetwork.coinGeckoId,
    supportedOneInchTokens,
    filterSquidTokens,
  ]);

  const filteredToTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentToEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentToChain?.id);

    if (currentSwapAPI === 'osmo') {
      return filteredFromTokenList.filter((token) =>
        osmoSwapMath.poolsAssetData.data?.find(
          (item) =>
            (isEqualsIgnoringCase(item.adenom, token.address) && isEqualsIgnoringCase(item.bdenom, currentFromToken?.address)) ||
            (isEqualsIgnoringCase(item.adenom, currentFromToken?.address) && isEqualsIgnoringCase(item.bdenom, token.address)),
        ),
      );
    }

    if (currentSwapAPI === '1inch' && oneInchTokens.data) {
      const filteredTokenList = Object.values(oneInchTokens.data.tokens);

      return [
        ...filteredTokenList.filter((item) => item.tags.includes('native')).map((item) => ({ ...item, coinGeckoId: currentEthereumNetwork.coinGeckoId })),
        ...filteredTokenList.filter((item) => currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            supportedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
        ...filteredTokenList.filter(
          (item) =>
            !item.tags.includes('native') &&
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)) &&
            !supportedOneInchTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ];
    }

    if (currentSwapAPI === 'squid' && currentToChain?.line === 'ETHEREUM') {
      const filteredTokenList = filterSquidTokens(currentToChain?.chainId);

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
      const filteredTokenList = filterSquidTokens(currentToChain?.chainId);

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
        balance: cosmosToChainBalance.data?.balance
          ? cosmosToChainBalance.data?.balance.find((coin) =>
              isEqualsIgnoringCase(coin.denom, osmosisAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.denom),
            )?.amount
          : '0',
      }));
    }

    return [];
  }, [
    ethereumTokens,
    currentSwapAPI,
    oneInchTokens.data,
    currentToChain?.line,
    currentToChain?.id,
    currentToChain?.chainId,
    filteredFromTokenList,
    osmoSwapMath.poolsAssetData.data,
    currentFromToken?.address,
    currentEthereumNetwork.coinGeckoId,
    supportedOneInchTokens,
    filterSquidTokens,
    osmosisAssets.data,
    cosmosToChainBalance.data?.balance,
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
        if (currentFromChain?.line === 'COSMOS') {
          return isEqualsIgnoringCase(item.address, osmosisChain.baseDenom);
        }

        if (currentFromChain?.line === 'ETHEREUM') {
          return isEqualsIgnoringCase(item.address, EVM_NATIVE_TOKEN_ADDRESS);
        }

        return undefined;
      }),
    [currentFromChain?.line, filteredFromTokenList, osmosisChain.baseDenom],
  );

  const currentFeeTokenBalance = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
      return cosmosFromChainBalance.data?.balance?.find((item) => isEqualsIgnoringCase(item.denom, osmosisChain.baseDenom))?.amount || '0';
    }

    if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid') {
      return BigInt(currentFromEVMNativeBalance?.data?.result || '0').toString(10);
    }

    return '0';
  }, [currentSwapAPI, cosmosFromChainBalance.data?.balance, osmosisChain.baseDenom, currentFromEVMNativeBalance?.data?.result]);

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
      gt(currentInputBaseAmount, '0')
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

  const squidSourceChainGasCosts = useMemo(
    () =>
      squidRoute.data?.route.estimate.gasCosts
        .map((item, _, array) => ({
          ...item,
          amount: array.reduce((ac, cu) => (item.token.address === cu.token.address ? plus(ac, cu.amount) : ac), '0'),
        }))
        .filter((chainItem, idx, arr) => arr.findIndex((item) => item.token.address === chainItem.token.address) === idx),
    [squidRoute.data?.route.estimate.gasCosts],
  );

  const squidCrossChainFeeCosts = useMemo(
    () =>
      squidRoute.data?.route.estimate.feeCosts
        .map((item, _, array) => ({
          ...item,
          amount: array.reduce((ac, cu) => (item.token.address === cu.token.address ? plus(ac, cu.amount) : ac), '0'),
          token: {
            ...item.token,
            coingeckoId:
              osmosisAssets.data.find(
                (asset) =>
                  asset.counter_party?.denom &&
                  asset.counter_party.denom ===
                    evm_assets.mainnet.find((evmAsset) =>
                      evmAsset.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, item.token.address)),
                    )?.id,
              )?.coinGeckoId || item.token.coingeckoId,
          },
        }))
        .filter((chainItem, idx, arr) => arr.findIndex((item) => item.token.address === chainItem.token.address) === idx),
    [osmosisAssets.data, squidRoute.data?.route.estimate.feeCosts],
  );

  const squidSourceChainFeeAmount = useMemo(() => squidSourceChainGasCosts?.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0', [squidSourceChainGasCosts]);

  const squidCrossChainFeeAmount = useMemo(() => squidCrossChainFeeCosts?.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0', [squidCrossChainFeeCosts]);

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
      gt(currentInputBaseAmount, '0') &&
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
    if (currentSwapAPI === 'osmo') {
      return osmoSwapMath.estimatedOutputBaseAmount;
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data) {
      return oneInchRoute.data.toTokenAmount;
    }

    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return squidRoute.data.route.estimate.toAmount;
    }

    return '0';
  }, [currentSwapAPI, oneInchRoute.data, squidRoute.data, osmoSwapMath.estimatedOutputBaseAmount]);

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

  const outputAmountOf1Token = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
      return osmoSwapMath.exchangeRate;
    }
    if (currentSwapAPI === 'squid' && squidRoute.data?.route.estimate.exchangeRate) {
      return squidRoute.data.route.estimate.exchangeRate;
    }
    return '0';
  }, [currentSwapAPI, osmoSwapMath.exchangeRate, squidRoute.data?.route.estimate.exchangeRate]);

  const priceImpactPercent = useMemo(() => {
    if (currentSwapAPI === 'osmo') {
      return osmoSwapMath.priceImpact;
    }

    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return squidRoute.data.route.estimate.aggregatePriceImpact;
    }

    return '0';
  }, [currentSwapAPI, osmoSwapMath.priceImpact, squidRoute.data]);

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
                  pool_id: osmoSwapMath.currentPoolId,
                  token_out_denom: currentToToken?.address,
                },
              ],
              sender: currentFromAddress,
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
    osmoSwapMath.currentPoolId,
    currentToToken?.address,
    currentFromAddress,
    currentInputBaseAmount,
    currentFromToken?.address,
    estimatedToTokenBaseMinAmount,
  ]);

  const [osmoSwapAminoTx] = useDebounce(memoizedOsmoSwapAminoTx, 700);

  const osmoSwapProtoTx = useMemo(() => {
    if (osmoSwapAminoTx) {
      const pTx = protoTx(osmoSwapAminoTx, Buffer.from(new Uint8Array(64)).toString('base64'), { type: getPublicKeyType(osmosisChain), value: '' });

      return pTx && protoTxBytes({ ...pTx });
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
                    asset.counter_party?.denom &&
                    asset.counter_party.denom ===
                      evm_assets.mainnet.find((evmAsset) =>
                        evmAsset.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, cu.token.address)),
                      )?.id,
                )?.coinGeckoId || cu.token.coingeckoId
              ]?.[chromeStorage.currency] || 0,
            ),
          ),
        '0',
      ) || '0',
    [chromeStorage.currency, coinGeckoPrice.data, osmosisAssets.data, squidRoute.data?.route.estimate.feeCosts],
  );

  const estimatedFeePrice = useMemo(() => {
    if (currentSwapAPI === 'osmo' || currentSwapAPI === '1inch') {
      return times(estimatedFeeDisplayAmount, currentFeeTokenPrice);
    }

    if (currentSwapAPI === 'squid') {
      return plus(squidSourceChainTotalFeePrice, squidCrossChainTotalFeePrice);
    }

    return '0';
  }, [currentSwapAPI, estimatedFeeDisplayAmount, currentFeeTokenPrice, squidSourceChainTotalFeePrice, squidCrossChainTotalFeePrice]);

  const currentOsmoSwapFeeDisplayAmount = useMemo(
    () => times(inputDisplayAmount || '0', osmoSwapMath.swapServiceFeeRate),
    [inputDisplayAmount, osmoSwapMath.swapServiceFeeRate],
  );

  const osmoSwapFeePrice = useMemo(() => times(currentFeeTokenPrice, currentOsmoSwapFeeDisplayAmount), [currentFeeTokenPrice, currentOsmoSwapFeeDisplayAmount]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentFromTokenDisplayBalance, estimatedFeeDisplayAmount);

    if (isEqualsIgnoringCase(currentFromToken?.address, currentFeeToken?.address)) {
      if (currentSwapAPI === 'osmo') {
        return gt(maxAmount, '0') ? maxAmount : '0';
      }

      if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid') {
        return gt(maxAmount, '0') && gt(estimatedFeeDisplayAmount, '0') ? maxAmount : '0';
      }
    }
    return currentFromTokenDisplayBalance;
  }, [currentFromTokenDisplayBalance, estimatedFeeDisplayAmount, currentSwapAPI, currentFromToken?.address, currentFeeToken?.address]);

  const swapAssetInfo = useCallback(() => {
    const tmpFromToken = currentFromToken;
    const tmpFromChain = currentFromChain;

    if (currentSwapAPI === 'squid' && currentToChain?.line === 'ETHEREUM') {
      setCurrentFromChain(currentToChain);
      setCurrentToChain(tmpFromChain);
    }

    setCurrentFromToken(currentToToken);
    setCurrentToToken(tmpFromToken);

    setInputDisplayAmount('');
  }, [currentFromChain, currentFromToken, currentSwapAPI, currentToChain, currentToToken]);

  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  const errorMessage = useMemo(() => {
    if (!filteredFromChains.length || !filteredToChainList.length || (currentSwapAPI && (!filteredFromTokenList.length || !filteredToTokenList.length))) {
      return t('pages.Wallet.Swap.entry.networkError');
    }
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentFromTokenDisplayBalance, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }

    if (isEqualsIgnoringCase(currentFromToken?.address, currentFeeToken?.address)) {
      if (gt(estimatedFeeBaseAmount, currentFromTokenBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
      }

      if (gt(plus(currentInputBaseAmount, estimatedFeeBaseAmount), currentFromTokenBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
      }
    }

    if (gt(estimatedFeeBaseAmount, currentFeeTokenBalance)) {
      return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
    }

    if (currentSwapAPI === 'osmo') {
      if (!osmoSwapMath.poolData.data || !osmoSwapMath.poolsAssetData.data) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (gt(currentInputBaseAmount, osmoSwapMath.tokenBalanceIn || '0')) {
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
      if (!integratedSwapTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }

    if (currentSwapAPI === 'squid') {
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
    filteredFromChains.length,
    filteredToChainList.length,
    currentSwapAPI,
    filteredFromTokenList.length,
    filteredToTokenList.length,
    inputDisplayAmount,
    currentFromTokenDisplayBalance,
    currentFromToken?.address,
    currentFeeToken?.address,
    estimatedFeeBaseAmount,
    currentFeeTokenBalance,
    estimatedToTokenDisplayAmount,
    t,
    currentFromTokenBalance,
    currentInputBaseAmount,
    osmoSwapMath.poolData.data,
    osmoSwapMath.poolsAssetData.data,
    osmoSwapMath.tokenBalanceIn,
    priceImpactPercent,
    osmoSwapAminoTx,
    integratedSwapTx,
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
    if (currentSwapAPI === '1inch') {
      if (allowance.data && !gt(allowance.data.allowance, currentInputBaseAmount)) {
        return t('pages.Wallet.Swap.entry.allowanceWarning');
      }
      if (oneInchRoute.error) {
        return oneInchRoute.error.response?.data.description;
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
        return squidRoute.error.errors?.map(({ message }) => message).join('\n');
      }

      if (!errorMessage && !isDisabled) {
        return t('pages.Wallet.Swap.entry.receiveWarningMessage');
      }
    }

    if (gt(estimatedFeeBaseAmount, currentFeeTokenBalance)) {
      return `${t('pages.Wallet.Swap.entry.lessThanFeeWarningDescription1')} ${fix(
        estimatedFeeDisplayAmount,
        getDisplayMaxDecimals(currentFeeToken?.decimals),
      )} ${currentFeeToken?.symbol || ''} ${t('pages.Wallet.Swap.entry.lessThanFeeWarningDescription2')}`;
    }

    if (currentFeeToken && isEqualsIgnoringCase(currentFromToken?.address, currentFeeToken.address)) {
      if (gt(plus(currentInputBaseAmount, estimatedFeeBaseAmount), currentFromTokenBalance)) {
        return `${t('pages.Wallet.Swap.entry.balanceWarningDescription1')} ${currentFeeToken.symbol}${t(
          'pages.Wallet.Swap.entry.balanceWarningDescription2',
        )} ${fix(minus(currentFromTokenDisplayBalance, estimatedFeeDisplayAmount), getDisplayMaxDecimals(currentFeeToken.decimals))} ${
          currentFeeToken.symbol
        } ${t('pages.Wallet.Swap.entry.balanceWarningDescription3')}`;
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
    currentFromTokenBalance,
    currentFromTokenDisplayBalance,
  ]);

  const inputHelperMessage = useMemo(() => {
    if (inputDisplayAmount) {
      if (gt(inputDisplayAmount, currentFromTokenDisplayBalance)) {
        return t('pages.Wallet.Swap.entry.insufficientAmount');
      }
    }
    return '';
  }, [currentFromTokenDisplayBalance, inputDisplayAmount, t]);

  const allowanceErrorMessage = useMemo(() => {
    if (gte(currentInputBaseAmount, allowance.data?.allowance || '0') && gte(allowanceTxBaseFee, currentFeeTokenBalance)) {
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
  }, [filteredFromChains, currentFromChain, currentToChain, params.id]);

  useEffect(() => {
    if (filteredFromChains.length < 2) {
      setCurrentFromChain(filteredFromChains[0]);
    }
    if (filteredToChainList.length < 2) {
      setCurrentToChain(filteredToChainList[0]);
    }
  }, [filteredFromChains, filteredToChainList, currentSwapAPI]);

  useEffect(() => {
    if ((currentSwapAPI === 'squid' && currentToChain?.line === 'COSMOS') || !currentSwapAPI) {
      setIsDisabledSwapAssetInfo(true);
    } else {
      setIsDisabledSwapAssetInfo(false);
    }
  }, [osmosisChain.chainId, currentSwapAPI, currentToChain?.chainId, currentToChain?.line]);

  useEffect(() => {
    if (!currentFromChain || !currentToChain) {
      setCurrentSwapAPI(undefined);
    }
    if (currentFromChain?.id === osmosisChain.id && currentToChain?.id === osmosisChain.id) {
      setCurrentSwapAPI('osmo');
    }
    if (
      currentFromChain?.id === currentToChain?.id &&
      supportedSwapChains.data?.oneInch.evm.send.find((sendChain) => sendChain.chainId === currentFromChain?.chainId) &&
      supportedSwapChains.data?.oneInch.evm.receive.find((receiveChain) => receiveChain.chainId === currentToChain?.chainId)
    ) {
      setCurrentSwapAPI('1inch');
    }

    if (
      currentFromChain?.id !== currentToChain?.id &&
      (supportedSwapChains.data?.squid.evm.send.find((sendChain) => sendChain.chainId === currentFromChain?.chainId) ||
        supportedSwapChains.data?.squid.cosmos.send.find((sendChain) => sendChain.chainId === currentFromChain?.chainId)) &&
      (supportedSwapChains.data?.squid.evm.receive.find((receiveChain) => receiveChain.chainId === currentToChain?.chainId) ||
        supportedSwapChains.data?.squid.cosmos.receive.find((receiveChain) => receiveChain.chainId === currentToChain?.chainId))
    ) {
      setCurrentSwapAPI('squid');
    }
  }, [
    osmosisChain.id,
    currentFromChain,
    currentFromChain?.id,
    currentToChain,
    currentToChain?.id,
    supportedSwapChains.data?.oneInch.evm.send,
    supportedSwapChains.data?.oneInch.evm.receive,
    supportedSwapChains.data?.squid.evm.send,
    supportedSwapChains.data?.squid.evm.receive,
    supportedSwapChains.data?.squid.cosmos.receive,
    supportedSwapChains.data?.squid.cosmos.send,
  ]);

  useEffect(() => {
    if (!currentSwapAPI || !filteredFromTokenList.find((token) => token.address === currentFromToken?.address)) {
      setCurrentFromToken(undefined);
    }
    if (!currentSwapAPI || !filteredToTokenList.find((token) => token.address === currentToToken?.address)) {
      setCurrentToToken(undefined);
    }

    if (!currentFromToken && currentFromChain?.id === osmosisChain.id && currentSwapAPI === 'osmo') {
      setCurrentFromToken(filteredFromTokenList[0]);
    }
    if (!currentToToken && currentToChain?.id === osmosisChain.id && currentSwapAPI === 'osmo') {
      setCurrentToToken(filteredToTokenList[0]);
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
              balance={currentFromTokenDisplayBalance}
              tokenAmountPrice={inputTokenAmountPrice}
              currentSelectedChain={currentFromChain}
              currentSelectedCoin={currentFromToken}
              onClickChain={(clickedChain) => {
                setCurrentFromChain(clickedChain);
                if (isFromSelected) {
                  setCurrentToChain(undefined);
                }

                setCurrentFromToken(undefined);
                setCurrentToToken(undefined);
                setInputDisplayAmount('');
              }}
              onClickCoin={(clickedCoin) => {
                if (currentSwapAPI === '1inch' && isEqualsIgnoringCase(clickedCoin.address, currentToToken?.address)) {
                  void swapAssetInfo();
                } else {
                  setCurrentFromToken(clickedCoin);
                }
              }}
              availableChainList={filteredFromChains}
              availableTokenList={filteredFromTokenList}
              address={currentFromAddress}
              isTokenAvailable={!!currentFromChain && !!currentToChain}
            >
              <SwapCoinInputAmountContainer data-is-error>
                <AmountInput
                  error
                  helperText={inputHelperMessage}
                  endAdornment={
                    gt(maxDisplayAmount, '0') && (
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
              balance={currentToTokenDisplayBalance}
              tokenAmountPrice={estimatedToTokenDisplayAmountPrice}
              currentSelectedChain={currentToChain}
              currentSelectedCoin={currentToToken}
              onClickChain={(clickedChain) => {
                setCurrentToChain(clickedChain);
                if (!isFromSelected) {
                  setCurrentFromChain(undefined);
                }

                setCurrentFromToken(undefined);
                setCurrentToToken(undefined);
                setInputDisplayAmount('');
              }}
              onClickCoin={(clickedCoin) => {
                if (currentSwapAPI === '1inch' && isEqualsIgnoringCase(clickedCoin.address, currentFromToken?.address)) {
                  void swapAssetInfo();
                } else {
                  setCurrentToToken(clickedCoin);
                }
              }}
              availableChainList={filteredToChainList}
              availableTokenList={filteredToTokenList}
              address={currentToAddress}
              isTokenAvailable={!!currentFromChain && !!currentToChain}
            >
              {isLoadingSwapData ? (
                <OutputAmountCircularProgressContainer>
                  <Skeleton width="7.4rem" height="1.5rem" />
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
            {!isDisabledSwapAssetInfo && (
              <SwapIconButton onClick={swapAssetInfo}>
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
                    <Skeleton width="10.3rem" height="1.5rem" />
                  </MinimumReceivedCircularProgressContainer>
                ) : gt(estimatedToTokenDisplayMinAmount, '0') ? (
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
                        <Skeleton width="10rem" height="1.5rem" />
                      ) : gt(outputAmountOf1Token, '0') ? (
                        <SwapInfoBodyRightTextContainer>
                          <Typography variant="h6n">{`1 ${currentFromToken?.symbol || ''} ≈`} </Typography>
                          &nbsp;
                          <Tooltip title={outputAmountOf1Token} arrow placement="top">
                            <span>
                              <NumberText
                                typoOfIntegers="h6n"
                                typoOfDecimals="h7n"
                                fixed={gt(outputAmountOf1Token, '0') ? getDisplayMaxDecimals(currentToToken?.decimals) : 0}
                              >
                                {outputAmountOf1Token}
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
                        <Skeleton width="4rem" height="1.5rem" />
                      ) : priceImpactPercent !== '0' ? (
                        <SwapInfoBodyRightTextContainer data-is-invalid={gt(priceImpactPercent, currentSwapAPI === 'osmo' ? '10' : '5')}>
                          <Typography variant="h6n">{` ${gt(priceImpactPercent, '0') ? `-` : ``} ${
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
                      {t('pages.Wallet.Swap.entry.swapFee')} ({times(osmoSwapMath.swapServiceFeeRate, '100')}%)
                    </Typography>
                  </SwapInfoBodyLeftContainer>
                  <SwapInfoBodyRightContainer>
                    {gt(osmoSwapFeePrice, '0') ? (
                      <FeePriceButton type="button" onClick={() => setIsOsmoSwapFeePriceCurrencyBase(!isOsmoSwapFeePriceCurrencyBase)}>
                        <FeePriceButtonTextContainer>
                          {isOsmoSwapFeePriceCurrencyBase ? (
                            <>
                              <Typography variant="h6n">{` ≈ ${lt(osmoSwapFeePrice, '0.01') ? `<` : ``} ${CURRENCY_SYMBOL[currency]}`}</Typography>
                              &nbsp;
                              <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                                {osmoSwapFeePrice}
                              </NumberText>
                            </>
                          ) : (
                            <>
                              <Tooltip title={currentOsmoSwapFeeDisplayAmount} arrow placement="top">
                                <span>
                                  <Typography variant="h6n">≈</Typography>
                                  &nbsp;
                                  <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={currentFeeToken?.decimals}>
                                    {currentOsmoSwapFeeDisplayAmount}
                                  </NumberText>
                                </span>
                              </Tooltip>
                              &nbsp;
                              <Typography variant="h6n"> {currentFeeToken?.symbol}</Typography>
                            </>
                          )}
                        </FeePriceButtonTextContainer>
                      </FeePriceButton>
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
                      <Skeleton width="4rem" height="1.5rem" />
                    ) : gt(estimatedFeePrice, '0') && debouncedInputDisplayAmount ? (
                      <FeePriceButton type="button" onClick={() => setIsFeePriceCurrencyBase(!isFeePriceCurrencyBase)}>
                        <FeePriceButtonTextContainer>
                          {isFeePriceCurrencyBase ? (
                            <>
                              <Typography variant="h6n">{` ≈ ${lt(estimatedFeePrice, '0.01') ? `<` : ``} ${CURRENCY_SYMBOL[currency]}`}</Typography>
                              &nbsp;
                              <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                                {estimatedFeePrice}
                              </NumberText>
                            </>
                          ) : (
                            <>
                              <Tooltip title={estimatedFeeDisplayAmount} arrow placement="top">
                                <span>
                                  <Typography variant="h6n">≈</Typography>
                                  &nbsp;
                                  <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(currentFeeToken?.decimals)}>
                                    {estimatedFeeDisplayAmount}
                                  </NumberText>
                                </span>
                              </Tooltip>
                              &nbsp;
                              <Typography variant="h6n">{currentFeeToken?.symbol}</Typography>
                            </>
                          )}
                        </FeePriceButtonTextContainer>
                      </FeePriceButton>
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
                              <ChainFeeInfo title="Source Chain Gas" feeInfo={squidSourceChainGasCosts} isTildeAmount />
                              <ChainFeeInfo title="Cross-Chain fees" feeInfo={squidCrossChainFeeCosts} />
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
                        <Skeleton width="4rem" height="1.5rem" />
                      ) : gt(estimatedFeePrice, '0') ? (
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
                        <Skeleton width="4rem" height="1.5rem" />
                      ) : gt(squidProcessingTime, '0') ? (
                        <SwapInfoBodyRightTextContainer>
                          <Typography variant="h6n">{`~ ${squidProcessingTime}`}</Typography>
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
                  {t('pages.Wallet.Swap.entry.permissionButton')}
                </Button>
              </div>
            </Tooltip>
          ) : (
            <Tooltip varient="error" title={errorMessage} placement="top" arrow>
              <div>
                <Button
                  type="button"
                  disabled={!!errorMessage || isDisabled || (currentSwapAPI === 'osmo' ? !osmoSwapAminoTx : !integratedSwapTx)}
                  onClick={async () => {
                    if ((currentSwapAPI === '1inch' || currentSwapAPI === 'squid') && integratedSwapTx) {
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
                  <ButtonTextIconContaier>
                    {currentSwapAPI ? t('pages.Wallet.Swap.entry.swapButtonOn') : t('pages.Wallet.Swap.entry.swapButton')}
                    {currentSwapAPI === 'osmo' && <OsmosisLogoIcon />}
                    {currentSwapAPI === '1inch' && <OneInchLogoIcon />}
                    {currentSwapAPI === 'squid' && <SquidLogoIcon />}
                  </ButtonTextIconContaier>
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
            <SwapCoinContainer headerLeftText="From" balance="0" tokenAmountPrice="0" address="" isChainAvailable={false} isTokenAvailable={false}>
              <SwapCoinOutputAmountContainer data-is-active={false}>
                <NumberText typoOfIntegers="h3n" fixed={0}>
                  0
                </NumberText>
              </SwapCoinOutputAmountContainer>
            </SwapCoinContainer>
            <SwapCoinContainer headerLeftText="To" balance="0" tokenAmountPrice="0" address="" isChainAvailable={false} isTokenAvailable={false}>
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
                {t('pages.Wallet.Swap.entry.swapButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      );
    </>
  );
}
