import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { CHAINS, COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM, EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import AmountInput from '~/Popup/components/common/AmountInput';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import InformContatiner from '~/Popup/components/common/InformContainer';
import NumberText from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useGasRateSWR } from '~/Popup/hooks/SWR/cosmos/useGasRateSWR';
import { useSupportChainsSWR } from '~/Popup/hooks/SWR/cosmos/useSupportChainsSWR';
import { useBalanceSWR as useNativeBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useOneInchTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useOneInchTokensSWR';
import { useSupportTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useSupportTokensSWR';
import { useOneInchSwap } from '~/Popup/hooks/SWR/integratedSwap/oneInch/useOneInchSwap';
import { useSkipSupportChainsSWR } from '~/Popup/hooks/SWR/integratedSwap/skip/SWR/useSkipSupportChainsSWR';
import { useSkipSwap } from '~/Popup/hooks/SWR/integratedSwap/skip/useSkipSwap';
import { useSquidAssetsSWR } from '~/Popup/hooks/SWR/integratedSwap/squid/SWR/useSquidAssetsSWR';
import { useSquidTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/squid/SWR/useSquidTokensSWR';
import { useSquidSwap } from '~/Popup/hooks/SWR/integratedSwap/squid/useSquidSwap';
import { useSupportSwapChainsSWR } from '~/Popup/hooks/SWR/integratedSwap/useSupportSwapChainsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, lt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getDefaultAV } from '~/Popup/utils/cosmos';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
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
  ProcessingTimeStyledTooltip,
  SideButton,
  StyledButton,
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
  SwapVenueImageContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';
import Management24Icon from '~/images/icons/Mangement24.svg';
import OneInchLogoIcon from '~/images/icons/OneInchLogo.svg';
import Permission16Icon from '~/images/icons/Permission16.svg';
import SkipLogoIcon from '~/images/icons/SkipLogoIcon.svg';
import SquidLogoIcon from '~/images/icons/SquidLogo.svg';
import SwapIcon from '~/images/icons/Swap.svg';

export default function Entry() {
  const { t, language } = useTranslation();
  const { navigateBack } = useNavigate();
  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts();
  const params = useParams();

  const supportedSwapChains = useSupportSwapChainsSWR({ suspense: true });

  const skipSupportedChains = useSkipSupportChainsSWR({ suspense: true });
  const supportedCosmosChain = useSupportChainsSWR({ suspense: true });

  const { squidChains, filterSquidTokens } = useSquidAssetsSWR();

  const { enQueue } = useCurrentQueue();

  const { extensionStorage } = useExtensionStorage();
  const { ethereumTokens } = extensionStorage;
  const { currency } = extensionStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const { currentChain, setCurrentChain } = useCurrentChain();

  const { currentEthereumNetwork, setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);

  const [isFeePriceCurrencyBase, setIsFeePriceCurrencyBase] = useState(false);

  const [currentSlippage, setCurrentSlippage] = useState('1');

  const [currentSwapAPI, setCurrentSwapAPI] = useState<IntegratedSwapAPI>();

  const filteredFromChains: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMChains = ETHEREUM_NETWORKS.filter(
      (item) =>
        supportedSwapChains.data?.squid.evm.send.find((sendChain) => sendChain.chainId === String(parseInt(item.chainId, 16))) &&
        squidChains?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === squidChain.chainId),
    ).map((item) => ({
      ...item,
      baseChainUUID: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const oneInchEVMChains = ETHEREUM_NETWORKS.filter((item) =>
      supportedSwapChains.data?.oneInch.evm.send.find((sendChain) => sendChain.chainId === String(parseInt(item.chainId, 16))),
    ).map((item) => ({
      ...item,
      baseChainUUID: ETHEREUM.id,
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
      baseChainUUID: item.id,
      networkName: item.chainName,
    }));

    const skipSwapChains = COSMOS_CHAINS.filter((item) => skipSupportedChains.data?.chains.find((chain) => chain.chain_id === item.chainId)).map((item) => ({
      ...item,
      baseChainUUID: item.id,
      networkName: item.chainName,
    }));

    const integratedEVMChains = [...squidEVMChains, ...oneInchEVMChains].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    const integratedCosmosChains = [...squidCosmosChains, ...skipSwapChains].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    return [...integratedEVMChains, ...integratedCosmosChains];
  }, [
    skipSupportedChains.data?.chains,
    squidChains,
    supportedCosmosChain.data?.chains,
    supportedSwapChains.data?.oneInch.evm.send,
    supportedSwapChains.data?.squid.cosmos.send,
    supportedSwapChains.data?.squid.evm.send,
  ]);

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain>(
    filteredFromChains.find((item) => item.id === params.id) ||
      (CHAINS.find((item) => item.id === params.id)?.line === COSMOS.line
        ? filteredFromChains.find((item) => item.id === COSMOS.id) || filteredFromChains[0]
        : filteredFromChains.find((item) => item.id === ETHEREUM.id) || filteredFromChains[0]),
  );

  const selectedFromCosmosChain = useMemo(() => (currentFromChain.line === 'COSMOS' ? currentFromChain : undefined), [currentFromChain]);

  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const filteredToChainList: IntegratedSwapChain[] = useMemo(() => {
    const squidEVMChains = ETHEREUM_NETWORKS.filter(
      (item) =>
        supportedSwapChains.data?.squid.evm.receive.find((receiveChain) => receiveChain.chainId === String(parseInt(item.chainId, 16))) &&
        squidChains?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === squidChain.chainId),
    ).map((item) => ({
      ...item,
      baseChainUUID: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const oneInchEVMChains = ETHEREUM_NETWORKS.filter((item) =>
      supportedSwapChains.data?.oneInch.evm.receive.find((receiveChain) => receiveChain.chainId === String(parseInt(item.chainId, 16))),
    ).map((item) => ({
      ...item,
      baseChainUUID: ETHEREUM.id,
      chainId: String(parseInt(item.chainId, 16)),
      line: ETHEREUM.line,
    }));

    const skipSwapChains = COSMOS_CHAINS.filter((item) => skipSupportedChains.data?.chains.find((chain) => chain.chain_id === item.chainId)).map((item) => ({
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

    const integratedCosmosChains = [...skipSwapChains, ...squidCosmosChains].filter(
      (chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx,
    );

    if (currentFromChain) {
      const originChains = [...integratedEVMChains, ...integratedCosmosChains];
      if (!squidEVMChains.find((item) => item.id === currentFromChain.id) && oneInchEVMChains.find((item) => item.id === currentFromChain.id)) {
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
        const availableChains = [...squidEVMChains.filter((item) => item.id !== currentFromChain.id), ...squidCosmosChains];

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
        const availableChains = [...squidEVMChains, ...squidCosmosChains];

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

      if (currentFromChain.line === COSMOS.line) {
        const availableChains = [...skipSwapChains];

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
    skipSupportedChains.data?.chains,
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

  const currentFromAddress = useMemo(
    () => (currentFromChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentFromChain.baseChainUUID]) || '',
    [accounts?.data, currentAccount.id, currentFromChain],
  );
  const currentToAddress = useMemo(
    () => (currentToChain && accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentToChain.baseChainUUID]) || '',
    [accounts?.data, currentAccount.id, currentToChain],
  );

  const cosmosFromChainBalance = useBalanceSWR(currentFromChain.line === COSMOS.line ? currentFromChain : COSMOS);
  const cosmosToChainBalance = useBalanceSWR(currentToChain?.line === COSMOS.line ? currentToChain : COSMOS);

  const cosmosFromTokenAssets = useCosmosAssetsSWR(currentFromChain.line === COSMOS.line ? currentFromChain : undefined);
  const cosmosToTokenAssets = useCosmosAssetsSWR(currentToChain?.line === COSMOS.line ? currentToChain : undefined);

  const currentFromEVMNativeBalance = useNativeBalanceSWR(currentFromChain?.line === ETHEREUM.line ? currentFromChain : undefined);
  const currentFromEVMTokenBalance = useTokenBalanceSWR({
    network: currentFromChain?.line === ETHEREUM.line ? currentFromChain : undefined,
    token: currentFromChain?.line === ETHEREUM.line ? (currentFromToken as EthereumToken) : undefined,
  });

  const currentToEVMNativeBalance = useNativeBalanceSWR(currentToChain?.line === ETHEREUM.line ? currentToChain : undefined);
  const currentToEVMTokenBalance = useTokenBalanceSWR({
    network: currentToChain?.line === ETHEREUM.line ? currentToChain : undefined,
    token: currentToChain?.line === ETHEREUM.line ? (currentToToken as EthereumToken) : undefined,
  });

  const supportedSquidTokens = useSquidTokensSWR();

  const selected30OneInchTokens = useSupportTokensSWR();

  const oneInchTokens = useOneInchTokensSWR(currentSwapAPI === '1inch' ? String(parseInt(currentEthereumNetwork.chainId, 16)) : undefined);

  const supportedOneInchTokens = useMemo(
    () =>
      currentSwapAPI === '1inch' && selected30OneInchTokens.data?.[String(parseInt(currentEthereumNetwork.chainId, 16))]
        ? Object.values(selected30OneInchTokens.data[String(parseInt(currentEthereumNetwork.chainId, 16))])
        : [],
    [selected30OneInchTokens.data, currentEthereumNetwork.chainId, currentSwapAPI],
  );

  const filteredFromTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentFromEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentFromChain?.id);

    if (currentSwapAPI === 'skip') {
      const filteredTokens = cosmosFromTokenAssets.data.map((item) => {
        const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[extensionStorage.currency] || '0' : '0';
        const balance = cosmosFromChainBalance.data?.balance?.find((coin) => coin.denom === item.denom)?.amount || '0';
        const price = times(toDisplayDenomAmount(balance, item.decimals), coinPrice);
        return {
          ...item,
          address: item.denom,
          balance,
          price,
          imageURL: item.image,
          name: getCapitalize(item.prevChain || item.origin_chain),
          displayDenom: item.symbol,
          symbol: undefined,
        };
      });

      return [
        ...filteredTokens.filter((item) => gt(item.balance, '0')).sort((a, b) => (gt(a.price, b.price) ? -1 : 1)),
        ...filteredTokens.filter((item) => !gt(item.balance, '0')),
      ].sort((a) => (currentFromChain?.displayDenom === a.displayDenom && a.origin_type === 'staking' ? -1 : 1));
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
        coingeckoId: undefined,
      }));
    }

    return [];
  }, [
    ethereumTokens,
    currentSwapAPI,
    oneInchTokens.data,
    currentFromChain?.id,
    currentFromChain?.displayDenom,
    currentFromChain?.chainId,
    cosmosFromTokenAssets.data,
    coinGeckoPrice.data,
    extensionStorage.currency,
    cosmosFromChainBalance.data?.balance,
    currentFromEVMNativeBalance.data?.result,
    currentEthereumNetwork.coinGeckoId,
    supportedOneInchTokens,
    filterSquidTokens,
  ]);

  const currentFromTokenBalance = useMemo(() => {
    if (currentFromChain?.line === COSMOS.line) {
      return filteredFromTokenList.find((item) => item.address === currentFromToken?.address)?.balance || '0';
    }
    if (currentFromChain?.line === ETHEREUM.line) {
      if (isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentFromToken?.address)) {
        return BigInt(currentFromEVMNativeBalance.data?.result || '0').toString(10);
      }
      return BigInt(currentFromEVMTokenBalance.data || '0').toString(10);
    }
    return '0';
  }, [currentFromChain?.line, filteredFromTokenList, currentFromToken?.address, currentFromEVMTokenBalance.data, currentFromEVMNativeBalance.data?.result]);

  const currentFromTokenDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentFromTokenBalance, currentFromToken?.decimals || 0),
    [currentFromToken?.decimals, currentFromTokenBalance],
  );

  const currentFromTokenPrice = useMemo(
    () => (currentFromToken?.coinGeckoId && coinGeckoPrice.data?.[currentFromToken?.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [extensionStorage.currency, coinGeckoPrice.data, currentFromToken?.coinGeckoId],
  );

  const filteredToTokenList: IntegratedSwapToken[] = useMemo(() => {
    const currentToEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentToChain?.id);

    if (currentSwapAPI === 'skip') {
      const filteredTokens = cosmosToTokenAssets.data.map((item) => {
        const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[extensionStorage.currency] || '0' : '0';
        const balance = cosmosToChainBalance.data?.balance?.find((coin) => coin.denom === item.denom)?.amount || '0';
        const price = times(toDisplayDenomAmount(balance, item.decimals), coinPrice);
        return {
          ...item,
          address: item.denom,
          balance,
          price,
          imageURL: item.image,
          name: getCapitalize(item.prevChain || item.origin_chain),
          displayDenom: item.symbol,
          symbol: undefined,
        };
      });

      return [
        ...filteredTokens.filter((item) => gt(item.balance, '0')).sort((a, b) => (gt(a.price, b.price) ? -1 : 1)),
        ...filteredTokens.filter((item) => !gt(item.balance, '0')),
      ].sort((a) => (currentToChain?.displayDenom === a.displayDenom && a.origin_type === 'staking' ? -1 : 1));
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

    if (currentSwapAPI === 'squid' && currentToChain?.line === ETHEREUM.line) {
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
        coingeckoId: undefined,
      }));
    }

    if (currentSwapAPI === 'squid' && currentToChain?.line === COSMOS.line) {
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
        coinGeckoId: cosmosToTokenAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.coinGeckoId || item.coingeckoId,
        coingeckoId: undefined,
        balance:
          cosmosToChainBalance.data?.balance?.find((coin) =>
            isEqualsIgnoringCase(coin.denom, cosmosToTokenAssets.data.find((asset) => asset.counter_party?.denom === item.address)?.denom),
          )?.amount || '0',
      }));
    }

    return [];
  }, [
    ethereumTokens,
    currentSwapAPI,
    oneInchTokens.data,
    currentToChain?.line,
    currentToChain?.id,
    currentToChain?.displayDenom,
    currentToChain?.chainId,
    cosmosToTokenAssets.data,
    coinGeckoPrice.data,
    extensionStorage.currency,
    cosmosToChainBalance.data?.balance,
    currentToEVMNativeBalance.data?.result,
    currentEthereumNetwork.coinGeckoId,
    supportedOneInchTokens,
    filterSquidTokens,
    supportedSquidTokens.data?.mainnet,
    currentFromToken?.address,
  ]);

  const currentToTokenBalance = useMemo(() => {
    if (currentToChain?.line === COSMOS.line) {
      return filteredToTokenList.find((item) => item.address === currentToToken?.address)?.balance || '0';
    }
    if (currentToChain?.line === ETHEREUM.line) {
      if (isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentToToken?.address)) {
        return BigInt(currentToEVMNativeBalance.data?.result || '0').toString(10);
      }
      return BigInt(currentToEVMTokenBalance.data || '0').toString(10);
    }
    return '0';
  }, [currentToChain?.line, filteredToTokenList, currentToToken?.address, currentToEVMTokenBalance.data, currentToEVMNativeBalance.data?.result]);

  const currentToTokenDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentToTokenBalance, currentToToken?.decimals || 0),
    [currentToToken?.decimals, currentToTokenBalance],
  );

  const currentToTokenPrice = useMemo(
    () => (currentToToken?.coinGeckoId && coinGeckoPrice.data?.[currentToToken.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [extensionStorage.currency, coinGeckoPrice.data, currentToToken?.coinGeckoId],
  );

  const currentFeeToken = useMemo(
    () =>
      filteredFromTokenList.find((item) => {
        if (currentFromChain?.line === COSMOS.line) {
          return isEqualsIgnoringCase(item.address, selectedFromCosmosChain?.baseDenom);
        }

        if (currentFromChain?.line === ETHEREUM.line) {
          return isEqualsIgnoringCase(item.address, EVM_NATIVE_TOKEN_ADDRESS);
        }

        return undefined;
      }),
    [currentFromChain?.line, filteredFromTokenList, selectedFromCosmosChain?.baseDenom],
  );

  const currentFeeTokenBalance = useMemo(() => {
    if (currentSwapAPI === 'skip') {
      return cosmosFromChainBalance.data?.balance?.find((item) => isEqualsIgnoringCase(item.denom, selectedFromCosmosChain?.baseDenom))?.amount || '0';
    }

    if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid') {
      return BigInt(currentFromEVMNativeBalance?.data?.result || '0').toString(10);
    }

    return '0';
  }, [currentSwapAPI, cosmosFromChainBalance.data?.balance, selectedFromCosmosChain?.baseDenom, currentFromEVMNativeBalance?.data?.result]);

  const currentFeeTokenPrice = useMemo(
    () => (currentFeeToken?.coinGeckoId && coinGeckoPrice.data?.[currentFeeToken.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [extensionStorage.currency, coinGeckoPrice.data, currentFeeToken?.coinGeckoId],
  );

  const inputTokenAmountPrice = useMemo(() => times(inputDisplayAmount || '0', currentFromTokenPrice), [inputDisplayAmount, currentFromTokenPrice]);

  const { skipRoute, skipSwapVenueChain, memoizedSkipSwapAminoTx, skipSwapTx, skipSwapAminoTx, skipSwapSimulatedGas } = useSkipSwap(
    currentSwapAPI === 'skip' && gt(currentInputBaseAmount, '0') && currentFromChain && currentToChain && currentFromToken && currentToToken
      ? {
          inputBaseAmount: currentInputBaseAmount,
          fromChain: currentFromChain as CosmosChain,
          toChain: currentToChain as CosmosChain,
          fromToken: currentFromToken as CosmosAssetV3,
          toToken: currentToToken as CosmosAssetV3,
          slippage: currentSlippage,
        }
      : undefined,
  );

  const {
    squidRoute,
    squidProcessingTime,
    squidSourceChainGasCosts,
    squidCrossChainFeeCosts,
    squidSourceChainFeeAmount,
    squidCrossChainFeeAmount,
    estimatedSquidFeePrice,
    allowance: squidAllowance,
    allowanceTx: squidAllowanceTx,
    allowanceTxBaseFee: squidAllowanceTxBaseFee,
    allowanceBaseEstimatedGas: squidAllowanceBaseEstimatedGas,
  } = useSquidSwap(
    currentSwapAPI === 'squid' && currentFromChain && currentToChain && currentFromToken && currentToToken && supportedSquidTokens.data && currentToAddress
      ? {
          inputBaseAmount: currentInputBaseAmount,
          fromChain: currentFromChain,
          toChain: currentToChain,
          fromToken: currentFromToken,
          toToken: currentToToken,
          supportedSquidTokens: supportedSquidTokens.data,
          senderAddress: currentFromAddress,
          receiverAddress: currentToAddress,
          slippage: currentSlippage,
        }
      : undefined,
  );

  const {
    oneInchRoute,
    allowance: oneInchAllowance,
    allowanceBaseEstimatedGas: oneInchAllowanceBaseEstimatedGas,
    allowanceTx: oneInchAllowanceTx,
    allowanceTxBaseFee: oneInchAllowanceTxBaseFee,
  } = useOneInchSwap(
    currentSwapAPI === '1inch' && currentFromChain && currentFromToken && currentToToken && currentFromAddress
      ? {
          inputBaseAmount: currentInputBaseAmount,
          fromChain: currentFromChain,
          fromToken: currentFromToken,
          toToken: currentToToken,
          senderAddress: currentFromAddress,
          slippage: currentSlippage,
        }
      : undefined,
  );

  const integratedAllowance = useMemo(() => {
    if (currentSwapAPI === '1inch')
      return {
        allowance: oneInchAllowance.data?.allowance,
        allowanceTx: oneInchAllowanceTx,
        allowanceTxBaseFee: oneInchAllowanceTxBaseFee,
        allowanceBaseEstimatedGas: oneInchAllowanceBaseEstimatedGas,
      };

    if (currentSwapAPI === 'squid')
      return {
        allowance: squidAllowance.data,
        allowanceTx: squidAllowanceTx,
        allowanceTxBaseFee: squidAllowanceTxBaseFee,
        allowanceBaseEstimatedGas: squidAllowanceBaseEstimatedGas,
      };

    return undefined;
  }, [
    currentSwapAPI,
    oneInchAllowance.data?.allowance,
    oneInchAllowanceBaseEstimatedGas,
    oneInchAllowanceTx,
    oneInchAllowanceTxBaseFee,
    squidAllowance.data,
    squidAllowanceBaseEstimatedGas,
    squidAllowanceTx,
    squidAllowanceTxBaseFee,
  ]);

  const isLoadingSwapData = useMemo(() => {
    if (currentSwapAPI === '1inch') return oneInchRoute.isValidating;

    if (currentSwapAPI === 'squid') return squidRoute.isValidating;

    if (currentSwapAPI === 'skip') return skipRoute.isValidating || skipSwapTx.isValidating;
    return false;
  }, [currentSwapAPI, oneInchRoute.isValidating, skipRoute.isValidating, skipSwapTx.isValidating, squidRoute.isValidating]);

  const estimatedToTokenBaseAmount = useMemo(() => {
    if (currentSwapAPI === 'skip' && skipRoute.data?.amount_out) {
      return skipRoute.data?.amount_out;
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data?.toTokenAmount) {
      return oneInchRoute.data.toTokenAmount;
    }

    if (currentSwapAPI === 'squid' && squidRoute.data?.route.estimate.toAmount) {
      return squidRoute.data.route.estimate.toAmount;
    }

    return '0';
  }, [currentSwapAPI, oneInchRoute.data?.toTokenAmount, skipRoute.data?.amount_out, squidRoute.data?.route.estimate.toAmount]);

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
    if ((currentSwapAPI === 'skip' || currentSwapAPI === '1inch') && gt(inputDisplayAmount || '0', '0') && gt(estimatedToTokenDisplayAmount || '0', '0')) {
      return divide(estimatedToTokenDisplayAmount, inputDisplayAmount);
    }
    if (currentSwapAPI === 'squid' && squidRoute.data?.route.estimate.exchangeRate) {
      return squidRoute.data.route.estimate.exchangeRate;
    }
    return '0';
  }, [currentSwapAPI, inputDisplayAmount, estimatedToTokenDisplayAmount, squidRoute.data?.route.estimate.exchangeRate]);

  const priceImpactPercent = useMemo(() => {
    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return squidRoute.data.route.estimate.aggregatePriceImpact;
    }

    return '0';
  }, [currentSwapAPI, squidRoute.data]);

  const integratedSwapTx = useMemo(() => {
    if (gt(integratedAllowance?.allowance || '0', currentInputBaseAmount)) {
      if (currentSwapAPI === '1inch' && oneInchRoute.data) {
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
    }

    return undefined;
  }, [currentFromAddress, currentInputBaseAmount, currentSwapAPI, integratedAllowance, oneInchRoute.data, squidRoute.data]);

  const estimatedGas = useMemo(() => {
    if (currentSwapAPI === 'skip') {
      return skipSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS;
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data) {
      return times(oneInchRoute.data.tx.gas, getDefaultAV(), 0);
    }

    if (currentSwapAPI === 'squid' && squidRoute.data) {
      return squidRoute.data.route.transactionRequest.gasLimit;
    }

    return '0';
  }, [currentSwapAPI, oneInchRoute.data, skipSwapSimulatedGas, squidRoute.data]);

  const cosmosGasRate = useGasRateSWR(selectedFromCosmosChain || COSMOS);

  const estimatedFeeBaseAmount = useMemo(() => {
    if (currentSwapAPI === 'skip' && selectedFromCosmosChain) {
      return ceil(times(estimatedGas, cosmosGasRate.data[selectedFromCosmosChain.baseDenom].low || selectedFromCosmosChain.gasRate.low));
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
    selectedFromCosmosChain,
    oneInchRoute.data,
    estimatedGas,
    cosmosGasRate.data,
    squidSourceChainGasCosts,
    squidSourceChainFeeAmount,
    squidCrossChainFeeCosts,
    squidCrossChainFeeAmount,
  ]);

  const estimatedFeeDisplayAmount = useMemo(
    () => toDisplayDenomAmount(estimatedFeeBaseAmount, currentFeeToken?.decimals || 0),
    [currentFeeToken?.decimals, estimatedFeeBaseAmount],
  );

  const estimatedFeePrice = useMemo(() => {
    if (currentSwapAPI === 'skip' || currentSwapAPI === '1inch') {
      return times(estimatedFeeDisplayAmount, currentFeeTokenPrice);
    }

    if (currentSwapAPI === 'squid') {
      return estimatedSquidFeePrice;
    }

    return '0';
  }, [currentSwapAPI, estimatedFeeDisplayAmount, currentFeeTokenPrice, estimatedSquidFeePrice]);

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
      if (currentToChain?.line === ETHEREUM.line) {
        setCurrentFromChain(currentToChain);
      }
      if (currentToChain?.line === COSMOS.line) {
        setCurrentFromChain(filteredFromChains[0].id === tmpFromChain?.id ? filteredFromChains[1] : filteredFromChains[0]);
      }
      setCurrentToChain(tmpFromChain);
    }

    if (currentSwapAPI === 'skip') {
      if (currentFromChain.id !== currentToChain?.id && currentToChain) {
        setCurrentFromChain(currentToChain);
        setCurrentToChain(tmpFromChain);
      }
    }

    setCurrentFromToken(currentToToken);
    setCurrentToToken(tmpFromToken);

    setInputDisplayAmount('');
  }, [currentFromChain, currentFromToken, currentSwapAPI, currentToChain, currentToToken, filteredFromChains]);

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

    if (currentSwapAPI === 'skip') {
      if (!skipSupportedChains) {
        return t('pages.Wallet.Swap.entry.networkError');
      }
      if (skipRoute.data?.txs_required && skipRoute.data?.txs_required > 1) {
        return t('pages.Wallet.Swap.entry.multiTxSwapError');
      }
      if (skipRoute.error?.response?.data.message) {
        return skipRoute.error.response.data.message;
      }
      if (skipSwapTx.error?.response?.data.message) {
        return skipSwapTx.error.response.data.message;
      }
      if (!skipSwapAminoTx) {
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
    skipSupportedChains,
    skipRoute.data?.txs_required,
    skipRoute.error?.response?.data.message,
    skipSwapTx.error?.response?.data.message,
    skipSwapAminoTx,
    integratedSwapTx,
    estimatedToTokenDisplayAmountPrice,
    priceImpactPercent,
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
    if (gt(currentInputBaseAmount, '0') && !isLoadingSwapData) {
      if (integratedAllowance?.allowance && !gt(integratedAllowance.allowance, currentInputBaseAmount)) {
        return t('pages.Wallet.Swap.entry.allowanceWarning');
      }

      if (currentSwapAPI === '1inch') {
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

      if (currentSwapAPI === 'skip') {
        if (skipRoute.data?.txs_required && skipRoute.data?.txs_required > 1) {
          return t('pages.Wallet.Swap.entry.multiTxSwap');
        }
        if (skipRoute.error?.response?.data.message) {
          return skipRoute.error.response.data.message;
        }
        if (skipSwapTx.error?.response?.data.message) {
          return skipSwapTx.error.response.data.message;
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
    }

    return '';
  }, [
    currentInputBaseAmount,
    isLoadingSwapData,
    integratedAllowance?.allowance,
    currentSwapAPI,
    estimatedFeeBaseAmount,
    currentFeeTokenBalance,
    currentFeeToken,
    currentFromToken?.address,
    t,
    oneInchRoute.error,
    estimatedToTokenDisplayAmountPrice,
    priceImpactPercent,
    squidRoute.error,
    errorMessage,
    isDisabled,
    skipRoute.data?.txs_required,
    skipRoute.error?.response?.data.message,
    skipSwapTx.error?.response?.data.message,
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
    if (gte(currentInputBaseAmount, integratedAllowance?.allowance || '0') && gte(integratedAllowance?.allowanceTxBaseFee || '0', currentFeeTokenBalance)) {
      return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
    }
    return '';
  }, [integratedAllowance?.allowance, integratedAllowance?.allowanceTxBaseFee, currentFeeTokenBalance, currentInputBaseAmount, t]);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedSkipSwapAminoTx]);

  useEffect(() => {
    if (currentFromChain && !currentToChain) {
      setCurrentToChain(filteredToChainList.find((item) => item.id === currentFromChain.id) || filteredToChainList[0]);
    }

    if (currentToChain && filteredToChainList.filter((item) => item.isUnavailable).find((item) => item.id === currentToChain.id)) {
      if (currentFromChain.line === COSMOS.line) {
        setCurrentToChain(filteredToChainList.find((item) => item.id === currentFromChain.id) || filteredToChainList[0]);
      } else {
        setCurrentToChain(filteredToChainList[0]);
      }
    }
  }, [filteredFromChains, filteredToChainList, currentSwapAPI, currentFromChain, currentToChain]);

  useEffect(() => {
    if (!currentFromChain || !currentToChain) {
      setCurrentSwapAPI(undefined);
    }
    if (currentFromChain.line === COSMOS.line && currentToChain?.line === COSMOS.line) {
      setCurrentSwapAPI('skip');
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
      if (currentSwapAPI === 'skip') {
        setCurrentFromToken(filteredFromTokenList.find((item) => item.displayDenom === currentFromChain.displayDenom) || filteredFromTokenList[0]);
      }
      if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid') {
        setCurrentFromToken(filteredFromTokenList[0]);
      }
    }

    if (!filteredToTokenList.find((item) => item.address === currentToToken?.address && item.name === currentToToken.name)) {
      if (currentSwapAPI === '1inch') {
        setCurrentToToken(filteredToTokenList.find((item) => item.displayDenom.includes('USDT')));
      }
      if (currentSwapAPI === 'squid') {
        setCurrentToToken(filteredToTokenList[0]);
      }
      if (currentSwapAPI === 'skip') {
        if (currentFromChain.id === currentToChain?.id && filteredToTokenList[1]) {
          setCurrentToToken(filteredToTokenList[1]);
        } else {
          setCurrentToToken(filteredToTokenList[0]);
        }
      }
    }

    if (currentSwapAPI === 'skip') {
      if (currentFromChain.id === currentToChain?.id && currentFromToken?.address === currentToToken?.address && filteredToTokenList.length > 1) {
        setCurrentToToken(filteredToTokenList.filter((item) => item.address !== currentToToken?.address)[0]);
      }
    }
  }, [
    currentFromChain,
    currentFromChain.id,
    currentFromToken,
    currentSwapAPI,
    currentToChain,
    currentToChain?.id,
    currentToToken,
    filteredFromTokenList,
    filteredToTokenList,
  ]);

  useEffect(() => {
    if (currentFromToken) {
      if (currentSwapAPI === '1inch') {
        void oneInchAllowance.mutate();
      }
      if (currentSwapAPI === 'squid') {
        void squidAllowance.mutate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSwapAPI, currentFromToken]);

  useEffect(() => {
    if (currentFromChain?.line === ETHEREUM.line) {
      void setCurrentEthereumNetwork(currentFromChain);
      if (currentChain.line !== ETHEREUM.line) {
        void setCurrentChain(ETHEREUM);
      }
    }
  }, [currentChain.id, currentChain.line, currentFromChain, setCurrentChain, setCurrentEthereumNetwork]);

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
                if (currentFromChain.id === currentToChain?.id && isEqualsIgnoringCase(clickedCoin.address, currentToToken?.address)) {
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
                if (currentFromChain.id === currentToChain?.id && isEqualsIgnoringCase(clickedCoin.address, currentFromToken?.address)) {
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
            <InformContatiner varient="warning">
              <Typography variant="h6">{warningMessage}</Typography>
            </InformContatiner>
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

              {currentSwapAPI === 'squid' && (
                <SwapInfoBodyTextContainer>
                  <SwapInfoBodyLeftContainer>
                    <Typography variant="h6">{t('pages.Wallet.Swap.entry.priceImpact')}</Typography>
                  </SwapInfoBodyLeftContainer>
                  <SwapInfoBodyRightContainer>
                    {isLoadingSwapData ? (
                      <Skeleton width="4rem" height="1.5rem" />
                    ) : priceImpactPercent !== '0' ? (
                      <SwapInfoBodyRightTextContainer data-is-invalid={gt(priceImpactPercent, '5')}>
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
              )}

              {(currentSwapAPI === 'skip' || currentSwapAPI === '1inch') && (
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
              {currentSwapAPI === 'skip' && (
                <>
                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.processingTime')}</Typography>
                    </SwapInfoBodyLeftContainer>

                    <SwapInfoBodyRightContainer>
                      {isLoadingSwapData ? (
                        <Skeleton width="4rem" height="1.5rem" />
                      ) : memoizedSkipSwapAminoTx ? (
                        <SwapInfoBodyRightTextContainer>
                          <>
                            <Typography variant="h6n">~ 0.5</Typography>
                            &nbsp;
                            <Typography variant="h6n">{t('pages.Wallet.Swap.entry.minutes')}</Typography>
                            &nbsp;
                            <ProcessingTimeStyledTooltip title={t('pages.Wallet.Swap.entry.ibcRelayingTimeInfo')} placement="top" arrow>
                              <SwapInfoBodyLeftIconContainer>
                                <Info16Icon />
                              </SwapInfoBodyLeftIconContainer>
                            </ProcessingTimeStyledTooltip>
                          </>
                        </SwapInfoBodyRightTextContainer>
                      ) : (
                        <Typography variant="h6">-</Typography>
                      )}
                    </SwapInfoBodyRightContainer>
                  </SwapInfoBodyTextContainer>

                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.swapVenue')}</Typography>
                    </SwapInfoBodyLeftContainer>

                    <SwapInfoBodyRightContainer>
                      {isLoadingSwapData ? (
                        <Skeleton width="4rem" height="1.5rem" />
                      ) : skipSwapVenueChain ? (
                        <SwapInfoBodyRightTextContainer>
                          <SwapVenueImageContainer>
                            <Image src={skipSwapVenueChain.imageURL} />
                          </SwapVenueImageContainer>
                          &nbsp;
                          <Typography variant="h6n">{skipSwapVenueChain.chainName}</Typography>
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
          {(currentSwapAPI === '1inch' || currentSwapAPI === 'squid') &&
          integratedAllowance?.allowance &&
          !gt(integratedAllowance.allowance, currentInputBaseAmount) &&
          integratedAllowance.allowanceTx ? (
            <Tooltip varient="error" title={allowanceErrorMessage} placement="top" arrow>
              <div>
                <Button
                  Icon={Permission16Icon}
                  type="button"
                  disabled={!integratedAllowance.allowanceTx || !!allowanceErrorMessage}
                  onClick={async () => {
                    if ((currentSwapAPI === '1inch' || currentSwapAPI === 'squid') && integratedAllowance.allowanceTx) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'eth_sendTransaction',
                          params: [
                            {
                              ...integratedAllowance.allowanceTx,
                              gas: toHex(integratedAllowance.allowanceBaseEstimatedGas, { addPrefix: true, isStringNumber: true }),
                            },
                          ],
                        },
                      });

                      if (currentAccount.type === 'LEDGER') {
                        await debouncedOpenTab();
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
                <StyledButton
                  type="button"
                  data-is-skip={currentSwapAPI === 'skip'}
                  disabled={!!errorMessage || isDisabled || isLoadingSwapData || (currentSwapAPI === 'skip' ? !skipSwapAminoTx : !integratedSwapTx)}
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
                        await debouncedOpenTab();
                      }
                    }
                    if (currentSwapAPI === 'skip' && skipSwapAminoTx && selectedFromCosmosChain && currentFeeToken) {
                      await enQueue({
                        messageId: '',
                        origin: '',
                        channel: 'inApp',
                        message: {
                          method: 'cos_signAmino',
                          params: {
                            chainName: selectedFromCosmosChain.chainName,
                            doc: {
                              ...skipSwapAminoTx,
                              fee: { amount: [{ denom: currentFeeToken.address, amount: estimatedFeeBaseAmount }], gas: estimatedGas },
                            },
                            isEditFee: true,
                            isEditMemo: true,
                            isCheckBalance: true,
                          },
                        },
                      });
                    }
                  }}
                >
                  <ButtonTextIconContaier>
                    {language === 'ko' ? (
                      <>
                        {currentSwapAPI === 'skip' && <SkipLogoIcon />}
                        {currentSwapAPI === '1inch' && <OneInchLogoIcon />}
                        {currentSwapAPI === 'squid' && <SquidLogoIcon />}
                        {currentSwapAPI ? t('pages.Wallet.Swap.entry.swapButtonOn') : t('pages.Wallet.Swap.entry.swapButton')}
                      </>
                    ) : (
                      <>
                        {currentSwapAPI ? t('pages.Wallet.Swap.entry.swapButtonOn') : t('pages.Wallet.Swap.entry.swapButton')}
                        {currentSwapAPI === 'skip' && <SkipLogoIcon />}
                        {currentSwapAPI === '1inch' && <OneInchLogoIcon />}
                        {currentSwapAPI === 'squid' && <SquidLogoIcon />}
                      </>
                    )}
                  </ButtonTextIconContaier>
                </StyledButton>
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
