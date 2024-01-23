import { useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { ETHEREUM_ADD_NFT_ERROR } from '~/constants/error';
import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
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
  PreviewBodyContainer,
  PreviewContainer,
  PreviewContentContainer,
  PreviewHeaderContainer,
  PreviewImageItemContainer,
  PreviewItemContainer,
  PreviewItemHeaderContainer,
  PreviewItemSubHeaderContainer,
  PreviewNFTImageContainer,
  PreviewNFTSubtitleContainer,
  StyledAbsoluteLoading,
  StyledIconButton,
  StyledInput,
} from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';
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

  const nftSourceURI = useGetNFTURISWR({
    contractAddress: debouncedContractAddress,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const isOwnedNFT = useGetNFTOwnerSWR({
    contractAddress: debouncedContractAddress,
    ownerAddress: currentAddress,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const nftMeta = useGetNFTMetaSWR({
    contractAddress: debouncedContractAddress,
    tokenId: debouncedTokenId,
    tokenStandard: currentNFTStandard.data ? currentNFTStandard.data : undefined,
  });

  const isLoadingData = useMemo(
    () => isOwnedNFT.isValidating || nftMeta.isValidating || nftSourceURI.isValidating || currentNFTStandard.isValidating,
    [currentNFTStandard.isValidating, nftMeta.isValidating, isOwnedNFT.isValidating, nftSourceURI.isValidating],
  );

  const errorType = useMemo(() => {
    if (!ethereumAddressRegex.test(debouncedContractAddress)) {
      return ETHEREUM_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS;
    }
    if (!debouncedTokenId) {
      return ETHEREUM_ADD_NFT_ERROR.INVALID_TOKEN_ID;
    }

    if (!nftSourceURI.data) {
      return ETHEREUM_ADD_NFT_ERROR.INVALID_SOURCE;
    }

    if (!isOwnedNFT.data) {
      return ETHEREUM_ADD_NFT_ERROR.NOT_OWNED_NFT;
    }

    if (isOwnedNFT.error || currentNFTStandard.error) {
      return ETHEREUM_ADD_NFT_ERROR.NETWORK_ERROR;
    }
    return '';
  }, [currentNFTStandard.error, debouncedContractAddress, debouncedTokenId, nftSourceURI.data, isOwnedNFT.data, isOwnedNFT.error]);

  const nftPreviewIcon = useMemo(() => {
    if (errorType && debouncedContractAddress && debouncedTokenId) {
      return NFTErrorIcon;
    }
    return NFTPreviewIcon;
  }, [debouncedContractAddress, debouncedTokenId, errorType]);

  const nftPreviewHeaderText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === ETHEREUM_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidAddressTitle');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidTokenIdTitle');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.INVALID_SOURCE) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidSourceTitle');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidOwnershipTitle');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.networkErrorTitle');
      }
    }

    return t('pages.Chain.Ethereum.NFT.Add.entry.imagePreview');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const nftPreviewSubText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === ETHEREUM_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidAddress');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidTokenId');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.INVALID_SOURCE) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidSource');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.invalidOwnership');
      }

      if (errorType === ETHEREUM_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.Chain.Ethereum.NFT.Add.entry.networkError');
      }
    }

    return t('pages.Chain.Ethereum.NFT.Add.entry.previewSubText');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const submit = async () => {
    try {
      if (debouncedContractAddress && debouncedTokenId && currentNFTStandard.data && nftMeta) {
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

  const handleOnClickCopy = (copyString?: string) => {
    if (copyString && copy(copyString)) {
      enqueueSnackbar(t('pages.Chain.Ethereum.NFT.Add.entry.copied'));
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

      <PreviewContainer>
        {!errorType ? (
          currentNFTStandard.data === 'ERC721' ? (
            <>
              <PreviewHeaderContainer>
                <Typography variant="h6">{t('pages.Chain.Ethereum.NFT.Add.entry.preview')}</Typography>
              </PreviewHeaderContainer>
              <PreviewBodyContainer>
                <PreviewNFTImageContainer>
                  {nftMeta?.data?.imageURL ? <Image src={nftMeta.data.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
                </PreviewNFTImageContainer>
                <PreviewNFTSubtitleContainer>
                  <Typography variant="h3">{nftMeta?.data?.name || nftSourceURI.data}</Typography>
                </PreviewNFTSubtitleContainer>
              </PreviewBodyContainer>
            </>
          ) : (
            <PreviewContentContainer>
              <PreviewItemContainer>
                <PreviewItemHeaderContainer>
                  <Typography variant="h5">{t('pages.Chain.Ethereum.NFT.Add.entry.uri')}</Typography>

                  <StyledIconButton
                    disabled={!nftSourceURI.data}
                    onClick={() => {
                      handleOnClickCopy(nftSourceURI.data || '');
                    }}
                  >
                    <Copy16Icon />
                  </StyledIconButton>
                </PreviewItemHeaderContainer>
                <PreviewItemSubHeaderContainer>
                  <Typography variant="h5">{nftSourceURI.data}</Typography>
                </PreviewItemSubHeaderContainer>
              </PreviewItemContainer>

              {nftMeta.data && (
                <PreviewItemContainer>
                  <PreviewItemHeaderContainer>
                    <Typography variant="h5">{t('pages.Chain.Ethereum.NFT.Add.entry.data')}</Typography>

                    <StyledIconButton
                      onClick={() => {
                        handleOnClickCopy(JSON.stringify(nftMeta.data, null, 4));
                      }}
                    >
                      <Copy16Icon />
                    </StyledIconButton>
                  </PreviewItemHeaderContainer>
                  <PreviewItemSubHeaderContainer>
                    <Typography variant="h5">{JSON.stringify(nftMeta.data, null, 4)}</Typography>
                  </PreviewItemSubHeaderContainer>
                </PreviewItemContainer>
              )}

              <PreviewImageItemContainer>
                <PreviewItemHeaderContainer>
                  <Typography variant="h5">{t('pages.Chain.Ethereum.NFT.Add.entry.preview')}</Typography>
                </PreviewItemHeaderContainer>
                <PreviewNFTImageContainer>
                  {nftMeta?.data?.imageURL ? <Image src={nftMeta?.data?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
                </PreviewNFTImageContainer>
              </PreviewImageItemContainer>
            </PreviewContentContainer>
          )
        ) : (
          <>
            <PreviewHeaderContainer>
              <Typography variant="h6">{t('pages.Chain.Ethereum.NFT.Add.entry.preview')}</Typography>
            </PreviewHeaderContainer>
            <PreviewBodyContainer>
              <EmptyAsset Icon={nftPreviewIcon} headerText={nftPreviewHeaderText} subHeaderText={nftPreviewSubText} />
            </PreviewBodyContainer>
          </>
        )}
        {isLoadingData && currentTokenId && currentContractAddress && <StyledAbsoluteLoading size="4rem" />}
      </PreviewContainer>
      <ButtonContainer>
        <Button type="submit" disabled={!!errorType} onClick={submit}>
          {t('pages.Chain.Ethereum.NFT.Add.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
