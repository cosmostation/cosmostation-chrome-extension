import { Typography } from '@mui/material';

import { useBalanceSWR } from '~/Popup/hooks/SWR/tendermint/useBalanceSWR';
import { useIbcTokenSWR } from '~/Popup/hooks/SWR/tendermint/useIbcTokenSWR';
import IbcTokenItem from '~/Popup/pages/Wallet/components/tendermint/IbcTokenList/components/IbcTokenItem';
import type { TendermintChain } from '~/types/chain';

import { Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

type EntryProps = {
  chain: TendermintChain;
};

export default function IbcTokenList({ chain }: EntryProps) {
  const balance = useBalanceSWR(chain, true);
  const ibcToken = useIbcTokenSWR(chain, true);

  const ibcTokenArray = ibcToken.data?.ibc_tokens?.map((token) => token.hash) || [];

  const tokens =
    balance.data?.balance
      ?.filter((token) => ibcTokenArray.includes(token.denom.replace('ibc/', '')))
      .map((token) => {
        const tokenInfo = ibcToken.data?.ibc_tokens?.find((item) => item.hash === token.denom.replace('ibc/', ''));
        return { balance: token, tokenInfo };
      }) || [];

  const tokensLength = tokens.length;

  if (tokensLength < 1) {
    return null;
  }

  const sortedTokens = tokens.sort((a) => (a.tokenInfo?.auth ? -1 : 1));

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <Typography variant="h6">IBC Tokens</Typography>
        </ListTitleLeftContainer>
        <ListTitleRightContainer>
          <Typography variant="h6">{tokensLength}</Typography>
        </ListTitleRightContainer>
      </ListTitleContainer>
      <ListContainer>
        {sortedTokens.map((token) => (
          <IbcTokenItem
            key={token.tokenInfo?.hash}
            amount={token.balance.amount}
            channel={token.tokenInfo?.channel_id}
            decimals={token.tokenInfo?.decimal}
            baseDenom={token.tokenInfo?.base_denom}
            displayDenom={token.tokenInfo?.display_denom}
            imageURL={token.tokenInfo?.moniker}
          />
        ))}
      </ListContainer>
    </Container>
  );
}
