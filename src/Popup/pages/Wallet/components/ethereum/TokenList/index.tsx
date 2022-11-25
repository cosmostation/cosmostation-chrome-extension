import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Path } from '~/types/route';

import TokenItem, { TokenItemError, TokenItemSkeleton } from './components/TokenItem';
import {
  AddTokenButton,
  AddTokenTextContainer,
  Container,
  ListContainer,
  ListTitleContainer,
  ListTitleLeftContainer,
  ListTitleLeftCountContainer,
  ListTitleLeftTextContainer,
  ListTitleRightContainer,
} from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

export default function TokenList() {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const { currentEthereumTokens, removeEthereumToken } = useCurrentEthereumTokens();
  const { data } = useTokensSWR();

  const isExistToken = !!currentEthereumTokens.length;

  const addToken = () => navigate(data.length > 0 ? '/chain/ethereum/token/add/erc20/search' : '/chain/ethereum/token/add/erc20');

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <ListTitleLeftTextContainer>
            <Typography variant="h6">{t('pages.Wallet.components.ethereum.TokenList.index.token')}</Typography>
          </ListTitleLeftTextContainer>
          <ListTitleLeftCountContainer>
            <Typography variant="h6">{isExistToken ? `${currentEthereumTokens.length}` : ''}</Typography>
          </ListTitleLeftCountContainer>
        </ListTitleLeftContainer>
        <ListTitleRightContainer>
          {isExistToken && (
            <AddButton type="button" onClick={addToken}>
              {t('pages.Wallet.components.ethereum.TokenList.index.importTokenButton')}
            </AddButton>
          )}
        </ListTitleRightContainer>
      </ListTitleContainer>

      <ListContainer>
        {isExistToken ? (
          currentEthereumTokens.map((token) => {
            const handleOnClickDelete = async () => {
              await removeEthereumToken(token);
            };

            return (
              <ErrorBoundary
                key={token.id}
                FallbackComponent={
                  // eslint-disable-next-line react/no-unstable-nested-components
                  (props) => <TokenItemError {...props} token={token} onClickDelete={handleOnClickDelete} />
                }
              >
                <Suspense fallback={<TokenItemSkeleton token={token} />}>
                  <TokenItem token={token} onClickDelete={handleOnClickDelete} onClick={() => navigate(`/wallet/send/${token.id}` as unknown as Path)} />
                </Suspense>
              </ErrorBoundary>
            );
          })
        ) : (
          <AddTokenButton type="button" onClick={addToken}>
            <Plus16Icon />
            <AddTokenTextContainer>
              <Typography variant="h6">{t('pages.Wallet.components.ethereum.TokenList.index.importTokenButton')}</Typography>
            </AddTokenTextContainer>
          </AddTokenButton>
        )}
      </ListContainer>
    </Container>
  );
}
