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
    const { name, description, creator, image_url, link, project_url } = getObjectDisplay(nftObject).data || {};

    return {
      name: name || '',
      description: description || '',
      imageUrl: image_url || '',
      link: link || '',
      projectUrl: project_url || '',
      creator: creator || '',
    };
  }, [nftObject]);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <BodyContainer>
        <ObjectImageContainer>{nftMeta.imageUrl ? <Image src={nftMeta.imageUrl} /> : <Image src={unknownNFTImg} />}</ObjectImageContainer>
      </BodyContainer>

      <BottomContainer>
        <ObjectNameTextContainer>
          <Typography variant="h5">{nftMeta.name || nftObject.data?.objectId}</Typography>
        </ObjectNameTextContainer>
        <ObjectDescriptionTextContainer>
          <Typography variant="h5">{nftMeta.description}</Typography>
        </ObjectDescriptionTextContainer>
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
