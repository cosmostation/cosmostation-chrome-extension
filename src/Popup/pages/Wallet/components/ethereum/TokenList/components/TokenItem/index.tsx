import { useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useTokenBalance } from '~/Popup/hooks/SWR/ethereum/useTokenBalance';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { EthereumToken } from '~/types/chain';

import {
  DeleteButton,
  LeftContainer,
  LeftImageContainer,
  LeftTextChainContainer,
  LeftTextContainer,
  LeftTextErrorContainer,
  RightButtonContainer,
  RightContainer,
  RightTextChangeRateContainer,
  RightTextContainer,
  RightTextValueContainer,
  StyledAbsoluteLoading,
  StyledButton,
  StyledIconButton,
} from './styled';

import Close16Icon from '~/images/icons/Close16.svg';
import RetryIcon from '~/images/icons/Retry.svg';

type TokenItemProps = {
  token: EthereumToken;
  onClick?: () => void;
  onClickDelete?: () => void;
  disabled?: boolean;
};

export default function TokenItem({ token, disabled, onClick, onClickDelete }: TokenItemProps) {
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const tokenBalance = useTokenBalance(token, { suspense: true });

  const { currency } = chromeStorage;
  const amount = tokenBalance.data || '0';
  const price = (token.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[currency]) || 0;
  const displayAmount = toDisplayDenomAmount(amount, token.decimals);

  const value = times(displayAmount, price);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {displayAmount}
            </Number>
          </RightTextValueContainer>
          <RightTextChangeRateContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={currency}>
              {value}
            </Number>
          </RightTextChangeRateContainer>
        </RightTextContainer>
        <DeleteButton id="deleteButton" onClick={onClickDelete}>
          <Close16Icon />
        </DeleteButton>
      </RightContainer>
    </StyledButton>
  );
}

type TokenItemSkeletonProps = Pick<TokenItemProps, 'token'>;

export function TokenItemSkeleton({ token }: TokenItemSkeletonProps) {
  return (
    <StyledButton disabled>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Skeleton width={40} variant="text" />
          </RightTextValueContainer>
          <RightTextChangeRateContainer>
            <Skeleton width={40} variant="text" />
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}

type TokenItemErrorProps = Pick<TokenItemProps, 'token'> & FallbackProps;

export function TokenItemError({ token, resetErrorBoundary }: TokenItemErrorProps) {
  useTokenBalance(token);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  return (
    <StyledButton disabled>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
          <LeftTextErrorContainer>
            <Typography variant="h6">{t('pages.Wallet.components.ethereum.TokenList.components.TokenItem.index.networkError')}</Typography>
          </LeftTextErrorContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightButtonContainer>
        <StyledIconButton
          onClick={() => {
            setIsLoading(true);

            setTimeout(() => {
              resetErrorBoundary();
              setIsLoading(false);
            }, 500);
          }}
        >
          <RetryIcon />
        </StyledIconButton>
      </RightButtonContainer>
      {isLoading && <StyledAbsoluteLoading size="2rem" />}
    </StyledButton>
  );
}
