import { Typography } from '@mui/material';

import { BackButton, Container, SideButton, TextContainer } from './styled';

import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';
import Management24Icon from '~/images/icons/Mangement24.svg';

type SubHeaderProps = {
  title: string;
  onClick?: () => void;
  onSubClick?: () => void;
};

export default function SubHeader({ title, onClick, onSubClick }: SubHeaderProps) {
  return (
    <Container>
      <BackButton onClick={onClick}>
        <LeftArrow16Icon />
      </BackButton>
      <TextContainer>
        <Typography variant="h3">{title}</Typography>
      </TextContainer>
      {onSubClick && (
        <SideButton onClick={onSubClick}>
          <Management24Icon />
        </SideButton>
      )}
    </Container>
  );
}
