import { useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';
import type { Path } from '~/types/route';

import CoinItem from './components/CoinItem';
import TokenItem from './components/TokenItem';
import TypeButton from './components/TypeButton';
import type { TypeInfo } from './components/TypePopover';
import TypePopover from './components/TypePopover';
import { AddTokenButton, AddTokenTextContainer, Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

type CoinListProps = {
  chain: CosmosChain;
};

export default function CoinList({ chain }: CoinListProps) {
  const { coins, ibcCoins } = useCoinListSWR(chain, true);

  const { chromeStorage } = useChromeStorage();
  const { t } = useTranslation();

  const accounts = useAccounts(true);

  const address = accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { currentCosmosTokens, removeCosmosToken } = useCurrentCosmosTokens();

  const coinCnt = coins.length;
  const ibcCointCnt = ibcCoins.length;
  const tokenCnt = currentCosmosTokens.length;

  const sortedCoins = useMemo(() => coins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)), [coins]);
  const sortedIbcCoins = useMemo(() => ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)), [ibcCoins]);

  const sortedTokens = useMemo(() => currentCosmosTokens.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)), [currentCosmosTokens]);

  const typeInfos = useMemo(() => {
    const infos: TypeInfo[] = [];

    infos.push({ type: 'all', name: 'All Assets', count: coinCnt + ibcCointCnt + tokenCnt });

    if (coinCnt) {
      infos.push({ type: 'native', name: 'Native Coins', count: coinCnt });
    }

    if (ibcCointCnt) {
      infos.push({ type: 'ibc', name: 'IBC Coins', count: ibcCointCnt });
    }

    if (tokenCnt && chain.cosmWasm) {
      infos.push({ type: 'cw20', name: 'CW20 Tokens', count: tokenCnt });
    }

    return infos;
  }, [chain.cosmWasm, coinCnt, ibcCointCnt, tokenCnt]);

  const [currentTypeInfo, setCurrentTypeInfo] = useState(typeInfos[0]);

  const { navigate } = useNavigate();

  if (coinCnt + ibcCointCnt < 1 && !chain.cosmWasm) {
    return null;
  }

  const isExistCoinOrToken = coinCnt + ibcCointCnt + tokenCnt > 0;

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <TypeButton
            text={currentTypeInfo.name}
            number={currentTypeInfo.count}
            onClick={(event) => setPopoverAnchorEl(event.currentTarget)}
            isActive={isOpenPopover}
          />
        </ListTitleLeftContainer>
        <ListTitleRightContainer>
          {isExistCoinOrToken && chain.cosmWasm && (
            <AddButton type="button" onClick={() => navigate('/chain/cosmos/token/add/cw20')}>
              {t('pages.Wallet.components.cosmos.CoinList.index.importTokenButton')}
            </AddButton>
          )}
        </ListTitleRightContainer>
      </ListTitleContainer>
      <ListContainer>
        {(currentTypeInfo.type === 'all' || currentTypeInfo.type === 'native') &&
          sortedCoins.map((item) => (
            <CoinItem
              disabled={!gt(item.availableAmount, '0')}
              key={item.baseDenom}
              onClick={() => navigate(`/wallet/send/${item.baseDenom ? `${encodeURIComponent(item.baseDenom)}` : ''}` as unknown as Path)}
              amount={item.totalAmount}
              channel={item.channelId}
              decimals={item.decimals}
              baseDenom={item.originBaseDenom}
              displayDenom={item.displayDenom}
              imageURL={item.imageURL}
            />
          ))}

        {(currentTypeInfo.type === 'all' || currentTypeInfo.type === 'ibc') &&
          sortedIbcCoins.map((item) => (
            <CoinItem
              disabled={!gt(item.availableAmount, '0')}
              key={item.baseDenom}
              onClick={() => navigate(`/wallet/send/${item.baseDenom ? `${encodeURIComponent(item.baseDenom)}` : ''}` as unknown as Path)}
              amount={item.totalAmount}
              channel={item.channelId}
              decimals={item.decimals}
              baseDenom={item.originBaseDenom}
              displayDenom={item.displayDenom}
              imageURL={item.imageURL}
            />
          ))}

        {(currentTypeInfo.type === 'all' || currentTypeInfo.type === 'cw20') &&
          sortedTokens.map((item) => <TokenItem key={item.id} address={address} chain={chain} token={item} onClickDelete={() => removeCosmosToken(item)} />)}

        {!isExistCoinOrToken && chain.cosmWasm && (
          <AddTokenButton type="button" onClick={() => navigate('/chain/cosmos/token/add/cw20')}>
            <Plus16Icon />
            <AddTokenTextContainer>
              <Typography variant="h6">{t('pages.Wallet.components.cosmos.CoinList.index.importTokenButton')}</Typography>
            </AddTokenTextContainer>
          </AddTokenButton>
        )}
      </ListContainer>
      <TypePopover
        marginThreshold={0}
        currentTypeInfo={currentTypeInfo}
        typeInfos={typeInfos}
        onClickType={(selectedTypeInfo) => {
          setCurrentTypeInfo(selectedTypeInfo);
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
