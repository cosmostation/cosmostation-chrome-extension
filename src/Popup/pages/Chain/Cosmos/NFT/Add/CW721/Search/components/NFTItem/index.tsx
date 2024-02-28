import { useMemo } from 'react';
import { Tooltip, Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';

import {
  LeftContainer,
  LeftImageContainer,
  LeftInfoBodyContainer,
  LeftInfoContainer,
  LeftInfoFooterContainer,
  LeftInfoHeaderContainer,
  NFTButton,
  RightContainer,
} from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type NFTItemProps = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
  onClick?: () => void;
  isActive: boolean;
};

export default function NFTItem({ onClick, isActive, chain, contractAddress, tokenId }: NFTItemProps) {
  const { data: nftMeta } = useNFTMetaSWR({ chain, contractAddress, tokenId });

  const shorterContractAddress = useMemo(() => shorterAddress(contractAddress, 16), [contractAddress]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 9), [tokenId]);

  return (
    <NFTButton type="button" onClick={onClick}>
      <LeftContainer>
        <LeftImageContainer>
          {nftMeta?.imageURL ? <Image src={nftMeta.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nftMeta?.name || ''} placement="top" arrow>
              <Typography variant="h5">{nftMeta?.name}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={contractAddress} placement="top" arrow>
              <Typography variant="h6">{shorterContractAddress}</Typography>
            </Tooltip>
            &nbsp;/&nbsp;
            <Tooltip title={tokenId || ''} placement="top" arrow>
              <Typography variant="h6">{shorterTokenId}</Typography>
            </Tooltip>
          </LeftInfoBodyContainer>
          <LeftInfoFooterContainer>
            <Typography variant="h6">CW-721</Typography>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </NFTButton>
  );
}
