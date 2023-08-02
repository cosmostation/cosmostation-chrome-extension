import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import InformContainer from '~/Popup/components/common/InformContainer';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
// import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetNFTMetaSWR';
// import { useGetNFTsMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetNFTsMetaSWR';
import { useGetNFTsURISWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetNFTsURISWR';
import { useGetOwnedNFTTokenIDsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useGetOwnedNFTTokenIDsSWR';
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
  Div,
  ImportCustomTokenButton,
  ImportCustomTokenImage,
  ImportCustomTokenText,
  StyledInput,
  StyledSearch20Icon,
  TokenIconBox,
  TokenIconText,
  TokenList,
  TokensIcon,
} from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

type EntryProps = {
  chain: CosmosChain;
};

type CosmosNFTParams = Omit<CosmosNFT, 'id'>;

export default function Entry({ chain }: EntryProps) {
  const testList = [
    {
      address: 'stars1gy069cfum2nyqw92z3emt7lsged4rgjn53kzvqzsk4aya8zl9whsh2m5ca',
      name: 'Cosmic Robotz',
      symbol: 'CRZ',
    },
    {
      address: 'stars1p9k65klczkpn3877d9ehxamyv3kjqtpq6lldptcy6ngy74cr7c9syhgk7e',
      name: 'Mantra Punks',
      symbol: 'MTP',
    },
  ];

  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<CosmosNFTParams[]>([]);

  const { addCosmosNFTs, currentCosmosNFTs } = useCurrentCosmosNFTs();

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const testContractAddresses = testList.map((test) => test.address);

  const ownedNFTTokenIds = useGetOwnedNFTTokenIDsSWR({ chain, contractAddresses: testContractAddresses, ownerAddress: currentAddress });

  const flattendOwnedNFTTokenIds = useMemo(
    () =>
      // flatMap(ownedNFTTokenIds.data, (obj) =>
      //   obj.tokens.map((tokenId) => ({
      //     contractAddress: obj.contractAddress,
      //     tokenId,
      //   })),
      // ),
      ownedNFTTokenIds.data
        ?.map((obj) =>
          obj.tokens.map((tokenId) => ({
            contractAddress: obj.contractAddress,
            tokenId,
          })),
        )
        .reduce((acc, arr) => acc.concat(arr), []) || [],
    [ownedNFTTokenIds],
  );

  const filteredUniqueTokens = useMemo(
    () => flattendOwnedNFTTokenIds.filter((item) => !currentCosmosNFTs.find((nfts) => nfts.address === item.contractAddress && nfts.tokenId === item.tokenId)),
    [currentCosmosNFTs, flattendOwnedNFTTokenIds],
  );

  // NOTE 토큰 URI 가져오기
  const ownedNFTsURI = useGetNFTsURISWR({ chain, nftInfos: filteredUniqueTokens });

  // NOTE validNFTs의 메타정보 가져오기/ ipfs파싱방식이 달라서 그런가 작동하지 않음
  // const testtest = useGetNFTsMetaSWR({ chain, nftInfos: filteredUniqueTokens });
  // const testtesttest = useGetNFTMetaSWR({ chain, contractAddress: filteredUniqueTokens[0]?.contractAddress, tokenId: filteredUniqueTokens[0]?.tokenId });

  // https://ipfs.mintscan.io/ipfs/bafybeibs4bln5recdqpaqo5e4nt55kll35asn2d3aa2xskxq4ntqxfjjjm/images/6395.png
  // https://ipfs.tech/bafybeibiwbgqzne2o4dqpkxgnpcyqkxwj6daqzhe33a4tjnpc3h6noufme/metadata/2195
  const [debouncedSearch] = useDebounce(search, 500);

  // NOTE 컬렉션 명, nft 이름으로 필터링
  // NOTE NFTsMeta로 가져온 리스트로 필터링 하기
  const filteredTokens = debouncedSearch
    ? ownedNFTsURI.data?.filter((item) => item?.contractAddress && item?.contractAddress.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1) || []
    : ownedNFTsURI.data || [];

  const handleOnSubmit = async () => {
    await addCosmosNFTs(selectedTokens);
    setSelectedTokens([]);
    enqueueSnackbar(t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.addNFTSnackbar'));
  };

  const isExistNFT = !!filteredTokens.length;

  return (
    <Container>
      <InformContainer varient="info">
        <Typography variant="h6">{t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.warning')}</Typography>
      </InformContainer>
      <Div>
        <ImportCustomTokenButton onClick={() => navigate('/chain/cosmos/nft/add/cw721')}>
          <ImportCustomTokenImage>
            <Plus16Icon />
          </ImportCustomTokenImage>
          <ImportCustomTokenText>
            <Typography variant="h5">{t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.importCustomNFTButton')}</Typography>
          </ImportCustomTokenText>
        </ImportCustomTokenButton>
      </Div>
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
          <TokenList>
            {filteredTokens.map((token) => {
              const isActive = !!selectedTokens.find((check) => check.address === token?.contractAddress);
              return (
                <NFTItem
                  key={token.contractAddress + token.tokenId}
                  chain={chain}
                  contractAddress={token.contractAddress}
                  tokenId={token.tokenId}
                  onClick={() => {
                    if (isActive) {
                      setSelectedTokens(selectedTokens.filter((selectedToken) => selectedToken.address !== token.contractAddress));
                    } else {
                      setSelectedTokens([
                        ...selectedTokens,
                        {
                          address: token.contractAddress,
                          tokenId: token.tokenId,
                          chainUniqueId: chain.id,
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
          </TokenList>
        ) : (
          <TokenIconBox>
            <TokensIcon />
            <TokenIconText>
              <Typography variant="h6">
                {t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.nftIconText1')}
                <br />
                {t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.nftIconText2')}
              </Typography>
            </TokenIconText>
          </TokenIconBox>
        )}
      </ContentsContainer>
      <ButtonContainer>
        <Button onClick={handleOnSubmit} disabled={selectedTokens.length === 0}>
          {t('pages.Chain.Cosmos.NFT.Add.CW721.Search.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
