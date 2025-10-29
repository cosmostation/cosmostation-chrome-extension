import { useRef, useState } from 'react';
import { InputAdornment, type TextFieldProps } from '@mui/material';

import type { ChainBase, UniqueChainId } from '@/types/chain';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import { ChainImageContainer, ChevronIconContainer, Container, RightAdornmentContainer, StyledSelectBox } from './styled';
import ChainListBottomSheet from '../ChainListBottomSheet';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

export type ChainBaseWithInfo = ChainBase & {
  info?: 'ibc';
};

type ChainSelectBoxProps = TextFieldProps & {
  chainList: ChainBaseWithInfo[];
  currentChainId?: UniqueChainId;
  rightAdornmentComponent?: JSX.Element;
  bottomSheetTitle?: string;
  bottomSheetSearchPlaceholder?: string;
  onClickChain?: (id?: UniqueChainId) => void;
};

export default function RecipientChainSelectBox({
  chainList,
  currentChainId,
  rightAdornmentComponent,
  bottomSheetTitle,
  bottomSheetSearchPlaceholder,
  onClickChain,
  ...remainder
}: ChainSelectBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpenChainListBottomSheet, setIsOpenChainListBottomSheet] = useState(false);

  const currentSelectedChain = chainList.find((chain) => isMatchingUniqueChainId(chain, currentChainId));

  const handleMenuItemClick = (value?: UniqueChainId) => {
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
                <ChainImageContainer src={currentSelectedChain?.image || ''} />
              </InputAdornment>
            ) : null,
            endAdornment: remainder.disabled ? null : (
              <InputAdornment position="end">
                <RightAdornmentContainer>
                  {rightAdornmentComponent}
                  <ChevronIconContainer data-is-open={isOpenChainListBottomSheet}>
                    <BottomFilledChevronIcon />
                  </ChevronIconContainer>
                </RightAdornmentContainer>
              </InputAdornment>
            ),
          },
          inputLabel: {
            shrink: !!currentChainId,
          },
        }}
        onClick={!remainder.disabled ? handleInputClick : undefined}
        value={currentSelectedChain?.name}
        {...remainder}
      />
      <ChainListBottomSheet
        currentChainId={currentChainId}
        chainList={chainList}
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
