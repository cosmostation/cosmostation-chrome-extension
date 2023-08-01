import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayTokenStandard } from '~/Popup/utils/ethereum';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumChain } from '~/types/chain';
import type { Path } from '~/types/route';

import NFTCardItem, { NFTCardItemError, NFTCardItemSkeleton } from './components/NFTCardItem';
import TypeButton from './components/TypeButton';
import type { TypeInfo } from './components/TypePopover';
import TypePopover from './components/TypePopover';
import { AddTokenButton, AddTokenTextContainer, Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

type NFTListProps = {
  chain: EthereumChain;
};

export default function NFTList({ chain }: NFTListProps) {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { currentEthereumNFTs, removeEthereumNFT } = useCurrentEthereumNFTs();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const ownedEthereumNFTs = useMemo(
    () => currentEthereumNFTs.filter((item) => isEqualsIgnoringCase(item.ownerAddress, currentAddress)),
    [currentAddress, currentEthereumNFTs],
  );

  const typeInfos = useMemo(() => {
    const infos: TypeInfo[] = [];

    const nftTypeList = Array.from(new Set([...ownedEthereumNFTs.map((item) => item.tokenType)]));

    infos.push({ type: 'all', name: 'All Assets', count: ownedEthereumNFTs.length });

    nftTypeList.forEach((item) => {
      infos.push({ type: item, name: toDisplayTokenStandard(item), count: ownedEthereumNFTs.filter((nft) => item === nft.tokenType).length });
    });

    return infos;
  }, [ownedEthereumNFTs]);

  const [currentType, setCurrentType] = useState(typeInfos[0].type);

  const currentTypeInfo = useMemo(() => typeInfos.find((item) => item.type === currentType), [currentType, typeInfos]);

  const isExistNFT = useMemo(() => !!ownedEthereumNFTs.length, [ownedEthereumNFTs.length]);

  const filteredNFTs = useMemo(() => {
    if (currentType === 'all') return ownedEthereumNFTs;

    return ownedEthereumNFTs.filter((item) => currentTypeInfo?.type === item.tokenType) || [];
  }, [ownedEthereumNFTs, currentType, currentTypeInfo?.type]);

  const addNFT = () => navigate('/chain/ethereum/nft/add');

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
              {t('pages.Wallet.components.ethereum.NFTList.index.importNFTButton')}
            </AddButton>
          </ListTitleRightContainer>
        </ListTitleContainer>
      )}
      {isExistNFT ? (
        <ListContainer>
          {filteredNFTs.map((nft) => {
            const handleOnClickDelete = async () => {
              await removeEthereumNFT(nft);
            };
            return (
              <ErrorBoundary
                key={nft.id}
                FallbackComponent={
                  // eslint-disable-next-line react/no-unstable-nested-components
                  (props) => <NFTCardItemError {...props} nft={nft} onClickDelete={handleOnClickDelete} />
                }
              >
                <Suspense fallback={<NFTCardItemSkeleton />}>
                  <NFTCardItem
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
