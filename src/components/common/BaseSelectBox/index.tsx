import { useRef } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import { BottomContainer, BottomWrapper, ChevronIconContainer, Container, HelperTextContainer, RightAdormentConatiner, StyledSelectBox } from './styled';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type BaseSelectBoxProps = TextFieldProps & {
  helperText?: string;
  isOpenBottomSheet?: boolean;
  rightAdornmentComponent?: JSX.Element;
  startAdornmentComponent?: JSX.Element;
  onClickSelectBox?: () => void;
};

export default function BaseSelectBox({
  error = false,
  helperText,
  isOpenBottomSheet = false,
  startAdornmentComponent,
  rightAdornmentComponent,
  onClickSelectBox,
  ...remainder
}: BaseSelectBoxProps) {
  const isShowBottomContainer = helperText;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputClick = () => {
    onClickSelectBox?.();
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
            startAdornment: remainder.value && startAdornmentComponent ? <InputAdornment position="start">{startAdornmentComponent}</InputAdornment> : null,
            endAdornment: remainder.disabled ? null : (
              <InputAdornment position="end">
                <RightAdormentConatiner>
                  {rightAdornmentComponent}
                  <ChevronIconContainer data-is-open={isOpenBottomSheet}>
                    <BottomFilledChevronIcon />
                  </ChevronIconContainer>
                </RightAdormentConatiner>
              </InputAdornment>
            ),
          },
          inputLabel: {
            shrink: !!remainder.value,
          },
        }}
        {...remainder}
        onClick={(e) => {
          if (remainder.onClick) {
            remainder.onClick(e);
          }
          handleInputClick();
        }}
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
    </Container>
  );
}
