import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ChainBase, UniqueChainId } from '@/types/chain';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import { ChainImageContainer, ChevronIconContainer, GridMenuIconContainer, StyledIconButton, TextContainer } from './styled';
import ChainListBottomSheet from '../ChainListBottomSheet';
import type { IconTextButtonProps } from '../common/IconTextButton';

import AllNetworkIcon from '@/assets/images/icons/AllNetwork36.svg';
import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type AllNetworkButtonprops = IconTextButtonProps & {
  variant?: 'normal' | 'chip';
  currentChainId?: UniqueChainId;
  chainList?: ChainBase[];
  isManageAssets?: boolean;
  selectChainOption?: (id?: UniqueChainId) => void;
};

export default function AllNetworkButton({
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
            <ChainImageContainer sizeVariant={'large'} src={currentChain.image || ''} />
          ) : (
            <GridMenuIconContainer sizeVariant={'large'}>
              <AllNetworkIcon />
            </GridMenuIconContainer>
          )
        }
        trailingIcon={
          <ChevronIconContainer sizeVariant={'medium'} data-is-open={isOpenChainListBottomSheet}>
            <BottomFilledChevronIcon />
          </ChevronIconContainer>
        }
        onClick={() => {
          setIsOpenChainListBottomSheet(true);
        }}
        {...remainder}
      >
        <TextContainer variant={'b2_M'}>{currentChain ? currentChain.name : t('components.AllNetworkButton.index.allNetwork')}</TextContainer>
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
