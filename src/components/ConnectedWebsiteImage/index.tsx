import Image from '@/components/common/Image';

import { WebsiteImageContainer, WebsiteImageWrapper } from './styled';

import WebsiteDefaultImg from 'assets/images/default/websiteDefault.png';

type ConnectedWebsiteImageProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  image?: string;
};

export default function ConnectedWebsiteImage({ image, ...remainder }: ConnectedWebsiteImageProps) {
  return (
    <WebsiteImageWrapper {...remainder}>
      <WebsiteImageContainer>
        <Image src={image} defaultImgSrc={WebsiteDefaultImg} />
      </WebsiteImageContainer>
    </WebsiteImageWrapper>
  );
}
