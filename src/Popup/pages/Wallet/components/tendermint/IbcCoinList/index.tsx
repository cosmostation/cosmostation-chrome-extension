import { Typography } from '@mui/material';

import { useCoinListSWR } from '~/Popup/hooks/SWR/tendermint/useCoinListSWR';
import IbcCoinItem from '~/Popup/pages/Wallet/components/tendermint/IbcCoinList/components/IbcCoinItem';
import type { TendermintChain } from '~/types/chain';

import { Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

type EntryProps = {
  chain: TendermintChain;
};

export default function IbcCoinList({ chain }: EntryProps) {
  const { coins, ibcCoins } = useCoinListSWR(chain, true);

  const sortedCoins = [...coins, ...ibcCoins.sort((item) => (item.auth ? -1 : 1))];

  const coinLength = sortedCoins.length;

  if (coinLength < 1) {
    return null;
  }

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <Typography variant="h6">Coins</Typography>
        </ListTitleLeftContainer>
        <ListTitleRightContainer>
          <Typography variant="h6">{coinLength}</Typography>
        </ListTitleRightContainer>
      </ListTitleContainer>
      <ListContainer>
        {sortedCoins.map((item) => (
          <IbcCoinItem
            key={item.baseDenom}
            amount={item.totalAmount}
            channel={item.channelId}
            decimals={item.decimals}
            baseDenom={item.baseDenom}
            displayDenom={item.displayDenom}
            imageURL={item.imageURL}
          />
        ))}
      </ListContainer>
    </Container>
  );
}
