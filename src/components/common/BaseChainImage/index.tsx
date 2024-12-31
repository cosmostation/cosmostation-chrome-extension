import Image from 'components/common/Image';

import DefaultChainImage from '@/assets/images/chain/defaultChain.png';

export type BaseChainImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export default function BaseChainImage({ ...remainder }: BaseChainImageProps) {
  return <Image defaultImgSrc={DefaultChainImage} {...remainder} />;
}
