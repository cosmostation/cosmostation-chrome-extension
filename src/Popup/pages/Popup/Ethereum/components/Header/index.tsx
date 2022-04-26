import { Typography } from '@mui/material';

import { ChainNameContainer, Container, OriginContainer } from './styled';

type HeaderProps = {
  chainName: string;
  origin?: string;
  className?: string;
};

export default function Header({ chainName, origin, className }: HeaderProps) {
  return (
    <Container className={className}>
      <ChainNameContainer>
        <Typography variant="h3">{chainName}</Typography>
      </ChainNameContainer>
      {origin && (
        <OriginContainer>
          <Typography variant="h6">{origin}</Typography>
        </OriginContainer>
      )}
    </Container>
  );
}
