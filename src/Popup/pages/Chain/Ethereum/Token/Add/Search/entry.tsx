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

import TokenItem from './component/index';
import {
  ButtonContainer,
  Container,
  Div,
  ImportCustomTokenButton,
  ImportCustomTokenImage,
  ImportCustomTokenText,
  ListContainer,
  StyledInput,
  StyledSearch20Icon,
  TokenList,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';
import Plus16Icon from '~/images/icons/Plus16.svg';

export default function Entry() {
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
          />
        </Div>
        <ListContainer>
          <TokenList>
            {filteredTokens.map((item) => (
              <TokenItem
                key={item.chainId}
                imageProps={{ alt: item.chainId, src: item.imageURL }}
                // isActive={  === network.id}
                // onClick={(isActive) => isActive}
                name={item.name}
                symbol={item.displayDenom}
              />
            ))}
          </TokenList>
        </ListContainer>
        <ButtonContainer>
          <Button type="button" onClick={() => navigate('/wallet')} disabled={!isSubmitted}>
            {t('pages.Chain.Ethereum.Token.Add.SEARCHTOKEN.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}

// 참고 및 연구할 부분
