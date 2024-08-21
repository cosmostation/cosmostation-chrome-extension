import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { CHAINS, COSMOS_CHAINS, COSMOS_DEFAULT_SQUID_CONTRACT_SWAP_GAS, COSMOS_DEFAULT_SWAP_GAS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import { ETHEREUM, EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { ETHEREUM as ETHEREUM_NETWORK } from '~/constants/chain/ethereum/network/ethereum';
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
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useGasRateSWR } from '~/Popup/hooks/SWR/cosmos/useGasRateSWR';
import { useBalanceSWR as useNativeBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useOneInchTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useOneInchTokensSWR';
import { useSpotPriceSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useSporPriceSWR';
import { useSupportTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useSupportTokensSWR';
import { useOneInchSwap } from '~/Popup/hooks/SWR/integratedSwap/oneInch/useOneInchSwap';
import { useSkipSupportChainsSWR } from '~/Popup/hooks/SWR/integratedSwap/skip/SWR/useSkipSupportChainsSWR';
import { useSkipSupportTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/skip/SWR/useSkipSupportTokensSWR';
import { useSkipSwap } from '~/Popup/hooks/SWR/integratedSwap/skip/useSkipSwap';
import { useSquidAssetsSWR } from '~/Popup/hooks/SWR/integratedSwap/squid/SWR/useSquidAssetsSWR';
import { useSquidCosmosSwap } from '~/Popup/hooks/SWR/integratedSwap/squid/useSquidCosmosSwap';
import { useSquidSwap } from '~/Popup/hooks/SWR/integratedSwap/squid/useSquidSwap';
import { useSupportSwapChainsSWR } from '~/Popup/hooks/SWR/integratedSwap/useSupportSwapChainsSWR';
import { useChainIdToAssetNameMapsSWR } from '~/Popup/hooks/SWR/useChainIdToAssetNameMapsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, lt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { calcPriceImpact } from '~/Popup/utils/calculate';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { convertAssetNameToCosmos, getDefaultAV } from '~/Popup/utils/cosmos';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { EthereumToken } from '~/types/chain';
import type { IntegratedSwapChain, IntegratedSwapFeeToken, IntegratedSwapToken } from '~/types/swap/asset';
import type { IntegratedSwapAPI } from '~/types/swap/integratedSwap';

import ChainFeeInfo from './components/ChainFeeInfo';
import NoticeBottomSheet from './components/NoticeBottomSheet';
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
  NoticeAddressBottomContainer,
  NoticeAddressContainer,
  NoticeAddressHeaderContainer,
  NoticeAddressHeaderImageContainer,
  NoticeTextContainer,
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

  const { squidChains, filterSquidTokens } = useSquidAssetsSWR();

  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR();

  const { enQueue } = useCurrentQueue();

  const { extensionStorage } = useExtensionStorage();
  const { ethereumTokens } = extensionStorage;

  const { currency } = extensionStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const { currentChain, setCurrentChain } = useCurrentChain();
  const { currentEthereumNetwork, setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

  const [isOpenSlippageDialog, setIsOpenSlippageDialog] = useState(false);
  const [isOpenNoticeBottomSheet, setIsOpenNoticeBottomSheet] = useState(false);

  const [isFeePriceCurrencyBase, setIsFeePriceCurrencyBase] = useState(false);

  const [currentSlippage, setCurrentSlippage] = useState('1');

  const [currentSwapAPI, setCurrentSwapAPI] = useState<IntegratedSwapAPI>();

  const spotPriceData = useSpotPriceSWR(currentSwapAPI === '1inch' ? { chainId: currentEthereumNetwork.chainId, currency } : undefined);

  const squidEVMChains = useMemo(
    () =>
      ETHEREUM_NETWORKS.filter((item) =>
        squidChains?.find((squidChain) => squidChain.chainType === 'evm' && String(parseInt(item.chainId, 16)) === squidChain.chainId),
      ).map((item) => ({
        ...item,
        baseChainUUID: ETHEREUM.id,
        chainId: String(parseInt(item.chainId, 16)),
        line: ETHEREUM.line,
      })),
    [squidChains],
  );

  const oneInchEVMChains = useMemo(
    () =>
      ETHEREUM_NETWORKS.filter((item) =>
        supportedSwapChains.data?.oneInch.evm.send.find((sendChain) => sendChain.chainId === String(parseInt(item.chainId, 16))),
      ).map((item) => ({
        ...item,
        baseChainUUID: ETHEREUM.id,
        chainId: String(parseInt(item.chainId, 16)),
        line: ETHEREUM.line,
      })),
    [supportedSwapChains.data?.oneInch.evm.send],
  );

  const squidCosmosChains = useMemo(
    () =>
      COSMOS_CHAINS.filter((item) => squidChains?.find((squidChain) => squidChain.chainType === 'cosmos' && item.chainId === squidChain.chainId)).map(
        (item) => ({
          ...item,
          baseChainUUID: item.id,
          networkName: item.chainName,
        }),
      ),
    [squidChains],
  );

  const skipSwapChains = useMemo(
    () =>
      COSMOS_CHAINS.filter((item) => skipSupportedChains.data?.chains.find((chain) => chain.chain_id === item.chainId)).map((item) => ({
        ...item,
        baseChainUUID: item.id,
        networkName: item.chainName,
      })),
    [skipSupportedChains.data?.chains],
  );

  const integratedEVMChains = useMemo(
    () =>
      [...squidEVMChains, ...oneInchEVMChains]
        .filter((chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx)
        .sort((a, b) => a.networkName.localeCompare(b.networkName))
        .sort((a) => (a.id === ETHEREUM_NETWORK.id ? -1 : 1)),
    [oneInchEVMChains, squidEVMChains],
  );

  const integratedCosmosChains = useMemo(
    () =>
      [...squidCosmosChains, ...skipSwapChains]
        .filter((chainItem, idx, arr) => arr.findIndex((item) => item.id === chainItem.id) === idx)
        .sort((a, b) => a.networkName.localeCompare(b.networkName))
        .sort((a) => (a.id === COSMOS.id ? -1 : 1)),
    [skipSwapChains, squidCosmosChains],
  );

  const filteredFromChains: IntegratedSwapChain[] = useMemo(
    () => [...integratedEVMChains, ...integratedCosmosChains],
    [integratedCosmosChains, integratedEVMChains],
  );

  const [currentFromChain, setCurrentFromChain] = useState<IntegratedSwapChain>(
    filteredFromChains.find((item) => item.id === params.id) ||
      (CHAINS.find((item) => item.id === params.id)?.line === COSMOS.line
        ? filteredFromChains.find((item) => item.id === COSMOS.id) || filteredFromChains[0]
        : filteredFromChains.find((item) => item.id === ETHEREUM.id) || filteredFromChains[0]),
  );

  const selectedFromCosmosChain = useMemo(() => (currentFromChain.line === 'COSMOS' ? currentFromChain : undefined), [currentFromChain]);

  const [currentToChain, setCurrentToChain] = useState<IntegratedSwapChain>();

  const availableToChains = useMemo(() => {
    if (!squidEVMChains.find((item) => item.id === currentFromChain.id) && oneInchEVMChains.find((item) => item.id === currentFromChain.id)) {
      return [currentFromChain];
    }

    if (squidEVMChains.find((item) => item.id === currentFromChain.id) && !oneInchEVMChains.find((item) => item.id === currentFromChain.id)) {
      return [...squidEVMChains.filter((item) => item.id !== currentFromChain.id), ...squidCosmosChains];
    }

    if (squidEVMChains.find((item) => item.id === currentFromChain.id) && oneInchEVMChains.find((item) => item.id === currentFromChain.id)) {
      return [...squidEVMChains, ...squidCosmosChains];
    }

    if (currentFromChain.line === COSMOS.line) {
      if (squidCosmosChains.find((item) => item.id === currentFromChain.id) && skipSwapChains.find((item) => item.id === currentFromChain.id)) {
        return [...squidEVMChains, ...integratedCosmosChains];
      }

      if (squidCosmosChains.find((item) => item.id === currentFromChain.id) && !skipSwapChains.find((item) => item.id === currentFromChain.id)) {
        return [...squidEVMChains, ...squidCosmosChains];
      }

      if (!squidCosmosChains.find((item) => item.id === currentFromChain.id) && skipSwapChains.find((item) => item.id === currentFromChain.id)) {
        return [...skipSwapChains];
      }
    }
    return [];
  }, [currentFromChain, integratedCosmosChains, oneInchEVMChains, skipSwapChains, squidCosmosChains, squidEVMChains]);

  const filteredToChains: IntegratedSwapChain[] = useMemo(() => {
    if (currentFromChain) {
      const originChains = [...integratedEVMChains, ...integratedCosmosChains];

      return originChains
        .map((item) => {
          const availableChain = availableToChains.find((chain) => chain.id === item.id);

          return availableChain
            ? {
                ...item,
                isUnavailable: false,
              }
            : {
                ...item,
                isUnavailable: true,
              };
        })
        .sort((a, b) => (a.isUnavailable === b.isUnavailable ? 0 : a.isUnavailable ? 1 : -1));
    }

    return [];
  }, [availableToChains, currentFromChain, integratedCosmosChains, integratedEVMChains]);

  const { data: fromChainTokens } = useTokensSWR(currentFromChain?.line === ETHEREUM.line ? currentFromChain : undefined);
  const { data: toChainTokens } = useTokensSWR(currentToChain?.line === ETHEREUM.line ? currentToChain : undefined);

  const defaultFromTokens: EthereumToken[] = useMemo(
    () =>
      fromChainTokens
        .filter((item) => item.default)
        .map((item) => ({
          id: `${currentFromChain?.id || ''}${item.address}`,
          ethereumNetworkId: currentFromChain?.id || '',
          address: item.address,
          name: item.name,
          displayDenom: item.displayDenom,
          decimals: item.decimals,
          imageURL: item.imageURL,
          coinGeckoId: item.coinGeckoId,
          tokenType: 'ERC20',
          default: item.default,
        })),
    [currentFromChain?.id, fromChainTokens],
  );
  const defaultToTokens: EthereumToken[] = useMemo(
    () =>
      toChainTokens
        .filter((item) => item.default)
        .map((item) => ({
          id: `${currentToChain?.id || ''}${item.address}`,
          ethereumNetworkId: currentToChain?.id || '',
          address: item.address,
          name: item.name,
          displayDenom: item.displayDenom,
          decimals: item.decimals,
          imageURL: item.imageURL,
          coinGeckoId: item.coinGeckoId,
          tokenType: 'ERC20',
          default: item.default,
        })),
    [currentToChain?.id, toChainTokens],
  );

  const currentFromEthereumTokens = useMemo(
    () =>
      [...defaultFromTokens, ...ethereumTokens.filter((item) => item.ethereumNetworkId === currentFromChain?.id)].filter(
        (token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx,
      ),
    [currentFromChain?.id, defaultFromTokens, ethereumTokens],
  );

  const currentToEthereumTokens = useMemo(
    () =>
      [...defaultToTokens, ...ethereumTokens.filter((item) => item.ethereumNetworkId === currentToChain?.id)].filter(
        (token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx,
      ),
    [currentToChain?.id, defaultToTokens, ethereumTokens],
  );

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
    token: currentFromChain?.line === ETHEREUM.line ? (currentFromToken as Omit<EthereumToken, 'id' | 'ethereumNetworkId' | 'tokenType'>) : undefined,
  });

  const currentToEVMNativeBalance = useNativeBalanceSWR(currentToChain?.line === ETHEREUM.line ? currentToChain : undefined);
  const currentToEVMTokenBalance = useTokenBalanceSWR({
    network: currentToChain?.line === ETHEREUM.line ? currentToChain : undefined,
    token: currentToChain?.line === ETHEREUM.line ? (currentToToken as Omit<EthereumToken, 'id' | 'ethereumNetworkId' | 'tokenType'>) : undefined,
  });

  const supportedSkipFromTokens = useSkipSupportTokensSWR(currentSwapAPI === 'skip' && currentFromChain.chainId ? currentFromChain.chainId : undefined);

  const supportedSkipToTokens = useSkipSupportTokensSWR(currentSwapAPI === 'skip' && currentToChain?.chainId ? currentToChain.chainId : undefined);

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
    if (currentSwapAPI === 'skip' && supportedSkipFromTokens.data) {
      const filteredTokens = cosmosFromTokenAssets.data
        .filter((item) =>
          supportedSkipFromTokens.data?.chain_to_assets_map[currentFromChain.chainId]?.assets.find((skipTokenAsset) =>
            isEqualsIgnoringCase(skipTokenAsset.denom, item.denom),
          ),
        )
        .map((item) => {
          const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[extensionStorage.currency] || '0' : '0';
          const balance = cosmosFromChainBalance.data?.balance?.find((coin) => coin.denom === item.denom)?.amount || '0';
          const price = times(toDisplayDenomAmount(balance, item.decimals), coinPrice);
          return {
            ...item,
            tokenAddressOrDenom: item.denom,
            balance,
            price,
            imageURL: item.image,
            name: convertAssetNameToCosmos(item.prevChain || item.origin_chain, chainIdToAssetNameMaps)?.chainName || item.prevChain?.toUpperCase() || '',
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
      const filteredTokens = oneInchTokens.data;

      return [
        ...filteredTokens
          .filter((item) => item.tags.includes('native'))
          .map((item) => ({
            ...item,
            balance: BigInt(currentFromEVMNativeBalance.data?.result || '0').toString(10),
            coinGeckoId: currentEthereumNetwork.coinGeckoId,
          })),
        ...filteredTokens
          .filter((item) => currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)))
          .map((item) => ({
            ...item,
            coinGeckoId: currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))?.coinGeckoId,
          })),
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
        name: item.name.toUpperCase(),
        tokenAddressOrDenom: item.address,
        displayDenom: item.symbol,
        imageURL: item.logoURI,
      }));
    }

    if (currentSwapAPI === 'squid_cosmos' && currentFromChain.line === COSMOS.line) {
      const squidTokens = filterSquidTokens(currentFromChain?.chainId);

      const filteredTokens = cosmosFromTokenAssets.data
        .filter((item) => squidTokens.find((squidToken) => squidToken.address === item.denom))
        .map((item) => {
          const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[extensionStorage.currency] || '0' : '0';
          const balance = cosmosFromChainBalance.data?.balance?.find((coin) => coin.denom === item.denom)?.amount || '0';
          const price = times(toDisplayDenomAmount(balance, item.decimals), coinPrice);
          return {
            ...item,
            tokenAddressOrDenom: item.denom,
            balance,
            price,
            imageURL: item.image,
            name: convertAssetNameToCosmos(item.prevChain || item.origin_chain, chainIdToAssetNameMaps)?.chainName || item.prevChain?.toUpperCase() || '',
            displayDenom: item.symbol,
            symbol: undefined,
          };
        });

      return [
        ...filteredTokens.filter((item) => gt(item.balance, '0')).sort((a, b) => (gt(a.price, b.price) ? -1 : 1)),
        ...filteredTokens.filter((item) => !gt(item.balance, '0')),
      ].sort((a) => (currentFromChain?.displayDenom === a.displayDenom && a.origin_type === 'staking' ? -1 : 1));
    }

    if (currentSwapAPI === 'squid_evm' && currentFromChain.line === ETHEREUM.line) {
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
        name: item.name.toUpperCase(),
        tokenAddressOrDenom: item.address,
        displayDenom: item.symbol,
        imageURL: isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address)
          ? currentFromChain.tokenImageURL
          : currentFromEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))?.imageURL || item.logoURI,
        coinGeckoId: item.coingeckoId,
        coingeckoId: undefined,
      }));
    }

    return [];
  }, [
    chainIdToAssetNameMaps,
    coinGeckoPrice.data,
    cosmosFromChainBalance.data?.balance,
    cosmosFromTokenAssets.data,
    currentEthereumNetwork.coinGeckoId,
    currentFromChain.chainId,
    currentFromChain?.displayDenom,
    currentFromChain.line,
    currentFromChain.tokenImageURL,
    currentFromEVMNativeBalance.data?.result,
    currentFromEthereumTokens,
    currentSwapAPI,
    extensionStorage.currency,
    filterSquidTokens,
    oneInchTokens.data,
    supportedOneInchTokens,
    supportedSkipFromTokens.data,
  ]);

  const currentFromTokenBalance = useMemo(() => {
    if (currentFromChain?.line === COSMOS.line) {
      return filteredFromTokenList.find((item) => item.tokenAddressOrDenom === currentFromToken?.tokenAddressOrDenom)?.balance || '0';
    }
    if (currentFromChain?.line === ETHEREUM.line) {
      if (isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentFromToken?.tokenAddressOrDenom)) {
        return BigInt(currentFromEVMNativeBalance.data?.result || '0').toString(10);
      }
      return BigInt(currentFromEVMTokenBalance.data || '0').toString(10);
    }
    return '0';
  }, [
    currentFromChain?.line,
    filteredFromTokenList,
    currentFromToken?.tokenAddressOrDenom,
    currentFromEVMTokenBalance.data,
    currentFromEVMNativeBalance.data?.result,
  ]);

  const currentFromTokenDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentFromTokenBalance, currentFromToken?.decimals || 0),
    [currentFromToken?.decimals, currentFromTokenBalance],
  );

  const currentFromTokenPrice = useMemo(
    () =>
      (currentFromToken?.coinGeckoId && coinGeckoPrice.data?.[currentFromToken?.coinGeckoId]?.[extensionStorage.currency]) ||
      spotPriceData.data?.[currentFromToken?.tokenAddressOrDenom || ''] ||
      0,
    [coinGeckoPrice.data, currentFromToken?.tokenAddressOrDenom, currentFromToken?.coinGeckoId, extensionStorage.currency, spotPriceData.data],
  );

  const filteredToTokenList: IntegratedSwapToken[] = useMemo(() => {
    if (currentSwapAPI === 'skip') {
      const filteredTokens = cosmosToTokenAssets.data
        .filter((item) =>
          supportedSkipToTokens.data?.chain_to_assets_map[currentToChain?.chainId || '']?.assets.find((skipTokenAsset) =>
            isEqualsIgnoringCase(skipTokenAsset.denom, item.denom),
          ),
        )
        .map((item) => {
          const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[extensionStorage.currency] || '0' : '0';
          const balance = cosmosToChainBalance.data?.balance?.find((coin) => coin.denom === item.denom)?.amount || '0';
          const price = times(toDisplayDenomAmount(balance, item.decimals), coinPrice);
          return {
            ...item,
            tokenAddressOrDenom: item.denom,
            balance,
            price,
            imageURL: item.image,
            name: convertAssetNameToCosmos(item.prevChain || item.origin_chain, chainIdToAssetNameMaps)?.chainName || item.prevChain?.toUpperCase() || '',
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
      const filteredTokenList = oneInchTokens.data;

      return [
        ...filteredTokenList
          .filter((item) => item.tags.includes('native'))
          .map((item) => ({
            ...item,
            balance: BigInt(currentToEVMNativeBalance.data?.result || '0').toString(10),
            coinGeckoId: currentEthereumNetwork.coinGeckoId,
          })),
        ...filteredTokenList
          .filter((item) => currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address)))
          .map((item) => ({
            ...item,
            coinGeckoId: currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))?.coinGeckoId,
          })),
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
        name: item.name.toUpperCase(),
        tokenAddressOrDenom: item.address,
        displayDenom: item.symbol,
        imageURL: item.logoURI,
      }));
    }

    if ((currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') && currentToChain?.line === ETHEREUM.line) {
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
        name: item.name.toUpperCase(),
        tokenAddressOrDenom: item.address,
        displayDenom: item.symbol,
        imageURL: isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, item.address)
          ? currentToChain.tokenImageURL
          : currentToEthereumTokens.find((token) => isEqualsIgnoringCase(token.address, item.address))?.imageURL || item.logoURI,
        coinGeckoId: item.coingeckoId,
        coingeckoId: undefined,
      }));
    }

    if (currentSwapAPI === 'squid_evm' || (currentSwapAPI === 'squid_cosmos' && currentToChain?.line === COSMOS.line)) {
      const filteredSquidTokenList = filterSquidTokens(currentToChain?.chainId);

      const filteredTokens = cosmosToTokenAssets.data
        .filter((item) => filteredSquidTokenList.find((token) => isEqualsIgnoringCase(item.denom, token.address)))
        .map((item) => {
          const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[extensionStorage.currency] || '0' : '0';
          const balance = cosmosToChainBalance.data?.balance?.find((coin) => coin.denom === item.denom)?.amount || '0';
          const price = times(toDisplayDenomAmount(balance, item.decimals), coinPrice);
          return {
            ...item,
            tokenAddressOrDenom: item.denom,
            balance,
            price,
            imageURL: item.image,
            name: convertAssetNameToCosmos(item.prevChain || item.origin_chain, chainIdToAssetNameMaps)?.chainName || item.prevChain?.toUpperCase() || '',
            displayDenom: item.symbol,
            symbol: undefined,
          };
        });

      return [
        ...filteredTokens.filter((item) => gt(item.balance, '0')).sort((a, b) => (gt(a.price, b.price) ? -1 : 1)),
        ...filteredTokens.filter((item) => !gt(item.balance, '0')),
      ].sort((a) => (currentToChain?.displayDenom === a.displayDenom && a.origin_type === 'staking' ? -1 : 1));
    }

    return [];
  }, [
    chainIdToAssetNameMaps,
    coinGeckoPrice.data,
    cosmosToChainBalance.data?.balance,
    cosmosToTokenAssets.data,
    currentEthereumNetwork.coinGeckoId,
    currentSwapAPI,
    currentToChain?.chainId,
    currentToChain?.displayDenom,
    currentToChain?.line,
    currentToChain?.tokenImageURL,
    currentToEVMNativeBalance.data?.result,
    currentToEthereumTokens,
    extensionStorage.currency,
    filterSquidTokens,
    oneInchTokens.data,
    supportedOneInchTokens,
    supportedSkipToTokens.data?.chain_to_assets_map,
  ]);

  const currentToTokenBalance = useMemo(() => {
    if (currentToChain?.line === COSMOS.line) {
      return filteredToTokenList.find((item) => item.tokenAddressOrDenom === currentToToken?.tokenAddressOrDenom)?.balance || '0';
    }
    if (currentToChain?.line === ETHEREUM.line) {
      if (isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, currentToToken?.tokenAddressOrDenom)) {
        return BigInt(currentToEVMNativeBalance.data?.result || '0').toString(10);
      }
      return BigInt(currentToEVMTokenBalance.data || '0').toString(10);
    }
    return '0';
  }, [currentToChain?.line, filteredToTokenList, currentToToken?.tokenAddressOrDenom, currentToEVMTokenBalance.data, currentToEVMNativeBalance.data?.result]);

  const currentToTokenDisplayBalance = useMemo(
    () => toDisplayDenomAmount(currentToTokenBalance, currentToToken?.decimals || 0),
    [currentToToken?.decimals, currentToTokenBalance],
  );

  const currentToTokenPrice = useMemo(
    () =>
      (currentToToken?.coinGeckoId && coinGeckoPrice.data?.[currentToToken.coinGeckoId]?.[extensionStorage.currency]) ||
      spotPriceData.data?.[currentToToken?.tokenAddressOrDenom || ''] ||
      0,
    [coinGeckoPrice.data, currentToToken?.tokenAddressOrDenom, currentToToken?.coinGeckoId, extensionStorage.currency, spotPriceData.data],
  );

  const { feeCoins, defaultGasRateKey } = useCurrentFeesSWR(selectedFromCosmosChain || COSMOS);

  const currentFeeToken = useMemo<IntegratedSwapFeeToken | undefined>(() => {
    if (currentFromChain?.line === COSMOS.line) {
      const baseFeeCoin = feeCoins[0];

      return {
        tokenAddressOrDenom: baseFeeCoin.baseDenom,
        decimals: baseFeeCoin.decimals,
        displayDenom: baseFeeCoin.displayDenom,
        coinGeckoId: baseFeeCoin.coinGeckoId,
        imageURL: baseFeeCoin.imageURL,
      };
    }

    if (currentFromChain?.line === ETHEREUM.line) {
      return {
        tokenAddressOrDenom: EVM_NATIVE_TOKEN_ADDRESS,
        decimals: currentFromChain.decimals,
        displayDenom: currentFromChain.displayDenom,
        coinGeckoId: currentFromChain.coinGeckoId,
        imageURL: currentFromChain.imageURL,
      };
    }
    return undefined;
  }, [currentFromChain.coinGeckoId, currentFromChain.decimals, currentFromChain.displayDenom, currentFromChain.imageURL, currentFromChain?.line, feeCoins]);

  const currentFeeTokenBalance = useMemo(() => {
    if (currentSwapAPI === 'skip' || currentSwapAPI === 'squid_cosmos') {
      return cosmosFromChainBalance.data?.balance?.find((item) => isEqualsIgnoringCase(item.denom, currentFeeToken?.tokenAddressOrDenom))?.amount || '0';
    }

    if (currentSwapAPI === '1inch' || currentSwapAPI === 'squid_evm') {
      return BigInt(currentFromEVMNativeBalance?.data?.result || '0').toString(10);
    }

    return '0';
  }, [currentSwapAPI, cosmosFromChainBalance.data?.balance, currentFeeToken?.tokenAddressOrDenom, currentFromEVMNativeBalance?.data?.result]);

  const currentFeeTokenPrice = useMemo(
    () =>
      (currentFeeToken?.coinGeckoId && coinGeckoPrice.data?.[currentFeeToken.coinGeckoId]?.[extensionStorage.currency]) ||
      spotPriceData.data?.[currentFeeToken?.tokenAddressOrDenom || ''] ||
      0,
    [coinGeckoPrice.data, currentFeeToken?.tokenAddressOrDenom, currentFeeToken?.coinGeckoId, extensionStorage.currency, spotPriceData.data],
  );

  const inputTokenAmountPrice = useMemo(() => times(inputDisplayAmount || '0', currentFromTokenPrice), [inputDisplayAmount, currentFromTokenPrice]);

  const { skipRoute, skipSwapVenueChain, memoizedSkipSwapAminoTx, skipSwapTx, skipSwapAminoTx, skipSwapSimulatedGas } = useSkipSwap(
    currentSwapAPI === 'skip' &&
      gt(currentInputBaseAmount, '0') &&
      currentFromChain &&
      currentToChain &&
      currentFromChain.line === 'COSMOS' &&
      currentToChain.line === 'COSMOS' &&
      currentFromToken &&
      currentToToken &&
      currentFeeToken
      ? {
          inputBaseAmount: currentInputBaseAmount,
          fromChain: currentFromChain,
          toChain: currentToChain,
          fromToken: currentFromToken,
          toToken: currentToToken,
          feeToken: currentFeeToken,
          slippage: currentSlippage,
        }
      : undefined,
  );

  const isNeedSquidFallbackAddress = useMemo(
    () =>
      (currentSwapAPI === 'squid_evm' && currentToChain?.line === 'COSMOS' && currentToChain.bip44.coinType !== `118'`) ||
      (currentSwapAPI === 'squid_cosmos' && currentFromChain.line === 'COSMOS' && currentFromChain.bip44.coinType !== `118'`),
    [currentFromChain, currentSwapAPI, currentToChain],
  );

  const squidSwapFallbackAddress = useMemo(
    () => (isNeedSquidFallbackAddress ? accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[OSMOSIS.id] : undefined),
    [accounts?.data, currentAccount.id, isNeedSquidFallbackAddress],
  );

  const {
    squidEthRoute,
    squidEthProcessingTime,
    squidEthSourceChainGasCosts,
    squidEthCrossChainFeeCosts,
    squidEthSourceChainFeeAmount,
    squidEthCrossChainFeeAmount,
    estimatedSquidEthFeePrice,
    allowance: squidAllowance,
    allowanceTx: squidAllowanceTx,
    allowanceTxBaseFee: squidAllowanceTxBaseFee,
    allowanceBaseEstimatedGas: squidAllowanceBaseEstimatedGas,
  } = useSquidSwap(
    currentSwapAPI === 'squid_evm' &&
      currentFromChain &&
      gt(currentInputBaseAmount, '0') &&
      currentToChain &&
      currentFromToken &&
      currentToToken &&
      currentToAddress
      ? {
          inputBaseAmount: currentInputBaseAmount,
          fromChain: currentFromChain,
          toChain: currentToChain,
          fromToken: currentFromToken,
          toToken: currentToToken,
          senderAddress: currentFromAddress,
          receiverAddress: currentToAddress,
          slippage: currentSlippage,
          fallbackAddress: squidSwapFallbackAddress,
        }
      : undefined,
  );

  const {
    squidCosmosRoute,
    squidCosmosProcessingTime,
    squidCosmosSourceChainGasCosts,
    squidCosmosCrossChainFeeCosts,
    squidCosmosSourceChainFeeAmount,
    squidCosmosCrossChainFeeAmount,
    estimatedSquidCosmosFeePrice,
    memoizedSquidSwapAminoTx,
    squidSwapSimulatedGas,
    squidSwapAminoTx,
  } = useSquidCosmosSwap(
    currentSwapAPI === 'squid_cosmos' &&
      currentFromChain &&
      currentToChain &&
      gt(currentInputBaseAmount, '0') &&
      currentFromToken &&
      currentToToken &&
      currentToAddress &&
      currentFeeToken &&
      currentFromChain.line === COSMOS.line
      ? {
          inputBaseAmount: currentInputBaseAmount,
          fromChain: currentFromChain,
          toChain: currentToChain,
          fromToken: currentFromToken,
          toToken: currentToToken,
          senderAddress: currentFromAddress,
          receiverAddress: currentToAddress,
          slippage: currentSlippage,
          feeToken: currentFeeToken,
          fallbackAddress: squidSwapFallbackAddress,
        }
      : undefined,
  );

  const squidSwap = useMemo(() => {
    if (currentSwapAPI === 'squid_evm') {
      return {
        squidRoute: squidEthRoute,
        squidProcessingTime: squidEthProcessingTime,
        squidSourceChainGasCosts: squidEthSourceChainGasCosts,
        squidCrossChainFeeCosts: squidEthCrossChainFeeCosts,
        squidSourceChainFeeAmount: squidEthSourceChainFeeAmount,
        squidCrossChainFeeAmount: squidEthCrossChainFeeAmount,
        estimatedSquidFeePrice: estimatedSquidEthFeePrice,
      };
    }
    if (currentSwapAPI === 'squid_cosmos') {
      return {
        squidRoute: squidCosmosRoute,
        squidProcessingTime: squidCosmosProcessingTime,
        squidSourceChainGasCosts: squidCosmosSourceChainGasCosts,
        squidCrossChainFeeCosts: squidCosmosCrossChainFeeCosts,
        squidSourceChainFeeAmount: squidCosmosSourceChainFeeAmount,
        squidCrossChainFeeAmount: squidCosmosCrossChainFeeAmount,
        estimatedSquidFeePrice: estimatedSquidCosmosFeePrice,
        squidSwapSimulatedGas,
        squidSwapAminoTx,
      };
    }
    return {};
  }, [
    currentSwapAPI,
    estimatedSquidCosmosFeePrice,
    estimatedSquidEthFeePrice,
    squidCosmosCrossChainFeeAmount,
    squidCosmosCrossChainFeeCosts,
    squidCosmosProcessingTime,
    squidCosmosRoute,
    squidCosmosSourceChainFeeAmount,
    squidCosmosSourceChainGasCosts,
    squidEthCrossChainFeeAmount,
    squidEthCrossChainFeeCosts,
    squidEthProcessingTime,
    squidEthRoute,
    squidEthSourceChainFeeAmount,
    squidEthSourceChainGasCosts,
    squidSwapAminoTx,
    squidSwapSimulatedGas,
  ]);

  const {
    oneInchRoute,
    allowance: oneInchAllowance,
    allowanceBaseEstimatedGas: oneInchAllowanceBaseEstimatedGas,
    allowanceTx: oneInchAllowanceTx,
    allowanceTxBaseFee: oneInchAllowanceTxBaseFee,
  } = useOneInchSwap(
    currentSwapAPI === '1inch' && currentFromChain && gt(currentInputBaseAmount, '0') && currentFromToken && currentToToken && currentFromAddress
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

    if (currentSwapAPI === 'squid_evm')
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

    if (currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') return squidSwap.squidRoute?.isValidating;

    if (currentSwapAPI === 'skip') return skipRoute.isValidating || skipSwapTx.isValidating;
    return false;
  }, [currentSwapAPI, oneInchRoute.isValidating, skipRoute.isValidating, skipSwapTx.isValidating, squidSwap.squidRoute?.isValidating]);

  const estimatedToTokenBaseAmount = useMemo(() => {
    if (currentSwapAPI === 'skip' && skipRoute.data?.amount_out) {
      return skipRoute.data?.amount_out;
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data?.toAmount) {
      return oneInchRoute.data?.toAmount;
    }

    if ((currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') && squidSwap.squidRoute?.data?.route.estimate.toAmount) {
      return squidSwap.squidRoute.data.route.estimate.toAmount;
    }

    return '0';
  }, [currentSwapAPI, oneInchRoute.data?.toAmount, skipRoute.data?.amount_out, squidSwap.squidRoute?.data?.route.estimate.toAmount]);

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
    if ((currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') && squidSwap.squidRoute?.data?.route.estimate.exchangeRate) {
      return squidSwap.squidRoute.data.route.estimate.exchangeRate;
    }
    return '0';
  }, [currentSwapAPI, estimatedToTokenDisplayAmount, inputDisplayAmount, squidSwap.squidRoute?.data?.route.estimate.exchangeRate]);

  const priceImpactPercent = useMemo(() => {
    if (currentSwapAPI === 'skip') {
      if (skipRoute.data?.swap_price_impact_percent) {
        return skipRoute.data.swap_price_impact_percent;
      }

      if (skipRoute.data?.usd_amount_in && skipRoute.data?.usd_amount_out) {
        return calcPriceImpact(skipRoute.data.usd_amount_in, skipRoute.data.usd_amount_out);
      }
    }

    if ((currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') && squidSwap.squidRoute?.data) {
      return squidSwap.squidRoute.data.route.estimate.aggregatePriceImpact;
    }

    return '0';
  }, [currentSwapAPI, skipRoute.data?.swap_price_impact_percent, skipRoute.data?.usd_amount_in, skipRoute.data?.usd_amount_out, squidSwap.squidRoute?.data]);

  const integratedEVMSwapTx = useMemo(() => {
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

      if (currentSwapAPI === 'squid_evm' && squidSwap.squidRoute?.data?.route.transactionRequest && currentFromChain.line === ETHEREUM.line) {
        return {
          from: currentFromAddress,
          to: squidSwap.squidRoute.data.route.transactionRequest.targetAddress,
          data: squidSwap.squidRoute.data.route.transactionRequest.data,
          value: toHex(squidSwap.squidRoute.data.route.transactionRequest.value, { addPrefix: true, isStringNumber: true }),
          gas: toHex(squidSwap.squidRoute.data.route.transactionRequest.gasLimit, { addPrefix: true, isStringNumber: true }),
        };
      }
    }

    return undefined;
  }, [
    currentFromAddress,
    currentFromChain.line,
    currentInputBaseAmount,
    currentSwapAPI,
    integratedAllowance?.allowance,
    oneInchRoute.data,
    squidSwap.squidRoute?.data,
  ]);

  const integratedCosmosSwapTx = useMemo(() => {
    if (currentSwapAPI === 'squid_cosmos' && squidSwap.squidRoute?.data) {
      return squidSwap.squidSwapAminoTx;
    }

    if (currentSwapAPI === 'skip') {
      return skipSwapAminoTx;
    }
    return undefined;
  }, [currentSwapAPI, skipSwapAminoTx, squidSwap.squidRoute?.data, squidSwap.squidSwapAminoTx]);

  const estimatedGas = useMemo(() => {
    if (currentSwapAPI === 'skip') {
      return skipSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS;
    }

    if (currentSwapAPI === 'squid_cosmos') {
      return squidSwapSimulatedGas || COSMOS_DEFAULT_SQUID_CONTRACT_SWAP_GAS;
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data) {
      return times(oneInchRoute.data.tx.gas, getDefaultAV(), 0);
    }

    if (currentSwapAPI === 'squid_evm' && squidSwap.squidRoute?.data?.route.transactionRequest?.gasLimit) {
      return squidSwap.squidRoute.data.route.transactionRequest.gasLimit;
    }

    return '0';
  }, [currentSwapAPI, oneInchRoute.data, skipSwapSimulatedGas, squidSwap.squidRoute?.data, squidSwapSimulatedGas]);

  const cosmosGasRate = useGasRateSWR(selectedFromCosmosChain || COSMOS);

  const estimatedFeeBaseAmount = useMemo(() => {
    if (currentSwapAPI === 'skip' && selectedFromCosmosChain) {
      return ceil(
        times(
          estimatedGas,
          cosmosGasRate.data.gasRate[currentFeeToken?.tokenAddressOrDenom || selectedFromCosmosChain.baseDenom]?.[defaultGasRateKey] ||
            selectedFromCosmosChain.gasRate.low,
        ),
      );
    }

    if (currentSwapAPI === '1inch' && oneInchRoute.data) {
      return times(estimatedGas, oneInchRoute.data.tx.gasPrice);
    }

    if (currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') {
      return plus(squidSwap.squidSourceChainFeeAmount || '0', squidSwap.squidCrossChainFeeAmount || '0');
    }

    return '0';
  }, [
    cosmosGasRate.data.gasRate,
    currentFeeToken?.tokenAddressOrDenom,
    currentSwapAPI,
    defaultGasRateKey,
    estimatedGas,
    oneInchRoute.data,
    selectedFromCosmosChain,
    squidSwap.squidCrossChainFeeAmount,
    squidSwap.squidSourceChainFeeAmount,
  ]);

  const estimatedFeeDisplayAmount = useMemo(
    () => toDisplayDenomAmount(estimatedFeeBaseAmount, currentFeeToken?.decimals || 0),
    [currentFeeToken?.decimals, estimatedFeeBaseAmount],
  );

  const estimatedFeePrice = useMemo(() => {
    if (currentSwapAPI === 'skip' || currentSwapAPI === '1inch') {
      return times(estimatedFeeDisplayAmount, currentFeeTokenPrice);
    }

    if (currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') {
      return squidSwap?.estimatedSquidFeePrice || '0';
    }

    return '0';
  }, [currentFeeTokenPrice, currentSwapAPI, estimatedFeeDisplayAmount, squidSwap?.estimatedSquidFeePrice]);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentFromTokenDisplayBalance, estimatedFeeDisplayAmount);

    if (isEqualsIgnoringCase(currentFromToken?.tokenAddressOrDenom, currentFeeToken?.tokenAddressOrDenom)) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }
    return currentFromTokenDisplayBalance;
  }, [currentFromTokenDisplayBalance, estimatedFeeDisplayAmount, currentFromToken?.tokenAddressOrDenom, currentFeeToken?.tokenAddressOrDenom]);

  const swapAssetInfo = useCallback(() => {
    const tmpFromToken = currentFromToken;
    const tmpFromChain = currentFromChain;

    if (currentFromChain.id !== currentToChain?.id && currentToChain) {
      setCurrentFromChain(currentToChain);
      setCurrentToChain(tmpFromChain);
    }

    setCurrentFromToken(currentToToken);
    setCurrentToToken(tmpFromToken);

    setInputDisplayAmount('');
  }, [currentFromChain, currentFromToken, currentToChain, currentToToken]);

  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  const sendSwapTx = useCallback(async () => {
    if ((currentSwapAPI === '1inch' || currentSwapAPI === 'squid_evm') && integratedEVMSwapTx) {
      await enQueue({
        messageId: '',
        origin: '',
        channel: 'inApp',
        message: {
          method: 'eth_sendTransaction',
          params: [
            {
              ...integratedEVMSwapTx,
            },
          ],
        },
      });

      if (currentAccount.type === 'LEDGER') {
        await debouncedOpenTab();
      }
    }

    if ((currentSwapAPI === 'skip' || currentSwapAPI === 'squid_cosmos') && integratedCosmosSwapTx && selectedFromCosmosChain && currentFeeToken) {
      await enQueue({
        messageId: '',
        origin: '',
        channel: 'inApp',
        message: {
          method: 'cos_signAmino',
          params: {
            chainName: selectedFromCosmosChain.chainName,
            doc: {
              ...integratedCosmosSwapTx,
              fee: { amount: [{ denom: currentFeeToken.tokenAddressOrDenom, amount: estimatedFeeBaseAmount }], gas: estimatedGas },
            },
            isEditFee: false,
            isEditMemo: true,
            isCheckBalance: true,
          },
        },
      });
    }
  }, [
    currentAccount.type,
    currentFeeToken,
    currentSwapAPI,
    enQueue,
    estimatedFeeBaseAmount,
    estimatedGas,
    integratedCosmosSwapTx,
    integratedEVMSwapTx,
    selectedFromCosmosChain,
  ]);

  const errorMessage = useMemo(() => {
    if (!filteredFromChains.length || !filteredToChains.length || (currentSwapAPI && (!filteredFromTokenList.length || !filteredToTokenList.length))) {
      return t('pages.Wallet.Swap.entry.networkError');
    }
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentFromTokenDisplayBalance, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }

    if (isEqualsIgnoringCase(currentFromToken?.tokenAddressOrDenom, currentFeeToken?.tokenAddressOrDenom)) {
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
      if (!integratedEVMSwapTx) {
        return t('pages.Wallet.Swap.entry.invalidSwapTx');
      }
    }

    if (currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') {
      if (gt(estimatedToTokenDisplayAmountPrice, '100000')) {
        return t('pages.Wallet.Swap.entry.oversizedSwap');
      }

      if (currentSwapAPI === 'squid_evm') {
        if (!integratedEVMSwapTx) {
          return t('pages.Wallet.Swap.entry.invalidSwapTx');
        }
      }

      if (currentSwapAPI === 'squid_cosmos') {
        if (!integratedCosmosSwapTx) {
          return t('pages.Wallet.Swap.entry.invalidSwapTx');
        }
      }
    }

    if (!gt(estimatedToTokenDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidOutputAmount');
    }
    return '';
  }, [
    filteredFromChains.length,
    filteredToChains.length,
    currentSwapAPI,
    filteredFromTokenList.length,
    filteredToTokenList.length,
    inputDisplayAmount,
    currentFromTokenDisplayBalance,
    currentFromToken?.tokenAddressOrDenom,
    currentFeeToken?.tokenAddressOrDenom,
    estimatedFeeBaseAmount,
    currentFeeTokenBalance,
    estimatedToTokenDisplayAmount,
    t,
    integratedCosmosSwapTx,
    currentFromTokenBalance,
    currentInputBaseAmount,
    skipSupportedChains,
    skipRoute.data?.txs_required,
    skipRoute.error?.response?.data.message,
    skipSwapTx.error?.response?.data.message,
    skipSwapAminoTx,
    integratedEVMSwapTx,
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

  const noticeMessage = useMemo(() => {
    if (isNeedSquidFallbackAddress) {
      return t('pages.Wallet.Swap.entry.squidSwapNoticeDescription');
    }

    return '';
  }, [isNeedSquidFallbackAddress, t]);

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

      if (currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') {
        if (gt(estimatedToTokenDisplayAmountPrice, '100000')) {
          return t('pages.Wallet.Swap.entry.txSizeWarning');
        }
        if (gt(priceImpactPercent, '3')) {
          return t('pages.Wallet.Swap.entry.liquidityWarning');
        }
        if (squidSwap.squidRoute?.error) {
          return squidSwap.squidRoute.error.errors?.map(({ message }) => message).join('\n');
        }

        if (!errorMessage && !isDisabled) {
          return t('pages.Wallet.Swap.entry.receiveWarningMessage');
        }
      }

      if (currentSwapAPI === 'skip') {
        if (gt(priceImpactPercent, '3')) {
          return t('pages.Wallet.Swap.entry.liquidityWarning');
        }
        if (skipRoute.data?.txs_required && skipRoute.data?.txs_required > 1) {
          return t('pages.Wallet.Swap.entry.multiTxSwap');
        }
        if (skipRoute.data?.warning) {
          return skipRoute.data.warning.message;
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

      if (currentFeeToken && isEqualsIgnoringCase(currentFromToken?.tokenAddressOrDenom, currentFeeToken.tokenAddressOrDenom)) {
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
    currentFromToken?.tokenAddressOrDenom,
    t,
    skipRoute.data,
    oneInchRoute.error,
    estimatedToTokenDisplayAmountPrice,
    priceImpactPercent,
    squidSwap.squidRoute?.error,
    errorMessage,
    isDisabled,
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

  const isSwapButtonDisabled = useMemo(
    () =>
      !!errorMessage ||
      isDisabled ||
      isLoadingSwapData ||
      (currentSwapAPI === 'skip' || currentSwapAPI === 'squid_cosmos' ? !integratedCosmosSwapTx : !integratedEVMSwapTx),
    [currentSwapAPI, errorMessage, integratedCosmosSwapTx, integratedEVMSwapTx, isDisabled, isLoadingSwapData],
  );

  const isNoticeButtonEnabled = useMemo(() => !!noticeMessage && !isSwapButtonDisabled, [noticeMessage, isSwapButtonDisabled]);

  const isAllowanceButtonEnabled = useMemo(
    () =>
      (currentSwapAPI === '1inch' || currentSwapAPI === 'squid_evm') &&
      integratedAllowance?.allowance &&
      !gt(integratedAllowance.allowance, currentInputBaseAmount) &&
      integratedAllowance.allowanceTx,
    [currentInputBaseAmount, currentSwapAPI, integratedAllowance?.allowance, integratedAllowance?.allowanceTx],
  );

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedSkipSwapAminoTx, memoizedSquidSwapAminoTx]);

  useEffect(() => {
    if (currentFromChain && !currentToChain) {
      setCurrentToChain(filteredToChains.find((item) => item.id === currentFromChain.id) || filteredToChains[0]);
    }

    if (currentToChain && filteredToChains.filter((item) => item.isUnavailable).find((item) => item.id === currentToChain.id)) {
      if (currentFromChain.line === COSMOS.line) {
        setCurrentToChain(filteredToChains.find((item) => item.id === currentFromChain.id) || filteredToChains[0]);
      } else {
        setCurrentToChain(filteredToChains[0]);
      }
    }
  }, [filteredFromChains, filteredToChains, currentSwapAPI, currentFromChain, currentToChain]);

  useEffect(() => {
    if (!currentFromChain || !currentToChain) {
      setCurrentSwapAPI(undefined);
    }

    if (currentFromChain.line === COSMOS.line && currentToChain?.line === COSMOS.line) {
      if (
        squidCosmosChains.find((item) => item.id === currentToChain?.id) &&
        skipSwapChains.find((item) => item.id === currentToChain?.id) &&
        squidCosmosChains.find((item) => item.id === currentFromChain?.id) &&
        skipSwapChains.find((item) => item.id === currentFromChain?.id)
      ) {
        setCurrentSwapAPI('skip');
      }
      if (
        (squidCosmosChains.find((item) => item.id === currentToChain?.id) && !skipSwapChains.find((item) => item.id === currentToChain?.id)) ||
        (squidCosmosChains.find((item) => item.id === currentFromChain?.id) && !skipSwapChains.find((item) => item.id === currentFromChain?.id))
      ) {
        setCurrentSwapAPI('squid_cosmos');
      }
      if (
        (!squidCosmosChains.find((item) => item.id === currentToChain?.id) && skipSwapChains.find((item) => item.id === currentToChain?.id)) ||
        (!squidCosmosChains.find((item) => item.id === currentFromChain?.id) && skipSwapChains.find((item) => item.id === currentFromChain?.id))
      ) {
        setCurrentSwapAPI('skip');
      }
    }

    if (currentFromChain?.line === ETHEREUM.line && currentToChain?.line === ETHEREUM.line) {
      if (
        currentFromChain?.id === currentToChain?.id &&
        supportedSwapChains.data?.oneInch.evm.send.find((sendChain) => sendChain.chainId === currentFromChain?.chainId) &&
        supportedSwapChains.data?.oneInch.evm.receive.find((receiveChain) => receiveChain.chainId === currentToChain?.chainId)
      ) {
        setCurrentSwapAPI('1inch');
      }

      if (
        currentFromChain?.id !== currentToChain?.id &&
        squidEVMChains.find((item) => item.id === currentFromChain?.id) &&
        squidEVMChains.find((item) => item.id === currentToChain?.id)
      ) {
        setCurrentSwapAPI('squid_evm');
      }
    }

    if (currentFromChain?.line === ETHEREUM.line && currentToChain?.line === COSMOS.line) {
      setCurrentSwapAPI('squid_evm');
    }

    if (currentFromChain?.line === COSMOS.line && currentToChain?.line === ETHEREUM.line) {
      setCurrentSwapAPI('squid_cosmos');
    }
  }, [
    currentFromChain,
    currentToChain,
    skipSwapChains,
    squidCosmosChains,
    squidEVMChains,
    supportedSwapChains.data?.oneInch.evm.receive,
    supportedSwapChains.data?.oneInch.evm.send,
  ]);

  useEffect(() => {
    if (!filteredFromTokenList.find((item) => item.tokenAddressOrDenom === currentFromToken?.tokenAddressOrDenom && item.name === currentFromToken.name)) {
      if ((currentSwapAPI === 'skip' || currentSwapAPI === 'squid_cosmos') && currentFromChain.line === COSMOS.line) {
        setCurrentFromToken(filteredFromTokenList.find((item) => item.displayDenom === currentFromChain.displayDenom) || filteredFromTokenList[0]);
      }
      if ((currentSwapAPI === '1inch' || currentSwapAPI === 'squid_evm') && currentFromChain.line === ETHEREUM.line) {
        setCurrentFromToken(filteredFromTokenList[0]);
      }
    }

    if (!filteredToTokenList.find((item) => item.tokenAddressOrDenom === currentToToken?.tokenAddressOrDenom && item.name === currentToToken.name)) {
      if (currentSwapAPI === '1inch') {
        setCurrentToToken(filteredToTokenList.find((item) => item.displayDenom.includes('USDT')));
      }
      if (currentSwapAPI === 'squid_evm') {
        setCurrentToToken(filteredToTokenList[0]);
      }
      if (currentSwapAPI === 'skip' || currentSwapAPI === 'squid_cosmos') {
        if (currentFromChain.id === currentToChain?.id && filteredToTokenList[1]) {
          setCurrentToToken(filteredToTokenList[1]);
        } else {
          setCurrentToToken(filteredToTokenList[0]);
        }
      }
    }

    if (currentSwapAPI === 'skip' || currentSwapAPI === 'squid_cosmos') {
      if (
        currentFromChain.id === currentToChain?.id &&
        currentFromToken?.tokenAddressOrDenom === currentToToken?.tokenAddressOrDenom &&
        filteredToTokenList.length > 1
      ) {
        setCurrentToToken(filteredToTokenList.filter((item) => item.tokenAddressOrDenom !== currentToToken?.tokenAddressOrDenom)[0]);
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
      if (currentSwapAPI === 'squid_evm') {
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
  }, [currentChain.line, currentFromChain, setCurrentChain, setCurrentEthereumNetwork]);

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
                if (currentFromChain.id === currentToChain?.id && isEqualsIgnoringCase(clickedCoin.tokenAddressOrDenom, currentToToken?.tokenAddressOrDenom)) {
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
                if (
                  currentFromChain.id === currentToChain?.id &&
                  isEqualsIgnoringCase(clickedCoin.tokenAddressOrDenom, currentFromToken?.tokenAddressOrDenom)
                ) {
                  void swapAssetInfo();
                } else {
                  setCurrentToToken(clickedCoin);
                }
              }}
              availableChainList={filteredToChains}
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

              {currentSwapAPI !== '1inch' && (
                <SwapInfoBodyTextContainer>
                  <SwapInfoBodyLeftContainer>
                    <Typography variant="h6">{t('pages.Wallet.Swap.entry.priceImpact')}</Typography>
                  </SwapInfoBodyLeftContainer>
                  <SwapInfoBodyRightContainer>
                    {isLoadingSwapData ? (
                      <Skeleton width="4rem" height="1.5rem" />
                    ) : priceImpactPercent !== '0' ? (
                      <SwapInfoBodyRightTextContainer data-is-invalid={gt(priceImpactPercent, '3')}>
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
              )}

              {(currentSwapAPI === 'skip' || currentSwapAPI === '1inch') && (
                <SwapInfoBodyTextContainer>
                  <SwapInfoBodyLeftContainer>
                    <Typography variant="h6">{t('pages.Wallet.Swap.entry.gasFee')}</Typography>
                  </SwapInfoBodyLeftContainer>
                  <SwapInfoBodyRightContainer>
                    {isLoadingSwapData ? (
                      <Skeleton width="4rem" height="1.5rem" />
                    ) : gt(estimatedFeeDisplayAmount, '0') && debouncedInputDisplayAmount ? (
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

              {(currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') && (
                <>
                  <SwapInfoBodyTextContainer>
                    <SwapInfoBodyLeftContainer>
                      <Typography variant="h6">{t('pages.Wallet.Swap.entry.gasFees')}</Typography>
                      <GasInfoStyledTooltip
                        title={
                          <StyledTooltipTitleContainer>
                            <Typography variant="h7">{t('pages.Wallet.Swap.entry.gasFeesInfo')}</Typography>
                            <StyledTooltipBodyContainer>
                              <ChainFeeInfo title="Source Chain Gas" feeInfo={squidSwap.squidSourceChainGasCosts} isTildeAmount />
                              <ChainFeeInfo title="Cross-Chain fees" feeInfo={squidSwap.squidCrossChainFeeCosts} />
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
                      ) : gt(squidSwap.squidProcessingTime || '0', '0') ? (
                        <SwapInfoBodyRightTextContainer>
                          <Typography variant="h6n">{`~ ${String(parseFloat(fix(squidSwap.squidProcessingTime || '0', 2)))}`}</Typography>
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
          {isAllowanceButtonEnabled ? (
            <Tooltip varient="error" title={allowanceErrorMessage} placement="top" arrow>
              <div>
                <Button
                  Icon={Permission16Icon}
                  type="button"
                  disabled={!integratedAllowance?.allowanceTx || !!allowanceErrorMessage}
                  onClick={async () => {
                    if ((currentSwapAPI === '1inch' || currentSwapAPI === 'squid_evm') && integratedAllowance?.allowanceTx) {
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
                  disabled={isSwapButtonDisabled}
                  onClick={async () => {
                    if (isNoticeButtonEnabled) {
                      setIsOpenNoticeBottomSheet(true);
                      return;
                    }

                    await sendSwapTx();
                  }}
                >
                  <ButtonTextIconContaier>
                    {language === 'ko' ? (
                      <>
                        {currentSwapAPI === 'skip' && <SkipLogoIcon />}
                        {currentSwapAPI === '1inch' && <OneInchLogoIcon />}
                        {(currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') && <SquidLogoIcon />}
                        {currentSwapAPI ? t('pages.Wallet.Swap.entry.swapButtonOn') : t('pages.Wallet.Swap.entry.swapButton')}
                      </>
                    ) : (
                      <>
                        {currentSwapAPI ? t('pages.Wallet.Swap.entry.swapButtonOn') : t('pages.Wallet.Swap.entry.swapButton')}
                        {currentSwapAPI === 'skip' && <SkipLogoIcon />}
                        {currentSwapAPI === '1inch' && <OneInchLogoIcon />}
                        {(currentSwapAPI === 'squid_evm' || currentSwapAPI === 'squid_cosmos') && <SquidLogoIcon />}
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
      <NoticeBottomSheet
        open={isOpenNoticeBottomSheet}
        onClose={() => setIsOpenNoticeBottomSheet(false)}
        onClickConfirm={async () => {
          await sendSwapTx();
        }}
      >
        <NoticeTextContainer>
          <Typography variant="h5" sx={{ lineHeight: '2rem' }}>
            {noticeMessage}
          </Typography>
        </NoticeTextContainer>
        <NoticeAddressContainer>
          <NoticeAddressHeaderContainer>
            <NoticeAddressHeaderImageContainer>
              <Image src={OSMOSIS.imageURL} />
            </NoticeAddressHeaderImageContainer>
            <Typography variant="h6">{t('pages.Wallet.Swap.entry.osmosisFallbackAddress')}</Typography>
          </NoticeAddressHeaderContainer>
          <NoticeAddressBottomContainer>
            <Typography variant="h6">{squidSwapFallbackAddress}</Typography>
          </NoticeAddressBottomContainer>
        </NoticeAddressContainer>
      </NoticeBottomSheet>
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
