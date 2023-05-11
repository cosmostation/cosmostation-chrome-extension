import { useMemo } from 'react';
import { Typography } from '@mui/material';
import type { SuiObjectResponse } from '@mysten/sui.js';
import { getObjectDisplay } from '@mysten/sui.js';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';

import { BodyContainer, BottomContainer, ObjectDescriptionTextContainer, ObjectImageContainer, ObjectNameTextContainer, StyledButton } from './styled';

type NFTCardItemProps = {
  nftObject: SuiObjectResponse;
  onClick?: () => void;
  disabled?: boolean;
};

export default function NFTCardItem({ nftObject, onClick, disabled }: NFTCardItemProps) {
  const nftMeta = useMemo(() => {
    const { name, description, image_url } = getObjectDisplay(nftObject).data || {};

    return {
      name: name || '',
      description: description || '',
      imageUrl: image_url || '',
      objectId: nftObject.data?.objectId || '',
    };
  }, [nftObject]);

  const { name, imageUrl, objectId, description } = nftMeta;

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <BodyContainer>
        <ObjectImageContainer>{imageUrl ? <Image src={imageUrl} /> : <Image src={unknownNFTImg} />}</ObjectImageContainer>
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
