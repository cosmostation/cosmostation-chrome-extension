import { useState } from 'react';

import { StyledCheckBoxButton } from './styled';

import CheckIcon from '@/assets/images/icons/Check.svg';

type CheckBoxButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isChecked?: boolean;
  onClick?: (isChecked: boolean) => void;
};

export default function CheckBoxButton({ isChecked = false, onClick, ...remainder }: CheckBoxButtonProps) {
  const [isButtonActive, setIsButtonActive] = useState(isChecked);

  return (
    <StyledCheckBoxButton
      type="button"
      onClick={() => {
        setIsButtonActive(!isButtonActive);
        onClick?.(!isButtonActive);
      }}
      isChecked={isButtonActive}
      {...remainder}
    >
      {isButtonActive && <CheckIcon />}
    </StyledCheckBoxButton>
  );
}
