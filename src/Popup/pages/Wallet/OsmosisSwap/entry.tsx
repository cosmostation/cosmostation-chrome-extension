import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { Typography } from '@mui/material';

import { COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { usePoolsAssetSWR } from '~/Popup/hooks/osmoSwap/SWR/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/osmoSwap/SWR/usePoolsSWR';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, lt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { calcOutGivenIn, calcSpotPrice, decimalScaling } from '~/Popup/utils/osmosis';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { AssetV3 } from '~/types/cosmos/asset';

import CoinListBottomSheet from './components/CoinListBottomSheet';
import SlippageSettingDialog from './components/SlippageSettingDialog';
import {
  BackButton,
  BottomContainer,
  Container,
  MaxButton,
  SideButton,
  StyledInput,
  SwapCoinBodyContainer,
  SwapCoinBodyLeftButton,
  SwapCoinBodyLeftHeaderContainer,
  SwapCoinBodyLeftImageContainer,
  SwapCoinBodyLeftInfoContainer,
  SwapCoinBodyLeftSubTitleContainer,
  SwapCoinBodyLeftTitleContainer,
  SwapCoinBodyRightContainer,
  SwapCoinBodyRightHeaderContainer,
  SwapCoinBodyRightSubTitleContainer,
  SwapCoinBodyRightTitleContainer,
  SwapCoinContainer,
  SwapCoinHeaderContainer,
  SwapContainer,
  SwapIconButton,
  SwapInfoBodyContainer,
  SwapInfoBodyLeftContainer,
  SwapInfoBodyRightContainer,
  SwapInfoBodyRightTextContainer,
  SwapInfoBodyTextContainer,
  SwapInfoContainer,
  SwapInfoHeaderContainer,
  TextContainer,
  TopContainer,
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';
import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';
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
  const { navigateBack } = useNavigate();
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const accounts = useAccounts(true);

  const { enQueue } = useCurrentQueue();
  const nodeInfo = useNodeInfoSWR(chain);
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;
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

  const [isOpenedInputCoinList, setIsOpenedInputCoinList] = useState(false);
  const [isOpenedOutputCoinList, setIsOpenedOutputCoinList] = useState(false);

  const inputCoinPrice = useMemo(
    () => (inputCoin?.coinGeckoId && coinGeckoPrice.data?.[inputCoin?.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [extensionStorage.currency, coinGeckoPrice.data, inputCoin?.coinGeckoId],
  );
  const outputCoinPrice = useMemo(
    () => (outputCoin?.coinGeckoId && coinGeckoPrice.data?.[outputCoin?.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [extensionStorage.currency, coinGeckoPrice.data, outputCoin?.coinGeckoId],
  );

  const inputCoinAmountPrice = useMemo(() => times(inputDisplayAmount || '0', inputCoinPrice), [inputDisplayAmount, inputCoinPrice]);

  const outputCoinAmountPrice = useMemo(() => times(currentOutputDisplayAmount || '0', outputCoinPrice), [currentOutputDisplayAmount, outputCoinPrice]);

  const memoizedSwapAminoTx = useMemo(() => {
    if (inputDisplayAmount && account.data?.value.account_number) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.default_node_info?.network ?? chain.chainId,
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
    nodeInfo.data?.default_node_info?.network,
    outputCoinBaseDenom,
    tokenOutMinAmount,
  ]);

  const [swapAminoTx] = useDebounce(memoizedSwapAminoTx, 700);

  const swapProtoTx = useMemo(() => {
    if (swapAminoTx) {
      const pTx = protoTx(swapAminoTx, [Buffer.from(new Uint8Array(64)).toString('base64')], { type: getPublicKeyType(chain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : null;
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

  const errorMessage = useMemo(() => {
    if (!poolData.data || !poolsAssetData.data) {
      return t('pages.Wallet.OsmosisSwap.entry.networkError');
    }
    if (gt(currentInputBaseAmount, tokenBalanceIn || '0')) {
      return t('pages.Wallet.OsmosisSwap.entry.excessiveSwap');
    }
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.OsmosisSwap.entry.invalidAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, inputDisplayAmount)) {
      return t('pages.Wallet.OsmosisSwap.entry.insufficientAmount');
    }
    if (inputCoin?.denom === currentFeeCoin.baseDenom) {
      if (!gte(currentInputCoinDisplayAvailableAmount, plus(inputDisplayAmount, currentDisplayFeeAmount))) {
        return t('pages.Wallet.OsmosisSwap.entry.insufficientAmount');
      }
      if (!gte(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.Wallet.OsmosisSwap.entry.insufficientFeeAmount');
      }
    }
    if (gt(priceImpactPercent, 10)) {
      return t('pages.Wallet.OsmosisSwap.entry.invalidPriceImpact');
    }
    if (!gt(currentOutputDisplayAmount, 0)) {
      return t('pages.Wallet.OsmosisSwap.entry.invalidOutputAmount');
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

  return (
    <>
      <Container>
        <TopContainer>
          <BackButton onClick={() => navigateBack()}>
            <LeftArrow16Icon />
          </BackButton>
          <TextContainer>
            <Typography variant="h3">{t('pages.Wallet.OsmosisSwap.entry.title')}</Typography>
          </TextContainer>
          <SideButton onClick={() => setIsOpenSlippageDialog(true)}>
            <Management24Icon />
          </SideButton>
        </TopContainer>
        <SwapContainer>
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinBodyLeftHeaderContainer>
                <Typography variant="h6">Input Coin</Typography>
              </SwapCoinBodyLeftHeaderContainer>
              <SwapCoinBodyRightHeaderContainer>
                <Typography variant="h6"> {t('pages.Wallet.OsmosisSwap.entry.availableAmount')} :</Typography>
                &nbsp;
                <Tooltip title={currentInputCoinDisplayAvailableAmount} arrow placement="top">
                  <span>
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(inputCoin?.decimals)}>
                      {currentInputCoinDisplayAvailableAmount}
                    </NumberText>
                  </span>
                </Tooltip>
                <MaxButton
                  onClick={() => {
                    setInputDisplayAmount(maxDisplayAmount);
                  }}
                >
                  <Typography variant="h6">MAX</Typography>
                </MaxButton>
              </SwapCoinBodyRightHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinBodyContainer>
              <SwapCoinBodyLeftButton onClick={() => setIsOpenedInputCoinList(true)} data-is-active={isOpenedInputCoinList}>
                <SwapCoinBodyLeftImageContainer>
                  <Image src={inputCoin?.image || chain.imageURL} />
                </SwapCoinBodyLeftImageContainer>
                <SwapCoinBodyLeftInfoContainer>
                  <SwapCoinBodyLeftTitleContainer>
                    <Typography variant="h4">{inputCoin?.symbol || chain.displayDenom}</Typography>
                  </SwapCoinBodyLeftTitleContainer>
                  <SwapCoinBodyLeftSubTitleContainer>
                    <Typography variant="h6">{inputCoin?.chainName || chain.chainName}</Typography>
                  </SwapCoinBodyLeftSubTitleContainer>
                </SwapCoinBodyLeftInfoContainer>
                <BottomArrow24Icon />
              </SwapCoinBodyLeftButton>
              <SwapCoinBodyRightContainer>
                <SwapCoinBodyRightTitleContainer>
                  <StyledInput
                    placeholder="0"
                    value={inputDisplayAmount}
                    onChange={(e) => {
                      if (!isDecimal(e.currentTarget.value, inputCoin?.decimals || 0) && e.currentTarget.value) {
                        return;
                      }

                      if (gt(e.currentTarget.value || '0', maxDisplayAmount)) {
                        setInputDisplayAmount(maxDisplayAmount);
                      } else {
                        setInputDisplayAmount(e.currentTarget.value);
                      }
                    }}
                  />
                </SwapCoinBodyRightTitleContainer>
                <SwapCoinBodyRightSubTitleContainer>
                  {inputCoinAmountPrice && inputDisplayAmount && (
                    <NumberText typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                      {inputCoinAmountPrice}
                    </NumberText>
                  )}
                </SwapCoinBodyRightSubTitleContainer>
              </SwapCoinBodyRightContainer>
            </SwapCoinBodyContainer>
          </SwapCoinContainer>
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinBodyLeftHeaderContainer>
                <Typography variant="h6">Output Coin</Typography>
              </SwapCoinBodyLeftHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinBodyContainer>
              <SwapCoinBodyLeftButton onClick={() => setIsOpenedOutputCoinList(true)} data-is-active={isOpenedOutputCoinList}>
                <SwapCoinBodyLeftImageContainer>
                  <Image src={outputCoin?.image} />
                </SwapCoinBodyLeftImageContainer>
                <SwapCoinBodyLeftInfoContainer>
                  <SwapCoinBodyLeftTitleContainer>
                    <Typography variant="h4">{outputCoin?.symbol}</Typography>
                  </SwapCoinBodyLeftTitleContainer>
                  <SwapCoinBodyLeftSubTitleContainer>
                    <Typography variant="h6">{outputCoin?.chainName}</Typography>
                  </SwapCoinBodyLeftSubTitleContainer>
                </SwapCoinBodyLeftInfoContainer>
                <BottomArrow24Icon />
              </SwapCoinBodyLeftButton>
              <SwapCoinBodyRightContainer>
                <SwapCoinBodyRightTitleContainer data-is-active={currentOutputDisplayAmount !== '0'}>
                  <Tooltip title={currentOutputDisplayAmount} arrow placement="top">
                    <span>
                      <NumberText typoOfIntegers="h4n" fixed={currentOutputDisplayAmount !== '0' ? getDisplayMaxDecimals(outputCoin?.decimals) : 0}>
                        {currentOutputDisplayAmount}
                      </NumberText>
                    </span>
                  </Tooltip>
                </SwapCoinBodyRightTitleContainer>
                <SwapCoinBodyRightSubTitleContainer>
                  {outputCoinAmountPrice && inputDisplayAmount && (
                    <NumberText typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                      {outputCoinAmountPrice}
                    </NumberText>
                  )}
                </SwapCoinBodyRightSubTitleContainer>
              </SwapCoinBodyRightContainer>
            </SwapCoinBodyContainer>
          </SwapCoinContainer>
          <SwapIconButton onClick={swapCoin}>
            <SwapIcon />
          </SwapIconButton>
        </SwapContainer>
        <SwapInfoContainer>
          <SwapInfoHeaderContainer>
            <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(inputCoin?.decimals)}>
              1
            </NumberText>
            &nbsp;
            <Typography variant="h6n">{inputCoin?.symbol} ≈</Typography>
            &nbsp;
            <Tooltip title={outputAmountOf1Coin} arrow placement="top">
              <span>
                <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(outputCoin?.decimals)}>
                  {outputAmountOf1Coin}
                </NumberText>
              </span>
            </Tooltip>
            &nbsp;
            <Typography variant="h6n">{outputCoin?.symbol}</Typography>
          </SwapInfoHeaderContainer>
          <SwapInfoBodyContainer>
            <SwapInfoBodyTextContainer>
              <SwapInfoBodyLeftContainer>
                <Typography variant="h6">{t('pages.Wallet.OsmosisSwap.entry.priceImpact')}</Typography>
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
                  {t('pages.Wallet.OsmosisSwap.entry.swapFee')} ({times(swapFeeRate, 100)}%)
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
                <Typography variant="h6">{t('pages.Wallet.OsmosisSwap.entry.expectedOutput')}</Typography>
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
                  {t('pages.Wallet.OsmosisSwap.entry.minimumReceived')} ({currentSlippage}%)
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
          </SwapInfoBodyContainer>
        </SwapInfoContainer>
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
                {t('pages.Wallet.OsmosisSwap.entry.swapButton')}
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
      <CoinListBottomSheet
        currentSelectedCoin={inputCoin}
        availableCoinList={availableSwapCoinList}
        open={isOpenedInputCoinList}
        onClose={() => setIsOpenedInputCoinList(false)}
        onClickCoin={(clickedCoin) => {
          setInputDisplayAmount('');
          setInputCoinBaseDenom(clickedCoin.denom);
        }}
      />
      <CoinListBottomSheet
        currentSelectedCoin={outputCoin}
        availableCoinList={availableSwapOutputCoinList}
        open={isOpenedOutputCoinList}
        onClose={() => setIsOpenedOutputCoinList(false)}
        onClickCoin={(clickedCoin) => setOutputCoinBaseDenom(clickedCoin.denom)}
      />
      );
    </>
  );
}
