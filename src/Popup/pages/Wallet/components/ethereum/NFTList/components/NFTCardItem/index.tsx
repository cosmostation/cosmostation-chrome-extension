import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';
import type { EthereumNFT } from '~/types/nft';

import {
  BodyContainer,
  BottomContainer,
  DeleteButton,
  ObjectAbsoluteEditionMarkContainer,
  ObjectDescriptionTextContainer,
  ObjectImageContainer,
  ObjectNameTextContainer,
  StyledButton,
} from './styled';

import Close16Icon from '~/images/icons/Close16.svg';

type NFTCardItemProps = {
  nftObject: EthereumNFT;
  onClick?: () => void;
  onClickDelete?: () => void;
};

export default function NFTCardItem({ nftObject, onClick, onClickDelete }: NFTCardItemProps) {
  const { name, imageURL, rarity, description, tokenId } = nftObject;

  return (
    <StyledButton onClick={onClick}>
      <BodyContainer>
        <ObjectImageContainer>
          <>
            <Image src={imageURL} defaultImgSrc={unknownNFTImg} />
            {rarity && (
              <ObjectAbsoluteEditionMarkContainer>
                <Typography variant="h6">{rarity}</Typography>
              </ObjectAbsoluteEditionMarkContainer>
            )}
            <DeleteButton
              id="deleteButton"
              onClick={(e) => {
                e.stopPropagation();
                onClickDelete?.();
              }}
            >
              <Close16Icon />
            </DeleteButton>
          </>
        </ObjectImageContainer>
      </BodyContainer>

      <BottomContainer>
        <ObjectDescriptionTextContainer>
          <Typography variant="h5">{description}</Typography>
        </ObjectDescriptionTextContainer>
        <ObjectNameTextContainer>
          <Typography variant="h5">{name || tokenId}</Typography>
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
