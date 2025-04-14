import { useCallback, useMemo, useRef, useState } from 'react';
import { InputAdornment, type TextFieldProps, Typography } from '@mui/material';

import type { ChainBase, CosmosChain, EvmChain, UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';

import ChainListBottomSheet from './components/ChainListBottomSheet';
import EthermintSelectBottomSheet from './components/EthermintSelectBottomSheet';
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

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type ChainSelectBoxProps = TextFieldProps & {
  chainList: ChainBase[];
  currentSelectedChain?: ChainBase;
  helperText?: string;
  rightAdornmentComponent?: JSX.Element;
  bottomSheetTitle?: string;
  bottomSheetSearchPlaceholder?: string;
  disableSortChain?: boolean;
  onClickChain?: (id?: UniqueChainId) => void;
};

export default function EthermintFilterChainSelectBox({
  chainList,
  currentSelectedChain,
  error = false,
  helperText,
  rightAdornmentComponent,
  bottomSheetTitle,
  bottomSheetSearchPlaceholder,
  disableSortChain = false,
  onClickChain,
  ...remainder
}: ChainSelectBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [pendingChainId, setPendingChainId] = useState<UniqueChainId | undefined>();

  const filteredChainList = useMemo(() => {
    return chainList.filter((chain, idx, arr) => arr.findIndex((item) => item.id === chain.id) === idx);
  }, [chainList]);

  const tempCosmosChain = useMemo(() => {
    if (!pendingChainId) return undefined;
    const { id } = parseUniqueChainId(pendingChainId);
    return chainList.find((chain): chain is CosmosChain => chain.id === id && chain.chainType === 'cosmos');
  }, [pendingChainId, chainList]);

  const handleInputClick = useCallback(() => {
    setBottomSheetOpen(true);
    inputRef.current?.blur();
  }, []);

  const closeBottomSheets = useCallback(() => {
    setPendingChainId(undefined);
    setBottomSheetOpen(false);
  }, []);

  const handleChainSelect = useCallback(
    (chainId?: UniqueChainId) => {
      if (!chainId) return;

      const parsed = parseUniqueChainId(chainId);
      const selected = chainList.find((c) => isMatchingUniqueChainId(c, chainId));

      const isCosmosLikeEvm = parsed.chainType === 'evm' && (selected as EvmChain)?.isCosmos;
      const isEvmLikeCosmos = parsed.chainType === 'cosmos' && (selected as CosmosChain)?.isEvm;

      if (isCosmosLikeEvm || isEvmLikeCosmos) {
        setPendingChainId(chainId);
      } else {
        onClickChain?.(chainId);
        setBottomSheetOpen(false);
      }
    },
    [chainList, onClickChain],
  );

  const handleTypeSelect = useCallback(
    (type: 'cosmos' | 'evm') => {
      if (!pendingChainId) return;
      const { id } = parseUniqueChainId(pendingChainId);
      const selectedId = getUniqueChainIdWithManual(id, type);
      onClickChain?.(selectedId);
      closeBottomSheets();
    },
    [pendingChainId, onClickChain, closeBottomSheets],
  );

  return (
    <Container>
      <StyledSelectBox
        variant="standard"
        inputRef={inputRef}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: currentSelectedChain && (
              <InputAdornment position="start">
                <ChainImageContainer src={currentSelectedChain.image || ''} />
              </InputAdornment>
            ),
            endAdornment: !remainder.disabled && (
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
            shrink: !!currentSelectedChain,
          },
        }}
        onClick={handleInputClick}
        value={currentSelectedChain?.name}
        {...remainder}
      />

      {!!helperText && (
        <BottomWrapper>
          <BottomContainer>
            <HelperTextContainer data-is-error={error}>
              <Typography variant="b4_M">{helperText}</Typography>
            </HelperTextContainer>
          </BottomContainer>
        </BottomWrapper>
      )}

      <ChainListBottomSheet
        open={isBottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        currentChain={currentSelectedChain}
        chainList={filteredChainList}
        disableAllNetwork
        disableSort={disableSortChain}
        title={bottomSheetTitle}
        searchPlaceholder={bottomSheetSearchPlaceholder}
        onClickChain={handleChainSelect}
      />

      <EthermintSelectBottomSheet
        open={!!pendingChainId}
        onClose={closeBottomSheets}
        bech32AddressPrefix={(tempCosmosChain?.accountPrefix ?? '') + 1}
        onSelectOption={handleTypeSelect}
      />
    </Container>
  );
}
