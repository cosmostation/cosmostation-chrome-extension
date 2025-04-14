import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Search from '@/components/Search';

import {
  ImageSkeletonContainer,
  LeftContainer,
  LeftContentsContainer,
  SkeletonContainer,
  StickyContainer,
  SubTextSkeletonContainer,
  TextSkeletonContainer,
} from './-styled';

export default function EntrySkeleton() {
  const { t } = useTranslation();

  return (
    <BaseBody>
      <StickyContainer>
        <Search placeholder={t('pages.view.multi-chain-privateKey.entry.searchPlaceholder')} disableFilter />
      </StickyContainer>
      <SkeletonWrapper />
    </BaseBody>
  );
}

export function SkeletonWrapper() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </>
  );
}

function SkeletonItem() {
  return (
    <SkeletonContainer>
      <LeftContainer>
        <ImageSkeletonContainer variant="circular" />
        <LeftContentsContainer>
          <TextSkeletonContainer variant="rectangular" />
          <SubTextSkeletonContainer variant="rectangular" />
        </LeftContentsContainer>
      </LeftContainer>
    </SkeletonContainer>
  );
}
