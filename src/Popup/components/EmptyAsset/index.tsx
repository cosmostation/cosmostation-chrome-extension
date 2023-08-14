import { Typography } from '@mui/material';

import { Container, HeaderTextContainer, SubHeaderTextContainer, TextContainer } from './styled';

type EmptyAssetProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  Icon: SvgElement;
  headerText: string;
  subHeaderText: string;
  subContainerWidth?: string;
};

export default function EmptyAsset({ Icon, headerText, subHeaderText, subContainerWidth = '22', ...remainder }: EmptyAssetProps) {
  return (
    <Container {...remainder}>
      <Icon />
      <TextContainer>
        <HeaderTextContainer>
          <Typography variant="h4">{headerText}</Typography>
        </HeaderTextContainer>
        <SubHeaderTextContainer data-width={subContainerWidth}>
          <Typography variant="h5">{subHeaderText}</Typography>
        </SubHeaderTextContainer>
      </TextContainer>
    </Container>
  );
}
