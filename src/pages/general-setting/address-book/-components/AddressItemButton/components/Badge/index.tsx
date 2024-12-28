import { Container, StyledImage } from './styled';

type BadgeProps = {
  name: string;
  image?: string;
  colorHex?: string;
};

export default function Badge({ name, image, colorHex }: BadgeProps) {
  return (
    <Container colorHex={colorHex}>
      {image && <StyledImage src={image} />}
      {name}
    </Container>
  );
}
