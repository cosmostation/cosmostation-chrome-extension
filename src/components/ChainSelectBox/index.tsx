import { useRef, useState } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import {
  BottomContainer,
  BottomWrapper,
  ChainImageContainer,
  ChevronIconContainer,
  HelperTextContainer,
  RightAdormentConatiner,
  StyledSelectBox,
} from './styled';
import BottomSheet from '../common/BottomSheet';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type ChainSelectBoxProps = TextFieldProps & {
  helperText?: string;
  onClickChain?: (chain: string) => void;
  rightAdornmentComponent?: JSX.Element;
};

export default function ChainSelectBox({ error = false, helperText, rightAdornmentComponent, onClickChain, ...remainder }: ChainSelectBoxProps) {
  const isShowBottomContainer = helperText;
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedValue, setSelectedValue] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleMenuItemClick = (value: string) => {
    setSelectedValue(value);
    onClickChain?.(value);
    setDrawerOpen(false);
  };

  const handleInputClick = () => {
    setDrawerOpen(true);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <>
      <StyledSelectBox
        variant="standard"
        inputRef={inputRef}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: selectedValue ? (
              <InputAdornment position="start">
                <ChainImageContainer src={'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/stride/asset/stumee.png'} />
              </InputAdornment>
            ) : null,
            endAdornment: (
              <InputAdornment position="end">
                <RightAdormentConatiner>
                  {rightAdornmentComponent}
                  <ChevronIconContainer data-is-open={drawerOpen}>
                    <BottomFilledChevronIcon />
                  </ChevronIconContainer>
                </RightAdormentConatiner>
              </InputAdornment>
            ),
          },
          inputLabel: {
            shrink: !!selectedValue,
          },
        }}
        onClick={handleInputClick}
        value={selectedValue}
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

      {/* TODO 컴포넌트화 */}
      <BottomSheet anchor="bottom" open={drawerOpen} onClose={handleDrawerClose}>
        <>
          <button onClick={() => handleMenuItemClick('Option 1')}>Option 1</button>
          <button onClick={() => handleMenuItemClick('Option 2')}>Option 2</button>
        </>
      </BottomSheet>
    </>
  );
}
