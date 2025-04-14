import { Container, StyledImage } from './styled';

type BadgeProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  name: string;
  image?: string;
  colorHex?: string;
};

export default function Badge({ name, image, colorHex, ...remainder }: BadgeProps) {
  return (
    <Container colorHex={colorHex} {...remainder}>
      {image && <StyledImage src={image} />}
      {name}
    </Container>
  );
}
