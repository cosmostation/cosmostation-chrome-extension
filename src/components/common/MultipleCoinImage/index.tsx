import { ImageContainer, MultipleImage } from './styled';

export type MultipleCoinImageProps = React.HTMLAttributes<HTMLDivElement> & {
  imageURLs?: string[];
};

export default function MultipleCoinImage({ imageURLs, ...remainder }: MultipleCoinImageProps) {
  return (
    <ImageContainer {...remainder}>
      {imageURLs?.map((item, i) => {
        const imageURLCount = imageURLs?.length || 0;

        const imageCountLimit = (() => {
          if (imageURLCount === 5) {
            return 39;
          }
          if (imageURLCount === 4) {
            return 40;
          }
          if (imageURLCount === 3) {
            return 42;
          }
          if (imageURLCount === 2) {
            return 43;
          }
          return 46;
        })();

        return (
          <MultipleImage
            key={item}
            src={item}
            sx={{
              left: `${imageCountLimit + i * 4}%`,
              zIndex: -i,
            }}
          />
        );
      })}
    </ImageContainer>
  );
}
