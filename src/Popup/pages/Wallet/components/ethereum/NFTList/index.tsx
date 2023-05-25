import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import Empty from '~/Popup/components/common/Empty';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Path } from '~/types/route';

import NFTCardItem, { NFTCardItemSkeleton } from './components/NFTCardItem';
import TypeButton from './components/TypeButton';
import type { TypeInfo } from './components/TypePopover';
import TypePopover from './components/TypePopover';
import { AddTokenButton, AddTokenTextContainer, Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

// NOTE nft를 소유하지 않은경우 해당 nft item이 바로 사라지는게 아니라 X표시를 해놓기는 해야함
export default function NFTList() {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { currentEthereumNFTs, removeEthereumNFT } = useCurrentEthereumNFTs();

  const typeInfos = useMemo(() => {
    const infos: TypeInfo[] = [];

    // NOTE name말고 다른 컬렉션으로 할 것
    // const nftNameList = currentEthereumNFTs.map((item) => item.name);

    infos.push({ type: 'all', name: 'All Assets', count: currentEthereumNFTs.length });

    // NOTE name말고 다른 컬렉션으로 할 것
    // nftNameList.forEach((item) => {
    //   infos.push({ type: item, name: item, count: currentEthereumNFTs.filter((nft) => item === nft.name).length });
    // });

    if (currentEthereumNFTs?.filter((item) => !item.description).length) {
      infos.push({ type: 'etc', name: 'ETC', count: currentEthereumNFTs.filter((nft) => !nft.description).length });
    }

    return infos;
  }, [currentEthereumNFTs]);

  const [currentType, setCurrentType] = useState(typeInfos[0].type);

  const currentTypeInfo = useMemo(() => typeInfos.find((item) => item.type === currentType), [currentType, typeInfos]);

  const isExistNFT = !!currentEthereumNFTs.length;

  // NOTE 여기서 ownercheck
  const filteredNFTObjects = useMemo(() => {
    if (currentType === 'all') return currentEthereumNFTs;
    if (currentType === 'etc') return currentEthereumNFTs;

    return currentEthereumNFTs.filter((item) => currentTypeInfo?.name === item.id) || [];
  }, [currentEthereumNFTs, currentType, currentTypeInfo?.name]);

  const addToken = () => navigate('/chain/ethereum/nft/add');

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
            <AddButton type="button" onClick={addToken}>
              {t('pages.Wallet.components.ethereum.NFTList.index.importNFTButton')}
            </AddButton>
          </ListTitleRightContainer>
        </ListTitleContainer>
      )}
      {isExistNFT ? (
        <ListContainer>
          {filteredNFTObjects.map((nft) => {
            const handleOnClickDelete = async () => {
              await removeEthereumNFT(nft);
            };
            return (
              <ErrorBoundary key={nft.id} FallbackComponent={Empty}>
                <Suspense fallback={<NFTCardItemSkeleton />}>
                  <NFTCardItem
                    nftObject={nft}
                    onClickDelete={handleOnClickDelete}
                    onClick={() => navigate(`/wallet/nft-detail/${nft.id || ''}` as unknown as Path)}
                  />
                </Suspense>
              </ErrorBoundary>
            );
          })}
        </ListContainer>
      ) : (
        <AddTokenButton type="button" onClick={addToken}>
          <Plus16Icon />
          <AddTokenTextContainer>
            <Typography variant="h6">{t('pages.Wallet.components.ethereum.NFTList.index.importNFTButton')}</Typography>
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
