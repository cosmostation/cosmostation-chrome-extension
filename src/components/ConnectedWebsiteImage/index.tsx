import Image from '@/components/common/Image';

import { WebsiteImageContainer, WebsiteImageWrapper } from './styled';

type ConnectedWebsiteImageProps = {
  image?: string;
};

export default function ConnectedWebsiteImage({ image }: ConnectedWebsiteImageProps) {
  return (
    <WebsiteImageWrapper>
      <WebsiteImageContainer>
        <Image src={image} />
      </WebsiteImageContainer>
    </WebsiteImageWrapper>
  );
}
