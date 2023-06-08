import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { useGetNFTURISWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTURISWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import type { EthereumNFT } from '~/types/ethereum/nft';

import {
  BlurredImage,
  BodyContainer,
  BottomContainer,
  DeleteButton,
  ObjectAbsoluteEditionMarkContainer,
  ObjectDescriptionTextContainer,
  ObjectImageContainer,
  ObjectNameTextContainer,
  SkeletonButton,
  StyledButton,
} from './styled';

import Close16Icon from '~/images/icons/Close16.svg';

type NFTCardItemProps = {
  nft: EthereumNFT;
  onClick?: () => void;
  onClickDelete?: () => void;
};

export default function NFTCardItem({ nft, onClick, onClickDelete }: NFTCardItemProps) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(true);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const { tokenId, address } = nft;

  // NOTE need suspense
  const nftMetaURI = useGetNFTURISWR({ contractAddress: address, tokenId }, { suspense: true });

  const nftMeta = useGetNFTMetaSWR({ metaURI: nftMetaURI.data, contractAddress: address, tokenId }, { suspense: true });

  const isOwnedNFT = useGetNFTOwnerSWR({ contractAddress: address, ownerAddress: currentAddress, tokenId }, { suspense: true });

  return (
    <StyledButton disabled={!isOwnedNFT.data} onClick={onClick}>
      <BodyContainer>
        <ObjectImageContainer>
          <>
            {!isOwnedNFT.data && (
              <BlurredImage>
                <Typography variant="h4">Not Owned NFT</Typography>
              </BlurredImage>
            )}
            <Image src={nftMeta.data?.imageURL} defaultImgSrc={unknownNFTImg} />

            {nftMeta.data?.rarity && (
              <ObjectAbsoluteEditionMarkContainer>
                <Typography variant="h6">{nftMeta.data.rarity}</Typography>
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
          <Typography variant="h5">{nftMeta.data?.description || address}</Typography>
        </ObjectDescriptionTextContainer>
        <ObjectNameTextContainer>
          <Typography variant="h5">{nftMeta.data?.name || tokenId}</Typography>
        </ObjectNameTextContainer>
      </BottomContainer>
    </StyledButton>
  );
}

export function NFTCardItemSkeleton() {
  return (
    <SkeletonButton disabled>
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
    </SkeletonButton>
  );
}
