import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { useNFTOwnerSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTOwnerSWR';
import { useNFTURISWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTURISWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayTokenId } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFT } from '~/types/cosmos/nft';

import {
  BlurredImage,
  BodyContainer,
  BottomContainer,
  BottomErrorContainer,
  BottomErrorFooterContainer,
  BottomErrorHeaderContainer,
  BottomErrorLeftContainer,
  BottomErrorRightContainer,
  DeleteButton,
  NFTDescriptionTextContainer,
  NFTImageContainer,
  NFTNameTextContainer,
  SkeletonButton,
  StyledAbsoluteLoading,
  StyledButton,
  StyledIconButton,
} from './styled';

import Close16Icon from '~/images/icons/Close16.svg';
import RetryIcon from '~/images/icons/Retry.svg';

type NFTCardItemProps = {
  chain: CosmosChain;
  nft: CosmosNFT;
  onClick?: () => void;
  onClickDelete?: () => void;
};

export default function NFTCardItem({ chain, nft, onClick, onClickDelete }: NFTCardItemProps) {
  const accounts = useAccounts(true);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { tokenId, address } = nft;

  const nftMeta = useNFTMetaSWR({ chain, contractAddress: address, tokenId });

  const isOwnedNFT = useNFTOwnerSWR({ chain, contractAddress: address, tokenId, ownerAddress: currentAddress }, { suspense: true });

  return (
    <StyledButton onClick={isOwnedNFT.isOwnedNFT ? onClick : undefined}>
      <BodyContainer>
        <NFTImageContainer>
          <>
            {!isOwnedNFT.isOwnedNFT && (
              <BlurredImage>
                <Typography variant="h4">Not Owned NFT</Typography>
              </BlurredImage>
            )}
            {nftMeta.data?.imageURL ? <Image src={nftMeta.data?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}

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
        </NFTImageContainer>
      </BodyContainer>

      <BottomContainer>
        <NFTDescriptionTextContainer>
          <Typography variant="h6">{nftMeta.data?.description}</Typography>
        </NFTDescriptionTextContainer>
        <NFTNameTextContainer>
          <Typography variant="h5">{nftMeta.data?.name}</Typography>
        </NFTNameTextContainer>
      </BottomContainer>
    </StyledButton>
  );
}

export function NFTCardItemSkeleton() {
  return (
    <SkeletonButton disabled>
      <BodyContainer>
        <NFTImageContainer>
          <Image src={unknownNFTImg} />
        </NFTImageContainer>
      </BodyContainer>
      <BottomContainer>
        <NFTNameTextContainer>
          <Skeleton width={40} variant="text" />
        </NFTNameTextContainer>
        <NFTDescriptionTextContainer>
          <Skeleton width={40} variant="text" />
        </NFTDescriptionTextContainer>
      </BottomContainer>
    </SkeletonButton>
  );
}

type NFTItemErrorProps = Pick<NFTCardItemProps, 'chain' | 'nft' | 'onClickDelete'> & FallbackProps;

export function NFTCardItemError({ chain, nft, onClickDelete, resetErrorBoundary }: NFTItemErrorProps) {
  const { address, tokenId, ownerAddress } = nft;

  useNFTURISWR({ chain, contractAddress: address, tokenId });
  useNFTMetaSWR({ chain, contractAddress: address, tokenId });
  useNFTOwnerSWR({ chain, contractAddress: address, tokenId, ownerAddress });

  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  return (
    <StyledButton disabled>
      <BodyContainer>
        <NFTImageContainer>
          <Image src={unknownNFTImg} />

          <DeleteButton
            id="deleteButton"
            onClick={(e) => {
              e.stopPropagation();
              onClickDelete?.();
            }}
          >
            <Close16Icon />
          </DeleteButton>
        </NFTImageContainer>
      </BodyContainer>
      <BottomErrorContainer>
        <BottomErrorLeftContainer>
          <BottomErrorHeaderContainer>
            <Typography variant="h6">{t('pages.Wallet.components.cosmos.NFTList.components.NFTCardItem.index.networkError')}</Typography>
          </BottomErrorHeaderContainer>
          <BottomErrorFooterContainer>
            <Typography variant="h5">{toDisplayTokenId(nft.tokenId)}</Typography>
          </BottomErrorFooterContainer>
        </BottomErrorLeftContainer>
        <BottomErrorRightContainer>
          <StyledIconButton
            onClick={() => {
              setIsLoading(true);

              setTimeout(() => {
                resetErrorBoundary();
                setIsLoading(false);
              }, 500);
            }}
          >
            <RetryIcon />
          </StyledIconButton>
        </BottomErrorRightContainer>
      </BottomErrorContainer>
      {isLoading && <StyledAbsoluteLoading size="2rem" />}
    </StyledButton>
  );
}
