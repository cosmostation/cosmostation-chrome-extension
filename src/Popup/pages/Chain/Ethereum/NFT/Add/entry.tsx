import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { useGetNFTStandardSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTStandardSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ethereumAddressRegex } from '~/Popup/utils/regex';

import {
  ButtonContainer,
  Container,
  Div,
  NFTPreviewBodyContainer,
  NFTPreviewContainer,
  NFTPreviewHeaderContainer,
  PreviewNFTImageContainer,
  PreviewNFTNameContainer,
  StyledAbsoluteLoading,
  StyledInput,
} from './styled';

import NFTErrorIcon from '~/images/icons/NFTError.svg';
import NFTPreviewIcon from '~/images/icons/NFTPreview.svg';

export default function Entry() {
  const { navigate } = useNavigate();
  const { addEthereumNFT } = useCurrentEthereumNFTs();
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const chain = ETHEREUM;
  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const [currentContractAddress, setCurrentContractAddress] = useState('');
  const [debouncedContractAddress] = useDebounce(currentContractAddress, 500);
  const [debouncedContractAddress2] = useDebounce(currentContractAddress, 1000);

  const [currentTokenId, setCurrentTokenId] = useState('');
  const [debouncedTokenId] = useDebounce(currentTokenId, 500);
  // NOTE Look for a better way to use debounce
  const [debouncedTokenId2] = useDebounce(currentTokenId, 1000);

  const { data: currentNFTStandard } = useGetNFTStandardSWR({ contractAddress: debouncedContractAddress });

  const { data: isOwnedNFT, isValidating: isValidatingOwner } = useGetNFTOwnerSWR({
    contractAddress: debouncedContractAddress,
    ownerAddress: currentAddress,
    tokenId: debouncedTokenId,
  });

  const {
    data: nftMeta,
    isValidating: isValidatingMetaData,
    error,
  } = useGetNFTMetaSWR({ contractAddress: debouncedContractAddress, tokenId: debouncedTokenId });

  const isLoadingData = useMemo(() => isValidatingOwner || isValidatingMetaData, [isValidatingMetaData, isValidatingOwner]);
  // NOTE check & fix error
  const errorType = useMemo(() => {
    if (!ethereumAddressRegex.test(debouncedContractAddress)) {
      return 'invalidAddress';
    }
    if (currentContractAddress && currentTokenId && debouncedContractAddress2 && debouncedTokenId2 && !isLoadingData) {
      if (!isOwnedNFT) {
        return 'misMatch';
      }
      if (error) {
        return 'error';
      }
    }

    return '';
  }, [currentContractAddress, currentTokenId, debouncedContractAddress, debouncedContractAddress2, debouncedTokenId2, error, isLoadingData, isOwnedNFT]);

  const nftPreviewIcon = useMemo(() => {
    if (errorType && debouncedContractAddress && debouncedTokenId) {
      return NFTErrorIcon;
    }
    return NFTPreviewIcon;
  }, [debouncedContractAddress, debouncedTokenId, errorType]);

  const nftPreviewHeaderText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === 'invalidAddress') {
        return 'Invalid Contract Address';
      }

      if (errorType === 'misMatch') {
        return 'Mismatch';
      }

      if (errorType === 'error') {
        return 'Error';
      }
    }

    return 'IMG Preview';
  }, [debouncedContractAddress, debouncedTokenId, errorType]);

  const nftPreviewSubText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === 'invalidAddress') {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidAddress');
      }

      if (errorType === 'misMatch') {
        // NOTE need i18
        return 'Ownership information does not match.';
      }

      if (errorType === 'error') {
        // NOTE need i18
        return 'An error has occurred. please try again';
      }
    }

    return t('pages.Chain.Ethereum.NFT.Add.entry.previewSubText');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const submit = async () => {
    try {
      if (debouncedContractAddress && debouncedTokenId && currentNFTStandard && nftMeta) {
        const newNFT = {
          tokenId: debouncedTokenId,
          tokenType: currentNFTStandard,
          ownerAddress: currentAddress,
          address: debouncedContractAddress,
        };

        await addEthereumNFT({
          ...newNFT,
        });

        enqueueSnackbar('success');
      }
    } catch (e) {
      enqueueSnackbar('fail', { variant: 'error' });
    } finally {
      navigate('/');
    }
  };

  return (
    <Container>
      <Div sx={{ marginBottom: '0.8rem' }}>
        <StyledInput
          placeholder={t('pages.Chain.Ethereum.NFT.Add.entry.addressPlaceholder')}
          onChange={(e) => setCurrentContractAddress(e.currentTarget.value)}
          error={debouncedContractAddress ? !ethereumAddressRegex.test(debouncedContractAddress) : undefined}
          value={currentContractAddress}
        />
      </Div>

      <Div sx={{ marginBottom: '0.8rem' }}>
        <StyledInput
          placeholder={t('pages.Chain.Ethereum.NFT.Add.entry.tokenIdPlaceholder')}
          onChange={(e) => setCurrentTokenId(e.currentTarget.value)}
          value={currentTokenId}
        />
      </Div>

      <NFTPreviewContainer>
        <NFTPreviewHeaderContainer>
          <Typography variant="h6">{t('pages.Chain.Ethereum.NFT.Add.entry.preview')}</Typography>
        </NFTPreviewHeaderContainer>
        <NFTPreviewBodyContainer>
          {isLoadingData ? (
            <StyledAbsoluteLoading size="4rem" />
          ) : !errorType && nftMeta ? (
            <>
              <PreviewNFTImageContainer>
                <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} />
              </PreviewNFTImageContainer>
              <PreviewNFTNameContainer>
                <Typography variant="h3">{nftMeta?.name}</Typography>
              </PreviewNFTNameContainer>
            </>
          ) : (
            <EmptyAsset Icon={nftPreviewIcon} headerText={nftPreviewHeaderText} subHeaderText={nftPreviewSubText} />
          )}
        </NFTPreviewBodyContainer>
      </NFTPreviewContainer>
      <ButtonContainer>
        {/* FIXME check condition */}
        <Button type="submit" disabled={!!errorType || isLoadingData || !(currentContractAddress && currentTokenId)} onClick={submit}>
          {t('pages.Chain.Ethereum.NFT.Add.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
