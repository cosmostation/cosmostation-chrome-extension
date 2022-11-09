import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import type { ImportTokenForm } from 'Popup/pages/Chain/Ethereum/Token/Add/ERC20/useSchema';
import { useSchema } from 'Popup/pages/Chain/Ethereum/Token/Add/ERC20/useSchema';
import { joiResolver } from '@hookform/resolvers/joi';
import { InputAdornment, Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import TokenItem from './components/TokenItem/index';
import {
  ButtonContainer,
  Container,
  Div,
  ImportCustomTokenButton,
  ImportCustomTokenImage,
  ImportCustomTokenText,
  StyledInput,
  StyledSearch20Icon,
  TokenIconBox,
  TokenIconContainer,
  TokenIconText,
  TokenList,
  TokenListContainer,
  TokensIcon,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';
import Plus16Icon from '~/images/icons/Plus16.svg';

export default function Entry() {
  const tokens = useTokensSWR();
  const [search, setSearch] = useState('');
  const { importTokenForm } = useSchema();
  const { addEthereumToken } = useCurrentEthereumTokens();
  const [check, setCheck] = useState('');

  const onClickCheck = (selectToken: string) => {
    setCheck(selectToken);
  };

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const {
    handleSubmit,
    formState: { isSubmitted },
    reset,
  } = useForm<ImportTokenForm>({
    resolver: joiResolver(importTokenForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const filteredTokens = search
    ? tokens.data.filter(
        (item) => (item.name.toLowerCase().indexOf(search.toLowerCase()) || item.displayDenom.toLowerCase().indexOf(search.toLowerCase())) > -1,
      )
    : tokens.data;

  const isSearching = search.toLowerCase().length > 0;

  const submit = async (data: ImportTokenForm) => {
    try {
      const foundToken = tokens.data.find((item) => item.address.toLowerCase() === data.address.toLowerCase());

      const newToken = foundToken
        ? {
            address: foundToken.address,
            displayDenom: foundToken.displayDenom,
            decimals: foundToken.decimals,
            imageURL: foundToken.imageURL,
            coinGeckoId: foundToken.coinGeckoId,
          }
        : data;

      await addEthereumToken({ ...newToken, tokenType: 'ERC20' });

      enqueueSnackbar(t('pages.Chain.Ethereum.Token.Add.Search.entry.addTokenSnackbar'));
    } finally {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <WarningContainer>
          <WarningIconContainer>
            <Info16Icon />
          </WarningIconContainer>
          <WarningTextContainer>
            <Typography variant="h6">{t('pages.Chain.Ethereum.Token.Add.Search.entry.warning')}</Typography>
          </WarningTextContainer>
        </WarningContainer>
        <Div sx={{ marginBottom: '1.2rem' }}>
          <ImportCustomTokenButton onClick={() => navigate('/chain/ethereum/token/add/erc20')} type="button">
            <ImportCustomTokenImage>
              <Plus16Icon />
            </ImportCustomTokenImage>
            <ImportCustomTokenText>
              <Typography variant="h5">{t('pages.Chain.Ethereum.Token.Add.Search.entry.importCustomTokenButton')}</Typography>
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
            placeholder={t('pages.Chain.Ethereum.Token.Add.Search.entry.searchPlaceholder')}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
          />
        </Div>
        {isSearching ? (
          <TokenListContainer>
            <TokenList>
              {filteredTokens.map((token) => (
                <TokenItem
                  key={token.address}
                  name={token.name}
                  symbol={token.displayDenom}
                  imageURL={token.imageURL}
                  onClick={() => onClickCheck}
                  isActive={check.length === search.length}
                />
              ))}
            </TokenList>
          </TokenListContainer>
        ) : (
          <TokenIconContainer>
            <TokenIconBox>
              <TokensIcon />
              <TokenIconText>
                <Typography variant="h6">
                  {t('pages.Chain.Ethereum.Token.Add.Search.entry.tokenIconText1')}
                  <br />
                  {t('pages.Chain.Ethereum.Token.Add.Search.entry.tokenIconText2')}
                </Typography>
              </TokenIconText>
            </TokenIconBox>
          </TokenIconContainer>
        )}
        <ButtonContainer>
          <Button type="submit" onClick={() => navigate('/wallet')} disabled={!isSubmitted}>
            {t('pages.Chain.Ethereum.Token.Add.Search.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}
