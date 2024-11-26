import Image from 'components/common/Image';

import { BadgeImageContainer, CoinAfterImage, ImageContainer } from './styled';

export type BaseCoinImageProps = React.HTMLAttributes<HTMLDivElement> & {
  imageURL?: string;
  badgeImageURL?: string;
  isAggregatedCoin?: boolean;
};

export default function BaseCoinImage({ imageURL, badgeImageURL, isAggregatedCoin, ...remainder }: BaseCoinImageProps) {
  return (
    <ImageContainer style={{ width: '3.2rem', height: '3.2rem' }} {...remainder}>
      <Image src={imageURL} />
      {isAggregatedCoin && (
        <CoinAfterImage>
          <Image src={imageURL} />
          <CoinAfterImage>
            <Image src={imageURL} />
          </CoinAfterImage>
        </CoinAfterImage>
      )}
      {badgeImageURL && (
        <BadgeImageContainer>
          <Image src={badgeImageURL} />
        </BadgeImageContainer>
      )}
    </ImageContainer>
  );
}
