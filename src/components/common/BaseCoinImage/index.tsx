import AssetImage from '@/components/AssetImage';

import { BadgeImageContainer, CoinAfterImage, ImageContainer } from './styled';

import DefaultCoinImage from '@/assets/images/coin/defaultCoin.png';

export type BaseCoinImageProps = React.HTMLAttributes<HTMLDivElement> & {
  imageURL?: string;
  badgeImageURL?: string;
  isAggregatedCoin?: boolean;
};

export default function BaseCoinImage({ imageURL, badgeImageURL, isAggregatedCoin, ...remainder }: BaseCoinImageProps) {
  return (
    <ImageContainer {...remainder}>
      <AssetImage src={imageURL} defaultImgSrc={DefaultCoinImage} />
      {isAggregatedCoin && (
        <CoinAfterImage>
          <AssetImage src={imageURL} defaultImgSrc={DefaultCoinImage} />
          <CoinAfterImage>
            <AssetImage src={imageURL} defaultImgSrc={DefaultCoinImage} />
          </CoinAfterImage>
        </CoinAfterImage>
      )}
      {badgeImageURL && (
        <BadgeImageContainer>
          <AssetImage src={badgeImageURL} />
        </BadgeImageContainer>
      )}
    </ImageContainer>
  );
}
