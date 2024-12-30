import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TypoVariantKeys } from '@/styles/theme';
import type { ChainBase, UniqueChainId } from '@/types/chain';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import { ChainImageContainer, ChevronIconContainer, GridMenuIconContainer, StyledIconButton, TextContainer } from './styled';
import ChainListBottomSheet from '../ChainListBottomSheet';
import type { IconTextButtonProps } from '../common/IconTextButton';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import GridMenuIcon from '@/assets/images/icons/GridMenu14.svg';

type AllNetworkButtonprops = IconTextButtonProps & {
  typoVarient?: TypoVariantKeys;
  variant?: 'normal' | 'chip';
  sizeVariant?: 'small' | 'medium' | 'large';
  currentChainId?: UniqueChainId;
  chainList?: ChainBase[];
  isManageAssets?: boolean;
  selectChainOption?: (id?: UniqueChainId) => void;
};

export default function AllNetworkButton({
  typoVarient = 'b4_M',
  sizeVariant = 'small',
  variant = 'normal',
  currentChainId,
  chainList,
  isManageAssets = false,
  selectChainOption,
  ...remainder
}: AllNetworkButtonprops) {
  const { t } = useTranslation();
  const [isOpenChainListBottomSheet, setIsOpenChainListBottomSheet] = useState(false);

  const currentChain = chainList?.find((chain) => isMatchingUniqueChainId(chain, currentChainId));

  return (
    <>
      <StyledIconButton
        variants={variant}
        leadingIcon={
          currentChain ? (
            <ChainImageContainer sizeVariant={sizeVariant} src={currentChain.image} />
          ) : (
            <GridMenuIconContainer sizeVariant={sizeVariant}>
              <GridMenuIcon />
            </GridMenuIconContainer>
          )
        }
        trailingIcon={
          <ChevronIconContainer sizeVariant={sizeVariant} data-is-open={isOpenChainListBottomSheet}>
            <BottomFilledChevronIcon />
          </ChevronIconContainer>
        }
        onClick={() => {
          setIsOpenChainListBottomSheet(true);
        }}
        {...remainder}
      >
        <TextContainer variant={typoVarient}>{currentChain ? currentChain.name : t('components.AllNetworkButton.index.allNetwork')}</TextContainer>
      </StyledIconButton>
      <ChainListBottomSheet
        currentChainId={currentChainId}
        chainList={chainList || []}
        open={isOpenChainListBottomSheet}
        onClose={() => setIsOpenChainListBottomSheet(false)}
        customType={isManageAssets ? 'manageAssets' : 'normal'}
        onClickChain={(id) => {
          selectChainOption?.(id);
        }}
      />
    </>
  );
}
