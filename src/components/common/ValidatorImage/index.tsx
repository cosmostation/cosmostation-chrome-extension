import Image from '@/components/common/Image';
import type { ValidatorStatus } from '@/types/cosmos/validator';

import { AbsoluteImageContainer, AbsoluteSVGContainer, ImageContainer } from './styled';

import FakeValidator from '@/assets/images/icons/FakeValidator.svg';
import InActiveValidator from '@/assets/images/icons/InActiveValidator.svg';
import JailedValidator from '@/assets/images/icons/JailedValidator.svg';

import defaultValidatorImage from '@/assets/images/default/validatorDefault.png';

export type ValidatorImageProps = React.HTMLAttributes<HTMLDivElement> & {
  imageURL?: string;
  status?: ValidatorStatus;
};

export default function ValidatorImage({ imageURL, status, ...remainder }: ValidatorImageProps) {
  const overlayImage = (() => {
    if (!status) return undefined;

    if (status === 'fake') return <FakeValidator />;
    if (status === 'inActive') return <InActiveValidator />;
    if (status === 'jailed') return <JailedValidator />;
  })();

  return (
    <ImageContainer {...remainder}>
      <AbsoluteImageContainer
        style={{
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <Image src={imageURL} defaultImgSrc={defaultValidatorImage} />
      </AbsoluteImageContainer>
      {overlayImage && <AbsoluteSVGContainer>{overlayImage}</AbsoluteSVGContainer>}
    </ImageContainer>
  );
}
