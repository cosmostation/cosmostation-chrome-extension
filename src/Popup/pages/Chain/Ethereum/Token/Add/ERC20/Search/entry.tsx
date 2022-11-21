import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { EthereumToken } from '~/types/chain';

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

type EthereumTokenParams = Omit<EthereumToken, 'id' | 'ethereumNetworkId'>;

export default function Entry() {
  const tokens = useTokensSWR();
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [checks, setChecks] = useState<EthereumTokenParams[]>([]);

  const { addEthereumTokens, currentEthereumTokens } = useCurrentEthereumTokens();

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const exceptExistToken = tokens.data.filter((original) => !currentEthereumTokens.map((current) => current.address).includes(original.address));

  const filteredTokens = search
    ? exceptExistToken.filter(
        (item) => (item.name.toLowerCase().indexOf(search.toLowerCase()) || item.displayDenom.toLowerCase().indexOf(search.toLowerCase())) > -1,
      )
    : tokens.data;

  const isSearching = search.length > 0;

  const handleCheck = async () => {
    await addEthereumTokens(checks);
    enqueueSnackbar(t('pages.Chain.Ethereum.Token.Add.ERC20.Search.entry.addTokenSnackbar'));
  };

  return (
    <Container>
      <WarningContainer>
        <WarningIconContainer>
          <Info16Icon />
        </WarningIconContainer>
        <WarningTextContainer>
          <Typography variant="h6">{t('pages.Chain.Ethereum.Token.Add.ERC20.Search.entry.warning')}</Typography>
        </WarningTextContainer>
      </WarningContainer>
      <Div sx={{ marginBottom: '1.2rem' }}>
        <ImportCustomTokenButton onClick={() => navigate('/chain/ethereum/token/add/erc20')}>
          <ImportCustomTokenImage>
            <Plus16Icon />
          </ImportCustomTokenImage>
          <ImportCustomTokenText>
            <Typography variant="h5">{t('pages.Chain.Ethereum.Token.Add.ERC20.Search.entry.importCustomTokenButton')}</Typography>
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
          placeholder={t('pages.Chain.Ethereum.Token.Add.ERC20.Search.entry.searchPlaceholder')}
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
                  if (checks.find((check) => check.address === token.address)) {
                    setChecks(checks.filter((off) => off.address !== token.address));
                    // 무조건 false인 값
                  } else {
                    setChecks([...checks, { ...token, tokenType: 'ERC20' }]);
                    // 무조건 트루인 값
                  }
                }}
                isActive={!!checks.filter((active) => active.address === token.address)}
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
                {t('pages.Chain.Ethereum.Token.Add.ERC20.Search.entry.tokenIconText1')}
                <br />
                {t('pages.Chain.Ethereum.Token.Add.ERC20.Search.entry.tokenIconText2')}
              </Typography>
            </TokenIconText>
          </TokenIconBox>
        </TokenIconContainer>
      )}
      <ButtonContainer>
        <Button
          onClick={() => {
            void handleCheck();
          }}
          disabled={!checks}
        >
          {t('pages.Chain.Ethereum.Token.Add.ERC20.Search.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
