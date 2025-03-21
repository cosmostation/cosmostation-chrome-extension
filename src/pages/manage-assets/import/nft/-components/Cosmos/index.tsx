import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNavigate } from '@tanstack/react-router';

import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1300Text from '@/components/common/Base1300Text';
import BaseNFTImage from '@/components/common/BaseNFTImage';
import Button from '@/components/common/Button/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import EmptyAsset from '@/components/EmptyAsset';
import { COSMOS_ADD_NFT_ERROR } from '@/constants/error';
import { useNFTsMeta } from '@/hooks/cosmos/nft/useNFTsMeta';
import { useOwnedNFTsTokenId } from '@/hooks/cosmos/nft/useOwnedNFTsTokenId';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccountAddresses } from '@/hooks/useCurrentAccountAddresses';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { Route as Home } from '@/pages/index';
import type { UniqueChainId } from '@/types/chain';
import type { CosmosNFT } from '@/types/nft';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { getCosmosAddressRegex } from '@/utils/regex';
import { toastError, toastSuccess } from '@/utils/toast';

import {
  Container,
  Divider,
  InputWrapper,
  LabelContainer,
  PreviewBodyContainer,
  PreviewContainer,
  PreviewNFTImageContainer,
  StyledAbsoluteLoading,
} from './styled';

import NFTErrorIcon from '@/assets/images/icons/IMGError70.svg';
import NFTPreviewIcon from '@/assets/images/icons/IMGPreview70.svg';

type CosmosProps = {
  chainId: UniqueChainId;
};

