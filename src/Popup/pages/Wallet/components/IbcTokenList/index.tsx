import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import { useBalanceSWR } from '~/Popup/hooks/SWR/tendermint/useBalanceSWR';
import { useIbcTokenSWR } from '~/Popup/hooks/SWR/tendermint/useIbcTokenSWR';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import IbcTokenItem from '~/Popup/pages/Wallet/components/IbcTokenList/components/IbcTokenItem';
import type { TendermintChain } from '~/types/chain';

import { Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

export default function SuspenseIbcTokenList() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line !== 'TENDERMINT') {
    return null;
  }
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <ErrorBoundary fallback={<></>}>
      <Suspense fallback={null}>
        <IbcTokenList chain={currentChain} />
      </Suspense>
    </ErrorBoundary>
  );
}

type EntryProps = {
  chain: TendermintChain;
};

function IbcTokenList({ chain }: EntryProps) {
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

  const sortedTokens = tokens.sort((a) => (a.tokenInfo?.auth ? -1 : 1));

  console.log(sortedTokens);
  if (tokens.length < 1) {
    return null;
  }

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <Typography variant="h6">IBC Tokens</Typography>
        </ListTitleLeftContainer>
        <ListTitleRightContainer>
          <Typography variant="h6">2</Typography>
        </ListTitleRightContainer>
      </ListTitleContainer>
      <ListContainer>
        <IbcTokenItem amount="0" channel="dd" />
      </ListContainer>
    </Container>
  );
}
