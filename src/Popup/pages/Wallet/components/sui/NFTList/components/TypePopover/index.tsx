import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';

import { Container, StyledPopover, TypeButton, TypeLeftContainer, TypeLeftNumberContainer, TypeLeftTextContainer, TypeRightContainer } from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

export type TypeInfo = {
  type: string;
  name: string;
  count: string | number;
};

type TypePopoverProps = Omit<PopoverProps, 'children'> & { currentTypeInfo?: TypeInfo; typeInfos: TypeInfo[]; onClickType?: (coinInfo: TypeInfo) => void };

export default function TypePopover({ typeInfos, currentTypeInfo, onClickType, onClose, ...remainder }: TypePopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {typeInfos.map((item) => {
          const isActive = currentTypeInfo?.type === item.type;
          return (
            <TypeButton
              type="button"
              key={item.type}
              data-is-active={isActive ? 1 : 0}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickType?.(item);
                onClose?.({}, 'backdropClick');
              }}
            >
              <TypeLeftContainer>
                <Tooltip title={item.name} placement="top" arrow>
                  <TypeLeftTextContainer>
                    <Typography variant="h6">{item.name}</Typography>
                  </TypeLeftTextContainer>
                </Tooltip>
                <TypeLeftNumberContainer>
                  <Typography variant="h6">{item.count}</Typography>
                </TypeLeftNumberContainer>
              </TypeLeftContainer>
              <TypeRightContainer>{isActive && <Check16Icon />}</TypeRightContainer>
            </TypeButton>
          );
        })}
      </Container>
    </StyledPopover>
  );
}
