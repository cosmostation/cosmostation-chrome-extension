import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { shorterAddress } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/ethereum/nft';

import {
  InvalidImageContainer,
  InvalidImageTextContainer,
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
  isActive?: boolean;
  nft: EthereumNFT;
};

const NFTItem = forwardRef<HTMLButtonElement, NFTItemProps>(({ isActive, nft, ...remainder }, ref) => {
  const { tokenId, tokenType, address, ownerAddress } = nft;

  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  const { data: isOwnedNFT } = useGetNFTOwnerSWR({ contractAddress: address, ownerAddress, tokenId, tokenStandard: tokenType });

  const shorterContractAddress = useMemo(() => shorterAddress(address, 20), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 13), [tokenId]);

  const displayTokenStandard = useMemo(() => tokenType?.replace('ERC', 'ERC-'), [tokenType]);

  return (
    <NFTButton style={{ display: isOwnedNFT ? 'flex' : 'none' }} type="button" data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          {nftMeta?.imageURL ? (
            <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} />
          ) : (
            <InvalidImageContainer>
              <InvalidImageTextContainer>
                <Typography variant="h6">{tokenId}</Typography>
              </InvalidImageTextContainer>
            </InvalidImageContainer>
          )}
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nftMeta?.name || '-'} placement="top" arrow>
              <Typography variant="h5">{nftMeta?.name || '-'}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={address || ''} placement="top" arrow>
              <Typography variant="h6">{shorterContractAddress}</Typography>
            </Tooltip>
          </LeftInfoBodyContainer>
          <LeftInfoFooterContainer>
            <Tooltip title={tokenId || ''} placement="top" arrow>
              <Typography variant="h6">{shorterTokenId}</Typography>
            </Tooltip>
            /<Typography variant="h6">{displayTokenStandard}</Typography>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </NFTButton>
  );
});

export default NFTItem;
