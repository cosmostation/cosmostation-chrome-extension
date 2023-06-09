import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
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
import { useTranslation } from '~/Popup/hooks/useTranslation';
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
  ObjectAbsoluteEditionMarkContainer,
  ObjectDescriptionTextContainer,
  ObjectImageContainer,
  ObjectNameTextContainer,
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

  // NOTE https 정규식 체크 후 이미지 다르게 보여주기용 변수
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const nftMetaURI = useGetNFTURISWR({ contractAddress: address, tokenId, tokenStandard: tokenType }, { suspense: true });

  const nftMeta = useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType }, { suspense: true });

  const isOwnedNFT = useGetNFTOwnerSWR({ contractAddress: address, ownerAddress: currentAddress, tokenId, tokenStandard: tokenType }, { suspense: true });

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
          <Typography variant="h6">{nftMeta.data?.description || address}</Typography>
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
        <ObjectImageContainer>
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
        </ObjectImageContainer>
      </BodyContainer>
      <BottomErrorContainer>
        <BottomErrorLeftContainer>
          <BottomErrorHeaderContainer>
            <Typography variant="h6">{t('pages.Wallet.components.ethereum.NFTList.components.NFTCardItem.index.networkError')}</Typography>
          </BottomErrorHeaderContainer>
          <BottomErrorFooterContainer>
            <Typography variant="h5">{nft.tokenId}</Typography>
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
