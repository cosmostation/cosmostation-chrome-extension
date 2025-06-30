import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TypoVariantKeys } from '@/styles/theme';
import type { ChainBase, UniqueChainId } from '@/types/chain';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import { ChainImageContainer, ChevronIconContainer, GridMenuIconContainer, StyledIconButton, TextContainer } from './styled';
import ChainListBottomSheet from '../ChainListBottomSheet';
import type { IconTextButtonProps } from '../common/IconTextButton';

import AllNetworkIcon from '@/assets/images/icons/AllNetwork36.svg';
import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type AllNetworkButtonprops = IconTextButtonProps & {
  typoVarient?: TypoVariantKeys;
  variant?: 'normal' | 'chip';
  currentChainId?: UniqueChainId;
  chainList?: ChainBase[];
  isManageAssets?: boolean;
  isWithValue?: boolean;
  sizeVariant?: 'small' | 'medium' | 'large';
  selectChainOption?: (id?: UniqueChainId) => void;
};

export default function AllNetworkButton({
  typoVarient = 'b2_M',
  variant = 'normal',
  currentChainId,
  chainList,
  isManageAssets = false,
  isWithValue = false,
  sizeVariant,
  selectChainOption,
  ...remainder
}: AllNetworkButtonprops) {
  const { t } = useTranslation();
  const [isOpenChainListBottomSheet, setIsOpenChainListBottomSheet] = useState(false);

  const currentChain = chainList?.find((chain) => isMatchingUniqueChainId(chain, currentChainId));
  const resolvedChainName = currentChain
    ? currentChain.name.length > 20
      ? currentChain.name.substring(0, 15) + '...'
      : currentChain?.name
    : t('components.AllNetworkButton.index.allNetwork');
  return (
    <>
      <StyledIconButton
        variants={variant}
        leadingIcon={
          currentChain ? (
            <ChainImageContainer sizeVariant={sizeVariant || 'large'} src={currentChain.image || ''} />
          ) : (
            <GridMenuIconContainer sizeVariant={sizeVariant || 'large'}>
              <AllNetworkIcon />
            </GridMenuIconContainer>
          )
        }
        trailingIcon={
          remainder.disabled ? undefined : (
            <ChevronIconContainer sizeVariant={sizeVariant || 'medium'} data-is-open={isOpenChainListBottomSheet}>
              <BottomFilledChevronIcon />
            </ChevronIconContainer>
          )
        }
        onClick={() => {
          setIsOpenChainListBottomSheet(true);
        }}
        {...remainder}
      >
        <TextContainer variant={typoVarient}>{resolvedChainName}</TextContainer>
      </StyledIconButton>
      <ChainListBottomSheet
        currentChainId={currentChainId}
        chainList={chainList || []}
        open={isOpenChainListBottomSheet}
        onClose={() => setIsOpenChainListBottomSheet(false)}
        customType={isManageAssets ? 'manageAssets' : 'normal'}
        isShowValue={isWithValue}
        buttonVarients={isWithValue ? 'label' : undefined}
        onClickChain={(id) => {
          selectChainOption?.(id);
        }}
      />
    </>
  );
}
