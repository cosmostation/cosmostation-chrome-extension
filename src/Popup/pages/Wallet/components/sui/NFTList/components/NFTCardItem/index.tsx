import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';
import { convertIpfs } from '~/Popup/utils/sui';
import type { SuiNFTMetaType } from '~/types/nft/nftMeta';

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
  nftMeta: SuiNFTMetaType;
  onClick?: () => void;
  disabled?: boolean;
};

export default function NFTCardItem({ nftMeta, onClick, disabled }: NFTCardItemProps) {
  const { name, imageUrl, objectId, description, isRare } = nftMeta;

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <BodyContainer>
        <ObjectImageContainer>
          <>
            <Image src={convertIpfs(imageUrl)} defaultImgSrc={unknownNFTImg} />
            {isRare && (
              <ObjectAbsoluteEditionMarkContainer>
                <Typography variant="h6">Rare</Typography>
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
