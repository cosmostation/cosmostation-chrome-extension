import unknownImg from '~/images/symbols/unknown.png';

type ImageProps = {
  src?: string | null;
  defaultImgSrc?: string;
  alt?: string;
  className?: string;
};

export default function Image({ src = 'https://', defaultImgSrc = unknownImg, alt, className }: ImageProps) {
  const validSrc = src || 'https://';

  return (
    <img
      className={className}
      src={validSrc}
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
