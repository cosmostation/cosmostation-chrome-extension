import Image from '@/components/common/Image';

import { WebsiteImageContainer, WebsiteImageWrapper } from './styled';

import WebsiteDefaultImg from 'assets/images/default/websiteDefault.png';

type ConnectedWebsiteImageProps = {
  image?: string;
};

export default function ConnectedWebsiteImage({ image }: ConnectedWebsiteImageProps) {
  return (
    <WebsiteImageWrapper>
      <WebsiteImageContainer>
        <Image src={image} defaultImgSrc={WebsiteDefaultImg} />
      </WebsiteImageContainer>
    </WebsiteImageWrapper>
  );
}
