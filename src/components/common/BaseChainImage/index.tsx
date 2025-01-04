import AssetImage from '@/components/AssetImage';

import DefaultChainImage from '@/assets/images/chain/defaultChain.png';

interface BaseChainImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
}

export default function BaseChainImage({ ...remainder }: BaseChainImageProps) {
  return <AssetImage defaultImgSrc={DefaultChainImage} {...remainder} />;
}
