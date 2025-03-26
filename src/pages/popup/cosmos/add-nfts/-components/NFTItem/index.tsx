import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseNFTImage from '@/components/common/BaseNFTImage';
import { useNFTsMeta } from '@/hooks/cosmos/nft/useNFTsMeta';
import type { CosmosChain } from '@/types/chain';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { Container, NFTImageContainer, NFTNameTextContainer, StyledAbsoluteLoading } from './styled';

type NFTItemProps = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export default function NFTItem({ chain, contractAddress, tokenId }: NFTItemProps) {
  const { data: nftMeta, isLoading } = useNFTsMeta({
    params: [
      {
        chainId: getUniqueChainId(chain),
        contractAddress,
        tokenId,
      },
    ],
  });

  const nftMetaData = nftMeta?.[0];
  const imageURL = nftMetaData?.imageURL;
  const name = nftMetaData?.name || shorterAddress(contractAddress, 14);
  const shortTokenId = tokenId.length > 10 ? shorterAddress(tokenId, 14) : tokenId;

  return (
    <Container>
      <NFTImageContainer>{imageURL ? <BaseNFTImage src={imageURL} /> : <BaseNFTImage />}</NFTImageContainer>

      <NFTNameTextContainer>
        <Base1300Text variant="b1_B">{name}</Base1300Text>
      </NFTNameTextContainer>
      <Base1000Text variant="b3_R">{`Token ID : ${shortTokenId}`}</Base1000Text>
      {isLoading && <StyledAbsoluteLoading size="4rem" />}
    </Container>
  );
}
