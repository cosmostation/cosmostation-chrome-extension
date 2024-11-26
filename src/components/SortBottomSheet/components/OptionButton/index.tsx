import type { CommonSortKeyType } from '@/types/sortKey';

import { ActiveBadge, StyledOptionButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  sortKey: CommonSortKeyType;
  isActive?: boolean;
  children: JSX.Element;
  onSelectSortOption?: (val: CommonSortKeyType) => void;
};

export default function OptionButton({ sortKey, isActive, children, onSelectSortOption, ...remainder }: OptionButtonProps) {
  return (
    <StyledOptionButton
      onClick={() => {
        onSelectSortOption?.(sortKey);
      }}
      {...remainder}
    >
      {children}
      {isActive && (
        <ActiveBadge>
          <CheckIcon />
        </ActiveBadge>
      )}
    </StyledOptionButton>
  );
}
