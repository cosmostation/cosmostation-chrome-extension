import { useMemo } from 'react';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useChainList } from '@/hooks/useChainList';

import {
  ChainContainer,
  ChainImage,
  LeftContainer,
  LeftContentsContainer,
  NFTImage,
  NFTImageContainer,
  NFTNameTextContainer,
  NFTSubNameTextContainer,
  StyledButton,
} from './styled';

import AddIcon from '@/assets/images/icons/Add20.svg';
import RemoveIcon from '@/assets/images/icons/Remove20.svg';

export type NFTButtonItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  name: string;
  subName: string;
  chainId: string;
  chainType: string;
  imageURL?: string;
  isActive?: boolean;
};

export default function NFTButtonItem({ name, subName, chainId, chainType, imageURL, isActive = false, onClick, ...remainder }: NFTButtonItemProps) {
  const { flatChainList } = useChainList();

  const chain = useMemo(() => flatChainList.find((chain) => chain.id === chainId && chain.chainType === chainType), [chainId, chainType, flatChainList]);

  return (
    <StyledButton onClick={onClick} {...remainder}>
      <LeftContainer>
        <NFTImageContainer>{imageURL ? <NFTImage src={imageURL} /> : <NFTImage />}</NFTImageContainer>
        <LeftContentsContainer>
          <NFTNameTextContainer>
            <Base1300Text variant="b2_M">{name}</Base1300Text>
          </NFTNameTextContainer>
          <NFTSubNameTextContainer>
            <Base1000Text variant="b3_R">{subName}</Base1000Text>
          </NFTSubNameTextContainer>
          <ChainContainer>
            <ChainImage src={chain?.image} />
            <Base1000Text variant="b4_M">{chain?.name}</Base1000Text>
          </ChainContainer>
        </LeftContentsContainer>
      </LeftContainer>

      {isActive ? <RemoveIcon /> : <AddIcon />}
    </StyledButton>
  );
}
