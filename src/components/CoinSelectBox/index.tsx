import { useRef, useState } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import type { FlatAccountAssets } from '@/types/accountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import {
  BottomContainer,
  BottomWrapper,
  ChevronIconContainer,
  CoinImageContainer,
  Container,
  HelperTextContainer,
  RightAdormentConatiner,
  StyledSelectBox,
} from './styled';
import CoinListBottomSheet from '../CoinListBottomSheet';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type CoinSelectBoxProps = TextFieldProps & {
  coinList: FlatAccountAssets[];
  currentCoinId?: string;
  helperText?: string;
  rightAdornmentComponent?: JSX.Element;
  bottomSheetTitle?: string;
  bottomSheetSearchPlaceholder?: string;
  onClickCoin?: (coinId: string) => void;
};

export default function CoinSelectBox({
  coinList,
  currentCoinId,
  error = false,
  helperText,
  rightAdornmentComponent,
  bottomSheetTitle,
  bottomSheetSearchPlaceholder,
  onClickCoin,
  ...remainder
}: CoinSelectBoxProps) {
  const isShowBottomContainer = helperText;
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpenCoinListBottomSheet, setIsOpenCoinListBottomSheet] = useState(false);

  const currentSelectedCoin = coinList.find(({ asset }) => getCoinId(asset) === currentCoinId);

  const handleMenuItemClick = (value: string) => {
    onClickCoin?.(value);
    setIsOpenCoinListBottomSheet(false);
  };

  const handleInputClick = () => {
    setIsOpenCoinListBottomSheet(true);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <Container>
      <StyledSelectBox
        variant="standard"
        inputRef={inputRef}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: currentSelectedCoin ? (
              <InputAdornment position="start">
                <CoinImageContainer src={currentSelectedCoin.asset.image} />
              </InputAdornment>
            ) : null,
            endAdornment: remainder.disabled ? null : (
              <InputAdornment position="end">
                <RightAdormentConatiner>
                  {rightAdornmentComponent}
                  <ChevronIconContainer data-is-open={isOpenCoinListBottomSheet}>
                    <BottomFilledChevronIcon />
                  </ChevronIconContainer>
                </RightAdormentConatiner>
              </InputAdornment>
            ),
          },
          inputLabel: {
            shrink: !!currentSelectedCoin,
          },
        }}
        onClick={!remainder.disabled ? handleInputClick : undefined}
        value={currentSelectedCoin?.asset.symbol}
        {...remainder}
      />
      <BottomWrapper>
        {isShowBottomContainer && (
          <BottomContainer>
            {helperText && (
              <HelperTextContainer data-is-error={error}>
                <Typography variant="b4_M">{helperText}</Typography>
              </HelperTextContainer>
            )}
          </BottomContainer>
        )}
      </BottomWrapper>
      <CoinListBottomSheet
        currentCoinId={currentCoinId}
        coinList={coinList}
        title={bottomSheetTitle}
        searchPlaceholder={bottomSheetSearchPlaceholder}
        open={isOpenCoinListBottomSheet}
        onClose={() => setIsOpenCoinListBottomSheet(false)}
        onClickCoin={(id) => {
          handleMenuItemClick(id);
        }}
      />
    </Container>
  );
}
