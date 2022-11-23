import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import { JUNO } from '~/constants/chain/cosmos/juno';
import Button from '~/Popup/components/common/Button';
import { useTokenInfoSWR } from '~/Popup/hooks/SWR/cosmos/useTokenInfoSWR';
import { useTokensSWR } from '~/Popup/hooks/SWR/cosmos/useTokensSWR';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosToken } from '~/types/chain';

import TokenItem from './components/TokenItem/index';
import {
  ButtonContainer,
  Container,
  ContentsContainer,
  Div,
  ImportCustomTokenButton,
  ImportCustomTokenImage,
  ImportCustomTokenText,
  StyledInput,
  StyledSearch20Icon,
  TokenIconBox,
  TokenIconText,
  TokenList,
  TokensIcon,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';
import Plus16Icon from '~/images/icons/Plus16.svg';

type CosmosTokenParams = Omit<CosmosToken, 'id'>;

export default function Entry() {
  const tokens = useTokensSWR(JUNO);
  // CW20Asset
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<CosmosTokenParams[]>([]);
  const { currentChain } = useCurrentChain();

  const { addCosmosTokens, currentCosmosTokens } = useCurrentCosmosTokens();
  const tokenInfo = useTokenInfoSWR(JUNO, '');
  // 이해안감

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const currentTokenAddresses = currentCosmosTokens.map((current) => current.address);

  const validTokens = useMemo(
    () => tokens.data.filter((original) => !currentTokenAddresses.includes(original.contract_address)),
    [currentTokenAddresses, tokens.data],
  );
  const filteredTokens = search ? validTokens.filter((item) => item.denom.toLowerCase().indexOf(search.toLowerCase()) > -1) : validTokens;

  const handleOnSubmit = async () => {
    if (tokenInfo.data) {
      await addCosmosTokens(selectedTokens);
      setSelectedTokens([]);
      enqueueSnackbar(t('pages.Chain.Cosmos.Token.Add.CW20.Search.entry.addTokenSnackbar'));
    }
  };

  return (
    <Container>
      <WarningContainer>
        <WarningIconContainer>
          <Info16Icon />
        </WarningIconContainer>
        <WarningTextContainer>
          <Typography variant="h6">{t('pages.Chain.Cosmos.Token.Add.CW20.Search.entry.warning')}</Typography>
        </WarningTextContainer>
      </WarningContainer>
      <Div sx={{ marginBottom: '1.2rem' }}>
        <ImportCustomTokenButton onClick={() => navigate('/chain/cosmos/token/add/cw20')}>
          <ImportCustomTokenImage>
            <Plus16Icon />
          </ImportCustomTokenImage>
          <ImportCustomTokenText>
            <Typography variant="h5">{t('pages.Chain.Cosmos.Token.Add.CW20.Search.entry.importCustomTokenButton')}</Typography>
          </ImportCustomTokenText>
        </ImportCustomTokenButton>
      </Div>
      <Div>
        <StyledInput
          startAdornment={
            <InputAdornment position="start">
              <StyledSearch20Icon />
            </InputAdornment>
          }
          placeholder={t('pages.Chain.Cosmos.Token.Add.CW20.Search.entry.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
      </Div>

      <ContentsContainer>
        {filteredTokens.length > 0 ? (
          <TokenList>
            {filteredTokens.map((token) => {
              const isActive = selectedTokens.find((check) => check.address === token.contract_address);
              return (
                <TokenItem
                  key={token.contract_address}
                  // name={token.denom}
                  symbol={token.denom}
                  logo={token.logo}
                  onClick={() => {
                    if (isActive) {
                      setSelectedTokens(selectedTokens.filter((selectedToken) => selectedToken.address !== token.contract_address));
                    } else {
                      // setSelectedTokens(selectedTokens);
                      setSelectedTokens([
                        ...selectedTokens,
                        {
                          ...token,
                          address: token.contract_address,
                          chainId: currentChain.id,
                          tokenType: 'CW20',
                          displayDenom: token.denom,
                          decimals: token.decimal,
                        },
                      ]);
                    }
                  }}
                  isActive={!!isActive}
                />
              );
            })}
          </TokenList>
        ) : (
          <TokenIconBox>
            <TokensIcon />
            <TokenIconText>
              <Typography variant="h6">
                {t('pages.Chain.Cosmos.Token.Add.CW20.Search.entry.tokenIconText1')}
                <br />
                {t('pages.Chain.Cosmos.Token.Add.CW20.Search.entry.tokenIconText2')}
              </Typography>
            </TokenIconText>
          </TokenIconBox>
        )}
      </ContentsContainer>
      <ButtonContainer>
        <Button onClick={handleOnSubmit} disabled={selectedTokens.length === 0}>
          {t('pages.Chain.Cosmos.Token.Add.CW20.Search.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
