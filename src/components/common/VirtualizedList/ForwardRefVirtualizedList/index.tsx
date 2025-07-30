import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';

import { useScaffoldRef } from '@/components/Wrapper/components/Scaffold/components/AppLayout';

import { StyledVirtualItem } from '../styled';

type ForwardRefVirtualizedListProps<T> = {
  items: T[];
  renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode;
  estimateSize: (index: number) => number;
  overscan?: number;
  isFixed?: boolean;
  parentRef?: React.RefObject<HTMLDivElement>;
  scrollToIndex?: number;
};

function ForwardRefVirtualizedListInner<T>({
  items,
  renderItem,
  estimateSize,
  overscan,
  isFixed = false,
  parentRef: externalParentRef,
  scrollToIndex,
}: ForwardRefVirtualizedListProps<T>) {
  const internalParentRef = useRef<HTMLDivElement>(null);
  const scaffoldRef = useScaffoldRef();
  const parentRef = externalParentRef || (isFixed ? internalParentRef : scaffoldRef);

  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    if (parentRef.current) {
      setScrollMargin(parentRef.current.offsetTop);
    }
  }, [parentRef, externalParentRef, isFixed]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current ?? null,
    estimateSize,
    overscan,
    scrollMargin,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (scrollToIndex && scrollToIndex >= 0) {
      const timer = setTimeout(() => {
        virtualizer.scrollToIndex(scrollToIndex, {
          align: 'center',
          behavior: 'smooth',
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [virtualizer, scrollToIndex]);

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

  return isFixed || externalParentRef ? (
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

const ForwardRefVirtualizedListBase = forwardRef<HTMLDivElement, ForwardRefVirtualizedListProps<unknown>>((props, ref) => (
  <ForwardRefVirtualizedListInner {...props} parentRef={props.parentRef || (ref as React.RefObject<HTMLDivElement>)} />
));
ForwardRefVirtualizedListBase.displayName = 'ForwardRefVirtualizedList';

export const ForwardRefVirtualizedList = ForwardRefVirtualizedListBase as <T>(
  props: ForwardRefVirtualizedListProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => JSX.Element;
