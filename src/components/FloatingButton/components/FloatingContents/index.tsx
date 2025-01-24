import Image from '@/components/common/Image';

import { CenteredImageContainer, FloatingContentsConainer, RotatingBorder } from './styled';

export type FloatingContentsProps = {
  image?: string;
  borderColor: {
    startColor: string;
    endColor: string;
  };
};

export default function FloatingContents({ image, borderColor }: FloatingContentsProps) {
  return (
    <FloatingContentsConainer>
      <RotatingBorder start-color={borderColor.startColor} end-color={borderColor.endColor} />
      <CenteredImageContainer>
        <Image src={image} />
      </CenteredImageContainer>
    </FloatingContentsConainer>
  );
}
