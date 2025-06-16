import { useEffect, useRef, useState } from 'react';
import { Typography, type TypographyProps } from '@mui/material';

import { shorterAddress } from '@/utils/string';

import { Container } from './styled';

type CenterEllipsisTextProps = TypographyProps & {
  children: string;
};

export default function CenterEllipsisText({ children, ...typographyProps }: CenterEllipsisTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState(children);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const updateTruncatedText = () => {
      const width = element.clientWidth;

      if (width < 100) {
        setDisplayText(shorterAddress(children, 12) || '');
      } else if (width < 200) {
        setDisplayText(shorterAddress(children, 16) || '');
      } else if (width < 300) {
        setDisplayText(shorterAddress(children, 34) || '');
      } else if (width < 400) {
        setDisplayText(shorterAddress(children, 43) || '');
      } else if (width < 450) {
        setDisplayText(shorterAddress(children, 48) || '');
      } else if (width < 500) {
        setDisplayText(shorterAddress(children, 54) || '');
      } else {
        setDisplayText(children);
      }
    };

    updateTruncatedText();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateTruncatedText);
      resizeObserver.observe(element);

      return () => resizeObserver.disconnect();
    }

    return undefined;
  }, [children]);

  return (
    <Container ref={containerRef}>
      <Typography noWrap title={children} {...typographyProps}>
        {displayText}
      </Typography>
    </Container>
  );
}
