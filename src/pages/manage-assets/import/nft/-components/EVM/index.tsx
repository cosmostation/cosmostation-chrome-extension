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
import { EVM_ADD_NFT_ERROR } from '@/constants/error';
import { useGetNFTMeta } from '@/hooks/evm/nft/useGetNFTMeta';
import { useGetNFTOwner } from '@/hooks/evm/nft/useGetNFTOwner';
import { useGetNFTStandard } from '@/hooks/evm/nft/useGetNFTStandard';
import { useGetNFTURI } from '@/hooks/evm/nft/useGetNFTURI';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { Route as Home } from '@/pages/index';
import type { UniqueChainId } from '@/types/chain';
import type { EvmNFT } from '@/types/nft';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { ethereumAddressRegex } from '@/utils/regex';
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

type EVMProps = {
  chainId: UniqueChainId;
};

export default function EVM({ chainId }: EVMProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const [currentContractAddress, setCurrentContractAddress] = useState('');
  const [debouncedContractAddress] = useDebounce(currentContractAddress, 500);
  const isValidDebouncedContractAddress = useMemo(() => ethereumAddressRegex.test(debouncedContractAddress), [debouncedContractAddress]);

  const [currentTokenId, setCurrentTokenId] = useState('');
  const [debouncedTokenId] = useDebounce(currentTokenId, 500);

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { addNFT } = useCurrentAccountNFT();

  const { chainList } = useChainList();

  const currentChain = chainList.evmChains?.find((chain) => isMatchingUniqueChainId(chain, chainId));
  const currentChainId = currentChain && getUniqueChainId(currentChain);

  const keyPair = useMemo(() => currentChain && getKeypair(currentChain, currentAccount, currentPassword), [currentAccount, currentChain, currentPassword]);

  const currentAddress = useMemo(() => currentChain && keyPair && getAddress(currentChain, keyPair.publicKey), [currentChain, keyPair]);

  const currentNFTStandard = useGetNFTStandard({
    chainId: currentChainId,
    contractAddress: isValidDebouncedContractAddress ? debouncedContractAddress : undefined,
  });

  const nftSourceURI = useGetNFTURI({
    chainId: currentChainId,
    contractAddress: isValidDebouncedContractAddress ? debouncedContractAddress : undefined,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const isOwnedNFT = useGetNFTOwner({
    chainId: currentChainId,
    contractAddress: isValidDebouncedContractAddress ? debouncedContractAddress : undefined,
    ownerAddress: currentAddress,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const nftMeta = useGetNFTMeta({
    chainId: currentChainId,
    contractAddress: isValidDebouncedContractAddress ? debouncedContractAddress : undefined,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const isLoadingData = useMemo(
    () => isOwnedNFT.isFetching || nftMeta.isFetching || nftSourceURI.isFetching || currentNFTStandard.isFetching,
    [currentNFTStandard.isFetching, isOwnedNFT.isFetching, nftMeta.isFetching, nftSourceURI.isFetching],
  );

  const errorType = useMemo(() => {
    if (!ethereumAddressRegex.test(debouncedContractAddress)) {
      return EVM_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS;
    }
    if (!debouncedTokenId) {
      return EVM_ADD_NFT_ERROR.INVALID_TOKEN_ID;
    }

    if (!nftSourceURI.data) {
      return EVM_ADD_NFT_ERROR.INVALID_SOURCE;
    }

    if (!isOwnedNFT.data) {
      return EVM_ADD_NFT_ERROR.NOT_OWNED_NFT;
    }

    if (isOwnedNFT.error || currentNFTStandard.error) {
      return EVM_ADD_NFT_ERROR.NETWORK_ERROR;
    }
    return '';
  }, [currentNFTStandard.error, debouncedContractAddress, debouncedTokenId, nftSourceURI.data, isOwnedNFT.data, isOwnedNFT.error]);

  const nftPreviewIcon = useMemo(() => {
    if (errorType && debouncedContractAddress && debouncedTokenId) {
      return <NFTErrorIcon />;
    }
    return <NFTPreviewIcon />;
  }, [debouncedContractAddress, debouncedTokenId, errorType]);

  const nftPreviewHeaderText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === EVM_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidAddressTitle');
      }

      if (errorType === EVM_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidTokenIdTitle');
      }

      if (errorType === EVM_ADD_NFT_ERROR.INVALID_SOURCE) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidSourceTitle');
      }

      if (errorType === EVM_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidOwnershipTitle');
      }

      if (errorType === EVM_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.manage-assets.import.nft.components.EVM.index.networkErrorTitle');
      }
    }

    return t('pages.manage-assets.import.nft.components.EVM.index.imagePreview');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const nftPreviewSubText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === EVM_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidAddress');
      }

      if (errorType === EVM_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidTokenId');
      }

      if (errorType === EVM_ADD_NFT_ERROR.INVALID_SOURCE) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidSource');
      }

      if (errorType === EVM_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.manage-assets.import.nft.components.EVM.index.invalidOwnership');
      }

      if (errorType === EVM_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.manage-assets.import.nft.components.EVM.index.networkError');
      }
    }

    return t('pages.manage-assets.import.nft.components.EVM.index.previewSubText');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const submit = useCallback(async () => {
    try {
      setIsProcessing(true);

      if (!(debouncedContractAddress && debouncedTokenId && currentNFTStandard.data && nftMeta && currentChain)) {
        throw new Error('Invalid NFT data');
      }

      const newNFT: Omit<EvmNFT, 'id'> = {
        chainId: currentChain.id,
        chainType: currentChain.chainType,
        tokenId: debouncedTokenId,
        tokenType: currentNFTStandard.data,
        contractAddress: debouncedContractAddress,
      };

      await addNFT({
        ...newNFT,
      });

      toastSuccess(t('pages.manage-assets.import.nft.components.EVM.index.success'));

      navigate({
        to: Home.to,
      });
    } catch {
      toastError(t('pages.manage-assets.import.nft.components.EVM.index.error'));
    } finally {
      setIsProcessing(false);
    }
  }, [addNFT, currentChain, currentNFTStandard.data, debouncedContractAddress, debouncedTokenId, navigate, nftMeta, t]);

  return (
    <Container>
      <InputWrapper>
        <StandardInput
          label={t('pages.manage-assets.import.nft.components.EVM.index.contractAddress')}
          error={debouncedContractAddress ? !ethereumAddressRegex.test(debouncedContractAddress) : undefined}
          helperText={debouncedContractAddress && !ethereumAddressRegex.test(debouncedContractAddress) ? 'Invalid Contract address' : undefined}
          onChange={(e) => setCurrentContractAddress(e.currentTarget.value)}
          value={currentContractAddress}
        />
        <StandardInput
          label={t('pages.manage-assets.import.nft.components.EVM.index.tokenId')}
          onChange={(e) => setCurrentTokenId(e.currentTarget.value)}
          value={currentTokenId}
        />
      </InputWrapper>

      <EdgeAligner>
        <Divider />
      </EdgeAligner>

      <PreviewContainer>
        <LabelContainer>
          <Base1300Text variant="h3_B">{t('pages.manage-assets.import.nft.components.EVM.index.preview')}</Base1300Text>
        </LabelContainer>
        {!errorType ? (
          <PreviewBodyContainer>
            <PreviewNFTImageContainer>{nftMeta?.data?.imageURL ? <BaseNFTImage src={nftMeta.data?.imageURL} /> : <BaseNFTImage />}</PreviewNFTImageContainer>
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
          {t('pages.manage-assets.import.nft.components.EVM.index.addNFT')}
        </Button>
      </BaseFooter>
    </Container>
  );
}
