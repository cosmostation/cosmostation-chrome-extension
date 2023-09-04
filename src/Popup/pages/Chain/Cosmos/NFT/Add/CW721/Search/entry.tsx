import { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { InputAdornment } from '@mui/material';

import { COSMOS_ADD_NFT_ERROR } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useContractsInfoSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useContractsInfoSWR';
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

import NFTError40Icon from '~/images/icons/NFTError40.svg';
import NFTPreview40Icon from '~/images/icons/NFTPreview40.svg';

type EntryProps = {
  chain: CosmosChain;
};

type CosmosNFTParams = Omit<CosmosNFT, 'id'>;

export default function Entry({ chain }: EntryProps) {
  const { enqueueSnackbar } = useSnackbar();

  const [nftLimit, setNFTLimit] = useState(30);

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

  const supportContracts = useSupportContractsSWR(chain);

  const nftSmartContractAddresses = useMemo(
    () => (debouncedContractAddress ? [debouncedContractAddress] : supportContracts.data?.map((item) => item.contractAddress) || []),
    [debouncedContractAddress, supportContracts.data],
  );

  const { data: nftContractInfo } = useContractsInfoSWR(chain, nftSmartContractAddresses);

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
        .map((item) => ({
          ...item,
          contractName: nftContractInfo?.find((info) => info.contractAddress === item.contractAddress)?.name,
        })),
    [currentAddress, currentCosmosNFTs, flattendOwnedNFTTokenIDs, nftContractInfo],
  );

  const filteredNFTs = useMemo(
    () => notAddedNFTsInfo.slice(0, nftLimit),

    [nftLimit, notAddedNFTsInfo],
  );

  const isExistNFT = useMemo(() => !!filteredNFTs.length, [filteredNFTs.length]);

  const errorType = useMemo(() => {
    if (debouncedContractAddress && !addressRegex.test(debouncedContractAddress)) {
      return COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS;
    }

    if (!isExistNFT && debouncedContractAddress) {
      return COSMOS_ADD_NFT_ERROR.NO_NFTS_AVAILABLE;
    }

    if (ownedNFTTokenIDs.error) {
      return COSMOS_ADD_NFT_ERROR.NETWORK_ERROR;
    }
    return undefined;
  }, [addressRegex, debouncedContractAddress, isExistNFT, ownedNFTTokenIDs.error]);

  const nftPreviewIcon = useMemo(() => (errorType ? NFTError40Icon : NFTPreview40Icon), [errorType]);

  const nftPreviewHeaderText = useMemo(() => {
    if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
      return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.invalidAddressTitle');
    }

    if (errorType === COSMOS_ADD_NFT_ERROR.NETWORK_ERROR) {
      return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.networkErrorTitle');
    }

    if (errorType === COSMOS_ADD_NFT_ERROR.NO_NFTS_AVAILABLE) {
      return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.noNFTsAvailable1');
    }

    return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.searchNFTTitle');
  }, [errorType, t]);

  const nftPreviewSubText = useMemo(() => {
    if (errorType === COSMOS_ADD_NFT_ERROR.INVALID_CONTRACT_ADDRESS) {
      return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.invalidAddress');
    }

    if (errorType === COSMOS_ADD_NFT_ERROR.NETWORK_ERROR) {
      return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.networkError');
    }

    if (errorType === COSMOS_ADD_NFT_ERROR.NO_NFTS_AVAILABLE) {
      return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.noNFTsAvailable2');
    }

    return t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.searchNFTSubText');
  }, [errorType, t]);

  const handleOnSubmit = useCallback(async () => {
    await addCosmosNFTs(selectedNFTs);
    enqueueSnackbar(t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.addNFTSnackbar'));
  }, [addCosmosNFTs, enqueueSnackbar, selectedNFTs, t]);

  return (
    <Container>
      <StyledInput
        startAdornment={
          <InputAdornment position="start">
            <StyledSearch20Icon />
          </InputAdornment>
        }
        placeholder={t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.contractAddressPlaceholder')}
        value={contractAddress}
        onChange={(event) => {
          setContractAddress(event.currentTarget.value);
        }}
      />
      <ContentsContainer>
        {isExistNFT ? (
          <NFTList>
            {filteredNFTs.map((nftItem) => {
              const isActive = !!selectedNFTs.find((check) => check.address === nftItem.contractAddress && check.tokenId === nftItem.tokenId);
              return (
                <NFTItem
                  key={nftItem.contractAddress + nftItem.tokenId}
                  chain={chain}
                  contractAddress={nftItem.contractAddress}
                  tokenId={nftItem.tokenId}
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
          <EmptyAsset Icon={nftPreviewIcon} headerText={nftPreviewHeaderText} subHeaderText={nftPreviewSubText} subContainerWidth="23" />
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
