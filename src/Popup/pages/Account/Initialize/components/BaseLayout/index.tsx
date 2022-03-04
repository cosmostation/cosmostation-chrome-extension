import { useEffect, useRef, useState } from 'react';
import { Typography } from '@mui/material';

import { Body, Container, DescriptionContainer, TitleAreaContainer, TitleContainer } from './styled';
import Header from '../Header';

type BaseLayoutProps = {
  children: JSX.Element;
  useHeader?: React.ComponentProps<typeof Header>;
  useTitle?: {
    title: string;
    description?: string;
  };
};

export default function BaseLayout({ children, useHeader, useTitle }: BaseLayoutProps) {
  const titleAreaRef = useRef<HTMLDivElement>(null);

  const [titleAreaHeight, setTitleAreaHeight] = useState(0);

  const containerHeight = `${60 - (useHeader ? 7.6 : 0) - titleAreaHeight / 10}rem`;

  useEffect(() => {
    setTitleAreaHeight(titleAreaRef.current?.clientHeight || 0);
  }, []);
  return (
    <Body>
      {useHeader && <Header {...useHeader} />}
      {useTitle && (
        <TitleAreaContainer ref={titleAreaRef}>
          <TitleContainer>
            <Typography variant="h2">{useTitle.title}</Typography>
          </TitleContainer>
          {useTitle.description && (
            <DescriptionContainer>
              <Typography variant="h4">{useTitle.description}</Typography>
            </DescriptionContainer>
          )}
        </TitleAreaContainer>
      )}
      <Container data-height={containerHeight}>{children}</Container>
    </Body>
  );
}
