import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, minus, plus, pow, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { convertAssetNameToCosmos } from '~/Popup/utils/cosmos';
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

  const [inputDisplayAmount, setInputAmount] = useState<string>('');

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

  const currentTokenInAmount = useMemo(() => toBaseDenomAmount(inputDisplayAmount || 0, inputCoin?.decimals || 0), [inputCoin?.decimals, inputDisplayAmount]);

  useEffect(() => {
    if (!outputCoin) {
      setOutputCoinBaseDenom(availableSwapOutputCoinList[0]?.denom);
    }
  }, [availableSwapOutputCoinList, outputCoin, outputCoinBaseDenom]);

  const currentPoolId = useMemo(() => currentPool?.id || '1', [currentPool?.id]);

  const poolsData = usePoolSWR(currentPoolId);

  const poolAsssets = useMemo(() => poolsData.data?.pool.pool_assets, [poolsData.data?.pool.pool_assets]);

  const swapFeeRate = useMemo(() => fix(poolsData.data?.pool.pool_params.swap_fee ?? '0'), [poolsData.data?.pool.pool_params.swap_fee]);

  const currentSwapRate = useMemo(() => {
    const tokenList = poolAsssets?.map((item) => item.token);

    const inputTokenPoolDisplayAmount =
      toDisplayDenomAmount(tokenList?.find((item) => item.denom === inputCoinBaseDenom)?.amount || '1', inputCoin?.decimals || 0) || 1;

    const outputTokenPoolDisplayAmount =
      toDisplayDenomAmount(tokenList?.find((item) => item.denom === outputCoinBaseDenom)?.amount || '1', outputCoin?.decimals || 0) || 1;

    return divide(outputTokenPoolDisplayAmount, inputTokenPoolDisplayAmount);
  }, [inputCoin?.decimals, inputCoinBaseDenom, outputCoin?.decimals, outputCoinBaseDenom, poolAsssets]);

  const outputDisplayAmount = useMemo(() => {
    if (inputDisplayAmount) {
      const tokenList = poolAsssets?.map((item) => item.token);

      const tokenAmountIn = tokenList?.find((item) => item.denom === inputCoinBaseDenom)?.amount || '1';
      const tokenWeightIn = poolAsssets?.find((item) => item.token.denom === inputCoinBaseDenom)?.weight || '1';

      const tokenAmountOut = tokenList?.find((item) => item.denom === outputCoinBaseDenom)?.amount || '1';
      const tokenWeightOut = poolAsssets?.find((item) => item.token.denom === outputCoinBaseDenom)?.weight || '1';

      const weightRatio = divide(tokenWeightIn || 1, tokenWeightOut || 1);
      const adjustIn = times(inputDisplayAmount || 1, minus(1, swapFeeRate));
      const y = divide(tokenAmountIn, plus(tokenAmountIn, adjustIn));
      // TODO 소수 계산 가능한 제곱함수 구현할것
      // osmo-ion은 weightRation가 소수라 pow안에 아규먼트로 넘어갈 시 오류 발생
      // 임시로 weightRatio를 1로 대체함
      // const foo = pow(y, 1);
      const foo = pow(y, Number(weightRatio));
      const bar = minus(1, foo);
      return times(tokenAmountOut, bar);
    }
    return '0';
  }, [inputCoinBaseDenom, inputDisplayAmount, outputCoinBaseDenom, poolAsssets, swapFeeRate]);

  const currentTokenOutAmount = useMemo(() => toBaseDenomAmount(outputDisplayAmount, outputCoin?.decimals || 0), [outputCoin?.decimals, outputDisplayAmount]);

  const priceImpact = useMemo(() => {
    const tokenList = poolAsssets?.map((item) => item.token);

    const tokenBalanceIn = tokenList?.find((item) => item.denom === inputCoinBaseDenom)?.amount || '1';
    const tokenWeightIn = poolAsssets?.find((item) => item.token.denom === inputCoinBaseDenom)?.weight || '1';

    const tokenBalanceOut = tokenList?.find((item) => item.denom === outputCoinBaseDenom)?.amount || '1';
    const tokenWeightOut = poolAsssets?.find((item) => item.token.denom === outputCoinBaseDenom)?.weight || '1';

    const inputWeightCalculated = divide(tokenBalanceIn, tokenWeightIn);
    const outputWeightCalculated = divide(tokenBalanceOut, tokenWeightOut);

    const scale = divide('1', minus('1', swapFeeRate));

    const beforeSpotPriceInOverOut = times(divide(inputWeightCalculated, outputWeightCalculated), scale);

    const effective = divide(inputDisplayAmount || 1, outputDisplayAmount !== '0' ? outputDisplayAmount : 1);

    return minus(divide(effective || 1, beforeSpotPriceInOverOut || 1), 1);
  }, [poolAsssets, swapFeeRate, inputDisplayAmount, outputDisplayAmount, inputCoinBaseDenom, outputCoinBaseDenom]);

  const currentInputCoinAvailableAmount = useMemo(() => inputCoin?.availableAmount || '0', [inputCoin]);

  const currentInputCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentInputCoinAvailableAmount, inputCoin?.decimals || 0),
    [currentInputCoinAvailableAmount, inputCoin],
  );

  const currentFeeCoin = chain;

  const currentFeeAmount = useMemo(() => times(COSMOS_DEFAULT_SWAP_GAS, chain.gasRate.average), [chain.gasRate.average]);

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

  const swapCoin = useCallback(() => {
    const temptInputCoinBaseDenom = inputCoinBaseDenom;
    setInputCoinBaseDenom(outputCoinBaseDenom);
    setOutputCoinBaseDenom(temptInputCoinBaseDenom);
    if (inputDisplayAmount) {
      setInputAmount(outputDisplayAmount);
    }
  }, [inputCoinBaseDenom, inputDisplayAmount, outputCoinBaseDenom, outputDisplayAmount]);

  const tokenOutMinAmount = useMemo(
    () => (currentSlippage && currentTokenOutAmount ? minus(currentTokenOutAmount, times(currentTokenOutAmount, divide(currentSlippage, 100))) : '0'),
    [currentSlippage, currentTokenOutAmount],
  );

  const tokenOutMinDisplayAmount = useMemo(() => toDisplayDenomAmount(tokenOutMinAmount, outputCoin?.decimals || 0), [outputCoin?.decimals, tokenOutMinAmount]);

  const [isOpenSlippageDialog, setisOpenSlippageDialog] = useState(false);

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

  const outputCoinAmountPrice = useMemo(() => times(outputDisplayAmount || '0', outputCoinPrice), [outputDisplayAmount, outputCoinPrice]);

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
    // TODO swap 불가 threshold 파악하기
    // if (!gt(priceImpact, 0.1)) {
    //   return t('pages.Wallet.Swap.entry.invalidPriceImpact');
    // }
    return '';
  }, [currentDisplayFeeAmount, currentInputCoinDisplayAvailableAmount, inputDisplayAmount, t]);
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
          <SideButton onClick={() => setisOpenSlippageDialog(true)}>
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
                    setInputAmount(maxDisplayAmount);
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
                      setInputAmount(e.currentTarget.value);
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
                <SwapCoinRightTitleContainer data-is-active={outputDisplayAmount !== '0'}>
                  <NumberText typoOfIntegers="h4n" fixed={outputDisplayAmount !== '0' ? getDisplayMaxDecimals(outputCoin?.decimals) : 0}>
                    {outputDisplayAmount}
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
              {currentSwapRate}
            </NumberText>
            &nbsp;
            <Typography variant="h6n">{outputCoin?.symbol}</Typography>
          </SwapInfoHeaderContainer>
          <SwapInfoSubContainer>
            <SwapInfoSubTextContainer>
              <SwapInfoSubLeftContainer>
                <Typography variant="h6">Price Impact</Typography>
              </SwapInfoSubLeftContainer>
              <SwapInfoSubRightContainer>
                {inputDisplayAmount && priceImpact ? (
                  <SwapInfoSubRightTextContainer>
                    <Typography variant="h6n">-</Typography>
                    &nbsp;
                    <Typography variant="h6n">{'<'}</Typography>
                    &nbsp;
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                      {priceImpact}
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
                <Typography variant="h6">Swap Fee ({times(swapFeeRate, 100)}%)</Typography>
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
                <Typography variant="h6">Expected Output</Typography>
              </SwapInfoSubLeftContainer>

              <SwapInfoSubRightContainer>
                {inputDisplayAmount && outputDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(outputCoin?.decimals)}>
                      {outputDisplayAmount}
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
                {/* TODO 이거 Minimim received 아닌지 여쭤보기 */}
                <Typography variant="h6">Minimum after slippage ({currentSlippage}%)</Typography>
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
                disabled={!!errorMessage}
                onClick={async () => {
                  const sequence = String(account.data?.value.sequence || '0');
                  if (inputDisplayAmount && account.data?.value.account_number) {
                    await enQueue({
                      messageId: '',
                      origin: '',
                      channel: 'inApp',
                      message: {
                        method: 'cos_signAmino',
                        params: {
                          chainName: chain.chainName,
                          doc: {
                            account_number: String(account.data.value.account_number),
                            sequence,
                            chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
                            fee: { amount: [{ amount: currentCeilFeeAmount, denom: currentFeeCoin.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
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
                                    amount: currentTokenInAmount,
                                    denom: inputCoinBaseDenom,
                                  },
                                  token_out_min_amount: tokenOutMinAmount,
                                },
                              },
                            ],
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
        </BottomContainer>
      </Container>
      <SlippageSettingDialog
        selectedSlippage={currentSlippage}
        open={isOpenSlippageDialog}
        onClose={() => setisOpenSlippageDialog(false)}
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
