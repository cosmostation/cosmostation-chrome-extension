import { useState } from 'react';

import BaseSkeleton from '../BaseSkeleton';

import DefaultCoinImage from '@/assets/images/coin/defaultCoin.png';

type SkeletonImageProps = {
  src?: string | null;
  defaultImgSrc?: string;
  alt?: string;
  className?: string;
};

export default function SkeletonImage({ src, defaultImgSrc = DefaultCoinImage, alt, className }: SkeletonImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const validSrc = src || defaultImgSrc;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultImgSrc;
    setIsLoaded(true);
  };

  return (
    <>
      {!isLoaded && <BaseSkeleton variant="rectangular" width="100%" height="100%" />}
      <img className={className} src={validSrc} alt={alt} onLoad={handleLoad} onError={handleError} style={{ display: isLoaded ? 'block' : 'none' }} />
    </>
  );
}
