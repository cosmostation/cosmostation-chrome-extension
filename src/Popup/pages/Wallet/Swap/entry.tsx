import { useCallback, useEffect, useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import { COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
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
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const balance = useBalanceSWR(chain);
  const [currentSlippage, setCurrentSlippage] = useState('1');

  const poolsAssetData = usePoolsAssetSWR(chain.chainName.toLowerCase());
  const poolDenomList = poolsAssetData.data ? [...poolsAssetData.data.map((item) => item.adenom), ...poolsAssetData.data.map((item) => item.bdenom)] : [];
  const uniquePoolDenomList = poolDenomList.filter((denom, idx, arr) => arr.findIndex((item) => item === denom) === idx);

  const [inputCoinBaseDenom, setInputCoinBaseDenom] = useState<string>(chain.baseDenom);
  const [outputCoinBaseDenom, setoutputCoinBaseDenom] = useState<string>('');

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
    const nameMap = {
      'dig-chain': 'Dig',
    } as Record<string, string>;

    const swapCoinList =
      currentChainAssets.data
        .filter((item) => uniquePoolDenomList.includes(item.denom))
        .map((item) => ({
          ...item,
          chainName:
            convertAssetNameToCosmos(item.prevChain || item.origin_chain)?.chainName ||
            nameMap[item.origin_chain] ||
            item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
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

  // TODO 소수점 rounding 처리

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

  useEffect(() => {
    if (!outputCoin) {
      setoutputCoinBaseDenom(availableSwapOutputCoinList[0]?.denom);
    }
  }, [availableSwapOutputCoinList, outputCoin, outputCoinBaseDenom]);

  const currentPoolId = useMemo(() => currentPool?.id || '1', [currentPool?.id]);

  const poolsData = usePoolSWR(currentPoolId);

  const poolAsssets = useMemo(() => poolsData.data?.pool.pool_assets, [poolsData.data?.pool.pool_assets]);

  const currentSwapRate = useMemo(() => {
    const tokenList = poolAsssets?.map((item) => item.token);

    const inputTokenPoolDisplayAmount =
      toDisplayDenomAmount(tokenList?.find((item) => item.denom === inputCoinBaseDenom)?.amount || '1', inputCoin?.decimals || 0) || 1;

    const outputTokenPoolDisplayAmount =
      toDisplayDenomAmount(tokenList?.find((item) => item.denom === outputCoinBaseDenom)?.amount || '1', outputCoin?.decimals || 0) || 1;

    return divide(outputTokenPoolDisplayAmount, inputTokenPoolDisplayAmount);
  }, [inputCoin?.decimals, inputCoinBaseDenom, outputCoin?.decimals, outputCoinBaseDenom, poolAsssets]);

  const outputDisplayAmount = useMemo(
    () => times(inputDisplayAmount || 0, currentSwapRate, inputDisplayAmount ? outputCoin?.decimals : 0),
    [currentSwapRate, inputDisplayAmount, outputCoin?.decimals],
  );

  const currentTokenOutAmount = useMemo(() => toBaseDenomAmount(outputDisplayAmount, outputCoin?.decimals || 0), [outputCoin?.decimals, outputDisplayAmount]);

  const currentInputCoinAvailableAmount = useMemo(() => inputCoin?.availableAmount || '0', [inputCoin]);

  const currentInputCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentInputCoinAvailableAmount, inputCoin?.decimals || 0),
    [currentInputCoinAvailableAmount, inputCoin],
  );
  // NOTE fix decimal 3으로 하드코딩되어있음
  const swapFeeRate = useMemo(() => fix(poolsData.data?.pool.pool_params.swap_fee ?? '0', 3), [poolsData.data?.pool.pool_params.swap_fee]);

  // NOTE 멀티 코인
  const currentFeeCoin = chain;

  const currentFeeAmount = useMemo(() => times(COSMOS_DEFAULT_SWAP_GAS, swapFeeRate), [swapFeeRate]);

  // NOTE 실제 msg에 들어가는 값인데 SwapInfo에서 보여주는 예상 swap fee랑 일치하지 않음 기준이 필요함
  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentCeilFeeAmount, chain.decimals);

  // const currentDisplayFeeAmount = useMemo(
  //   () => (inputDisplayAmount ? times(inputDisplayAmount, swapFeeRate) : '0'),
  //   [inputDisplayAmount, swapFeeRate],
  // );

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount);
    if (inputCoin?.denom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentInputCoinDisplayAvailableAmount;
  }, [currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount, inputCoin?.denom, currentFeeCoin.baseDenom]);

  const swapCoin = useCallback(() => {
    setInputCoinBaseDenom(outputCoinBaseDenom);
    setoutputCoinBaseDenom(inputCoinBaseDenom);
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

  const inputChainPrice = useMemo(
    () => (inputCoin?.coinGeckoId && coinGeckoPrice.data?.[inputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, inputCoin?.coinGeckoId],
  );
  const outputChainPrice = useMemo(
    () => (outputCoin?.coinGeckoId && coinGeckoPrice.data?.[outputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, outputCoin?.coinGeckoId],
  );

  const inputChainAmountPrice = useMemo(() => times(inputDisplayAmount || '0', inputChainPrice), [inputDisplayAmount, inputChainPrice]);

  const outputChainAmountPrice = useMemo(() => times(outputDisplayAmount || '0', outputChainPrice), [outputDisplayAmount, outputChainPrice]);

  const swapFeePrice = useMemo(() => times(inputChainPrice, currentDisplayFeeAmount), [inputChainPrice, currentDisplayFeeAmount]);

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
          {/* NOTE InPut */}
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinLeftHeaderContainer>
                <Typography variant="h6">Input Coin</Typography>
              </SwapCoinLeftHeaderContainer>
              <SwapCoinRightHeaderContainer>
                <Typography variant="h6n">Available :</Typography>
                &nbsp;
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={inputCoin?.decimals}>
                  {currentInputCoinDisplayAvailableAmount}
                </Number>
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
                  {inputChainAmountPrice && inputDisplayAmount && (
                    <Tooltip title={inputChainAmountPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {inputChainAmountPrice}
                        </Number>
                      </span>
                    </Tooltip>
                  )}
                </SwapCoinRightSubTitleContainer>
              </SwapCoinRightContainer>
            </SwapCoinBodyContainer>
          </SwapCoinContainer>
          {/* NOTE OutPut */}
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
                  <Number typoOfIntegers="h4n">{outputDisplayAmount}</Number>
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {outputChainAmountPrice && inputDisplayAmount && (
                    <Tooltip title={outputChainAmountPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {outputChainAmountPrice}
                        </Number>
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
            <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
              1
            </Number>
            &nbsp;
            <Typography variant="h6n">{inputCoin?.symbol} ≈</Typography>
            &nbsp;
            <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={outputCoin?.decimals}>
              {currentSwapRate}
            </Number>
            &nbsp;
            <Typography variant="h6n">{outputCoin?.symbol}</Typography>
          </SwapInfoHeaderContainer>
          <SwapInfoSubContainer>
            <SwapInfoSubTextContainer>
              <SwapInfoSubLeftContainer>
                <Typography variant="h6">Price Impact</Typography>
              </SwapInfoSubLeftContainer>

              <SwapInfoSubRightContainer>
                {inputDisplayAmount && swapFeePrice ? (
                  <SwapInfoSubRightTextContainer>
                    <Typography variant="h6n">-</Typography>
                    &nbsp;
                    <Typography variant="h6n">{'<'}</Typography>
                    &nbsp;
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                      {swapFeePrice}
                    </Number>
                    <Typography variant="h6n">%</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubTextContainer>
            <SwapInfoSubTextContainer>
              <SwapInfoSubLeftContainer>
                <Typography variant="h6">Swap Fee ({swapFeeRate}%)</Typography>
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
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                      {swapFeePrice}
                    </Number>
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
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={outputCoin?.decimals}>
                      {outputDisplayAmount}
                    </Number>
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
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={outputCoin?.decimals}>
                      {tokenOutMinDisplayAmount}
                    </Number>
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
                // onClick={ }
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
        onClickCoin={(clickedCoin) => setoutputCoinBaseDenom(clickedCoin.denom)}
      />
      );
    </>
  );
}
