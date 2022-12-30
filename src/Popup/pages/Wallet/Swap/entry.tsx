import { Typography } from '@mui/material';

import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import {
  BottomContainer,
  Container,
  MaxButton,
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
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';
import SwapIcon from '~/images/icons/Swap.svg';

export default function Entry() {
  const { t } = useTranslation();
  const sampleAmount = '4000.000';
  const sampleAmount2 = '12';
  // TODO currency 적용
  const sampleAmount3 = '9.04';

  const samplePopover = false;
  return (
    <Container>
      <SwapContainer>
        {/* NOTE InPut */}
        <SwapCoinContainer>
          <SwapCoinHeaderContainer>
            <SwapCoinLeftHeaderContainer>
              <Typography variant="h6">Input Coin</Typography>
            </SwapCoinLeftHeaderContainer>
            <SwapCoinRightHeaderContainer>
              <Typography variant="h6">Available:</Typography>
              &nbsp;
              <Number typoOfIntegers="h6n" typoOfDecimals="h6n">
                {sampleAmount}
              </Number>
              <MaxButton>
                <Typography variant="h6">MAX</Typography>
              </MaxButton>
            </SwapCoinRightHeaderContainer>
          </SwapCoinHeaderContainer>
          <SwapCoinContainerButton>
            <SwapCoinLeftContainer>
              <SwapCoinLeftImageContainer>
                <Image src={OSMOSIS.imageURL} />
              </SwapCoinLeftImageContainer>
              <SwapCoinLeftInfoContainer>
                <SwapCoinLeftTitleContainer>
                  <Typography variant="h5">{OSMOSIS.displayDenom}</Typography>
                </SwapCoinLeftTitleContainer>
                <SwapCoinLeftSubTitleContainer>
                  <Typography variant="h6n">{OSMOSIS.chainName}</Typography>
                </SwapCoinLeftSubTitleContainer>
              </SwapCoinLeftInfoContainer>
              <SwapCoinLeftIconButton data-is-active={samplePopover ? 1 : 0}>
                <BottomArrow24Icon />
              </SwapCoinLeftIconButton>
            </SwapCoinLeftContainer>
            <SwapCoinRightContainer>
              <SwapCoinRightTitleContainer>
                <Typography variant="h4">{sampleAmount2}</Typography>
              </SwapCoinRightTitleContainer>
              <SwapCoinRightSubTitleContainer>
                <Typography variant="h6n"> $ </Typography>{' '}
                <Tooltip title={sampleAmount3} arrow placement="top">
                  <span>
                    <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={OSMOSIS.decimals}>
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
                <Image src={OSMOSIS.imageURL} />
              </SwapCoinLeftImageContainer>
              <SwapCoinLeftInfoContainer>
                <SwapCoinLeftTitleContainer>
                  <Typography variant="h5">{OSMOSIS.displayDenom}</Typography>
                </SwapCoinLeftTitleContainer>
                <SwapCoinLeftSubTitleContainer>
                  <Typography variant="h6n">{OSMOSIS.chainName}</Typography>
                </SwapCoinLeftSubTitleContainer>
              </SwapCoinLeftInfoContainer>
              <SwapCoinLeftIconButton data-is-active={samplePopover ? 1 : 0}>
                <BottomArrow24Icon />
              </SwapCoinLeftIconButton>
            </SwapCoinLeftContainer>
            <SwapCoinRightContainer>
              <SwapCoinRightTitleContainer>
                <Typography variant="h4">{sampleAmount2}</Typography>
              </SwapCoinRightTitleContainer>
              <SwapCoinRightSubTitleContainer>
                <Typography variant="h6n"> $ </Typography>{' '}
                <Tooltip title={sampleAmount3} arrow placement="top">
                  <span>
                    <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={OSMOSIS.decimals}>
                      {sampleAmount3}
                    </Number>
                  </span>
                </Tooltip>
              </SwapCoinRightSubTitleContainer>
            </SwapCoinRightContainer>
          </SwapCoinContainerButton>
        </SwapCoinContainer>
        <SwapIconButton>
          <SwapIcon />
        </SwapIconButton>
      </SwapContainer>
      <SwapInfoContainer>
        <SwapInfoHeaderContainer>
          <Number typoOfIntegers="h6n" typoOfDecimals="h8n">
            {sampleAmount}
          </Number>
          &nbsp;
          <Typography variant="h6">{OSMOSIS.displayDenom} ≈</Typography>
          &nbsp;
          <Number typoOfIntegers="h6n" typoOfDecimals="h8n">
            {sampleAmount}
          </Number>
          &nbsp;
          <Typography variant="h6">{OSMOSIS.displayDenom}</Typography>
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
  );
}
