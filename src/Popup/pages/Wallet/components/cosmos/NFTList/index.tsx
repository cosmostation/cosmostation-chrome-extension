import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useContractsInfoSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useContractsInfoSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Path } from '~/types/route';

import NFTCardItem, { NFTCardItemError, NFTCardItemSkeleton } from './components/NFTCardItem';
import TypeButton from './components/TypeButton';
import type { TypeInfo } from './components/TypePopover';
import TypePopover from './components/TypePopover';
import { AddTokenButton, AddTokenTextContainer, Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

type NFTListProps = {
  chain: CosmosChain;
};

export default function NFTList({ chain }: NFTListProps) {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { currentCosmosNFTs, removeCosmosNFT } = useCurrentCosmosNFTs();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const currentAccountCosmosNFTs = useMemo(
    () => currentCosmosNFTs.filter((item) => isEqualsIgnoringCase(item.ownerAddress, currentAddress)),
    [currentAddress, currentCosmosNFTs],
  );

  const nftContractAddresses = useMemo(() => Array.from(new Set(currentAccountCosmosNFTs.map((item) => item.address))), [currentAccountCosmosNFTs]);

  const nftContractsInfo = useContractsInfoSWR(chain, nftContractAddresses);

  const typeInfos = useMemo(() => {
    const infos: TypeInfo[] = [];

    infos.push({ type: 'all', name: 'All Assets', count: currentAccountCosmosNFTs.length });

    nftContractsInfo.data?.forEach((item) => {
      infos.push({
        type: item?.contractAddress || '',
        name: item?.name || '',
        count: currentAccountCosmosNFTs.filter((nft) => item?.contractAddress === nft.address).length,
      });
    });

    if (currentAccountCosmosNFTs.filter((item) => !nftContractsInfo.data?.find((contractInfo) => contractInfo?.contractAddress === item.address)).length > 1) {
      infos.push({
        type: 'etc',
        name: 'ETC',
        count: currentAccountCosmosNFTs.filter((item) => !nftContractsInfo.data?.find((contractInfo) => contractInfo?.contractAddress === item.address)).length,
      });
    }

    return infos;
  }, [nftContractsInfo.data, currentAccountCosmosNFTs]);

  const [currentType, setCurrentType] = useState(typeInfos[0].type);

  const currentTypeInfo = useMemo(() => typeInfos.find((item) => item.type === currentType), [currentType, typeInfos]);

  const isExistNFT = useMemo(() => !!currentAccountCosmosNFTs.length, [currentAccountCosmosNFTs.length]);

  const filteredNFTs = useMemo(() => {
    if (currentType === 'all') return currentAccountCosmosNFTs;

    if (currentType === 'etc')
      return currentAccountCosmosNFTs.filter((item) => !nftContractsInfo.data?.find((contractInfo) => contractInfo.contractAddress === item.address));

    return currentAccountCosmosNFTs.filter((item) => currentTypeInfo?.type === item.address) || [];
  }, [currentType, currentAccountCosmosNFTs, nftContractsInfo.data, currentTypeInfo?.type]);

  const addNFT = () => navigate('/chain/cosmos/nft/add/cw721/search');

  return (
    <Container>
      {isExistNFT && (
        <ListTitleContainer>
          <ListTitleLeftContainer>
            <TypeButton
              text={currentTypeInfo?.name}
              number={currentTypeInfo?.count}
              onClick={(event) => setPopoverAnchorEl(event.currentTarget)}
              isActive={isOpenPopover}
            />
          </ListTitleLeftContainer>
          <ListTitleRightContainer>
            <AddButton type="button" onClick={addNFT}>
              {t('pages.Wallet.components.cosmos.NFTList.index.importNFTButton')}
            </AddButton>
          </ListTitleRightContainer>
        </ListTitleContainer>
      )}
      {isExistNFT ? (
        <ListContainer>
          {filteredNFTs.map((nft) => {
            const handleOnClickDelete = async () => {
              await removeCosmosNFT(nft);
            };
            return (
              <ErrorBoundary
                key={nft.id}
                FallbackComponent={
                  // eslint-disable-next-line react/no-unstable-nested-components
                  (props) => <NFTCardItemError {...props} chain={chain} nft={nft} onClickDelete={handleOnClickDelete} />
                }
              >
                <Suspense fallback={<NFTCardItemSkeleton />}>
                  <NFTCardItem
                    chain={chain}
                    nft={nft}
                    onClickDelete={handleOnClickDelete}
                    onClick={() => navigate(`/wallet/nft-detail/${nft.id || ''}` as unknown as Path)}
                  />
                </Suspense>
              </ErrorBoundary>
            );
          })}
        </ListContainer>
      ) : (
        <AddTokenButton type="button" onClick={addNFT}>
          <Plus16Icon />
          <AddTokenTextContainer>
            <Typography variant="h6">{t('pages.Wallet.components.cosmos.NFTList.index.importNFTButton')}</Typography>
          </AddTokenTextContainer>
        </AddTokenButton>
      )}
      <TypePopover
        marginThreshold={0}
        currentTypeInfo={currentTypeInfo}
        typeInfos={typeInfos}
        onClickType={(selectedTypeInfo) => {
          setCurrentType(selectedTypeInfo.type);
        }}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />
    </Container>
  );
}
