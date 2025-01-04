import DefaultCoinImage from '@/assets/images/coin/defaultCoin.png';

type AssetImageProps = {
  src?: string | null;
  defaultImgSrc?: string;
  alt?: string;
  className?: string;
};

export default function AssetImage({ src, defaultImgSrc = DefaultCoinImage, alt, className }: AssetImageProps) {
  const validSrc = src || defaultImgSrc;

  return (
    <img
      className={className}
      src={validSrc}
      alt={alt}
      onError={(event) => {
        event.currentTarget.onerror = null;

        event.currentTarget.src = defaultImgSrc;
      }}
    />
  );
}
