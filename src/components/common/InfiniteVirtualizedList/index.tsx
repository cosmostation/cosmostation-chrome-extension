import { useEffect } from 'react';
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';

import { useScaffoldRef } from '@/components/Wrapper/components/Scaffold/components/AppLayout';

import { StyledCircularProgress, StyledCircularProgressContainer } from './styled';

type InfiniteVirtualizedListProps<T> = {
  items: T[];
  renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode;
  estimateSize: (index: number) => number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  overscan?: number;
};

export function InfiniteVirtualizedList<T>({
  items,
  renderItem,
  estimateSize,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  overscan = 5,
}: InfiniteVirtualizedListProps<T>) {
  const scaffoldRef = useScaffoldRef();

  const virtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => scaffoldRef.current,
    estimateSize: estimateSize,
    overscan: overscan,
    scrollMargin: scaffoldRef.current?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= items.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, virtualizer, items.length]);

  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index > items.length - 1;

          return (
            <div key={virtualItem.key} data-index={virtualItem.index} ref={virtualizer.measureElement}>
              {isLoaderRow ? (
                <StyledCircularProgressContainer>
                  <StyledCircularProgress size={20} />
                </StyledCircularProgressContainer>
              ) : (
                renderItem(items[virtualItem.index], virtualItem)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
