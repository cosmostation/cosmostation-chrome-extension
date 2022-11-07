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
import type { Token } from '~/types/ethereum/common';

import {
  ButtonContainer,
  Container,
  ContentsContainer1,
  ContentsContainer2,
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
import TokenItem from './TokenList/component/index';

import Info16Icon from '~/images/icons/Info16.svg';
import Plus16Icon from '~/images/icons/Plus16.svg';

type TokenListProps = {
  currentTokens: Token;
  // onClickSelectToken?: (token: Token) => void;
};

export default function Entry({ currentTokens }: TokenListProps) {
  const [search, setSearch] = useState('');
  const { importTokenForm } = useSchema();
  const { addEthereumToken } = useCurrentEthereumTokens();

  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const tokens = useTokensSWR();

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

  const filteredTokens = search ? tokens.data.filter((item) => item.name.toLowerCase().indexOf(search.toLowerCase()) > -1) : tokens.data;

  const [isIconOn, setIconOn] = useState(true);

  const offIcon = () => {
    setIconOn(false);
  };

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

      enqueueSnackbar(t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.addTokenSnackbar'));
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
            <Typography variant="h6">{t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.warning')}</Typography>
          </WarningTextContainer>
        </WarningContainer>
        <Div sx={{ marginBottom: '1.2rem' }}>
          <ImportCustomTokenButton onClick={() => navigate('/chain/ethereum/token/add/erc20')} type="button">
            <ImportCustomTokenImage>
              <Plus16Icon />
            </ImportCustomTokenImage>
            <ImportCustomTokenText>
              <Typography variant="h5">{t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.importCustomTokenButton')}</Typography>
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
            placeholder={t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            onClick={offIcon}
          />
        </Div>
        {isIconOn && (
          <ContentsContainer1>
            <TokenIconBox>
              <TokensIcon />
              <TokenIconText>
                <Typography variant="h6">
                  {t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.tokenIconText1')}
                  <br />
                  {t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.tokenIconText2')}
                </Typography>
              </TokenIconText>
            </TokenIconBox>
          </ContentsContainer1>
        )}
        <ContentsContainer2>
          <TokenList>
            {filteredTokens.map((token) => {
              const isActive = currentTokens?.name === token?.name;
              return (
                <TokenItem
                  key={token.chainId}
                  imageProps={{ alt: token.chainId, src: token.imageURL }}
                  isActive={isActive}
                  // onClick={() => {
                  //   onClickSelectToken?.(token);
                  // }}
                  name={token.name}
                  symbol={token.displayDenom}
                />
              );
            })}
          </TokenList>
        </ContentsContainer2>
        <ButtonContainer>
          <Button type="submit" onClick={() => navigate('/wallet')} disabled={!isSubmitted}>
            {t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}
