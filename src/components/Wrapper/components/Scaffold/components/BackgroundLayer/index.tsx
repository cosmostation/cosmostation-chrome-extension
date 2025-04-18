import { BackgroundContainer, BlackRadialGradientLayer, Ellipse, ellipseStyles, PurpleRadialGradientLayer, Star, SubtleGradientLayer } from './styled';

type BackgroundLayer = {
  children: JSX.Element;
};

export default function BackgroundLayer({ children }: BackgroundLayer) {
  return (
    <BackgroundContainer>
      {ellipseStyles.map((style, index) => (
        <Ellipse
          key={index}
          sx={style}
          style={{
            display: 'none',
          }}
        />
      ))}
      <SubtleGradientLayer
        style={{
          display: 'none',
        }}
      />
      <BlackRadialGradientLayer
        style={{
          display: 'none',
        }}
      />
      <PurpleRadialGradientLayer
        style={{
          display: 'none',
        }}
      />
      {Array.from({ length: 300 }).map((_, i) => (
        <Star
          key={i}
          style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            width: `${(Math.random() * 3 + 2) / 10}rem`,
            height: `${(Math.random() * 3 + 2) / 10}rem`,
            animationDelay: `${Math.random() * 2}s`,
            filter: `blur(${(Math.random() * 2 + 0.8) / 10}rem)`,
          }}
        />
      ))}
      {children}
    </BackgroundContainer>
  );
}
