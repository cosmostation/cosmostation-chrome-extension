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

  const { data: currentNFTStandard } = useGetNFTStandardSWR({ contractAddress: debouncedContractAddress });

  const { data: isOwnedNFT } = useGetNFTOwnerSWR({ contractAddress: debouncedContractAddress, ownerAddress: currentAddress, tokenId: debouncedTokenId });

  // NOTE 로딩 컴포넌트 구현 필요
  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: debouncedContractAddress, tokenId: debouncedTokenId });

  const errorType = useMemo(() => {
    if (debouncedContractAddress && debouncedTokenId) {
      if (!ethereumAddressRegex.test(debouncedContractAddress)) {
        return 'invalidAddress';
      }
      if (!nftMeta) {
        return 'noNFTData';
      }

      if (!isOwnedNFT) {
        return 'misMatch';
      }
    }

    return '';
  }, [debouncedContractAddress, debouncedTokenId, nftMeta, isOwnedNFT]);

  const nftPreviewIcon = useMemo(() => {
    if (errorType && debouncedContractAddress && debouncedTokenId) {
      return NFTErrorIcon;
    }
    return NFTPreviewIcon;
  }, [debouncedContractAddress, debouncedTokenId, errorType]);

  const nftPreviewHeaderText = useMemo(() => {
    if (errorType === 'invalidAddress') {
      return 'Invalid Contract Address';
    }
    if (errorType === 'noNFTData') {
      return 'Not Found';
    }
    if (errorType === 'misMatch') {
      return 'Mismatch';
    }

    return 'IMG Preview';
  }, [errorType]);

  const nftPreviewSubText = useMemo(() => {
    if (errorType === 'invalidAddress') {
      return t('pages.Chain.Ethereum.NFT.Add.entry.invalidAddress');
    }
    if (errorType === 'noNFTData') {
      // NOTE need i18
      return 'No data, Check you input right value & network';
    }
    if (errorType === 'misMatch') {
      // NOTE need i18
      return 'Ownership information does not match.';
    }

    return t('pages.Chain.Ethereum.NFT.Add.entry.previewSubText');
  }, [errorType, t]);

  const submit = async () => {
    try {
      if (debouncedContractAddress && debouncedTokenId && currentNFTStandard && nftMeta) {
        const newNFT = {
          tokenId: debouncedTokenId,
          tokenType: currentNFTStandard,
          name: nftMeta.name,
          ownerAddress: currentAddress,
          address: debouncedContractAddress,
          description: nftMeta.description,
          imageURL: nftMeta.image,
          metaURI: nftMeta.metaURI,
          attributes: nftMeta.attributes?.filter((item) => item.trait_type && item.value),
          externalLink: nftMeta.external_link,
          traits: nftMeta.traits,
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
          {!errorType && nftMeta ? (
            <>
              <PreviewNFTImageContainer>
                <Image src={nftMeta?.image} defaultImgSrc={unknownNFTImg} />
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
        <Button type="submit" disabled={!!errorType} onClick={submit}>
          {t('pages.Chain.Ethereum.NFT.Add.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
