import Image from 'components/common/Image';

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
      <Image src={imageURL} defaultImgSrc={DefaultCoinImage} />
      {isAggregatedCoin && (
        <CoinAfterImage>
          <Image src={imageURL} defaultImgSrc={DefaultCoinImage} />
          <CoinAfterImage>
            <Image src={imageURL} defaultImgSrc={DefaultCoinImage} />
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
