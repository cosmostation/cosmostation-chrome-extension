import { Typography } from '@mui/material';

import { BodyText, Container, TopContainer } from './styled';

import InformationIcon from '@/assets/images/icons/InforMation14.svg';

type InformationPanelProps = {
  titleText: string;
  bodyText: string;
  varitant: 'caution' | 'info';
  icon?: JSX.Element;
};

export default function InformationPanel({ titleText, bodyText, varitant, icon }: InformationPanelProps) {
  const displayedIcon = (() => {
    if (icon) {
      return icon;
    }

    return <InformationIcon />;
  })();

  return (
    <Container>
      <TopContainer variant={varitant}>
        {displayedIcon}
        <Typography variant="b3_M">{titleText}</Typography>
      </TopContainer>
      <BodyText variant="b4_R_Multiline">{bodyText}</BodyText>
    </Container>
  );
}
