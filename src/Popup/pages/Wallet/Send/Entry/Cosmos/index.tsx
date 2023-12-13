import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { CircularTab, CircularTabPanel, CircularTabs } from '~/Popup/components/common/CircularTab';
import { BackButton } from '~/Popup/components/SubHeader/styled';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain, CosmosToken as BaseCosmosToken } from '~/types/chain';

import IBCError from './components/IBCError';
import IBCSend from './components/IBCSend';
import Send from './components/Send';
import { CircularTabContainer, Container, TopContainer } from './styled';

import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';

export const TYPE = {
  COIN: 'coin',
  TOKEN: 'token',
} as const;

export type CoinInfo = BaseCoinInfo & { type: typeof TYPE.COIN; price: string; name?: string };
export type TokenInfo = BaseCosmosToken & { type: typeof TYPE.TOKEN; availableAmount: string; price: string; name?: string };

export type CoinOrTokenInfo = CoinInfo | TokenInfo;

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const [value, setValue] = useState(0);

  const { navigateBack } = useNavigate();

  const { t } = useTranslation();

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Container>
      <TopContainer>
        <BackButton onClick={() => navigateBack()}>
          <LeftArrow16Icon />
        </BackButton>
        <CircularTabContainer>
          <CircularTabs value={value} onChange={handleChange}>
            <CircularTab label={t('pages.Wallet.Send.Entry.Cosmos.index.send')} />
            <CircularTab label={t('pages.Wallet.Send.Entry.Cosmos.index.ibcSend')} />
          </CircularTabs>
        </CircularTabContainer>
      </TopContainer>

      <CircularTabPanel value={value} index={0}>
        <Send chain={chain} />
      </CircularTabPanel>
      <CircularTabPanel value={value} index={1}>
        <ErrorBoundary fallback={<IBCError />}>
          <IBCSend chain={chain} />
        </ErrorBoundary>
      </CircularTabPanel>
    </Container>
  );
}
