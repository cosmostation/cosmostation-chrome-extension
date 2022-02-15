import unknownImg from '~/images/symbols/unknown.png';

type ImageProps = {
  src?: string;
  defaultImgSrc?: string;
  alt?: string;
};

export default function Image({ src = 'https://', defaultImgSrc = unknownImg, alt }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(event) => {
        // eslint-disable-next-line no-param-reassign
        event.currentTarget.onerror = null;
        // eslint-disable-next-line no-param-reassign
        event.currentTarget.src = defaultImgSrc;
      }}
    />
  );
}
