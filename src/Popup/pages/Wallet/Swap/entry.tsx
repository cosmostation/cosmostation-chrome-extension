import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import type { GetRoute, TokenData } from '@0xsquid/sdk';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
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
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useSupportSwapChainsSWR } from '~/Popup/hooks/SWR/integratedSwap/useSupportSwapChainsSWR';
import { useSquidAssetsSWR } from '~/Popup/hooks/SWR/squid/useSquidAssetsSWR';
import { useSquidRouteSWR } from '~/Popup/hooks/SWR/squid/useSquidRouteSWR';
import { useSquidTokensSWR } from '~/Popup/hooks/SWR/squid/useSquidTokensSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, lt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { CosmosChain, EthereumToken } from '~/types/chain';
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

export default function Entry() {
  const osmosisChain = OSMOSIS;
  const ethereumChain = ETHEREUM;
  const { t, language } = useTranslation();
  const { navigateBack } = useNavigate();
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(osmosisChain, true);
  const accounts = useAccounts(true);
  const params = useParams();

  const { enQueue } = useCurrentQueue();
  const nodeInfo = useNodeInfoSWR(osmosisChain);
  const supportedCosmosChain = useSupportChainsSWR({ suspense: true });
  const supportedSquidTokens = useSquidTokensSWR();
  const { chromeStorage } = useChromeStorage();
  const { ethereumTokens } = chromeStorage;
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const osmosisAssets = useCosmosAssetsSWR(osmosisChain);
  const supportedSwapChains = useSupportSwapChainsSWR({ suspense: true });

  const { currentChain, setCurrentChain } = useCurrentChain();
  const { currentEthereumNetwork, setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

  const { squidChains, filterSquidTokens } = useSquidAssetsSWR();

  const SupportedOneInchTokens = useSupportTokensSWR();

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);

  const [isFeePriceCurrencyBase, setIsFeePriceCurrencyBase] = useState(true);
  const [isOsmoSwapFeePriceCurrencyBase, setIsOsmoSwapFeePriceCurrencyBase] = useState(true);

  const [currentSlippage, setCurrentSlippage] = useState('1');

  const [currentSwapAPI, setCurrentSwapAPI] = useState<IntegratedSwapAPI>();

  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const filteredFromChains: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMChains = ETHEREUM_NETWORKS.filter(
      (item) =>
        supportedSwapChains.data?.squid.evm.send.find((sendChain) => sendChain.chainId === String(parseInt(item.chainId, 16))) &&
        squidChains?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === squidChain.chainId),
    ).map((item) => ({
      ...item,
      baseChainUUID: ethereumChain.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ethereumChain.line,
    }));

    const oneInchEVMChains = ETHEREUM_NETWORKS.filter((item) =>
      supportedSwapChains.data?.oneInch.evm.send.find((sendChain) => sendChain.chainId === String(parseInt(item.chainId, 16))),
    ).map((item) => ({
      ...item,
      baseChainUUID: ethereumChain.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ethereumChain.line,
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
      baseChainUUID: item.id,
      networkName: item.chainName,
    }));

    const osmoSwapChain = COSMOS_CHAINS.filter(
      (item) => osmosisChain.id === item.id && supportedCosmosChain.data?.chains.find((cosmosChain) => cosmosChain.chain_id === item.chainId),
    ).map((item) => ({
      ...item,
      baseChainUUID: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMChains = [...squidEVMChains, ...oneInchEVMChains].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    const integratedCosmosChains = [...squidCosmosChains, ...osmoSwapChain].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    return [...integratedEVMChains, ...integratedCosmosChains];
  }, [
    ethereumChain.id,
    ethereumChain.line,
    osmosisChain.id,
    squidChains,
    supportedCosmosChain.data?.chains,
    supportedSwapChains.data?.oneInch.evm.send,
    supportedSwapChains.data?.squid.cosmos.send,
    supportedSwapChains.data?.squid.evm.send,
  ]);

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain>(
    filteredFromChains.find((item) => item.id === params.id) || filteredFromChains[0],
  );
  const filteredToChainList: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMChains = ETHEREUM_NETWORKS.filter(
      (item) =>
        supportedSwapChains.data?.squid.evm.receive.find((receiveChain) => receiveChain.chainId === String(parseInt(item.chainId, 16))) &&
        squidChains?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === squidChain.chainId),
    ).map((item) => ({
      ...item,
      baseChainUUID: ethereumChain.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ethereumChain.line,
    }));

    const oneInchEVMChains = ETHEREUM_NETWORKS.filter((item) =>
      supportedSwapChains.data?.oneInch.evm.receive.find((receiveChain) => receiveChain.chainId === String(parseInt(item.chainId, 16))),
    ).map((item) => ({
      ...item,
      baseChainUUID: ethereumChain.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ethereumChain.line,
    }));

    const osmoSwapChain = COSMOS_CHAINS.filter(
      (item) => osmosisChain.id === item.id && supportedCosmosChain.data?.chains.find((cosmosChain) => cosmosChain.chain_id === item.chainId),
    ).map((item) => ({
      ...item,
      baseChainUUID: item.id,
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
      baseChainUUID: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMChains = [...squidEVMChains, ...oneInchEVMChains].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    const integratedCosmosChains = [...squidCosmosChains, ...osmoSwapChain].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    if (currentFromChain) {
      const originChains = [...integratedEVMChains, ...integratedCosmosChains];
      if (
        (!squidEVMChains.find((item) => item.id === currentFromChain.id) && oneInchEVMChains.find((item) => item.id === currentFromChain.id)) ||
        currentFromChain.id === osmosisChain.id
      ) {
        const availableChains = [currentFromChain];

        return [
          ...originChains.filter((item) => availableChains.find((chain) => chain.id === item.id)),
          ...originChains
            .filter((item) => !availableChains.find((chain) => chain.id === item.id))
            .map((item) => ({
              ...item,
              isUnavailable: true,
            })),
        ];
      }

      if (squidEVMChains.find((item) => item.id === currentFromChain.id) && !oneInchEVMChains.find((item) => item.id === currentFromChain.id)) {
        const availableChains = [...squidEVMChains.filter((item) => item.id !== currentFromChain.id), ...integratedCosmosChains];

        return [
          ...originChains.filter((item) => availableChains.find((chain) => chain.id === item.id)),
          ...originChains
            .filter((item) => !availableChains.find((chain) => chain.id === item.id))
            .map((item) => ({
              ...item,
              isUnavailable: true,
            })),
        ];
      }

      if (squidEVMChains.find((item) => item.id === currentFromChain.id) && oneInchEVMChains.find((item) => item.id === currentFromChain.id)) {
        const availableChains = [...squidEVMChains, ...integratedCosmosChains];

        return [
          ...originChains.filter((item) => availableChains.find((chain) => chain.id === item.id)),
          ...originChains
            .filter((item) => !availableChains.find((chain) => chain.id === item.id))
            .map((item) => ({
              ...item,
              isUnavailable: true,
            })),
        ];
      }
    }

    return [];
  }, [
    currentFromChain,
    ethereumChain.id,
    ethereumChain.line,
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
    () => (currentFromChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentFromChain.baseChainUUID]) || '',
    [accounts?.data, currentAccount.id, currentFromChain],
  );
  const currentToAddress = useMemo(
    () => (currentToChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentToChain.baseChainUUID]) || '',
    [accounts?.data, currentAccount.id, currentToChain],
  );

  const cosmosFromChainBalance = useBalanceSWR(currentFromChain as CosmosChain);
  const cosmosToChainBalance = useBalanceSWR(currentToChain as CosmosChain);

  const currentFromEVMNativeBalance = useNativeBalanceSWR(currentFromChain?.line === ethereumChain.line ? currentFromChain : undefined);
  const currentFromEVMTokenBalance = useTokenBalanceSWR({
    network: currentFromChain?.line === ethereumChain.line ? currentFromChain : undefined,
    token: currentFromChain?.line === ethereumChain.line ? (currentFromToken as EthereumToken) : undefined,
  });

  const currentToEVMNativeBalance = useNativeBalanceSWR(currentToChain?.line === ethereumChain.line ? currentToChain : undefined);
  const currentToEVMTokenBalance = useTokenBalanceSWR({
    network: currentToChain?.line === ethereumChain.line ? currentToChain : undefined,
    token: currentToChain?.line === ethereumChain.line ? (currentToToken as EthereumToken) : undefined,
  });

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
          imageURL: item.image,
          name: getCapitalize(item.prevChain || item.origin_chain),
          displayDenom: item.symbol,
          symbol: undefined,
        }));

      return [
        ...filteredTokens.filter((item) => gt(item?.balance || '0', '0') && (item.type === 'staking' || item.type === 'native' || item.type === 'bridge')),
        ...filteredTokens.filter((item) => gt(item?.balance || '0', '0') && item.type === 'ibc').sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)),
        ...filteredTokens.filter((item) => !gt(item?.balance || '0', '0')).sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)),
      ];
    }

    if (currentSwapAPI === '1inch' && oneInchTokens.data) {
      const filteredTokens = Object.values(oneInchTokens.data.tokens);

      return [
        ...filteredTokens
          .filter((item) => item.tags.includes('native'))
          .map((item) => ({
            ...item,
            balance: BigInt(currentFromEVMNativeBalance.data?.result || '0').toString(10),
            coinGeckoId: currentEthereumNetwork.coinGeckoId,
          })),
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
      ].map((item) => ({
        ...item,
        displayDenom: item.symbol,
        imageURL: item.logoURI,
      }));
    }

    if (currentSwapAPI === 'squid') {
      const filteredTokens = filterSquidTokens(currentFromChain?.chainId);

      return [
        ...filteredTokens
          .filter((item) => isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address))
          .map((item) => ({ ...item, balance: BigInt(currentFromEVMNativeBalance.data?.result || '0').toString(10) })),
        ...filteredTokens.filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokens.filter(
          (item) =>
            !isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address) &&
            !currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ].map((item) => ({
        ...item,
        displayDenom: item.symbol,
        imageURL: item.logoURI,
        coinGeckoId: item.coingeckoId,
      }));
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
    currentFromEVMNativeBalance,
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
        ...filteredTokenList
          .filter((item) => item.tags.includes('native'))
          .map((item) => ({
            ...item,
            balance: BigInt(currentToEVMNativeBalance.data?.result || '0').toString(10),
            coinGeckoId: currentEthereumNetwork.coinGeckoId,
          })),
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
      ].map((item) => ({
        ...item,
        displayDenom: item.symbol,
        imageURL: item.logoURI,
      }));
    }

    if (currentSwapAPI === 'squid' && currentToChain?.line === ethereumChain.line) {
      const filteredTokenList = filterSquidTokens(currentToChain?.chainId);

      return [
        ...filteredTokenList
          .filter((item) => isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address))
          .map((item) => ({ ...item, balance: BigInt(currentToEVMNativeBalance.data?.result || '0').toString(10) })),
        ...filteredTokenList.filter((item) => currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))),
        ...filteredTokenList.filter(
          (item) =>
            !isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address) &&
            !currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)),
        ),
      ].map((item) => ({
        ...item,
        displayDenom: item.symbol,
        imageURL: item.logoURI,
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
              supportedSquidTokens.data?.mainnet.find((token) =>
                token.contracts.find((contract) => isEqualsIgnoringCase(contract.address, currentFromToken?.address)),
              )?.id,
            ),
        ),
      ].map((item) => ({
        ...item,
        displayDenom: item.symbol,
        imageURL: item.logoURI,
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
    ethereumChain.line,
    filteredFromTokenList,
    osmoSwapMath.poolsAssetData.data,
    currentFromToken?.address,
    currentToEVMNativeBalance.data?.result,
    currentEthereumNetwork.coinGeckoId,
    supportedOneInchTokens,
    filterSquidTokens,
    supportedSquidTokens.data?.mainnet,
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

        if (currentFromChain?.line === ethereumChain.line) {
          return isEqualsIgnoringCase(item.address, EVM_NATIVE_TOKEN_ADDRESS);
        }

        return undefined;
      }),
    [currentFromChain?.line, ethereumChain.line, filteredFromTokenList, osmosisChain.baseDenom],
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

  const squidSourceChainGasCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidRoute.data?.route.estimate.gasCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidRoute.data?.route.estimate.gasCosts
          .filter((gasCost) => isEqualsIgnoringCase(gasCost.token.address, item))
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: squidRoute.data?.route.estimate.gasCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token,
      feeItems: [...(squidRoute.data?.route.estimate.gasCosts.filter((fee) => isEqualsIgnoringCase(fee.token.address, item)) || [])],
    }));
  }, [squidRoute.data?.route.estimate.gasCosts]);

  const squidCrossChainFeeCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidRoute.data?.route.estimate.feeCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidRoute.data?.route.estimate.feeCosts
          .filter((feeCost) => isEqualsIgnoringCase(feeCost.token.address, item) && feeCost.name !== 'Express Fee')
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: {
        ...squidRoute.data?.route.estimate.feeCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token,
        coingeckoId:
          osmosisAssets.data.find(
            (asset) =>
              asset.counter_party?.denom &&
              asset.counter_party.denom ===
                supportedSquidTokens.data?.mainnet.find((token) => token.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, item)))
                  ?.id,
          )?.coinGeckoId || squidRoute.data?.route.estimate.feeCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token.coingeckoId,
      } as TokenData | undefined,
      feeItems: [
        ...(squidRoute.data?.route.estimate.feeCosts
          .filter((fee) => isEqualsIgnoringCase(fee.token.address, item))
          .map((fee) => ({
            ...fee,
            token: {
              ...fee.token,
              coingeckoId:
                osmosisAssets.data.find(
                  (asset) =>
                    asset.counter_party?.denom &&
                    asset.counter_party.denom ===
                      supportedSquidTokens.data?.mainnet.find((token) =>
                        token.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, fee.token.address)),
                      )?.id,
                )?.coinGeckoId || fee.token.coingeckoId,
            },
          })) || []),
      ],
    }));
  }, [osmosisAssets.data, squidRoute.data?.route.estimate.feeCosts, supportedSquidTokens.data?.mainnet]);

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
        chain_id: nodeInfo.data?.default_node_info?.network ?? osmosisChain.chainId,
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
    nodeInfo.data?.default_node_info?.network,
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
        squidSourceChainGasCosts.every(
          (item, idx) =>
            isEqualsIgnoringCase(item.feeToken?.address, squidCrossChainFeeCosts[idx].feeToken?.address) &&
            isEqualsIgnoringCase(item.feeToken?.address, EVM_NATIVE_TOKEN_ADDRESS),
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
    squidSourceChainGasCosts,
    squidSourceChainFeeAmount,
    squidCrossChainFeeCosts,
    squidCrossChainFeeAmount,
  ]);

  const estimatedFeeDisplayAmount = useMemo(
    () => toDisplayDenomAmount(estimatedFeeBaseAmount, currentFeeToken?.decimals || 0),
    [currentFeeToken?.decimals, estimatedFeeBaseAmount],
  );

  const squidSourceChainTotalFeePrice = useMemo(
    () =>
      squidSourceChainGasCosts.reduce(
        (ac, cu) =>
          plus(
            ac,
            times(
              toDisplayDenomAmount(cu.amount || '0', cu.feeToken?.decimals || 0),
              (cu.feeToken?.coingeckoId && coinGeckoPrice.data?.[cu.feeToken.coingeckoId]?.[chromeStorage.currency]) || '0',
            ),
          ),
        '0',
      ) || '0',
    [chromeStorage.currency, coinGeckoPrice.data, squidSourceChainGasCosts],
  );

  const squidCrossChainTotalFeePrice = useMemo(
    () =>
      squidCrossChainFeeCosts?.reduce(
        (ac, cu) =>
          plus(
            ac,
            times(
              toDisplayDenomAmount(cu.amount || '0', cu.feeToken?.decimals || 0),
              (cu.feeToken?.coingeckoId && coinGeckoPrice.data?.[cu.feeToken.coingeckoId]?.[chromeStorage.currency]) || '0',
            ),
          ),
        '0',
      ) || '0',
    [chromeStorage.currency, coinGeckoPrice.data, squidCrossChainFeeCosts],
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
      return gt(maxAmount, '0') ? maxAmount : '0';
    }
    return currentFromTokenDisplayBalance;
  }, [currentFromTokenDisplayBalance, estimatedFeeDisplayAmount, currentFromToken?.address, currentFeeToken?.address]);

  const swapAssetInfo = useCallback(() => {
    const tmpFromToken = currentFromToken;
    const tmpFromChain = currentFromChain;

    if (currentSwapAPI === 'squid') {
      if (currentToChain?.line === ethereumChain.line) {
        setCurrentFromChain(currentToChain);
      }
      if (currentToChain?.line === osmosisChain.line) {
        setCurrentFromChain(filteredFromChains[0].id === tmpFromChain?.id ? filteredFromChains[1] : filteredFromChains[0]);
      }
      setCurrentToChain(tmpFromChain);
    }

    setCurrentFromToken(currentToToken);
    setCurrentToToken(tmpFromToken);

    setInputDisplayAmount('');
  }, [currentFromChain, currentFromToken, currentSwapAPI, currentToChain, currentToToken, ethereumChain.line, filteredFromChains, osmosisChain.line]);

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
        return t('pages.Wallet.Swap.entry.oversizedSwap');
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
      )} ${currentToToken.displayDenom} ${
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
      )} ${currentFeeToken?.displayDenom || ''} ${t('pages.Wallet.Swap.entry.lessThanFeeWarningDescription2')}`;
    }

    if (currentFeeToken && isEqualsIgnoringCase(currentFromToken?.address, currentFeeToken.address)) {
      if (gt(plus(currentInputBaseAmount, estimatedFeeBaseAmount), currentFromTokenBalance)) {
        return `${t('pages.Wallet.Swap.entry.balanceWarningDescription1')} ${currentFeeToken?.displayDenom}${t(
          'pages.Wallet.Swap.entry.balanceWarningDescription2',
        )} ${fix(minus(currentFromTokenDisplayBalance, estimatedFeeDisplayAmount), getDisplayMaxDecimals(currentFeeToken.decimals))} ${
          currentFeeToken?.displayDenom
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
      setCurrentToChain(filteredToChainList.find((item) => item.id === currentFromChain.id) || filteredToChainList[0]);
    }

    if (currentToChain && filteredToChainList.filter((item) => item.isUnavailable).find((item) => item.id === currentToChain.id)) {
      setCurrentToChain(filteredToChainList[0]);
    }
  }, [filteredFromChains, filteredToChainList, currentSwapAPI, currentFromChain, currentToChain]);

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
    if (!filteredFromTokenList.find((item) => item.address === currentFromToken?.address && item.name === currentFromToken.name)) {
      if (currentSwapAPI === 'osmo') {
        setCurrentFromToken(filteredFromTokenList.find((item) => item.displayDenom === COSMOS.displayDenom));
      }
      if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid') {
        setCurrentFromToken(filteredFromTokenList[0]);
      }
    }

    if (!filteredToTokenList.find((item) => item.address === currentToToken?.address && item.name === currentToToken.name)) {
      if (currentSwapAPI === 'osmo') {
        setCurrentToToken(filteredFromTokenList.find((item) => item.displayDenom === osmosisChain.displayDenom));
      }
      if (currentSwapAPI === '1inch') {
        setCurrentToToken(filteredToTokenList.find((item) => item.displayDenom.includes('USDT')));
      }
      if (currentSwapAPI === 'squid') {
        setCurrentToToken(filteredToTokenList[0]);
      }
    }
  }, [
    currentFromChain,
    currentFromChain?.id,
    currentFromToken,
    currentSwapAPI,
    currentToChain,
    currentToChain?.id,
    currentToToken,
    filteredFromTokenList,
    filteredToTokenList,
    osmosisChain.displayDenom,
    osmosisChain.id,
  ]);

  useEffect(() => {
    if (currentSwapAPI === '1inch' && currentFromToken) {
      void allowance.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSwapAPI, currentFromToken]);

  useEffect(() => {
    if (currentFromChain?.line === ethereumChain.line) {
      void setCurrentEthereumNetwork(currentFromChain);
      if (currentChain.line !== ethereumChain.line) {
        void setCurrentChain(ethereumChain);
      }
    }
    if (currentFromChain?.line === 'COSMOS' && currentChain.line !== 'COSMOS') {
      void setCurrentChain(osmosisChain);
    }
  }, [currentChain.line, currentFromChain, currentSwapAPI, ethereumChain, osmosisChain, setCurrentChain, setCurrentEthereumNetwork]);

  return (
    <>
      <Container>
        <SubSideHeader title={t('pages.Wallet.Swap.entry.title')} onClick={() => navigateBack()}>
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
                    if (!isDecimal(e.currentTarget.value, currentFromToken?.decimals || 0) && e.currentTarget.value) {
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
            <SwapIconButton onClick={swapAssetInfo}>
              <SwapIcon />
            </SwapIconButton>
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
                    <Typography variant="h4n">{currentToToken?.displayDenom}</Typography>
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
                          <Typography variant="h6n">{`1 ${currentFromToken?.displayDenom || ''} ≈`} </Typography>
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
                          <Typography variant="h6n">{currentToToken?.displayDenom}</Typography>
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
                              <Typography variant="h6n"> {currentFeeToken?.displayDenom}</Typography>
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
                    <Typography variant="h6">{t('pages.Wallet.Swap.entry.gasFee')}</Typography>
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
                              <Typography variant="h6n">{currentFeeToken?.displayDenom}</Typography>
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
                          <Typography variant="h6n">{`~ ${String(parseFloat(fix(squidProcessingTime, 2)))}`}</Typography>
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
                  disabled={!!errorMessage || isDisabled || isLoadingSwapData || (currentSwapAPI === 'osmo' ? !osmoSwapAminoTx : !integratedSwapTx)}
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
                    {language === 'ko' ? (
                      <>
                        {currentSwapAPI === 'osmo' && <OsmosisLogoIcon />}
                        {currentSwapAPI === '1inch' && <OneInchLogoIcon />}
                        {currentSwapAPI === 'squid' && <SquidLogoIcon />}
                        {currentSwapAPI ? t('pages.Wallet.Swap.entry.swapButtonOn') : t('pages.Wallet.Swap.entry.swapButton')}
                      </>
                    ) : (
                      <>
                        {currentSwapAPI ? t('pages.Wallet.Swap.entry.swapButtonOn') : t('pages.Wallet.Swap.entry.swapButton')}
                        {currentSwapAPI === 'osmo' && <OsmosisLogoIcon />}
                        {currentSwapAPI === '1inch' && <OneInchLogoIcon />}
                        {currentSwapAPI === 'squid' && <SquidLogoIcon />}
                      </>
                    )}
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
  const { navigateBack } = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Container>
        <SubSideHeader title={t('pages.Wallet.Swap.entry.title')} onClick={() => navigateBack()}>
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
