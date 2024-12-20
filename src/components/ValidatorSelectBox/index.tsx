import { useRef } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import {
  BottomContainer,
  BottomWrapper,
  ChevronIconContainer,
  Container,
  HelperTextContainer,
  ImageContainer,
  RightAdormentConatiner,
  StyledSelectBox,
} from './styled';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

// TODO 제거
export type Validator = {
  validatorName: string;
  validatorAddress: string;
  votingPower: string;
  commission: string;
  validatorImage: string;
};

type ValidatorSelectBoxProps = TextFieldProps & {
  validatorList: Validator[];
  currentValidaotorAddress?: string;
  validatorCounts?: number;
  helperText?: string;
  rightAdornmentComponent?: JSX.Element;
  isBottomSheetOpen?: boolean;
  onClickItem?: () => void;
};

export default function ValidatorSelectBox({
  validatorList,
  currentValidaotorAddress,
  validatorCounts,
  helperText,
  rightAdornmentComponent,
  error = false,
  isBottomSheetOpen = false,
  onClickItem,
  ...remainder
}: ValidatorSelectBoxProps) {
  const { disabled } = remainder;

  const isShowBottomContainer = helperText;
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValidator = validatorList.find((validator) => validator.validatorAddress === currentValidaotorAddress);

  const handleInputClick = () => {
    onClickItem?.();
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
            startAdornment:
              !validatorCounts && currentValidaotorAddress ? (
                <InputAdornment position="start">
                  <ImageContainer src={currentValidator?.validatorImage} />
                </InputAdornment>
              ) : null,
            endAdornment: disabled ? null : (
              <InputAdornment position="end">
                <RightAdormentConatiner>
                  {rightAdornmentComponent}
                  <ChevronIconContainer data-is-open={isBottomSheetOpen}>
                    <BottomFilledChevronIcon />
                  </ChevronIconContainer>
                </RightAdormentConatiner>
              </InputAdornment>
            ),
          },
          inputLabel: {
            shrink: !!currentValidaotorAddress,
          },
        }}
        onClick={handleInputClick}
        value={validatorCounts ? `${currentValidator?.validatorName} + ${validatorCounts}` : currentValidator?.validatorName}
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
    </Container>
  );
}
