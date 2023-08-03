import { useMemo } from 'react';
import { Tooltip, Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetNFTMetaSWR';
import { toDisplayTokenId } from '~/Popup/utils/nft';
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
  const nftMeta = useGetNFTMetaSWR({ chain, contractAddress, tokenId });

  const shorterContractAddress = useMemo(() => shorterAddress(contractAddress, 16), [contractAddress]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 9), [tokenId]);

  return (
    <NFTButton type="button" onClick={onClick}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={nftMeta.data?.imageURL} defaultImgSrc={unknownNFTImg} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nftMeta.data?.name || tokenId} placement="top" arrow>
              <Typography variant="h5">{nftMeta.data?.name || toDisplayTokenId(tokenId)}</Typography>
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
            {/* NOTE 토큰 타입? 컬렉션명? 뭐보여주지 */}
            <Typography variant="h6">CW-721</Typography>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </NFTButton>
  );
}
