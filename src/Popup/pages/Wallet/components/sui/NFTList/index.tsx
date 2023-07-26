import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { getNFTType } from '~/Popup/utils/sui';
import type { SuiChain } from '~/types/chain';
import type { Path } from '~/types/route';

import NFTCardItem, { NFTCardItemSkeleton } from './components/NFTCardItem';
import TypeButton from './components/TypeButton';
import type { TypeInfo } from './components/TypePopover';
import TypePopover from './components/TypePopover';
import { Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

import NoNFTIcon from '~/images/icons/NoNFT.svg';

type NFTListProps = {
  chain: SuiChain;
};

export default function NFTList({ chain }: NFTListProps) {
  const { navigate } = useNavigate();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { nftObjects } = useNFTObjectsSWR({ address: currentAddress });

  const typeInfos = useMemo(() => {
    const infos: TypeInfo[] = [];

    const nftTypeList = Array.from(new Set([...(nftObjects.map((item) => getNFTType(item.data?.type)) || [])]));

    infos.push({ type: 'all', name: 'All Assets', count: nftObjects.length });

    nftTypeList.forEach((item) => {
      if (nftObjects.filter((object) => item === getNFTType(object.data?.type)).length > 1) {
        infos.push({ type: item, name: item, count: nftObjects.filter((object) => item === getNFTType(object.data?.type)).length });
      }
    });

    infos.push({
      type: 'etc',
      name: 'ETC',
      count: nftObjects.filter((object, _, array) => array.filter((item) => getNFTType(item.data?.type) === getNFTType(object.data?.type)).length < 2).length,
    });
    return infos;
  }, [nftObjects]);

  const [currentType, setCurrentType] = useState(typeInfos[0].type);

  const currentTypeInfo = useMemo(() => typeInfos.find((item) => item.type === currentType), [currentType, typeInfos]);

  const isExistNFT = useMemo(() => nftObjects && !!nftObjects.length, [nftObjects]);

  const filteredNFTObjects = useMemo(() => {
    if (currentType === 'all') return nftObjects;
    if (currentType === 'etc')
      return nftObjects.filter((object, _, array) => array.filter((item) => getNFTType(item.data?.type) === getNFTType(object.data?.type)).length < 2) || [];

    return nftObjects.filter((item) => currentTypeInfo?.name === getNFTType(item.data?.type)) || [];
  }, [currentType, currentTypeInfo?.name, nftObjects]);

  if (!isExistNFT) {
    return <EmptyAsset style={{ marginTop: '8.5rem' }} Icon={NoNFTIcon} headerText="No NFTs" subHeaderText="Recent NFTs will show up here" />;
  }

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <TypeButton
            text={currentTypeInfo?.name}
            number={currentTypeInfo?.count}
            onClick={(event) => setPopoverAnchorEl(event.currentTarget)}
            isActive={isOpenPopover}
          />
        </ListTitleLeftContainer>
        <ListTitleRightContainer />
      </ListTitleContainer>
      <ListContainer>
        {filteredNFTObjects.map((nft) => (
          <ErrorBoundary key={nft.data?.objectId} FallbackComponent={Empty}>
            <Suspense fallback={<NFTCardItemSkeleton />}>
              <NFTCardItem nftObject={nft} onClick={() => navigate(`/wallet/nft-detail/${nft.data?.objectId || ''}` as unknown as Path)} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </ListContainer>
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
