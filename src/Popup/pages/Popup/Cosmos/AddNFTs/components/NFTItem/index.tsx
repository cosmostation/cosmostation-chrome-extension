import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { toDisplayTokenId } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';

import NFTInfoItem from './components/NFTInfoItem';
import {
  Container,
  ContentContainer,
  NFTContainer,
  NFTImageContainer,
  NFTInfoBodyContainer,
  NFTInfoContainer,
  NFTInfoHeaderContainer,
  NFTInfoHeaderTextContainer,
  NFTInfoLeftHeaderContainer,
} from './styled';

type NFTItemProps = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export default function NFTItem({ chain, contractAddress, tokenId }: NFTItemProps) {
  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

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
              <NFTInfoLeftHeaderContainer>
                <NFTInfoHeaderTextContainer>
                  <Tooltip title={nftMeta?.metaData?.name || tokenId} placement="top" arrow>
                    <Typography variant="h3">{nftMeta?.metaData?.name || toDisplayTokenId(tokenId)}</Typography>
                  </Tooltip>
                </NFTInfoHeaderTextContainer>
              </NFTInfoLeftHeaderContainer>
            </NFTInfoHeaderContainer>
            <NFTInfoBodyContainer>
              <NFTInfoItem chain={chain} contractAddress={contractAddress} tokenId={tokenId} ownerAddress={currentAddress} tokenType="CW721" />
            </NFTInfoBodyContainer>
          </NFTInfoContainer>
        </NFTContainer>
      </ContentContainer>
    </Container>
  );
}
