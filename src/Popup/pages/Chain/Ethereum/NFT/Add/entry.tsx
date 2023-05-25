import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { TOKEN_TYPE } from '~/constants/ethereum';
import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFT721OwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC721/useNFT721OwnerSWR';
import { useNFT1155BalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/ERC1155/useNFT1155BalanceSWR';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useGetNFTStandardSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTStandardSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { equal } from '~/Popup/utils/big';
import { ethereumAddressRegex } from '~/Popup/utils/regex';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';

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

  const { data: nft721OwnerAddress } = useNFT721OwnerSWR({ contractAddress: debouncedContractAddress, tokenId: debouncedTokenId });
  const { data: nft1155Balance } = useNFT1155BalanceSWR({ contractAddress: debouncedContractAddress, ownerAddress: currentAddress, tokenId: debouncedTokenId });

  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: debouncedContractAddress, tokenId: debouncedTokenId });

  const errorType = useMemo(() => {
    if (debouncedContractAddress && !ethereumAddressRegex.test(debouncedContractAddress)) {
      return 'invalidAddress';
    }
    if (!nftMeta) {
      return 'noNFTData';
    }

    if (debouncedTokenId && currentNFTStandard === TOKEN_TYPE.ERC721 && nft721OwnerAddress && !isEqualsIgnoringCase(currentAddress, nft721OwnerAddress)) {
      return 'misMatch';
    }
    if (debouncedTokenId && currentNFTStandard === TOKEN_TYPE.ERC1155 && equal('0', nft1155Balance || '0')) {
      return 'misMatch';
    }

    return '';
  }, [debouncedContractAddress, debouncedTokenId, currentNFTStandard, nft721OwnerAddress, currentAddress, nft1155Balance, nftMeta]);

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
      return 'No data, Check you input right value';
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
          name: nftMeta.name || '',
          address: debouncedContractAddress,
          description: nftMeta.description,
          imageURL: nftMeta.image,
          metaURI: nftMeta.metaURI,
        };

        await addEthereumNFT({
          ...newNFT,
        });

        enqueueSnackbar('success');
      }
    } catch (e) {
      enqueueSnackbar('fail', { variant: 'error' });
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
