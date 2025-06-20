import { Container, IconContainer, StyledOutlinedChipButton, SubTitleText, TextContainer, TitleText } from './styled';

import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type EmptyAssetProps = {
  icon?: JSX.Element;
  title: string;
  subTitle: string;
  chipButtonProps?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
};

export default function EmptyAsset({ icon, title, subTitle, chipButtonProps }: EmptyAssetProps) {
  return (
    <Container>
      <IconContainer>{icon || <NoSearchIcon />}</IconContainer>
      <TextContainer>
        <TitleText variant="b2_M">{title}</TitleText>
        <SubTitleText variant="b3_R_Multiline">{subTitle}</SubTitleText>
      </TextContainer>
      {chipButtonProps && <StyledOutlinedChipButton {...chipButtonProps}>{chipButtonProps?.children}</StyledOutlinedChipButton>}
    </Container>
  );
}
