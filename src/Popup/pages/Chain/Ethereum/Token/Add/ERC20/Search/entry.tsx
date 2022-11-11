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
  // 선택할 인덱스 (초기 값 x) => 새로운 값(선택할)으로 업데이트 (isActive에서 쓸 예정)
  const [check, setCheck] = useState<number>();

  const { t } = useTranslation();
  const { navigate } = useNavigate();

  // 검색 시, 정제되는 토큰 데이터
  const filteredTokens = search
    ? tokens.data.filter(
        (item) => (item.name.toLowerCase().indexOf(search.toLowerCase()) || item.displayDenom.toLowerCase().indexOf(search.toLowerCase())) > -1,
      )
    : tokens.data;

  // 서치창에 글자가 입력되면 리스트가 켜지는 로직
  const isSearching = search.toLowerCase().length > 0;

  // 선택한 인덱스의 데이터를 확인해 currentTokendata로 add하는 로직
  const handelCheck = async (checked: boolean, data: ImportTokenForm) => {
    if (checked) {
      // 체크한 토큰을 tokens(swr)데이터에서 찾기
      const checkedToken = tokens.data.find((item) => item.address.toLowerCase() === data.address.toLowerCase());
      // 체크한 토큰을 add하기 위해 부가 정보를 찾아 searchToken에 담기
      const searchedToken = checkedToken
        ? {
            address: checkedToken.address,
            displayDenom: checkedToken.displayDenom,
            decimals: checkedToken.decimals,
            imageURL: checkedToken.imageURL,
            coinGeckoId: checkedToken.coinGeckoId,
          }
        : data;
      // 월렛에서 가져올 함수를 사용해 searchToken 보내기 (async가 진행하는 함수가 완료될 때까지 기다렸다가 await가 실행되는 원리)
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
              // filteredTokens 배열 요소 전체를 대상으로 token이라는 콜백 함수를 호출, 호출 결과를 배열로 반환
              // (token 요소(타입), index 숫자형)
              <TokenItem
                key={token.address}
                name={token.name}
                symbol={token.displayDenom}
                imageURL={token.imageURL}
                //
                onClick={() => {
                  // 온클릭에서 담아야 할 것 1.useState()에 업데이트 할 함수(isActive), 2. handelCheck를 호출할 함수(submit 용도)
                  setCheck(index);
                  // useState()에 업데이트 할 함수 인자로는 인덱스를 담는다. => 왜? 이게 필요한가?
                  void handelCheck(true, token);
                  // 온클릭 시, true가 되며 token 배열 자체를 반환해야 함
                }}
                isActive={index === check}
                // TokenItem의 인덱스 === filteredList가 가진 인덱스(이것이 check가 아닌 것 같은데 어떻게 접근하는건지 잘 모르겠음)
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
          disabled={!handelCheck}
        >
          {t('pages.Chain.Ethereum.Token.Add.Search.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}
