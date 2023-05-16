import { useMemo } from 'react';
import { Typography } from '@mui/material';
import type { SuiObjectResponse } from '@mysten/sui.js';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import NFTImage from '~/Popup/components/common/NFTImage';
import Skeleton from '~/Popup/components/common/Skeleton';
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
  disabled?: boolean;
};

export default function NFTCardItem({ nftObject, onClick, disabled }: NFTCardItemProps) {
  const { name, imageUrl, objectId, description } = useMemo(() => getNFTMeta(nftObject), [nftObject]);

  const isRare = true;
  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <BodyContainer>
        <ObjectImageContainer>
          {imageUrl ? (
            <>
              <NFTImage src={imageUrl} />
              {isRare && (
                <ObjectAbsoluteEditionMarkContainer>
                  <Typography variant="h6">Rare</Typography>
                </ObjectAbsoluteEditionMarkContainer>
              )}
            </>
          ) : (
            <NFTImage src={unknownNFTImg} />
          )}
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
          <NFTImage src={unknownNFTImg} />
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