export default function Cosmos({ chainId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const [currentContractAddress, setCurrentContractAddress] = useState('');
  const [debouncedContractAddress] = useDebounce(currentContractAddress, 500);

  const [currentTokenId, setCurrentTokenId] = useState('');
  const [debouncedTokenId] = useDebounce(currentTokenId, 500);

  const { data: currentAccountAddress } = useCurrentAccountAddresses();

  const { addNFT } = useCurrentAccountNFT();

  const { chainListFilteredByAccountType } = useChainList();

  const currentChain = chainListFilteredByAccountType.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, chainId));
  const currentChainId = currentChain && getUniqueChainId(currentChain);

  const addressRegex = useMemo(() => currentChain?.accountPrefix && getCosmosAddressRegex(currentChain.accountPrefix, [39, 59]), [currentChain?.accountPrefix]);

  const currentAddress = useMemo(
    () =>
      currentAccountAddress?.find(
        (item) =>
          item.chainId === currentChain?.id &&
          item.chainType === currentChain.chainType &&
          item.accountType.hdPath === currentChain.accountTypes[0].hdPath &&
          item.accountType.pubkeyStyle === currentChain.accountTypes[0].pubkeyStyle &&
          item.accountType.pubkeyType === currentChain.accountTypes[0].pubkeyType,
      ),
    [currentAccountAddress, currentChain?.accountTypes, currentChain?.chainType, currentChain?.id],
  );

  const ownedNFTs = useOwnedNFTsTokenId({
    params:
      currentChainId && currentAddress?.address && debouncedContractAddress
        ? [
            {
              chainId: currentChainId,
              ownerAddress: currentAddress.address,
              contractAddress: debouncedContractAddress,
            },
          ]
        : undefined,
  });

  const currentOwnedNFT = useMemo(() => {
    const flattendOwnedNFTTokenIDs =
      ownedNFTs.data
        ?.map((obj) =>
          obj?.tokens.map((tokenId) => ({
            contractAddress: obj.contractAddress,
            tokenId,
          })),
        )
        .reduce((acc, arr) => (arr ? acc?.concat(arr) : arr), [] as { contractAddress: string; tokenId: string }[]) || [];

    return flattendOwnedNFTTokenIDs.find((item) => item?.contractAddress === debouncedContractAddress && item?.tokenId === debouncedTokenId);
  }, [debouncedContractAddress, debouncedTokenId, ownedNFTs.data]);

  const nftMetaData = useNFTsMeta({
    params: currentOwnedNFT && [
      {
        chainId: currentChainId,
        contractAddress: currentOwnedNFT.contractAddress,
        tokenId: currentOwnedNFT.tokenId,
      },
    ],
  });

  const currentOwnedNFTMetaData = useMemo(
    () =>
      nftMetaData.data?.find(
        (item) =>
          item?.contractAddress === currentOwnedNFT?.contractAddress &&
          item?.tokenId === currentOwnedNFT?.tokenId &&
          item?.chainId === currentChain?.id &&
          item?.chainType === currentChain?.chainType,
      ),
    [currentChain?.chainType, currentChain?.id, currentOwnedNFT?.contractAddress, currentOwnedNFT?.tokenId, nftMetaData.data],
  );

  const isLoadingData = useMemo(() => ownedNFTs.isFetching || nftMetaData.isFetching, [nftMetaData.isFetching, ownedNFTs.isFetching]);

  const errorType = useMemo(() => {
    if (debouncedContractAddress && addressRegex && !addressRegex.test(debouncedContractAddress)) {
      return COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS;
    }
    if (!debouncedTokenId) {
      return COSMOS_ADD_NFT_ERROR.INVALID_TOKEN_ID;
    }

    if (!currentOwnedNFT) {
      return COSMOS_ADD_NFT_ERROR.NOT_OWNED_NFT;
    }

    if (ownedNFTs.error || nftMetaData.error) {
      return COSMOS_ADD_NFT_ERROR.NETWORK_ERROR;
    }
    return undefined;
  }, [addressRegex, currentOwnedNFT, debouncedContractAddress, debouncedTokenId, nftMetaData.error, ownedNFTs.error]);

  const nftPreviewIcon = useMemo(() => {
    if (errorType && debouncedContractAddress && debouncedTokenId && !isLoadingData) {
      return <NFTErrorIcon />;
    }
    return <NFTPreviewIcon />;
  }, [debouncedContractAddress, debouncedTokenId, errorType, isLoadingData]);

  const nftPreviewHeaderText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId && !isLoadingData) {
      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.invalidAddressTitle');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.invalidTokenIdTitle');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.invalidOwnershipTitle');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.networkErrorTitle');
      }
    }

    return t('pages.manage-assets.import.nft.components.Cosmos.index.imagePreview');
  }, [debouncedContractAddress, debouncedTokenId, errorType, isLoadingData, t]);

  const nftPreviewSubText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId && !isLoadingData) {
      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.invalidAddress');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.invalidTokenId');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.invalidOwnership');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.manage-assets.import.nft.components.Cosmos.index.networkError');
      }
    }

    return t('pages.manage-assets.import.nft.components.Cosmos.index.previewSubText');
  }, [debouncedContractAddress, debouncedTokenId, errorType, isLoadingData, t]);

  const submit = useCallback(async () => {
    try {
      setIsProcessing(true);

      if (!(debouncedContractAddress && debouncedTokenId && currentOwnedNFT && currentChain)) {
        throw new Error('Invalid NFT data');
      }

      const newNFT: Omit<CosmosNFT, 'id'> = {
        chainId: currentChain.id,
        chainType: currentChain.chainType,
        tokenId: currentOwnedNFT.tokenId,
        tokenType: 'CW721',
        contractAddress: currentOwnedNFT.contractAddress,
      };

      await addNFT({
        ...newNFT,
      });

      toastSuccess(t('pages.manage-assets.import.nft.components.Cosmos.index.success'));

      navigate({
        to: Home.to,
      });
    } catch {
      toastError(t('pages.manage-assets.import.nft.components.Cosmos.index.error'));
    } finally {
      setIsProcessing(false);
    }
  }, [addNFT, currentChain, currentOwnedNFT, debouncedContractAddress, debouncedTokenId, navigate, t]);

  return (
    <Container>
      <InputWrapper>
        <StandardInput
          label={t('pages.manage-assets.import.nft.components.Cosmos.index.contractAddress')}
          error={debouncedContractAddress && addressRegex ? !addressRegex?.test(debouncedContractAddress) : undefined}
          helperText={debouncedContractAddress && addressRegex && !addressRegex.test(debouncedContractAddress) ? 'Invalid Contract address' : undefined}
          onChange={(e) => setCurrentContractAddress(e.currentTarget.value)}
          value={currentContractAddress}
        />
        <StandardInput
          label={t('pages.manage-assets.import.nft.components.Cosmos.index.tokenId')}
          onChange={(e) => setCurrentTokenId(e.currentTarget.value)}
          value={currentTokenId}
        />
      </InputWrapper>

      <EdgeAligner>
        <Divider />
      </EdgeAligner>

      <PreviewContainer>
        <LabelContainer>
          <Base1300Text variant="h3_B">{t('pages.manage-assets.import.nft.components.Cosmos.index.preview')}</Base1300Text>
        </LabelContainer>
        {!errorType ? (
          <PreviewBodyContainer>
            <PreviewNFTImageContainer>
              {currentOwnedNFTMetaData?.imageURL ? <BaseNFTImage src={currentOwnedNFTMetaData.imageURL} /> : <BaseNFTImage />}
            </PreviewNFTImageContainer>
          </PreviewBodyContainer>
        ) : (
          <PreviewBodyContainer>
            <EmptyAsset icon={nftPreviewIcon} title={nftPreviewHeaderText} subTitle={nftPreviewSubText} />
          </PreviewBodyContainer>
        )}
        {isLoadingData && currentTokenId && currentContractAddress && <StyledAbsoluteLoading size="4rem" />}
      </PreviewContainer>
      <BaseFooter>
        <Button onClick={submit} disabled={!!errorType} isProgress={isProcessing}>
          {t('pages.manage-assets.import.nft.components.Cosmos.index.addNFT')}
        </Button>
      </BaseFooter>
    </Container>
  );
}
