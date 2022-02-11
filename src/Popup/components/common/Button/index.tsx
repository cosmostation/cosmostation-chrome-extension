import type { SVGProps, VFC } from 'react';
import { Typography } from '@mui/material';

import { ContentContainer, StyledButton } from './styled';

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: 'h4' | 'h5';
  Image?: VFC<SVGProps<SVGSVGElement>>;
};

export default function Button({ children, Image, typoVarient = 'h4', ...remainder }: ButtonProps) {
  console.log(Image ? 1 : 0);
  return (
    <StyledButton {...remainder} data-typo-varient={typoVarient}>
      <ContentContainer data-is-image={Image ? 1 : 0}>
        {Image && <Image />}
        <Typography variant={typoVarient}>{children}</Typography>
      </ContentContainer>
    </StyledButton>
  );
}
