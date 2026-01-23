import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import AdBannerCarousel from '@/components/AdBannerCarousel';
import Search from '@/components/Search';

import { AdCarouselContainer, FilterContainer, StickyTabPanelContentsContainer } from './styled';
import ManageCryptoSection from '../ManageCryptoSection';

type CryptoFilterSectionProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isDebouncing: boolean;
  onClickFilter: () => void;
};

function CryptoFilterSection({ search, onSearchChange, onClearSearch, isDebouncing, onClickFilter }: CryptoFilterSectionProps) {
  const { t } = useTranslation();

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.currentTarget.value);
    },
    [onSearchChange],
  );

  return (
    <StickyTabPanelContentsContainer>
      <FilterContainer>
        <Search
          value={search}
          onChange={handleSearchChange}
          placeholder={t('pages.index.searchPlaceholder')}
          isPending={isDebouncing}
          onClickFilter={onClickFilter}
          onClear={onClearSearch}
        />
      </FilterContainer>

      <AdCarouselContainer>
        <AdBannerCarousel />
      </AdCarouselContainer>

      <ManageCryptoSection />
    </StickyTabPanelContentsContainer>
  );
}

export default memo(CryptoFilterSection);
