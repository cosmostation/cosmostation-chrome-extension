import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';

import { BottomContainer, Check, CheckContainer, Container, DescriptionContainer, TitleContainer } from './styled';

import Check46x33Icon from '~/images/icons/Check46x33.svg';

export default function Entry() {
  return (
    <Container>
      <TitleContainer>
        <Typography variant="h2">모두 완료되었습니다!</Typography>
      </TitleContainer>
      <DescriptionContainer>
        <Typography variant="h4">You may now open the extension.</Typography>
      </DescriptionContainer>
      <CheckContainer>
        <Check>
          <Check46x33Icon />
        </Check>
      </CheckContainer>
      <BottomContainer>
        <Button onClick={() => window.close()}>Done</Button>
      </BottomContainer>
    </Container>
  );
}
