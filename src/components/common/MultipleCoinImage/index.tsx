import { ImageContainer, MultipleImage } from './styled';

export type MultipleCoinImageProps = React.HTMLAttributes<HTMLDivElement> & {
  imageURLs?: string[];
};

export default function MultipleCoinImage({ imageURLs, ...remainder }: MultipleCoinImageProps) {
  // return (
  //   <ImageContainer style={{ width: '3.2rem', height: '3.2rem' }} {...remainder}>
  //     {imageURLs?.map((imageURL, i )=>{

  //       return <Image key={imageURL} src={imageURL}/>
  //     })}
  //   </ImageContainer>
  // );

  return (
    <ImageContainer style={{ width: '3.2rem', height: '3.2rem' }} {...remainder}>
      {imageURLs?.map((item, i) => {
        return (
          <MultipleImage
            key={item}
            src={item}
            sx={{
              left: `${i * 25}%`,
              zIndex: i,
            }}
          />
        );
      })}
    </ImageContainer>
  );
}
