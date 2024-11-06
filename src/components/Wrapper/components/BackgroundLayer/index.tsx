import { CircularGradientBackground, Container, Ellipse, RadialGradientLayer, Star } from './styled';

type BackgroundLayer = {
  children: JSX.Element;
};

const ellipseStyles = [
  { width: '120%', minWidth: '180rem', height: '80%' },
  { width: '110%', minWidth: '170rem', height: '70%', top: '9.5rem' },
  { width: '100%', minWidth: '160rem', height: '60%', top: '10.5rem' },
  { width: '90%', minWidth: '150rem', height: '50%', top: '11.5rem' },
];

export default function BackgroundLayer({ children }: BackgroundLayer) {
  const generateStars = (numStars: number) =>
    Array.from({ length: numStars }).map((_, i) => (
      <Star
        key={i}
        style={{
          top: `${Math.random() * 100}vh`,
          left: `${Math.random() * 100}vw`,
          width: `${Math.random() * 3 + 2}px`,
          height: `${Math.random() * 3 + 2}px`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ));

  return (
    <Container>
      {ellipseStyles.map((style, index) => (
        <Ellipse key={index} sx={style} />
      ))}
      <RadialGradientLayer />
      <CircularGradientBackground />
      {generateStars(200)}
      {children}
    </Container>
  );
}
