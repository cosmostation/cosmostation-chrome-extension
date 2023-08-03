import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import { TOKEN_TYPE } from '~/constants/cosmos';
import { COSMOS_ADD_NFT_ERROR } from '~/constants/error';
import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Input from '~/Popup/components/common/Input';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetNFTMetaSWR';
import { useGetNFTTokenIdsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetNFTTokenIdsSWR';
import { useGetNFTURISWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetNFTURISWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';

import {
  ButtonContainer,
  Container,
  Div,
  PreviewBodyContainer,
  PreviewContainer,
  PreviewHeaderContainer,
  PreviewNFTImageContainer,
  PreviewNFTSubtitleContainer,
  StyledAbsoluteLoading,
} from './styled';

import NFTErrorIcon from '~/images/icons/NFTError.svg';
import NFTPreviewIcon from '~/images/icons/NFTPreview.svg';

type EntryProps = {
  chain: CosmosChain;
};

export default function Entry({ chain }: EntryProps) {
  const { navigate } = useNavigate();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { addCosmosNFT } = useCurrentCosmosNFTs();

  const [currentContractAddress, setCurrentContractAddress] = useState('');
  const [debouncedContractAddress] = useDebounce(currentContractAddress, 500);

  const [currentTokenId, setCurrentTokenId] = useState('');
  const [debouncedTokenId] = useDebounce(currentTokenId, 500);

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const addressRegex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const ownedNFTs = useGetNFTTokenIdsSWR({ chain, contractAddress: debouncedContractAddress, ownerAddress: currentAddress });

  const isOwnedNFT = useMemo(() => ownedNFTs.data?.tokens.includes(debouncedTokenId), [debouncedTokenId, ownedNFTs.data?.tokens]);

  const nftSourceURI = useGetNFTURISWR({ chain, contractAddress: debouncedContractAddress, tokenId: debouncedTokenId });

  const nftMeta = useGetNFTMetaSWR({ chain, contractAddress: debouncedContractAddress, tokenId: debouncedTokenId });

  const isLoadingData = useMemo(
    () => nftSourceURI.isValidating || ownedNFTs.isValidating || nftMeta.isValidating,
    [nftMeta.isValidating, nftSourceURI.isValidating, ownedNFTs.isValidating],
  );

  const errorType = useMemo(() => {
    if (!addressRegex.test(debouncedContractAddress)) {
      return COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS;
    }
    if (!debouncedTokenId) {
      return COSMOS_ADD_NFT_ERROR.INVALID_TOKEN_ID;
    }

    if (!nftSourceURI.data) {
      return COSMOS_ADD_NFT_ERROR.INVALID_SOURCE;
    }

    if (!isOwnedNFT) {
      return COSMOS_ADD_NFT_ERROR.NOT_OWNED_NFT;
    }

    if (ownedNFTs.error || nftMeta.error) {
      return COSMOS_ADD_NFT_ERROR.NETWORK_ERROR;
    }
    return undefined;
  }, [addressRegex, debouncedContractAddress, debouncedTokenId, isOwnedNFT, nftMeta.error, nftSourceURI.data, ownedNFTs.error]);

  const nftPreviewIcon = useMemo(() => {
    if (errorType && debouncedContractAddress && debouncedTokenId) {
      return NFTErrorIcon;
    }
    return NFTPreviewIcon;
  }, [debouncedContractAddress, debouncedTokenId, errorType]);

  // "ipfs://bafybeibiwbgqzne2o4dqpkxgnpcyqkxwj6daqzhe33a4tjnpc3h6noufme/metadata/2195"
  // https://ipfs.mintscan.io/ipfs/bafybeibs4bln5recdqpaqo5e4nt55kll35asn2d3aa2xskxq4ntqxfjjjm/images/6395.png
  // https://ipfs.io/ipfs/bafybeibiwbgqzne2o4dqpkxgnpcyqkxwj6daqzhe33a4tjnpc3h6noufme/metadata/6395

  // https://ipfs.mintscan.io/ipfs/bafybeif6v6ntzhdobsafan5axpg27v7fnxwc64in3ec2qollrg37hfhbbm/images/2195.png
  // https://ipfs.mintscan.io/ipfs/bafybeiczlj6shvelqposdghrsy4vmeln6dhk37wolidd62ue4mptto6dmy/images/2195.png
  const nftPreviewHeaderText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidAddressTitle');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidTokenIdTitle');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_SOURCE) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidSourceTitle');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidOwnershipTitle');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.networkErrorTitle');
      }
    }

    return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.imagePreview');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const nftPreviewSubText = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidAddress');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_TOKEN_ID) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidTokenId');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_SOURCE) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidSource');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NOT_OWNED_NFT) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.invalidOwnership');
      }

      if (errorType === COSMOS_ADD_NFT_ERROR.NETWORK_ERROR) {
        return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.networkError');
      }
    }

    return t('pages.Chain.Cosmos.NFT.Add.CW721.entry.previewSubText');
  }, [debouncedContractAddress, debouncedTokenId, errorType, t]);

  const submit = async () => {
    try {
      if (debouncedContractAddress && debouncedTokenId) {
        const newNFT = {
          tokenId: debouncedTokenId,
          tokenType: TOKEN_TYPE.CW721,
          ownerAddress: currentAddress,
          address: debouncedContractAddress,
        };

        await addCosmosNFT(newNFT);

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
        <Input
          type="text"
          placeholder={t('pages.Chain.Cosmos.NFT.Add.CW721.entry.addressPlaceholder')}
          error={debouncedContractAddress ? !addressRegex.test(debouncedContractAddress) : undefined}
          onChange={(e) => setCurrentContractAddress(e.currentTarget.value)}
          value={currentContractAddress}
        />
      </Div>
      <Div sx={{ marginBottom: '0.8rem' }}>
        <Input
          type="text"
          onChange={(e) => setCurrentTokenId(e.currentTarget.value)}
          placeholder={t('pages.Chain.Cosmos.NFT.Add.CW721.entry.tokenIdPlaceholder')}
        />
      </Div>

      <PreviewContainer>
        {!errorType ? (
          <>
            <PreviewHeaderContainer>
              <Typography variant="h6">{t('pages.Chain.Cosmos.NFT.Add.CW721.entry.preview')}</Typography>
            </PreviewHeaderContainer>
            <PreviewBodyContainer>
              <PreviewNFTImageContainer>
                <Image src={nftMeta?.data?.imageURL} defaultImgSrc={unknownNFTImg} />
              </PreviewNFTImageContainer>
              <PreviewNFTSubtitleContainer>
                <Typography variant="h3">{nftMeta?.data?.name || nftSourceURI.data?.token_uri}</Typography>
              </PreviewNFTSubtitleContainer>
            </PreviewBodyContainer>
          </>
        ) : (
          <>
            <PreviewHeaderContainer>
              <Typography variant="h6">{t('pages.Chain.Cosmos.NFT.Add.CW721.entry.preview')}</Typography>
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
          {t('pages.Chain.Cosmos.NFT.Add.CW721.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
