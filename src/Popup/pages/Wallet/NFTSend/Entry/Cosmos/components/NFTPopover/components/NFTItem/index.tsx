import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { useNFTOwnerSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTOwnerSWR';
import { toDisplayCWTokenStandard } from '~/Popup/utils/cosmos';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFT } from '~/types/cosmos/nft';

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

type NFTItemProps = ComponentProps<typeof NFTButton> & {
  chain: CosmosChain;
  nft: CosmosNFT;
  isActive?: boolean;
};

const NFTItem = forwardRef<HTMLButtonElement, NFTItemProps>(({ chain, nft, isActive, ...remainder }, ref) => {
  const { tokenId, tokenType, address, ownerAddress } = nft;

  const { data: nftMeta } = useNFTMetaSWR({ contractAddress: address, tokenId, chain });

  const isOwnedNFT = useNFTOwnerSWR({ contractAddress: address, ownerAddress, tokenId, chain });

  const shorterContractAddress = useMemo(() => shorterAddress(address, 14), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 9), [tokenId]);

  const displayTokenStandard = useMemo(() => toDisplayCWTokenStandard(tokenType), [tokenType]);

  return (
    <NFTButton type="button" data-is-available={isOwnedNFT.isOwnedNFT} data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          {nftMeta?.imageURL ? <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nftMeta?.name || ''} placement="top" arrow>
              <Typography variant="h5">{nftMeta?.name}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={address || ''} placement="top" arrow>
              <Typography variant="h6">{shorterContractAddress}</Typography>
            </Tooltip>
            &nbsp;/&nbsp;
            <Tooltip title={tokenId || ''} placement="top" arrow>
              <Typography variant="h6">{shorterTokenId}</Typography>
            </Tooltip>
          </LeftInfoBodyContainer>
          <LeftInfoFooterContainer>
            <Typography variant="h6">{displayTokenStandard}</Typography>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </NFTButton>
  );
});

export default NFTItem;
