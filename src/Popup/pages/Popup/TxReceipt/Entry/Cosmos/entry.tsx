import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useTxInfoSWR } from '~/Popup/hooks/SWR/cosmos/useTxInfoSWR';
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
import CopyButton from '../components/CopyButton';

import Check16Icon from '~/images/icons/Check16.svg';
import ExplorerIcon from '~/images/icons/Explorer.svg';

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const { navigate } = useNavigate();

  const params = useParams();

  const txHash = useMemo(() => params.id || '', [params.id]);

  const txInfo = useTxInfoSWR(chain, txHash);

  const explorerURL = useMemo(() => chain.explorerURL, [chain.explorerURL]);

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/transactions/${txHash}` : ''), [explorerURL, txHash]);

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
            <Typography variant="h5">Broadcast Result</Typography>
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

        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">Gas used / wanted</Typography>
          </ItemTitleContainer>

          {txInfo.data?.gas_used && txInfo.data?.gas_wanted && (
            <div>
              <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                {txInfo.data.gas_used}
              </Number>
              &nbsp;/&nbsp;
              <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                {txInfo.data.gas_wanted}
              </Number>
            </div>
          )}
        </ItemContainer>

        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">Tx Hash</Typography>
            <CopyButton text={txHash} />
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
