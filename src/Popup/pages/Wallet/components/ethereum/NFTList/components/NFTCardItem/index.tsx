import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
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
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(true);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const { name, imageURL, rarity, description, tokenId, address } = nftObject;

  const { data: isOwnedNFT } = useGetNFTOwnerSWR({ contractAddress: address, ownerAddress: currentAddress, tokenId }, { suspense: true });

  return (
    <StyledButton disabled={!isOwnedNFT} onClick={onClick}>
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
