import { useState } from 'react';
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
import type { ImportTokenForm } from '../useSchema';

import Info16Icon from '~/images/icons/Info16.svg';
import Plus16Icon from '~/images/icons/Plus16.svg';

export default function Entry() {
  const tokens = useTokensSWR();
  const [search, setSearch] = useState('');
  const { addEthereumToken } = useCurrentEthereumTokens();
  // 초기 값 => 새로운 값으로 업데이트
  const [check, setCheck] = useState<number>();

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const filteredTokens = search
    ? tokens.data.filter(
        (item) => (item.name.toLowerCase().indexOf(search.toLowerCase()) || item.displayDenom.toLowerCase().indexOf(search.toLowerCase())) > -1,
      )
    : tokens.data;

  const isSearching = search.toLowerCase().length > 0;

  const handelCheck = async (checked: boolean, data: ImportTokenForm) => {
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
            {filteredTokens.map((token, index) => (
              <TokenItem
                key={token.address}
                name={token.name}
                symbol={token.displayDenom}
                imageURL={token.imageURL}
                onClick={() => {
                  setCheck(index);
                  void handelCheck(true, token);
                }}
                isActive={index === check}
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
          type="submit"
          onClick={() => {
            navigate('/wallet');
          }}
        >
          {t('pages.Chain.Ethereum.Token.Add.Search.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
