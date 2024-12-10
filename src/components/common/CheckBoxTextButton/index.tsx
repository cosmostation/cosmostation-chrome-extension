import { useState } from 'react';

import { StyledCheckBox, StyledCheckBoxTextButton } from './styled';

import CheckIcon from '@/assets/images/icons/Check.svg';

type IconTextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isChecked?: boolean;
  children?: JSX.Element;
  checkBoxProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  onClick?: (isChecked: boolean) => void;
};

export default function CheckBoxTextButton({ isChecked = false, children, checkBoxProps, onClick, ...remainder }: IconTextButtonProps) {
  const [isButtonActive, setIsButtonActive] = useState(isChecked);

  return (
    <StyledCheckBoxTextButton
      type="button"
      onClick={() => {
        setIsButtonActive(!isButtonActive);
        onClick?.(!isButtonActive);
      }}
      {...remainder}
    >
      <StyledCheckBox
        isChecked={isButtonActive}
        style={{
          width: '1.35rem',
          height: '1.35rem',
          marginRight: '0.625rem',
        }}
        {...checkBoxProps}
      >
        {isButtonActive && <CheckIcon />}
      </StyledCheckBox>
      {children}
    </StyledCheckBoxTextButton>
  );
}
