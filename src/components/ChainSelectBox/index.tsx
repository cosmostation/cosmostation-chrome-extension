import { useRef, useState } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import type { Chain } from '@/types/chain';

import {
  BottomContainer,
  BottomWrapper,
  ChainImageContainer,
  ChevronIconContainer,
  Container,
  HelperTextContainer,
  RightAdormentConatiner,
  StyledSelectBox,
} from './styled';
import ChainListBottomSheet from '../ChainListBottomSheet';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type ChainSelectBoxProps = TextFieldProps & {
  chainList: Chain[];
  currentChainId?: string;
  helperText?: string;
  rightAdornmentComponent?: JSX.Element;
  bottomSheetTitle?: string;
  bottomSheetSearchPlaceholder?: string;
  onClickChain?: (chainId: string) => void;
};

export default function ChainSelectBox({
  chainList,
  currentChainId,
  error = false,
  helperText,
  rightAdornmentComponent,
  bottomSheetTitle,
  bottomSheetSearchPlaceholder,
  onClickChain,
  ...remainder
}: ChainSelectBoxProps) {
  const isShowBottomContainer = helperText;
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpenChainListBottomSheet, setIsOpenChainListBottomSheet] = useState(false);

  const currentSelectedChain = chainList.find((chain) => chain.id === currentChainId);

  const handleMenuItemClick = (value: string) => {
    onClickChain?.(value);
    setIsOpenChainListBottomSheet(false);
  };

  const handleInputClick = () => {
    setIsOpenChainListBottomSheet(true);
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
            startAdornment: currentChainId ? (
              <InputAdornment position="start">
                <ChainImageContainer src={currentSelectedChain?.image} />
              </InputAdornment>
            ) : null,
            endAdornment: (
              <InputAdornment position="end">
                <RightAdormentConatiner>
                  {rightAdornmentComponent}
                  <ChevronIconContainer data-is-open={isOpenChainListBottomSheet}>
                    <BottomFilledChevronIcon />
                  </ChevronIconContainer>
                </RightAdormentConatiner>
              </InputAdornment>
            ),
          },
          inputLabel: {
            shrink: !!currentChainId,
          },
        }}
        onClick={handleInputClick}
        value={currentSelectedChain?.name}
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
      <ChainListBottomSheet
        currentChainId={currentChainId}
        chainList={chainList}
        disableAllNetwork
        title={bottomSheetTitle}
        searchPlaceholder={bottomSheetSearchPlaceholder}
        open={isOpenChainListBottomSheet}
        onClose={() => setIsOpenChainListBottomSheet(false)}
        onClickChain={(id) => {
          handleMenuItemClick(id);
        }}
      />
    </Container>
  );
}
