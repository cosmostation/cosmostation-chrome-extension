import { useState } from 'react';
import { Typography } from '@mui/material';

import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import SlippageSettingDialog from './components/SlippageSettingDialog';
import {
  BackButton,
  BottomContainer,
  Container,
  MaxButton,
  SideButton,
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

  const [isOpenSlippageDialog, setisOpenSlippageDialog] = useState(false);

  const { currency } = chromeStorage;
  const sampleAmount = '4000.000';
  const sampleAmount2 = '12.00';
  const outCoinAmount = '0.987423';
  // TODO currency 적용
  const sampleAmount3 = '9.04';

  const samplePopover = false;
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
                  <Number typoOfIntegers="h4n">{sampleAmount2}</Number>
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  <Tooltip title={sampleAmount3} arrow placement="top">
                    <span>
                      <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                        {sampleAmount3}
                      </Number>
                    </span>
                  </Tooltip>
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
                    <Typography variant="h6">{outputCoin.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIconButton data-is-active={samplePopover ? 1 : 0}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIconButton>
              </SwapCoinLeftContainer>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer>
                  <Typography variant="h4n">{outCoinAmount}</Typography>
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  <Tooltip title={sampleAmount3} arrow placement="top">
                    <span>
                      <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={outputCoin.decimals} currency={currency}>
                        {sampleAmount3}
                      </Number>
                    </span>
                  </Tooltip>
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
              <Typography variant="h6">Minimum after slippage (1%)</Typography>
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
                // disabled={!!errorMessage || !ibcSendAminoTx}
                // onClick={ }
              >
                {t('pages.Wallet.Swap.Entry.swapButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      <SlippageSettingDialog open={isOpenSlippageDialog} onClose={() => setisOpenSlippageDialog(false)} />
      );
    </>
  );
}
