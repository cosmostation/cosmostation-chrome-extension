import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';
import { getObjectDisplay } from '@mysten/sui.js';

import { SUI } from '~/constants/chain/sui/sui';
import Empty from '~/Popup/components/common/Empty';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import type { Path } from '~/types/route';

import NFTCardItem, { NFTCardItemSkeleton } from './components/NFTCardItem';
import TypeButton from './components/TypeButton';
import type { TypeInfo } from './components/TypePopover';
import TypePopover from './components/TypePopover';
import {
  Container,
  ListContainer,
  ListTitleContainer,
  ListTitleLeftContainer,
  ListTitleRightContainer,
  NoNFTContainer,
  NoNFTHeaderTextContainer,
  NoNFTSubTextContainer,
  NoNFTTextContainer,
} from './styled';

import NoNFTIcon from '~/images/icons/NoNFT.svg';

export default function NFTList() {
  const chain = SUI;

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

    const nftNameList = Array.from(
      new Set([
        ...(nftObjects
          ?.filter((item) => item.data?.content?.dataType === 'moveObject' && getObjectDisplay(item).data?.name)
          .map((item) => getObjectDisplay(item).data?.name || '') || []),
      ]),
    );

    infos.push({ type: 'all', name: 'All Assets', count: nftObjects.length });

    nftNameList.forEach((item) => {
      infos.push({ type: item, name: item, count: nftObjects.filter((object) => item === getObjectDisplay(object).data?.name).length });
    });

    if (nftObjects && nftObjects?.filter((item) => !getObjectDisplay(item).data?.name).length) {
      infos.push({ type: 'etc', name: 'ETC', count: nftObjects.filter((object) => !getObjectDisplay(object).data?.name).length });
    }

    return infos;
  }, [nftObjects]);

  const [currentType, setCurrentType] = useState(typeInfos[0].type);

  const currentTypeInfo = useMemo(() => typeInfos.find((item) => item.type === currentType), [currentType, typeInfos]);

  const isExistNFT = nftObjects && !!nftObjects.length;

  const filteredNFTObjects = useMemo(() => {
    if (currentType === 'all') return nftObjects;
    if (currentType === 'etc') return nftObjects.filter((item) => !getObjectDisplay(item).data?.name) || [];

    return nftObjects.filter((item) => currentTypeInfo?.name === getObjectDisplay(item).data?.name) || [];
  }, [currentType, currentTypeInfo?.name, nftObjects]);

  if (!isExistNFT) {
    return (
      <NoNFTContainer>
        <NoNFTIcon />
        <NoNFTTextContainer>
          <NoNFTHeaderTextContainer>
            <Typography variant="h4">No NFTs</Typography>
          </NoNFTHeaderTextContainer>
          <NoNFTSubTextContainer>
            <Typography variant="h4">Recent NFTs will show up here</Typography>
          </NoNFTSubTextContainer>
        </NoNFTTextContainer>
      </NoNFTContainer>
    );
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