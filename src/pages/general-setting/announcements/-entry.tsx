import { useEffect } from 'react';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { VirtualizedList } from '@/components/common/VirtualizedList';
import { preloadMobileImages, useAllAdInfos } from '@/hooks/useAdInfos';

import AnnouncementItem from './-component/AnnouncementItem';

export default function Entry() {
  const formattedAllAdInfos = useAllAdInfos();

  useEffect(() => {
    if (formattedAllAdInfos.length > 0) {
      preloadMobileImages(formattedAllAdInfos);
    }
  }, [formattedAllAdInfos]);

  return (
    <>
      <BaseBody>
        <EdgeAligner
          style={{
            marginTop: '1.2rem',
          }}
        >
          <VirtualizedList
            items={formattedAllAdInfos}
            estimateSize={() => 60}
            renderItem={(item, virtualItem) => <AnnouncementItem key={item.id + virtualItem.index} adInfo={item} />}
            overscan={5}
          />
        </EdgeAligner>
      </BaseBody>
    </>
  );
}
