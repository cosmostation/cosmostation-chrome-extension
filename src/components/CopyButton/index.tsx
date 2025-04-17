import { useCallback, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import type { IconButtonProps } from '@mui/material';

import { ContentWrapper, IconWrapper, StyledButton, StyledIconWrapper } from './styled';

import ConfirmIcon from '@/assets/images/icons/Confirm20.svg';
import DarkCopyIcon from '@/assets/images/icons/Copy18.svg';
import CopyIcon from '@/assets/images/icons/Copy20.svg';

export type CopyButtonProps = Omit<IconButtonProps, 'children'> & {
  copyString?: string;
  iconSize?: {
    width: number;
    height: number;
  };
  varient?: 'default' | 'dark';
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export default function CopyButton({ copyString, iconSize, varient = 'default', leading, trailing, ...remainder }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    copy(copyString || '');
    setCopied(true);
  }, [copyString]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    copyToClipboard();
    remainder.onClick?.(e);
  };

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <StyledButton type="button" onClick={handleClick} {...remainder}>
      <ContentWrapper>
        {leading}
        <IconWrapper
          sx={{
            width: iconSize?.width ? `${iconSize?.width}rem` : '100%',
            height: iconSize?.height ? `${iconSize.height}rem` : '100%',
          }}
        >
          <StyledIconWrapper className={copied ? 'hidden' : 'visible'}>{varient === 'dark' ? <DarkCopyIcon /> : <CopyIcon />}</StyledIconWrapper>
          <StyledIconWrapper className={copied ? 'visible' : 'hidden'}>
            <ConfirmIcon />
          </StyledIconWrapper>
        </IconWrapper>
        {trailing}
      </ContentWrapper>
    </StyledButton>
  );
}
