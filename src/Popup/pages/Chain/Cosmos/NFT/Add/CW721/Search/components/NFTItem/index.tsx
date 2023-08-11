import { useMemo } from 'react';
import { Tooltip, Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import { toDisplayTokenId } from '~/Popup/utils/nft';
import { shorterAddress } from '~/Popup/utils/string';
import type { NFTMetaResponse } from '~/types/cosmos/nft';

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
  nft: NFTMetaResponse;
  onClick?: () => void;
  isActive: boolean;
};

export default function NFTItem({ onClick, isActive, nft }: NFTItemProps) {
  const shorterContractAddress = useMemo(() => shorterAddress(nft.contractAddress, 16), [nft.contractAddress]);
  const shorterTokenId = useMemo(() => shorterAddress(nft.tokenId, 9), [nft.tokenId]);

  return (
    <NFTButton type="button" onClick={onClick}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={nft.imageURL} defaultImgSrc={unknownNFTImg} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nft.metaData?.name || nft.tokenId} placement="top" arrow>
              <Typography variant="h5">{nft.metaData?.name || toDisplayTokenId(nft.tokenId)}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={nft.contractAddress} placement="top" arrow>
              <Typography variant="h6">{shorterContractAddress}</Typography>
            </Tooltip>
            &nbsp;/&nbsp;
            <Tooltip title={nft.tokenId || ''} placement="top" arrow>
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
