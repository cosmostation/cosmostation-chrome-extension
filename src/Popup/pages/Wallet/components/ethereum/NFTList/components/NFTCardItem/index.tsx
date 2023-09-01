import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { useGetNFTURISWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTURISWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayTokenId } from '~/Popup/utils/nft';
import type { EthereumNFT } from '~/types/ethereum/nft';

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
  NFTAbsoluteEditionMarkContainer,
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

  const { tokenId, address, tokenType } = nft;

  const nftMeta = useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  const isOwnedNFT = useGetNFTOwnerSWR({ contractAddress: address, ownerAddress: currentAddress, tokenId, tokenStandard: tokenType }, { suspense: true });

  return (
    <StyledButton onClick={isOwnedNFT.data ? onClick : undefined}>
      <BodyContainer>
        <NFTImageContainer>
          <>
            {!isOwnedNFT.data && (
              <BlurredImage>
                <Typography variant="h4">Not Owned NFT</Typography>
              </BlurredImage>
            )}
            {nftMeta.data?.imageURL ? <Image src={nftMeta.data?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}

            {nftMeta.data?.rarity && (
              <NFTAbsoluteEditionMarkContainer>
                <Typography variant="h6">{nftMeta.data.rarity}</Typography>
              </NFTAbsoluteEditionMarkContainer>
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
        </NFTImageContainer>
      </BodyContainer>

      <BottomContainer>
        <NFTDescriptionTextContainer>
          <Typography variant="h6">{nftMeta.data?.description || address}</Typography>
        </NFTDescriptionTextContainer>
        <NFTNameTextContainer>
          <Typography variant="h5">{nftMeta.data?.name || toDisplayTokenId(tokenId)}</Typography>
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

type NFTItemErrorProps = Pick<NFTCardItemProps, 'nft' | 'onClickDelete'> & FallbackProps;

export function NFTCardItemError({ nft, onClickDelete, resetErrorBoundary }: NFTItemErrorProps) {
  const { address, tokenId, tokenType } = nft;

  useGetNFTURISWR({ contractAddress: address, tokenId, tokenStandard: tokenType });
  useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });
  useGetNFTOwnerSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

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
            <Typography variant="h6">{t('pages.Wallet.components.ethereum.NFTList.components.NFTCardItem.index.networkError')}</Typography>
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
