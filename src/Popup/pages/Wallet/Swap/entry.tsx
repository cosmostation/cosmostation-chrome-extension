import { useEffect, useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isDecimal, times } from '~/Popup/utils/big';

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
  SwapInfoSubRightTextContainer,
  SwapInfoSubTextContainer,
  TextContainer,
  TopContainer,
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';
import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';
import Management24Icon from '~/images/icons/Mangement24.svg';
import SwapIcon from '~/images/icons/Swap.svg';

export default function Entry() {
  const { t } = useTranslation();
  const { navigateBack } = useNavigate();
  const { chromeStorage } = useChromeStorage();

  const [inputCoin, setInputCoin] = useState(OSMOSIS);
  const [outputCoin, setOutputCoin] = useState(COSMOS);

  const [currentSlippage, setCurrentSlippage] = useState('1');

  // NOTE 바꿀 코인의 amount
  const [inputAmount, setInputAmout] = useState<string>('');
  const [outputAmount, setOutputAmout] = useState<string>('0');

  // FIXME 현재 인풋 어마운트를 다 지운 상태에서도 1.24값이 남아있음
  useEffect(() => {
    if (inputAmount) {
      // NOTE 변환비율 변경
      setOutputAmout(times(inputAmount, 1.24));
    }
  }, [inputAmount]);

  const [isOpenSlippageDialog, setisOpenSlippageDialog] = useState(false);

  const { currency } = chromeStorage;

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const inputChainPrice = (inputCoin.coinGeckoId && coinGeckoPrice.data?.[inputCoin.coinGeckoId]?.[chromeStorage.currency]) || 0;
  const outputChainPrice = (outputCoin.coinGeckoId && coinGeckoPrice.data?.[outputCoin.coinGeckoId]?.[chromeStorage.currency]) || 0;

  // NOTE calculate coin amount
  const inputChainAmoutPrice = useMemo(() => (inputAmount ? times(inputAmount, inputChainPrice) : '0'), [inputAmount, inputChainPrice]);

  const outputChainAmoutPrice = useMemo(() => (inputAmount ? times(outputAmount, outputChainPrice) : '0'), [inputAmount, outputAmount, outputChainPrice]);

  const sampleAmount = '4000.000';

  const samplePopover = false;

  const errorMessage = useMemo(
    () => {
      if (!inputAmount) {
        return t('pages.Wallet.Swap.entry.title');
      }
      return '';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputAmount],
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
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                  {sampleAmount}
                </Number>
                <MaxButton>
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
                    <Typography variant="h6">{inputCoin.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIconButton data-is-active={samplePopover ? 1 : 0}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIconButton>
              </SwapCoinLeftContainer>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer>
                  <StyledInput
                    placeholder={`${inputAmount || '0'}`}
                    value={inputAmount}
                    onChange={(e) => {
                      if (!isDecimal(e.currentTarget.value, 0) && e.currentTarget.value) {
                        return;
                      }
                      setInputAmout(e.currentTarget.value);
                    }}
                  />
                </SwapCoinRightTitleContainer>
                {inputAmount && (
                  <SwapCoinRightSubTitleContainer>
                    <Tooltip title={inputChainAmoutPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {inputChainAmoutPrice}
                        </Number>
                      </span>
                    </Tooltip>
                  </SwapCoinRightSubTitleContainer>
                )}
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
                    <Typography variant="h6">{outputCoin.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIconButton data-is-active={samplePopover ? 1 : 0}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIconButton>
              </SwapCoinLeftContainer>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer data-is-active={outputAmount !== '0'}>
                  <Typography variant="h4n">{outputAmount}</Typography>
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {inputAmount && (
                    <Tooltip title={outputChainAmoutPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={outputCoin.decimals} currency={currency}>
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
              setInputCoin(outputCoin);
              setOutputCoin(inputCoin);
            }}
          >
            <SwapIcon />
          </SwapIconButton>
        </SwapContainer>
        <SwapInfoContainer>
          <SwapInfoHeaderContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {sampleAmount}
            </Number>
            &nbsp;
            <Typography variant="h5n">{OSMOSIS.displayDenom} ≈</Typography>
            &nbsp;
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {sampleAmount}
            </Number>
            &nbsp;
            <Typography variant="h5n">{OSMOSIS.displayDenom}</Typography>
          </SwapInfoHeaderContainer>
          <SwapInfoSubContainer>
            <SwapInfoSubTextContainer>
              <Typography variant="h6">Price Impact</Typography>
              <SwapInfoSubRightTextContainer>
                <Typography variant="h6">-</Typography>
              </SwapInfoSubRightTextContainer>
            </SwapInfoSubTextContainer>
            <SwapInfoSubTextContainer>
              <Typography variant="h6">Swap Fee (0.2%)</Typography>
              <SwapInfoSubRightTextContainer>
                <Typography variant="h6">-</Typography>
              </SwapInfoSubRightTextContainer>
            </SwapInfoSubTextContainer>
            <SwapInfoSubTextContainer>
              <Typography variant="h6">Expected Output</Typography>
              <SwapInfoSubRightTextContainer>
                <Typography variant="h6">-</Typography>
              </SwapInfoSubRightTextContainer>
            </SwapInfoSubTextContainer>
            <SwapInfoSubTextContainer>
              <Typography variant="h6">Minimum after slippage ({currentSlippage}%)</Typography>
              <SwapInfoSubRightTextContainer>
                <Typography variant="h6">-</Typography>
              </SwapInfoSubRightTextContainer>
            </SwapInfoSubTextContainer>
          </SwapInfoSubContainer>
        </SwapInfoContainer>
        <BottomContainer>
          <Tooltip varient="error" title="errorMessage" placement="top" arrow>
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
        onSubmitSlippage={(a) => {
          setCurrentSlippage(a);
        }}
      />
      );
    </>
  );
}
