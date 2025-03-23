import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useChainList } from '@/hooks/useChainList';

import {
  BlurredImage,
  BodyContainer,
  BottomContainer,
  ChainContainer,
  ChainImage,
  ChainImageSkeletonContainer,
  ChainSkeletonContainer,
  NFTImage,
  NFTImageContainer,
  NFTImageSkeletonContainer,
  NFTNameTextContainer,
  StyledButton,
  TextSkeletonContainer,
} from './styled';

export type NFTItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  name: string;
  chainId: string;
  chainType: string;
  isOwned: boolean;
  imageURL?: string;
};

export default function NFTItem({ name, chainId, chainType, isOwned, imageURL, ...reamainder }: NFTItemProps) {
  const { flatChainList } = useChainList();

  const chain = useMemo(() => flatChainList.find((chain) => chain.id === chainId && chain.chainType === chainType), [chainId, chainType, flatChainList]);

  return (
    <StyledButton disabled={!isOwned || reamainder.disabled} {...reamainder}>
      <BodyContainer>
        <NFTImageContainer>
          <>
            {!isOwned && (
              <BlurredImage>
                <Typography variant="h4_B">Not Owned NFT</Typography>
              </BlurredImage>
            )}
            {imageURL ? <NFTImage src={imageURL} /> : <NFTImage />}
          </>
        </NFTImageContainer>
      </BodyContainer>

      <BottomContainer>
        <NFTNameTextContainer>
          <Base1300Text variant="b2_M">{name}</Base1300Text>
        </NFTNameTextContainer>
        <ChainContainer>
          <ChainImage src={chain?.image} />
          <NFTNameTextContainer
            sx={{
              maxWidth: '7rem',
            }}
          >
            <Base1000Text variant="b4_M">{chain?.name}</Base1000Text>
          </NFTNameTextContainer>
        </ChainContainer>
      </BottomContainer>
    </StyledButton>
  );
}

export function NFTSkeletonItem() {
  return (
    <StyledButton disabled>
      <NFTImageSkeletonContainer variant="rectangular" />

      <BottomContainer>
        <NFTNameTextContainer>
          <TextSkeletonContainer variant="rectangular" />
        </NFTNameTextContainer>
        <ChainSkeletonContainer>
          <ChainImageSkeletonContainer variant="circular" />
          <NFTNameTextContainer>
            <TextSkeletonContainer variant="rectangular" />
          </NFTNameTextContainer>
        </ChainSkeletonContainer>
      </BottomContainer>
    </StyledButton>
  );
}
