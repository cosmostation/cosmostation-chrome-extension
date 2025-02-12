import type React from 'react';

import { Container } from './styled';

type BaseFooterProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children?: React.ReactNode;
};

export default function BaseFooter({ children, ...remainder }: BaseFooterProps) {
  return <Container {...remainder}>{children}</Container>;
}
