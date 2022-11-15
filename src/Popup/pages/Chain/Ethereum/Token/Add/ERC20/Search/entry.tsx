import { useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { ModifiedAsset } from '~/types/ethereum/asset';

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
  const [check, setCheck] = useState<ModifiedAsset>();

  const { addEthereumToken } = useCurrentEthereumTokens();

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const filteredTokens = search
    ? tokens.data.filter(
        (item) => (item.name.toLowerCase().indexOf(search.toLowerCase()) || item.displayDenom.toLowerCase().indexOf(search.toLowerCase())) > -1,
      )
    : tokens.data;

  const isSearching = search.toLowerCase().length > 0;

  const handelCheck = async (checked: boolean, data: ModifiedAsset) => {
    if (checked) {
      const checkedToken = tokens.data.find((item) => item.address.toLowerCase() === data.address.toLowerCase());

      const searchedToken = checkedToken
        ? {
            address: checkedToken.address,
            displayDenom: checkedToken.displayDenom,
            decimals: checkedToken.decimals,
            imageURL: checkedToken.imageURL,
            coinGeckoId: checkedToken.coinGeckoId,
          }
        : data;

      await addEthereumToken({ ...searchedToken, tokenType: 'ERC20' });
    }
  };

  return (
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
        <ImportCustomTokenButton onClick={() => navigate('/chain/ethereum/token/add/erc20')}>
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
                onClick={() => {
                  if (token.address === check?.address) {
                    setCheck(undefined);
                  } else {
                    setCheck(token);
                  }
                }}
                isActive={token.address === check?.address}
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
        <Button
          onClick={() => {
            void handelCheck(true, check!);
            navigate('/wallet');
          }}
          disabled={!check}
        >
          {t('pages.Chain.Ethereum.Token.Add.Search.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
