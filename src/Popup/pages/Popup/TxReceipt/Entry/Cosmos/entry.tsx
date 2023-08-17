import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import type { CosmosChain } from '~/types/chain';

import {
  BottomContainer,
  CheckIconContainer,
  Container,
  ContentContainer,
  HeaderTitle,
  ItemColumnContainer,
  ItemContainer,
  ItemTitleContainer,
  StyledDivider,
  StyledIconButton,
  TxHashContainer,
  TxResultTextContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';
import ExplorerIcon from '~/images/icons/Explorer.svg';

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const { navigate } = useNavigate();

  const params = useParams();

  const txHash = useMemo(() => params.id || '', [params.id]);

  const explorerURL = useMemo(() => chain.explorerURL, [chain.explorerURL]);

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/account/${txHash}` : ''), [explorerURL, txHash]);

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts();
  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  return (
    <Container>
      <PopupHeader account={{ ...currentAccount, address: currentAddress }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} />
      <ContentContainer>
        <Typography variant="h4">Tx Receiept</Typography>

        <StyledDivider />

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">Tx Result</Typography>
          </ItemTitleContainer>

          <TxResultTextContainer>
            <CheckIconContainer>
              <Check16Icon />
            </CheckIconContainer>

            <HeaderTitle>
              <Typography variant="h5">Success</Typography>
            </HeaderTitle>
          </TxResultTextContainer>
        </ItemContainer>

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">View on Explorer</Typography>
          </ItemTitleContainer>

          {txDetailExplorerURL && (
            <StyledIconButton onClick={() => window.open(txDetailExplorerURL)}>
              <ExplorerIcon />
            </StyledIconButton>
          )}
        </ItemContainer>

        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">Tx Hash</Typography>
          </ItemTitleContainer>
          <TxHashContainer>
            <Typography variant="h5">{txHash}</Typography>
          </TxHashContainer>
        </ItemColumnContainer>
      </ContentContainer>

      <BottomContainer>
        <OutlineButton
          onClick={() => {
            navigate('/');
          }}
        >
          Done
        </OutlineButton>
      </BottomContainer>
    </Container>
  );
}
