import { Typography } from '@mui/material';

import { useCoinListSWR } from '~/Popup/hooks/SWR/tendermint/useCoinListSWR';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import IbcCoinItem from '~/Popup/pages/Wallet/components/tendermint/IbcCoinList/components/IbcCoinItem';
import { gt } from '~/Popup/utils/big';
import type { TendermintChain } from '~/types/chain';
import type { Path } from '~/types/route';

import { Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

type EntryProps = {
  chain: TendermintChain;
};

export default function IbcCoinList({ chain }: EntryProps) {
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
            baseDenom={item.baseDenom}
            displayDenom={item.displayDenom}
            imageURL={item.imageURL}
          />
        ))}
      </ListContainer>
    </Container>
  );
}
