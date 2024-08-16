import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';
import type { SuiObjectResponse } from '@mysten/sui/client';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { convertIpfs } from '~/Popup/utils/nft';
import { shorterAddress } from '~/Popup/utils/string';
import { getNFTMeta } from '~/Popup/utils/sui';
import type { SuiChain } from '~/types/chain';

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
  nftObject: SuiObjectResponse;
  chain: SuiChain;
};

const NFTItem = forwardRef<HTMLButtonElement, NFTItemProps>(({ isActive, nftObject, ...remainder }, ref) => {
  const nftMeta = useMemo(() => getNFTMeta(nftObject), [nftObject]);

  const { imageURL, name, type, objectId } = nftMeta;

  const shorterObjectId = useMemo(() => shorterAddress(objectId, 20), [objectId]);
  const shorterObjectType = useMemo(() => shorterAddress(type, 20), [type]);

  return (
    <NFTButton type="button" data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={convertIpfs(imageURL)} defaultImgSrc={unknownNFTImg} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={name || '-'} placement="top" arrow>
              <Typography variant="h5">{name || '-'}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={objectId || ''} placement="top" arrow>
              <Typography variant="h6">{shorterObjectId}</Typography>
            </Tooltip>
          </LeftInfoBodyContainer>
          <LeftInfoFooterContainer>
            <Tooltip title={type || ''} placement="top" arrow>
              <Typography variant="h6">{shorterObjectType}</Typography>
            </Tooltip>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </NFTButton>
  );
});

export default NFTItem;
