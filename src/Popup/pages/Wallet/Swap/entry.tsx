import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { Typography } from '@mui/material';

import { COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { convertAssetNameToCosmos, getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { calcSpotPrice } from '~/Popup/utils/osmosis';
import { protoTx } from '~/Popup/utils/proto';
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
  SwapCoinContainer,
  SwapCoinHeaderContainer,
  SwapCoinLeftButton,
  SwapCoinLeftHeaderContainer,
  SwapCoinLeftIcon,
  SwapCoinLeftImageContainer,
  SwapCoinLeftInfoContainer,
  SwapCoinLeftSubTitleContainer,
  SwapCoinLeftTitleContainer,
  SwapCoinRightContainer,
  SwapCoinRightHeaderContainer,
  SwapCoinRightSubTitleContainer,
  SwapCoinRightTitleContainer,
  SwapContainer,
  SwapIconButton,
  SwapInfoContainer,
  SwapInfoHeaderContainer,
  SwapInfoSubContainer,
  SwapInfoSubLeftContainer,
  SwapInfoSubRightContainer,
  SwapInfoSubRightTextContainer,
  SwapInfoSubTextContainer,
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

export default function Entry({ chain }: EntryProps) {
  const { t } = useTranslation();
  const { navigateBack } = useNavigate();
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

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const poolsAssetData = usePoolsAssetSWR(chain.chainName.toLowerCase());
  const poolDenomList = poolsAssetData.data ? [...poolsAssetData.data.map((item) => item.adenom), ...poolsAssetData.data.map((item) => item.bdenom)] : [];
  const uniquePoolDenomList = poolDenomList.filter((denom, idx, arr) => arr.findIndex((item) => item === denom) === idx);

  const [inputCoinBaseDenom, setInputCoinBaseDenom] = useState<string>(chain.baseDenom);
  const [outputCoinBaseDenom, setOutputCoinBaseDenom] = useState<string>('');

  const currentPool = useMemo(
    () =>
      poolsAssetData.data?.find(
        (item) =>
          (item.adenom === outputCoinBaseDenom && item.bdenom === inputCoinBaseDenom) ||
          (item.adenom === inputCoinBaseDenom && item.bdenom === outputCoinBaseDenom),
      ),
    [inputCoinBaseDenom, outputCoinBaseDenom, poolsAssetData.data],
  );

  const availableSwapCoinList: ChainAssetInfo[] = useMemo(() => {
    const swapCoinList =
      currentChainAssets.data
        .filter((item) => uniquePoolDenomList.includes(item.denom))
        .map((item) => ({
          ...item,
          chainName: convertAssetNameToCosmos(item.prevChain || item.origin_chain)?.chainName || getCapitalize(item.prevChain || item.origin_chain),
          availableAmount: balance.data?.balance ? balance.data?.balance.find((coin) => coin.denom === item.denom)?.amount : '0',
        })) || [];

    const sortedAvailableSwapCoinList = [
      ...swapCoinList.filter((item) => gt(item?.availableAmount || 0, 0) && (item.type === 'staking' || item.type === 'native')),
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
          (item) => (item.adenom === coin.denom && item.bdenom === inputCoinBaseDenom) || (item.adenom === inputCoinBaseDenom && item.bdenom === coin.denom),
        ),
      ),
    [availableSwapCoinList, inputCoinBaseDenom, poolsAssetData.data],
  );

  const inputCoin = useMemo(() => availableSwapCoinList.find((item) => item.denom === inputCoinBaseDenom), [availableSwapCoinList, inputCoinBaseDenom]);
  const outputCoin = useMemo(
    () => availableSwapOutputCoinList.find((item) => item.denom === outputCoinBaseDenom),
    [availableSwapOutputCoinList, outputCoinBaseDenom],
  );

  const currentInputBaseAmount = useMemo(() => toBaseDenomAmount(inputDisplayAmount || 0, inputCoin?.decimals || 0), [inputCoin?.decimals, inputDisplayAmount]);

  useEffect(() => {
    if (!outputCoin) {
      setOutputCoinBaseDenom(availableSwapOutputCoinList[0]?.denom);
    }
  }, [availableSwapOutputCoinList, outputCoin, outputCoinBaseDenom]);

  const currentPoolId = useMemo(() => currentPool?.id, [currentPool?.id]);

  const poolsData = usePoolSWR(currentPoolId);

  const poolAsssets = useMemo(() => poolsData.data?.pool.pool_assets, [poolsData.data?.pool.pool_assets]);

  const swapFeeRate = useMemo(() => poolsData.data?.pool.pool_params.swap_fee || '0', [poolsData.data?.pool.pool_params.swap_fee]);

  const tokenList = useMemo(() => poolAsssets?.map((item) => item.token), [poolAsssets]);

  const tokenAmountIn = useMemo(() => tokenList?.find((item) => item.denom === inputCoinBaseDenom)?.amount || '0', [inputCoinBaseDenom, tokenList]);
  const tokenWeightIn = useMemo(() => poolAsssets?.find((item) => item.token.denom === inputCoinBaseDenom)?.weight || '0', [inputCoinBaseDenom, poolAsssets]);

  const tokenAmountOut = useMemo(() => tokenList?.find((item) => item.denom === outputCoinBaseDenom)?.amount || '0', [outputCoinBaseDenom, tokenList]);
  const tokenWeightOut = useMemo(
    () => poolAsssets?.find((item) => item.token.denom === outputCoinBaseDenom)?.weight || '0',
    [outputCoinBaseDenom, poolAsssets],
  );

  const currentOutputBaseAmount = useMemo(() => {
    try {
      const weightRatio = divide(tokenWeightIn, tokenWeightOut);
      const adjustIn = times(currentInputBaseAmount, minus(1, swapFeeRate));
      const y = divide(tokenAmountIn, plus(tokenAmountIn, adjustIn));

      const foo = Number(y) ** Number(weightRatio);
      const bar = minus(1, foo);
      return times(tokenAmountOut, bar);
    } catch {
      return '0';
    }
  }, [currentInputBaseAmount, swapFeeRate, tokenAmountIn, tokenAmountOut, tokenWeightIn, tokenWeightOut]);

  const outputAmountOf1Coin = useMemo(() => {
    try {
      const weightRatio = divide(tokenWeightIn, tokenWeightOut);
      const adjustIn = 1;
      const y = divide(tokenAmountIn, plus(tokenAmountIn, adjustIn));

      const foo = Number(y) ** Number(weightRatio);
      const bar = minus(1, foo);
      return times(tokenAmountOut, bar);
    } catch {
      return '0';
    }
  }, [tokenAmountIn, tokenAmountOut, tokenWeightIn, tokenWeightOut]);

  const currentOutputDisplayAmount = useMemo(
    () => toDisplayDenomAmount(currentOutputBaseAmount, outputCoin?.decimals || 0),
    [currentOutputBaseAmount, outputCoin?.decimals],
  );

  const priceImpact = useMemo(() => {
    try {
      const beforeSpotPriceInOverOut = calcSpotPrice(tokenAmountIn, tokenWeightIn, tokenAmountOut, tokenWeightOut, swapFeeRate);

      const effective = divide(currentInputBaseAmount, currentOutputBaseAmount);
      return minus(divide(effective, beforeSpotPriceInOverOut), '1');
    } catch {
      return '0';
    }
  }, [tokenAmountIn, tokenWeightIn, tokenAmountOut, tokenWeightOut, swapFeeRate, currentInputBaseAmount, currentOutputBaseAmount]);

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
    if (inputCoin?.denom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentInputCoinDisplayAvailableAmount;
  }, [currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount, inputCoin?.denom, currentFeeCoin.baseDenom]);

  const swapFeePrice = useMemo(() => times(inputCoinPrice, currentDisplaySwapFeeAmount), [inputCoinPrice, currentDisplaySwapFeeAmount]);

  const errorMessage = useMemo(() => {
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, plus(inputDisplayAmount, currentDisplayFeeAmount))) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
    }
    if (gt(priceImpactPercent, 10)) {
      return t('pages.Wallet.Swap.entry.invalidPriceImpact');
    }
    return '';
  }, [currentDisplayFeeAmount, currentInputCoinDisplayAvailableAmount, inputDisplayAmount, priceImpactPercent, t]);

  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

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
            <Typography variant="h3">{t('pages.Wallet.Swap.entry.title')}</Typography>
          </TextContainer>
          <SideButton onClick={() => setIsOpenSlippageDialog(true)}>
            <Management24Icon />
          </SideButton>
        </TopContainer>
        <SwapContainer>
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinLeftHeaderContainer>
                <Typography variant="h6">Input Coin</Typography>
              </SwapCoinLeftHeaderContainer>
              <SwapCoinRightHeaderContainer>
                <Typography variant="h6n">Available :</Typography>
                &nbsp;
                <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={inputCoin?.decimals}>
                  {currentInputCoinDisplayAvailableAmount}
                </NumberText>
                <MaxButton
                  onClick={() => {
                    setInputDisplayAmount(maxDisplayAmount);
                  }}
                >
                  <Typography variant="h6n">MAX</Typography>
                </MaxButton>
              </SwapCoinRightHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinBodyContainer>
              <SwapCoinLeftButton onClick={() => setIsOpenedInputCoinList(true)}>
                <SwapCoinLeftImageContainer>
                  <Image src={inputCoin?.image || chain.imageURL} />
                </SwapCoinLeftImageContainer>
                <SwapCoinLeftInfoContainer>
                  <SwapCoinLeftTitleContainer>
                    <Typography variant="h4">{inputCoin?.symbol || chain.displayDenom}</Typography>
                  </SwapCoinLeftTitleContainer>
                  <SwapCoinLeftSubTitleContainer>
                    <Typography variant="h6">{inputCoin?.chainName || chain.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIcon data-is-active={isOpenedInputCoinList}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIcon>
              </SwapCoinLeftButton>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer>
                  <StyledInput
                    placeholder={`${inputDisplayAmount || '0'}`}
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
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {inputCoinAmountPrice && inputDisplayAmount && (
                    <Tooltip title={inputCoinAmountPrice} arrow placement="top">
                      <span>
                        <NumberText typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {inputCoinAmountPrice}
                        </NumberText>
                      </span>
                    </Tooltip>
                  )}
                </SwapCoinRightSubTitleContainer>
              </SwapCoinRightContainer>
            </SwapCoinBodyContainer>
          </SwapCoinContainer>
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinLeftHeaderContainer>
                <Typography variant="h6">Output Coin</Typography>
              </SwapCoinLeftHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinBodyContainer>
              <SwapCoinLeftButton onClick={() => setIsOpenedOutputCoinList(true)}>
                <SwapCoinLeftImageContainer>
                  <Image src={outputCoin?.image} />
                </SwapCoinLeftImageContainer>
                <SwapCoinLeftInfoContainer>
                  <SwapCoinLeftTitleContainer>
                    <Typography variant="h4">{outputCoin?.symbol}</Typography>
                  </SwapCoinLeftTitleContainer>
                  <SwapCoinLeftSubTitleContainer>
                    <Typography variant="h6">{outputCoin?.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIcon data-is-active={isOpenedOutputCoinList}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIcon>
              </SwapCoinLeftButton>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer data-is-active={currentOutputDisplayAmount !== '0'}>
                  <NumberText typoOfIntegers="h4n" fixed={currentOutputDisplayAmount !== '0' ? getDisplayMaxDecimals(outputCoin?.decimals) : 0}>
                    {currentOutputDisplayAmount}
                  </NumberText>
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {outputCoinAmountPrice && inputDisplayAmount && (
                    <Tooltip title={outputCoinAmountPrice} arrow placement="top">
                      <span>
                        <NumberText typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {outputCoinAmountPrice}
                        </NumberText>
                      </span>
                    </Tooltip>
                  )}
                </SwapCoinRightSubTitleContainer>
              </SwapCoinRightContainer>
            </SwapCoinBodyContainer>
          </SwapCoinContainer>
          <SwapIconButton onClick={swapCoin}>
            <SwapIcon />
          </SwapIconButton>
        </SwapContainer>
        <SwapInfoContainer>
          <SwapInfoHeaderContainer>
            <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n">
              1
            </NumberText>
            &nbsp;
            <Typography variant="h6n">{inputCoin?.symbol} ≈</Typography>
            &nbsp;
            <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={outputCoin?.decimals}>
              {outputAmountOf1Coin}
            </NumberText>
            &nbsp;
            <Typography variant="h6n">{outputCoin?.symbol}</Typography>
          </SwapInfoHeaderContainer>
          <SwapInfoSubContainer>
            <SwapInfoSubTextContainer>
              <SwapInfoSubLeftContainer>
                <Typography variant="h6">{t('pages.Wallet.Swap.entry.priceImpact')}</Typography>
              </SwapInfoSubLeftContainer>
              <SwapInfoSubRightContainer>
                {inputDisplayAmount && priceImpactPercent ? (
                  <SwapInfoSubRightTextContainer data-is-invalid={gt(priceImpactPercent, 10)}>
                    <Typography variant="h6n">-</Typography>
                    &nbsp;
                    <Typography variant="h6n">{'<'}</Typography>
                    &nbsp;
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                      {priceImpactPercent}
                    </NumberText>
                    <Typography variant="h6n">%</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubTextContainer>
            <SwapInfoSubTextContainer>
              <SwapInfoSubLeftContainer>
                <Typography variant="h6">
                  {t('pages.Wallet.Swap.entry.swapFee')} ({times(swapFeeRate, 100)}%)
                </Typography>
              </SwapInfoSubLeftContainer>
              <SwapInfoSubRightContainer>
                {inputDisplayAmount && swapFeePrice ? (
                  <SwapInfoSubRightTextContainer>
                    <Typography variant="h6">≈</Typography>
                    &nbsp;
                    <Typography variant="h6n">{'<'}</Typography>
                    &nbsp;
                    <Typography variant="h5n">{currency && `${CURRENCY_SYMBOL[currency]} `}</Typography>
                    &nbsp;
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                      {swapFeePrice}
                    </NumberText>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubTextContainer>
            <SwapInfoSubTextContainer>
              <SwapInfoSubLeftContainer>
                <Typography variant="h6">{t('pages.Wallet.Swap.entry.expectedOutput')}</Typography>
              </SwapInfoSubLeftContainer>

              <SwapInfoSubRightContainer>
                {inputDisplayAmount && currentOutputDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(outputCoin?.decimals)}>
                      {currentOutputDisplayAmount}
                    </NumberText>
                    &nbsp;
                    <Typography variant="h6n">{outputCoin?.symbol}</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubTextContainer>
            <SwapInfoSubTextContainer>
              <SwapInfoSubLeftContainer>
                <Typography variant="h6">
                  {t('pages.Wallet.Swap.entry.minimumReceived')} ({currentSlippage}%)
                </Typography>
              </SwapInfoSubLeftContainer>

              <SwapInfoSubRightContainer>
                {inputDisplayAmount && tokenOutMinDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(outputCoin?.decimals)}>
                      {tokenOutMinDisplayAmount}
                    </NumberText>
                    &nbsp;
                    <Typography variant="h6n">{outputCoin?.symbol}</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubTextContainer>
          </SwapInfoSubContainer>
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
                {t('pages.Wallet.Swap.Entry.swapButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      <SlippageSettingDialog
        selectedSlippage={currentSlippage}
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
        onClickCoin={(clickedCoin) => setInputCoinBaseDenom(clickedCoin.denom)}
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
