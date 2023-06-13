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
import { useGetNFTURISWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTURISWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ethereumAddressRegex } from '~/Popup/utils/regex';

import {
  ButtonContainer,
  Container,
  Div,
  InvalidPreviewNFTImageContainer,
  InvalidPreviewNFTImageTextContainer,
  NFTPreviewBodyContainer,
  NFTPreviewBodyContentContainer,
  NFTPreviewContainer,
  NFTPreviewHeaderContainer,
  PreviewNFTImageContainer,
  PreviewNFTSubtitleContainer,
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

  const [currentTokenId, setCurrentTokenId] = useState('');
  const [debouncedTokenId] = useDebounce(currentTokenId, 500);

  const currentNFTStandard = useGetNFTStandardSWR({ contractAddress: debouncedContractAddress });

  const getNFTURI = useGetNFTURISWR({
    contractAddress: debouncedContractAddress,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const getNFTOwnership = useGetNFTOwnerSWR({
    contractAddress: debouncedContractAddress,
    ownerAddress: currentAddress,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  // NOTE nft 훅 관련 변수명 나중에 싹 다 통일
  const getNFTMeta = useGetNFTMetaSWR({
    contractAddress: debouncedContractAddress,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const isLoadingData = useMemo(
    () => getNFTOwnership.isValidating || getNFTMeta.isValidating || getNFTURI.isValidating,
    [getNFTMeta.isValidating, getNFTOwnership.isValidating, getNFTURI.isValidating],
  );

  const errorType = useMemo(() => {
    if (!ethereumAddressRegex.test(debouncedContractAddress)) {
      return 'invalidAddress';
    }
    if (!debouncedTokenId) {
      return 'invalidTokenId';
    }

    if (!getNFTURI.data) {
      return 'notFound';
    }

    if (!getNFTOwnership.data) {
      return 'misMatch';
    }

    if (getNFTOwnership.error || currentNFTStandard.error) {
      return 'networkError';
    }
    return '';
  }, [currentNFTStandard.error, debouncedContractAddress, debouncedTokenId, getNFTURI.data, getNFTOwnership.data, getNFTOwnership.error]);
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

      if (errorType === 'invalidTokenId') {
        return 'Invalid Token ID';
      }

      if (errorType === 'notFound') {
        return 'Not Found';
      }

      if (errorType === 'misMatch') {
        return 'Mismatch';
      }

      if (errorType === 'networkError') {
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

      if (errorType === 'invalidTokenId') {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidTokenId');
      }

      if (errorType === 'notFound') {
        // NOTE need i18
        return 'No NFT';
      }

      if (errorType === 'misMatch') {
        // NOTE need i18
        return 'Ownership information does not match.';
      }

      if (errorType === 'networkError') {
        // NOTE need i18
        return 'An error has occurred. please try again later';
      }
    }

    return t('pages.Chain.Ethereum.NFT.Add.entry.previewSubText');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const submit = async () => {
    try {
      if (debouncedContractAddress && debouncedTokenId && currentNFTStandard.data && getNFTMeta) {
        const newNFT = {
          tokenId: debouncedTokenId,
          tokenType: currentNFTStandard.data,
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
          ) : !errorType ? (
            currentNFTStandard.data === 'ERC721' ? (
              <>
                <PreviewNFTImageContainer>
                  <Image src={getNFTMeta?.data?.imageURL} defaultImgSrc={unknownNFTImg} />
                </PreviewNFTImageContainer>
                <PreviewNFTSubtitleContainer>
                  <Typography variant="h3">{getNFTMeta?.data?.name || getNFTURI.data}</Typography>
                </PreviewNFTSubtitleContainer>
              </>
            ) : (
              <NFTPreviewBodyContentContainer>
                {getNFTURI && <Typography variant="h6">{getNFTURI.data}</Typography>}

                {getNFTMeta.data && <Typography variant="h6">{JSON.stringify(getNFTMeta.data, null, 4)}</Typography>}
                <PreviewNFTImageContainer>
                  {getNFTMeta?.data?.imageURL ? (
                    <Image src={getNFTMeta?.data?.imageURL} defaultImgSrc={unknownNFTImg} />
                  ) : (
                    <InvalidPreviewNFTImageContainer>
                      <InvalidPreviewNFTImageTextContainer>
                        <Typography variant="h3">{debouncedTokenId}</Typography>
                      </InvalidPreviewNFTImageTextContainer>
                    </InvalidPreviewNFTImageContainer>
                  )}
                </PreviewNFTImageContainer>
                {/* <PreviewNSubtitlemeContainer>
                  <Typography variant="h3">{getNFTMeta?.data?.name || getNFTURI.data}</Typography>
                </PreviewNFTSubtitleContainer> */}
              </NFTPreviewBodyContentContainer>
            )
          ) : (
            <EmptyAsset Icon={nftPreviewIcon} headerText={nftPreviewHeaderText} subHeaderText={nftPreviewSubText} />
          )}
        </NFTPreviewBodyContainer>
      </NFTPreviewContainer>
      <ButtonContainer>
        <Button type="submit" disabled={!!errorType} onClick={submit}>
          {t('pages.Chain.Ethereum.NFT.Add.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
