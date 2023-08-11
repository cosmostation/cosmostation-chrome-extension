import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { InputAdornment } from '@mui/material';

import { COSMOS_ADD_NFT_ERROR } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
// import { useContractsInfoSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useContractsInfoSWR';
import { useNFTsMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTsMetaSWR';
import { useOwnedNFTsTokenIDsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useOwnedNFTsTokenIDsSWR';
import { useSupportContractsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useSupportContractsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFT } from '~/types/cosmos/nft';

import NFTItem from './components/NFTItem';
import { ButtonContainer, Container, ContentsContainer, NFTList, StyledInput, StyledSearch20Icon } from './styled';

import NFTErrorIcon from '~/images/icons/NFTError.svg';
import NFTPreviewIcon from '~/images/icons/NFTPreview.svg';

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

  const [contractAddress, setContractAddress] = useState('');
  const [debouncedContractAddress] = useDebounce(contractAddress, 500);

  const addressRegex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const [selectedNFTs, setSelectedNFTs] = useState<CosmosNFTParams[]>([]);

  const { addCosmosNFTs, currentCosmosNFTs } = useCurrentCosmosNFTs();

  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );
  // const currentAddress = 'stars15y38ehvexp6275ptmm4jj3qdds379nk07tw95r';

  const supportContracts = useSupportContractsSWR(chain);

  const nftSmartContractAddresses = useMemo(
    () => (debouncedContractAddress ? [debouncedContractAddress] : supportContracts.data?.map((item) => item.contractAddress) || []),
    [debouncedContractAddress, supportContracts.data],
  );

  // NOTE
  // const { data: nftContractInfo } = useContractsInfoSWR(chain, nftSmartContractAddresses);

  const ownedNFTTokenIDs = useOwnedNFTsTokenIDsSWR({
    chain,
    contractAddresses: nftSmartContractAddresses,
    ownerAddress: currentAddress,
  });

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
    [ownedNFTTokenIDs.data],
  );

  const notAddedNFTsInfo = useMemo(
    () =>
      flattendOwnedNFTTokenIDs
        .filter(
          (item) =>
            !currentCosmosNFTs.find((nfts) => nfts.address === item.contractAddress && nfts.tokenId === item.tokenId && nfts.ownerAddress === currentAddress),
        )
        .slice(0, nftLimit),
    [currentAddress, currentCosmosNFTs, flattendOwnedNFTTokenIDs, nftLimit],
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
  // NOTE 디자인은 서치 바에 테두리 박스 넣는 방식으로(send시에 나오는 그 테두리 박스)

  // NOTE 이 방식은 전체 리스트에서 서칭이 안되기떄문에(보이는 애만 검색이 가능), 따라서 내부에서 metadata를 페칭해야함
  const filteredNFTs = useMemo(
    () =>
      debouncedSearch
        ? notAddedNFTs.filter(
            (item) =>
              // (item.contractName && item.contractName.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1) ||
              (item.metaData?.name && item.metaData.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1) ||
              (item?.tokenId && item.tokenId.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1),
          )
        : notAddedNFTs,
    [debouncedSearch, notAddedNFTs],
  );

  const errorType = useMemo(() => {
    if (!addressRegex.test(debouncedContractAddress)) {
      return COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS;
    }

    // if (!nftSourceURI.data) {
    //   return COSMOS_ADD_NFT_ERROR.INVALID_SOURCE;
    // }

    // if (!isOwnedNFT.isOwnedNFT) {
    //   return COSMOS_ADD_NFT_ERROR.NOT_OWNED_NFT;
    // }

    // if (isOwnedNFT.error || nftMeta.error) {
    //   return COSMOS_ADD_NFT_ERROR.NETWORK_ERROR;
    // }
    return undefined;
  }, [addressRegex, debouncedContractAddress]);

  const nftPreviewIcon = useMemo(() => {
    if (errorType && debouncedContractAddress) {
      return NFTErrorIcon;
    }
    return NFTPreviewIcon;
  }, [debouncedContractAddress, errorType]);

  const nftPreviewHeaderText = useMemo(() => {
    if (debouncedContractAddress) {
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
  }, [debouncedContractAddress, errorType, t]);

  const nftPreviewSubText = useMemo(() => {
    if (debouncedContractAddress) {
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
  }, [debouncedContractAddress, errorType, t]);

  const handleOnSubmit = useCallback(async () => {
    await addCosmosNFTs(selectedNFTs);
    enqueueSnackbar(t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.addNFTSnackbar'));
  }, [addCosmosNFTs, enqueueSnackbar, selectedNFTs, t]);

  const isExistNFT = useMemo(() => !!filteredNFTs.length, [filteredNFTs.length]);

  useEffect(() => {
    if (contractAddress.length > 1) {
      setTimeout(() => topRef.current?.scrollIntoView(), 0);

      setNFTLimit(30);
    }
  }, [contractAddress.length]);

  return (
    <Container>
      <StyledInput
        placeholder={t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.contractAddressPlaceholder')}
        value={contractAddress}
        onChange={(event) => {
          setContractAddress(event.currentTarget.value);
        }}
      />

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
          // NOTE 아이콘 사이즈 더 크게 조절 필요
          <EmptyAsset Icon={nftPreviewIcon} headerText={nftPreviewHeaderText} subHeaderText={nftPreviewSubText} />
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
