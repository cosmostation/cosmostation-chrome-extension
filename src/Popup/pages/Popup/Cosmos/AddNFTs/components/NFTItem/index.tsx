import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import type { CosmosChain } from '~/types/chain';

import { Container, ContentContainer, NFTContainer, NFTImageContainer, NFTInfoContainer, NFTInfoHeaderContainer, NFTInfoHeaderTextContainer } from './styled';

type NFTItemProps = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export default function NFTItem({ chain, contractAddress, tokenId }: NFTItemProps) {
  const { data: nftMeta } = useNFTMetaSWR({ contractAddress, tokenId, chain });

  return (
    <Container>
      <ContentContainer>
        <NFTContainer>
          <NFTImageContainer>
            {nftMeta?.imageURL ? <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
          </NFTImageContainer>
          <NFTInfoContainer>
            <NFTInfoHeaderContainer>
              <NFTInfoHeaderTextContainer>
                <Tooltip title={nftMeta?.name || ''} placement="top" arrow>
                  <Typography variant="h3">{nftMeta?.name}</Typography>
                </Tooltip>
              </NFTInfoHeaderTextContainer>
            </NFTInfoHeaderContainer>
          </NFTInfoContainer>
        </NFTContainer>
      </ContentContainer>
    </Container>
  );
}
