import type React from 'react';

import { Container } from './styled';

type BaseFooterProps = {
  children?: React.ReactNode;
};

export default function BaseFooter({ children }: BaseFooterProps) {
  return <Container>{children}</Container>;
}
