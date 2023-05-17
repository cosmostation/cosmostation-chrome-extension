import { Typography } from '@mui/material';

import { Container, HeaderTextContainer, SubHeaderTextContainer, TextContainer } from './styled';

type EmptyAssetProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  Icon: SvgElement;
  headerText: string;
  subHeaderText: string;
};

export default function EmptyAsset({ Icon, headerText, subHeaderText, ...remainder }: EmptyAssetProps) {
  return (
    <Container {...remainder}>
      <Icon />
      <TextContainer>
        <HeaderTextContainer>
          <Typography variant="h4">{headerText}</Typography>
        </HeaderTextContainer>
        <SubHeaderTextContainer>
          <Typography variant="h4">{subHeaderText}</Typography>
        </SubHeaderTextContainer>
      </TextContainer>
    </Container>
  );
}
