import { useLayoutEffect, useRef, useState } from 'react';
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';

import { useScaffoldRef } from '@/components/Wrapper/components/Scaffold/components/AppLayout';

import { StyledVirtualItem } from './styled';

type VirtualizedListProps<T> = {
  items: T[];
  renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode;
  estimateSize: (index: number) => number;
  overscan?: number;
  isFixed?: boolean;
};

export function VirtualizedList<T>({ items, renderItem, estimateSize, overscan, isFixed = false }: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const scaffoldRef = useScaffoldRef();
  const currentRef = isFixed ? parentRef : scaffoldRef;

  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    if (currentRef.current) {
      setScrollMargin(currentRef.current.offsetTop);
    }
  }, [currentRef]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => currentRef.current ?? null,
    estimateSize,
    overscan,
    scrollMargin,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const Container = (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualItems.map((virtualItem) => (
        <StyledVirtualItem
          key={virtualItem.key}
          data-index={virtualItem.index}
          ref={virtualizer.measureElement}
          style={{
            height: `${virtualItem.size}px`,
            transform: `translateY(${virtualItem.start - scrollMargin}px)`,
          }}
        >
          {renderItem(items[virtualItem.index], virtualItem)}
        </StyledVirtualItem>
      ))}
    </div>
  );

  return isFixed ? (
    <div
      ref={parentRef}
      style={{
        overflow: 'auto',
        height: '100%',
        width: '100%',
      }}
    >
      {Container}
    </div>
  ) : (
    Container
  );
}
