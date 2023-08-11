import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import InformContainer from '~/Popup/components/common/InformContainer';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTsMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTsMetaSWR';
import { useOwnedNFTsTokenIDsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useOwnedNFTsTokenIDsSWR';
import { useSupportContractsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useSupportContractsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFT } from '~/types/cosmos/nft';

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
  const topRef = useRef<HTMLDivElement>(null);

  const { enqueueSnackbar } = useSnackbar();

  const [nftLimit, setNFTLimit] = useState(30);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

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

  const supportContracts = useSupportContractsSWR(chain);

  const nftSmartContractAddresses = useMemo(() => supportContracts.data?.map((item) => item.contractAddress) || [], [supportContracts.data]);

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

  const notAddedNFTsInfo = useMemo(
    () =>
      flattendOwnedNFTTokenIDs.filter(
        (item) =>
          !currentCosmosNFTs.find((nfts) => nfts.address === item.contractAddress && nfts.tokenId === item.tokenId && nfts.ownerAddress === currentAddress),
      ),
    [currentAddress, currentCosmosNFTs, flattendOwnedNFTTokenIDs],
  );

  const ownedNFTsMeta = useNFTsMetaSWR({ chain, nftInfos: notAddedNFTsInfo });

  const notAddedNFTs = useMemo(
    () =>
      notAddedNFTsInfo.map((item) => ({
        ...item,
        imageURL: ownedNFTsMeta.data.find((meta) => meta.tokenId === item.tokenId && meta.contractAddress === item.contractAddress)?.imageURL || '',
        metaData: ownedNFTsMeta.data.find((meta) => meta.tokenId === item.tokenId && meta.contractAddress === item.contractAddress)?.metaData,
      })),
    [notAddedNFTsInfo, ownedNFTsMeta.data],
  );

  const filteredNFTs = useMemo(
    () =>
      debouncedSearch
        ? notAddedNFTs.filter(
            (item) =>
              (item.metaData?.name && item.metaData.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1) ||
              (item?.tokenId && item.tokenId.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1),
          )
        : notAddedNFTs,
    [debouncedSearch, notAddedNFTs],
  );

  const handleOnSubmit = useCallback(async () => {
    await addCosmosNFTs(selectedNFTs);
    enqueueSnackbar(t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.addNFTSnackbar'));
  }, [addCosmosNFTs, enqueueSnackbar, selectedNFTs, t]);

  const isExistNFT = useMemo(() => !!filteredNFTs.length, [filteredNFTs.length]);

  useEffect(() => {
    if (search.length > 1) {
      setTimeout(() => topRef.current?.scrollIntoView(), 0);

      setNFTLimit(30);
    }
  }, [search.length]);

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
            <div ref={topRef} />
            {filteredNFTs.map((nftItem) => {
              const isActive = !!selectedNFTs.find((check) => check.address === nftItem.contractAddress && check.tokenId === nftItem.tokenId);
              return (
                <NFTItem
                  key={nftItem.contractAddress + nftItem.tokenId}
                  nft={nftItem}
                  onClick={() => {
                    if (isActive) {
                      setSelectedNFTs(
                        selectedNFTs.filter((selectedNFT) => !(selectedNFT.address === nftItem.contractAddress && selectedNFT.tokenId === nftItem.tokenId)),
                      );
                    } else {
                      setSelectedNFTs([
                        ...selectedNFTs,
                        {
                          address: nftItem.contractAddress,
                          tokenId: nftItem.tokenId,
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
            {filteredNFTs?.length > nftLimit - 1 && (
              <IntersectionObserver
                onIntersect={() => {
                  setNFTLimit((limit) => limit + 30);
                }}
              />
            )}
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
