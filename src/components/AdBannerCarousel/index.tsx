import { useCallback, useEffect, useMemo, useRef } from 'react';
import Collapse from '@mui/material/Collapse';

import { useAdInfos } from '@/hooks/useAdInfos';
import { useCarousel } from '@/hooks/useCarousel';
import type { AdV1 } from '@/types/registry/ad';

import { AdBannerContainer, CloseIconButton, WrapperLink } from './styled';
import Carousel from '../common/Carousel';

import Close24Icon from '@/assets/images/icons/Close24.svg';

export default function AdBannerCarousel() {
  const { data: adInfoData, dismissAd } = useAdInfos();

  const filteredAdInfos = useMemo(() => adInfoData?.filteredAds ?? [], [adInfoData?.filteredAds]);

  const cachedAdsRef = useRef<AdV1[]>(filteredAdInfos);

  const displayAds = filteredAdInfos.length > 0 ? filteredAdInfos : cachedAdsRef.current;

  const carousel = useCarousel({
    totalItems: displayAds.length,
    autoRotate: true,
    autoRotateInterval: 4000,
  });

  const handleCloseAd = useCallback(
    async (adId: string) => {
      await dismissAd(adId);
    },
    [dismissAd],
  );

  const isVisible = filteredAdInfos.length > 0;

  const handleExited = () => {
    cachedAdsRef.current = [];
  };

  useEffect(() => {
    if (filteredAdInfos.length > 0) {
      cachedAdsRef.current = filteredAdInfos;
    }
  }, [filteredAdInfos]);

  return (
    <Collapse in={isVisible} timeout={300} unmountOnExit onExited={handleExited}>
      <AdBannerContainer onMouseEnter={carousel.pause} onMouseLeave={carousel.resume}>
        <Carousel currentIndex={carousel.currentIndex} onIndexChange={carousel.goTo}>
          {displayAds.map((ad) => (
            <WrapperLink
              key={ad.id}
              data-bg-image-src={ad.images?.extension}
              {...(ad.linkUrl && {
                href: ad.linkUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
            >
              <CloseIconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseAd(ad.id);
                }}
              >
                <Close24Icon />
              </CloseIconButton>
            </WrapperLink>
          ))}
        </Carousel>
      </AdBannerContainer>
    </Collapse>
  );
}
