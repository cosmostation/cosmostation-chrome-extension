import { useState } from 'react';

import AnnouncementDialog from '@/components/AnnouncementDialog';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import type { FormattedAdInfo } from '@/hooks/useAdInfos';

type AnnouncementItemProps = {
  adInfo: FormattedAdInfo;
};

export default function AnnouncementItem({ adInfo }: AnnouncementItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <BaseOptionButton
        onClick={() => {
          setIsOpen(true);
        }}
        leftSecondHeader={
          <Base1300Text variant="b2_M" marginTop={'0.1rem'}>
            {adInfo.title}
          </Base1300Text>
        }
        leftSecondBody={
          <Base1000Text variant="h7n_M" marginBottom={'0.1rem'}>
            {adInfo.formattedDate}
          </Base1000Text>
        }
      />
      <AnnouncementDialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        image={adInfo?.images?.mobile ?? ''}
        launchFunc={
          adInfo?.linkUrl
            ? () => {
                window.open(adInfo?.linkUrl ?? '', '_blank');
              }
            : undefined
        }
        launchButtonText={adInfo?.view_detail ?? 'View Detail'}
        launchButtonStyle={{
          bgColor: adInfo?.color ?? '#8d19bf',
        }}
      />
    </>
  );
}
