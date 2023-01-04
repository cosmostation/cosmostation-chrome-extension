import { useEffect, useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS } from '~/constants/chain';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolsSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { divide, gt, isDecimal, minus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

import CoinListBottomSheet from './components/CoinListBottomSheet';
import SlippageSettingDialog from './components/SlippageSettingDialog';
import {
  BackButton,
  BottomContainer,
  Container,
  MaxButton,
  SideButton,
  StyledInput,
  SwapCoinContainer,
  SwapCoinContainerButton,
  SwapCoinHeaderContainer,
  SwapCoinLeftContainer,
  SwapCoinLeftHeaderContainer,
  SwapCoinLeftIconButton,
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
  TextContainer,
  TopContainer,
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';
import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';
import Management24Icon from '~/images/icons/Mangement24.svg';
import SwapIcon from '~/images/icons/Swap.svg';

export type CoinInfo = BaseCoinInfo & { chain: CosmosChain };

export default function Entry() {
  const { t } = useTranslation();
  const { navigateBack } = useNavigate();
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;

  const coinList = useCoinListSWR(OSMOSIS, true);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(OSMOSIS, true);

  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        coinType: 'staking',
        decimals: OSMOSIS.decimals,
        imageURL: OSMOSIS.imageURL,
        displayDenom: OSMOSIS.displayDenom,
        baseDenom: OSMOSIS.baseDenom,
        coinGeckoId: OSMOSIS.coinGeckoId,
        chain: OSMOSIS,
      },
      ...coinList.coins
        .sort((a, b) => a.displayDenom.localeCompare(b.displayDenom))
        .map((item) => ({
          ...item,
          chain: OSMOSIS,
        })),
      ...coinList.ibcCoins
        .sort((a, b) => a.displayDenom.localeCompare(b.displayDenom))
        .map((item) => ({
          ...item,
          chain: COSMOS_CHAINS.find((chain) => chain.baseDenom === item.originBaseDenom) ?? OSMOSIS,
        })),
    ],
    [coinList.coins, coinList.ibcCoins, totalAmount, vestingRelatedAvailable],
  );

  const availableCoinList: CoinInfo[] = useMemo(() => [...coinAll.filter((item) => gt(item.availableAmount, '0'))], [coinAll]);

  const [inputCoinBaseDenom, setInputCoinBaseDenom] = useState(availableCoinList[0].baseDenom);
  const [outputCoinBaseDenom, setoutputCoinBaseDenom] = useState(availableCoinList[2].chain.baseDenom);

  const inputCoin = useMemo(() => availableCoinList.find((item) => item.chain.baseDenom === inputCoinBaseDenom)!, [availableCoinList, inputCoinBaseDenom]);
  const outputCoin = useMemo(() => availableCoinList.find((item) => item.chain.baseDenom === outputCoinBaseDenom)!, [availableCoinList, outputCoinBaseDenom]);

  const poolsAssetData = usePoolsAssetSWR(OSMOSIS.chainName.toLowerCase(), { suspense: true });

  // FIXME 아래의 계산로직이 동기적으로 처리되지 않아 usePoolsSWR의 아규먼트로 넘겨지는 값이 undefine이 넘어감
  const currentPool = useMemo(
    () => poolsAssetData.data?.find((item) => item.adenom === outputCoinBaseDenom && item.bdenom === inputCoinBaseDenom),
    [inputCoinBaseDenom, outputCoinBaseDenom, poolsAssetData.data],
  );
  // NOTE 테스트용 하드코딩
  const poolsData = usePoolsSWR(currentPool?.id ?? '1', { suspense: true });

  const swapPercentage = useMemo(() => {
    const amountList = poolsData.data?.pool.pool_assets.map((item) => item.token.amount);
    return amountList && divide(amountList[0], amountList[1]);
  }, [poolsData.data?.pool.pool_assets]);

  const currentInputCoinAvailableAmount = useMemo(() => inputCoin.availableAmount, [inputCoin.availableAmount]);

  const currentInputCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentInputCoinAvailableAmount, inputCoin.decimals),
    [currentInputCoinAvailableAmount, inputCoin.decimals],
  );
  const currentFeeCoin = OSMOSIS;

  // TODO
  const currentDisplayFeeAmount = '1';

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount);
    if (inputCoin.baseDenom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentInputCoinDisplayAvailableAmount;
  }, [currentInputCoinDisplayAvailableAmount, inputCoin.baseDenom, currentFeeCoin.baseDenom]);

  const [currentSlippage, setCurrentSlippage] = useState('1');

  // NOTE 바꿀 코인의 amount
  const [inputDisplayAmount, setInputAmout] = useState<string>('');

  const [outputDisplayAmount, setOutputAmout] = useState<string>('0');
  // NOTE 코인을 스왑하게 되면 이게 걸리면서 amount바뀌면서 곱하기가됨
  useEffect(() => {
    if (inputDisplayAmount && swapPercentage) {
      setOutputAmout(times(inputDisplayAmount, swapPercentage));
    } else {
      setOutputAmout('0');
    }
  }, [inputDisplayAmount, swapPercentage]);

  const tokenMinOutAmount = useMemo(
    () => (currentSlippage && outputDisplayAmount ? minus(outputDisplayAmount, times(outputDisplayAmount, divide(currentSlippage, 100))) : '0'),
    [currentSlippage, outputDisplayAmount],
  );

  const [isOpenSlippageDialog, setisOpenSlippageDialog] = useState(false);

  const [isOpenedInputCoinList, setIsOpenedInputCoinList] = useState(false);
  const [isOpenedOutputCoinList, setIsOpenedOutputCoinList] = useState(false);

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const inputChainPrice = (inputCoin.coinGeckoId && coinGeckoPrice.data?.[inputCoin.coinGeckoId]?.[chromeStorage.currency]) || 0;
  const outputChainPrice = (outputCoin.coinGeckoId && coinGeckoPrice.data?.[outputCoin.coinGeckoId]?.[chromeStorage.currency]) || 0;

  // NOTE calculate coin amount
  const inputChainAmoutPrice = useMemo(() => (inputDisplayAmount ? times(inputDisplayAmount, inputChainPrice) : '0'), [inputDisplayAmount, inputChainPrice]);

  const outputChainAmoutPrice = useMemo(
    () => (inputDisplayAmount ? times(outputDisplayAmount, outputChainPrice) : '0'),
    [inputDisplayAmount, outputDisplayAmount, outputChainPrice],
  );

  // NOTE poolsData에서 swap fee 비율 가져와서 사용할 것
  const swapFeePrice = useMemo(() => (inputDisplayAmount ? times(inputChainAmoutPrice, 0.0002) : '0'), [inputDisplayAmount, inputChainAmoutPrice]);

  const errorMessage = useMemo(
    () => {
      if (!inputDisplayAmount) {
        return t('pages.Wallet.Swap.entry.invalidAmount');
      }
      return '';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputDisplayAmount],
  );
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
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={inputCoin.decimals}>
                  {currentInputCoinDisplayAvailableAmount}
                </Number>
                <MaxButton
                  onClick={() => {
                    setInputAmout(maxDisplayAmount);
                  }}
                >
                  <Typography variant="h6n">MAX</Typography>
                </MaxButton>
              </SwapCoinRightHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinContainerButton>
              <SwapCoinLeftContainer>
                <SwapCoinLeftImageContainer>
                  <Image src={inputCoin.imageURL} />
                </SwapCoinLeftImageContainer>
                <SwapCoinLeftInfoContainer>
                  <SwapCoinLeftTitleContainer>
                    <Typography variant="h4">{inputCoin.displayDenom}</Typography>
                  </SwapCoinLeftTitleContainer>
                  <SwapCoinLeftSubTitleContainer>
                    <Typography variant="h6">{inputCoin.chain.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIconButton onClick={() => setIsOpenedInputCoinList(true)} data-is-active={isOpenedInputCoinList}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIconButton>
              </SwapCoinLeftContainer>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer>
                  <StyledInput
                    placeholder={`${inputDisplayAmount || '0'}`}
                    value={inputDisplayAmount}
                    onChange={(e) => {
                      if (!isDecimal(e.currentTarget.value, inputCoin.decimals) && e.currentTarget.value) {
                        return;
                      }
                      setInputAmout(e.currentTarget.value);
                    }}
                  />
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {inputDisplayAmount && (
                    <Tooltip title={inputChainAmoutPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {inputChainAmoutPrice}
                        </Number>
                      </span>
                    </Tooltip>
                  )}
                </SwapCoinRightSubTitleContainer>
              </SwapCoinRightContainer>
            </SwapCoinContainerButton>
          </SwapCoinContainer>
          {/* NOTE OutPut */}
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinLeftHeaderContainer>
                <Typography variant="h6">Output Coin</Typography>
              </SwapCoinLeftHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinContainerButton>
              <SwapCoinLeftContainer>
                <SwapCoinLeftImageContainer>
                  <Image src={outputCoin.imageURL} />
                </SwapCoinLeftImageContainer>
                <SwapCoinLeftInfoContainer>
                  <SwapCoinLeftTitleContainer>
                    <Typography variant="h4">{outputCoin.displayDenom}</Typography>
                  </SwapCoinLeftTitleContainer>
                  <SwapCoinLeftSubTitleContainer>
                    <Typography variant="h6">{outputCoin.chain.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIconButton data-is-active={isOpenedOutputCoinList}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIconButton>
              </SwapCoinLeftContainer>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer data-is-active={outputDisplayAmount !== '0'}>
                  <Number typoOfIntegers="h4n">{outputDisplayAmount}</Number>
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {inputDisplayAmount && (
                    <Tooltip title={outputChainAmoutPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={outputCoin.decimals} currency={currency}>
                          {outputChainAmoutPrice}
                        </Number>
                      </span>
                    </Tooltip>
                  )}
                </SwapCoinRightSubTitleContainer>
              </SwapCoinRightContainer>
            </SwapCoinContainerButton>
          </SwapCoinContainer>
          <SwapIconButton
            onClick={() => {
              // NOTE setter함수가 동기적으로 작동되지 않아서
              // 작동되는 것처럼 보이는데 인풋코인이 먼저 바뀔 경우
              // 아웃풋이랑 같은 코인이 될 가능성이 있음
              // FIXME amount정보도 같이 변경되도록
              setInputCoinBaseDenom(outputCoin.chain.baseDenom);
              setoutputCoinBaseDenom(inputCoin.chain.baseDenom);
            }}
          >
            <SwapIcon />
          </SwapIconButton>
        </SwapContainer>
        <SwapInfoContainer>
          <SwapInfoHeaderContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
              {inputDisplayAmount || '0'}
            </Number>
            &nbsp;
            <Typography variant="h6n">{inputCoin.displayDenom} ≈</Typography>
            &nbsp;
            <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
              {outputDisplayAmount}
            </Number>
            &nbsp;
            <Typography variant="h6n">{outputCoin.displayDenom}</Typography>
          </SwapInfoHeaderContainer>
          <SwapInfoSubContainer>
            <SwapInfoSubLeftContainer>
              <Typography variant="h6">Price Impact</Typography>
              <SwapInfoSubRightContainer>
                {inputDisplayAmount ? (
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
            </SwapInfoSubLeftContainer>
            <SwapInfoSubLeftContainer>
              {/* TODO poolsData에서 swap fee 비율 가져올 것 */}
              <Typography variant="h6">Swap Fee (0.2%)</Typography>
              <SwapInfoSubRightContainer>
                {inputDisplayAmount ? (
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
            </SwapInfoSubLeftContainer>
            <SwapInfoSubLeftContainer>
              <Typography variant="h6">Expected Output</Typography>
              <SwapInfoSubRightContainer>
                {inputDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                      {outputDisplayAmount}
                    </Number>
                    &nbsp;
                    <Typography variant="h6n">{outputCoin.displayDenom}</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubLeftContainer>
            <SwapInfoSubLeftContainer>
              <Typography variant="h6">Minimum after slippage ({currentSlippage}%)</Typography>
              <SwapInfoSubRightContainer>
                {inputDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                      {tokenMinOutAmount}
                    </Number>
                    &nbsp;
                    <Typography variant="h6n">{outputCoin.displayDenom}</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubLeftContainer>
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
        currentInputChain={inputCoin}
        selectedSlippage={currentSlippage}
        open={isOpenSlippageDialog}
        onClose={() => setisOpenSlippageDialog(false)}
        onSubmitSlippage={(a) => {
          setCurrentSlippage(a);
        }}
      />
      <CoinListBottomSheet
        currentSelectedCoin={inputCoin}
        availableCoinList={availableCoinList}
        open={isOpenedInputCoinList}
        onClose={() => setIsOpenedInputCoinList(false)}
        onClickCoin={(a) => setInputCoinBaseDenom(a.originBaseDenom || a.baseDenom)}
      />
      {/* NOTE 아웃 코인 */}
      <CoinListBottomSheet
        currentSelectedCoin={outputCoin}
        availableCoinList={availableCoinList}
        open={isOpenedOutputCoinList}
        onClose={() => setIsOpenedOutputCoinList(false)}
        onClickCoin={(a) => setoutputCoinBaseDenom(a.originBaseDenom || a.baseDenom)}
      />
      );
    </>
  );
}
