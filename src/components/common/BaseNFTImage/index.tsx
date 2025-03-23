import { convertIpfs } from '@/utils/nft';

import { StyledSkeletonImage } from './styled';

import defaultNFTImage from '@/assets/images/default/dappDefault.png';

interface BaseNFTImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
}

export default function BaseNFTImage({ src, ...remainder }: BaseNFTImageProps) {
  return <StyledSkeletonImage src={convertIpfs(src || '')} defaultImgSrc={defaultNFTImage} {...remainder} />;
}
