import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayTokenStandard } from '~/Popup/utils/ethereum';
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

  const ownedCosmosNFTs = useMemo(
    () => currentCosmosNFTs.filter((item) => isEqualsIgnoringCase(item.ownerAddress, currentAddress)),
    [currentAddress, currentCosmosNFTs],
  );

  // NOTE 여기서 컬렉션 이름 가져오는 로직 추가

  // NOTE 컬렉션 훅 promise all로 가져오기

  const typeInfos = useMemo(() => {
    const infos: TypeInfo[] = [];

    const nftTypeList = Array.from(new Set([...ownedCosmosNFTs.map((item) => item.chainUniqueId)]));

    infos.push({ type: 'all', name: 'All Assets', count: ownedCosmosNFTs.length });

    nftTypeList.forEach((item) => {
      infos.push({ type: item, name: toDisplayTokenStandard(item), count: ownedCosmosNFTs.filter((nft) => item === nft.chainUniqueId).length });
    });

    return infos;
  }, [ownedCosmosNFTs]);

  const [currentType, setCurrentType] = useState(typeInfos[0].type);

  const currentTypeInfo = useMemo(() => typeInfos.find((item) => item.type === currentType), [currentType, typeInfos]);

  const isExistNFT = !!ownedCosmosNFTs.length;

  const filteredNFTs = useMemo(() => {
    if (currentType === 'all') return ownedCosmosNFTs;

    return ownedCosmosNFTs.filter((item) => currentTypeInfo?.type === item.chainUniqueId) || [];
  }, [currentType, ownedCosmosNFTs, currentTypeInfo?.type]);

  // NOTE 전체 토큰 가져오는 페이지로 선이동(이더리움 토큰 참조할 것)
  const addToken = () => navigate('/chain/cosmos/nft/add/cw721/search');

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
        <AddTokenButton type="button" onClick={addToken}>
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
