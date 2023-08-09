import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import InformContainer from '~/Popup/components/common/InformContainer';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTsMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTsMetaSWR';
import { useOwnedNFTsTokenIDsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useOwnedNFTsTokenIDsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFT, CosmwasmSmartContract } from '~/types/cosmos/nft';

import NFTItem from './components/NFTItem';
import {
  ButtonContainer,
  Container,
  ContentsContainer,
  ImportCustomNFTButton,
  ImportCustomNFTButtonContainer,
  ImportCustomNFTImage,
  ImportCustomNFTText,
  NFTIconBox,
  NFTIconText,
  NFTList,
  NoNFTIcon,
  StyledInput,
  StyledSearch20Icon,
} from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

type EntryProps = {
  chain: CosmosChain;
};

type CosmosNFTParams = Omit<CosmosNFT, 'id'>;

export default function Entry({ chain }: EntryProps) {
  const nftSmartContracts = [] as CosmwasmSmartContract[];

  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [selectedNFTs, setSelectedNFTs] = useState<CosmosNFTParams[]>([]);

  const { addCosmosNFTs, currentCosmosNFTs } = useCurrentCosmosNFTs();

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const nftSmartContractAddresses = nftSmartContracts.find((item) => item.chainId === chain.chainId)?.smartContracts.map((nft) => nft.address) || [];

  const ownedNFTTokenIDs = useOwnedNFTsTokenIDsSWR({ chain, contractAddresses: nftSmartContractAddresses, ownerAddress: currentAddress });

  const flattendOwnedNFTTokenIDs = useMemo(
    () =>
      ownedNFTTokenIDs.data
        ?.map((obj) =>
          obj.tokens.map((tokenId) => ({
            contractAddress: obj.contractAddress,
            tokenId,
          })),
        )
        .reduce((acc, arr) => acc.concat(arr), []) || [],
    [ownedNFTTokenIDs],
  );

  const notAddedNFTs = useMemo(
    () =>
      flattendOwnedNFTTokenIDs.filter(
        (item) =>
          !currentCosmosNFTs.find((nfts) => nfts.address === item.contractAddress && nfts.tokenId === item.tokenId && nfts.ownerAddress === currentAddress),
      ),
    [currentAddress, currentCosmosNFTs, flattendOwnedNFTTokenIDs],
  );

  const ownedNFTsMeta = useNFTsMetaSWR({ chain, nftInfos: notAddedNFTs });

  const [debouncedSearch] = useDebounce(search, 500);

  const filteredNFTs = debouncedSearch
    ? ownedNFTsMeta.data.filter(
        (item) =>
          (item?.name && item.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1) ||
          (item?.tokenId && item.tokenId.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1),
      ) || []
    : ownedNFTsMeta.data || [];

  const handleOnSubmit = async () => {
    await addCosmosNFTs(selectedNFTs);
    enqueueSnackbar(t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.addNFTSnackbar'));
  };

  const isExistNFT = !!filteredNFTs.length;

  return (
    <Container>
      <InformContainer varient="info">
        <Typography variant="h6">{t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.warning')}</Typography>
      </InformContainer>
      <ImportCustomNFTButtonContainer>
        <ImportCustomNFTButton onClick={() => navigate('/chain/cosmos/nft/add/cw721')}>
          <ImportCustomNFTImage>
            <Plus16Icon />
          </ImportCustomNFTImage>
          <ImportCustomNFTText>
            <Typography variant="h5">{t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.importCustomNFTButton')}</Typography>
          </ImportCustomNFTText>
        </ImportCustomNFTButton>
      </ImportCustomNFTButtonContainer>
      <StyledInput
        startAdornment={
          <InputAdornment position="start">
            <StyledSearch20Icon />
          </InputAdornment>
        }
        placeholder={t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.searchPlaceholder')}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
        }}
      />
      <ContentsContainer>
        {isExistNFT ? (
          <NFTList>
            {filteredNFTs.map((token) => {
              const isActive = !!selectedNFTs.find((check) => check.address === token.contractAddress && check.tokenId === token.tokenId);
              return (
                <NFTItem
                  key={token.contractAddress + token.tokenId}
                  chain={chain}
                  contractAddress={token.contractAddress}
                  tokenId={token.tokenId}
                  onClick={() => {
                    if (isActive) {
                      setSelectedNFTs(
                        selectedNFTs.filter((selectedNFT) => !(selectedNFT.address === token.contractAddress && selectedNFT.tokenId === token.tokenId)),
                      );
                    } else {
                      setSelectedNFTs([
                        ...selectedNFTs,
                        {
                          address: token.contractAddress,
                          tokenId: token.tokenId,
                          baseChainUUID: chain.id,
                          tokenType: 'CW721',
                          ownerAddress: currentAddress,
                        },
                      ]);
                    }
                  }}
                  isActive={isActive}
                />
              );
            })}
          </NFTList>
        ) : (
          <NFTIconBox>
            <NoNFTIcon />
            <NFTIconText>
              <Typography variant="h6">
                {t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.nftIconText1')}
                <br />
                {t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.nftIconText2')}
              </Typography>
            </NFTIconText>
          </NFTIconBox>
        )}
      </ContentsContainer>
      <ButtonContainer>
        <Button onClick={handleOnSubmit} disabled={selectedNFTs.length === 0}>
          {t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
