import { Container, IconContainer, SubTitleText, TextContainer, TitleText } from './styled';

type EmptyAssetProps = {
  icon: JSX.Element;
  title: string;
  subTitle: string;
};

export default function EmptyAsset({ icon, title, subTitle }: EmptyAssetProps) {
  return (
    <Container>
      <IconContainer>{icon}</IconContainer>
      <TextContainer>
        <TitleText variant="b2_M">{title}</TitleText>
        <SubTitleText variant="b3_R_Multiline">{subTitle}</SubTitleText>
      </TextContainer>
    </Container>
  );
}
