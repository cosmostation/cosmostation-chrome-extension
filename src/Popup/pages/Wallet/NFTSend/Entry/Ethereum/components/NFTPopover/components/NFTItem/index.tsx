import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { shorterAddress } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/nft';

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
  isActive?: boolean;
  nft: EthereumNFT;
};

const NFTItem = forwardRef<HTMLButtonElement, NFTItemProps>(({ isActive, nft, ...remainder }, ref) => {
  const { imageURL, name, tokenId, tokenType, address } = nft;

  const shorterContractAddress = useMemo(() => shorterAddress(address, 20), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 20), [tokenId]);

  const tokenStandard = useMemo(() => tokenType?.replace('ERC', 'ERC-'), [tokenType]);

  return (
    <NFTButton type="button" data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} defaultImgSrc={unknownNFTImg} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={name || '-'} placement="top" arrow>
              <Typography variant="h5">{name || '-'}</Typography>
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
            /<Typography variant="h6">{tokenStandard}</Typography>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </NFTButton>
  );
});

export default NFTItem;
