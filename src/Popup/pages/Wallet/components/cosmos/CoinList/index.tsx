import { Typography } from '@mui/material';

import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import IbcCoinItem from '~/Popup/pages/Wallet/components/cosmos/CoinList/components/IbcCoinItem';
import { gt } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';
import type { Path } from '~/types/route';

import { Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

type CoinListProps = {
  chain: CosmosChain;
};

export default function CoinList({ chain }: CoinListProps) {
  const { coins, ibcCoins } = useCoinListSWR(chain, true);

  const sortedCoins = [...coins, ...ibcCoins.reverse().sort((item) => (item.auth ? -1 : 1))];

  const unauthCoins = ibcCoins.filter((item) => !item.auth).map((item) => item.baseDenom);

  const coinLength = sortedCoins.length;

  const { navigate } = useNavigate();

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
            disabled={!gt(item.availableAmount, '0') || unauthCoins.includes(item.baseDenom)}
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
      </ListContainer>
    </Container>
  );
}
