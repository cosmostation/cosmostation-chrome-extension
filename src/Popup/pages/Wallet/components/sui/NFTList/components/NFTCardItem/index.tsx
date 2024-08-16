import { useMemo } from 'react';
import { Typography } from '@mui/material';
import type { SuiObjectResponse } from '@mysten/sui/client';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';
import { convertIpfs } from '~/Popup/utils/nft';
import { getNFTMeta } from '~/Popup/utils/sui';

import {
  BodyContainer,
  BottomContainer,
  ObjectAbsoluteEditionMarkContainer,
  ObjectDescriptionTextContainer,
  ObjectImageContainer,
  ObjectNameTextContainer,
  StyledButton,
} from './styled';

type NFTCardItemProps = {
  nftObject: SuiObjectResponse;
  onClick?: () => void;
};

export default function NFTCardItem({ nftObject, onClick }: NFTCardItemProps) {
  const nftMeta = useMemo(() => getNFTMeta(nftObject), [nftObject]);

  const { name, imageURL, objectId, description, rarity } = nftMeta;

  return (
    <StyledButton onClick={onClick}>
      <BodyContainer>
        <ObjectImageContainer>
          <>
            <Image src={convertIpfs(imageURL)} defaultImgSrc={unknownNFTImg} />
            {rarity && (
              <ObjectAbsoluteEditionMarkContainer>
                <Typography variant="h6">{rarity}</Typography>
              </ObjectAbsoluteEditionMarkContainer>
            )}
          </>
        </ObjectImageContainer>
      </BodyContainer>

      <BottomContainer>
        <ObjectDescriptionTextContainer>
          <Typography variant="h5">{description}</Typography>
        </ObjectDescriptionTextContainer>
        <ObjectNameTextContainer>
          <Typography variant="h5">{name || objectId}</Typography>
        </ObjectNameTextContainer>
      </BottomContainer>
    </StyledButton>
  );
}

export function NFTCardItemSkeleton() {
  return (
    <StyledButton disabled>
      <BodyContainer>
        <ObjectImageContainer>
          <Image src={unknownNFTImg} />
        </ObjectImageContainer>
      </BodyContainer>
      <BottomContainer>
        <ObjectNameTextContainer>
          <Skeleton width={40} variant="text" />
        </ObjectNameTextContainer>
        <ObjectDescriptionTextContainer>
          <Skeleton width={40} variant="text" />
        </ObjectDescriptionTextContainer>
      </BottomContainer>
    </StyledButton>
  );
}
