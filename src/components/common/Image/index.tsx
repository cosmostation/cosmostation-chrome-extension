type ImageProps = {
  src?: string | null;
  defaultImgSrc?: string;
  alt?: string;
  className?: string;
};

export default function Image({ src = 'https://', alt, className }: ImageProps) {
  const validSrc = src || 'https://';

  return (
    <img
      className={className}
      src={validSrc}
      alt={alt}
      onError={(event) => {
        event.currentTarget.onerror = null;
      }}
    />
  );
}
