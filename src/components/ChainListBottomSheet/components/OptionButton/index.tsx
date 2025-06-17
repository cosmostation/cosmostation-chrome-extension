import { forwardRef } from 'react';

import BaseOptionButton from '@/components/common/BaseOptionButton';
import type { UniqueChainId } from '@/types/chain';

import { ActiveBadge, ChainImage, ChainNameText } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

type OptionButtonProps = {
  image: string | null;
  name: string;
  id?: UniqueChainId;
  isActive?: boolean;
  varient?: 'indicator' | 'label';
  leftSecondHeader?: JSX.Element;
  rightComponent?: JSX.Element;
  onSelectChain?: (id?: UniqueChainId) => void;
};

const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(
  ({ image, name, isActive, id, varient = 'indicator', onSelectChain, leftSecondHeader, rightComponent, ...remainder }, ref) => {
    return (
      <BaseOptionButton
        onClick={() => {
          onSelectChain?.(id);
        }}
        leftContent={<ChainImage src={image} />}
        leftSecondHeader={leftSecondHeader || <ChainNameText variant="b2_M">{name}</ChainNameText>}
        rightContent={
          rightComponent ? (
            rightComponent
          ) : isActive && varient === 'indicator' ? (
            <ActiveBadge>
              <CheckIcon />
            </ActiveBadge>
          ) : undefined
        }
        disableRightChevron
        enableActiveLabel={varient === 'label'}
        isActive={isActive}
        {...remainder}
        ref={ref}
      />
    );
  },
);

OptionButton.displayName = 'OptionButton';

export default OptionButton;
