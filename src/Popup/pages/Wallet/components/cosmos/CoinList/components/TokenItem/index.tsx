import { useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { CosmosChain, CosmosToken } from '~/types/chain';

import {
  DeleteButton,
  LeftContainer,
  LeftImageContainer,
  LeftTextChainContainer,
  LeftTextContainer,
  LeftTextErrorContainer,
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
  chain: CosmosChain;
  token: CosmosToken;
  address: string;
  isDefault: boolean;
  onClick?: () => void;
  onClickDelete?: () => void;
};

export default function TokenItem({ chain, token, address, isDefault, onClick, onClickDelete }: TokenItemProps) {
  const { extensionStorage } = useExtensionStorage();

  const { currency } = extensionStorage;

  const { decimals, displayDenom, imageURL, coinGeckoId } = token;
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const cw20Balance = useTokenBalanceSWR(chain, token.address, address, { suspense: true });

  const amount = cw20Balance.data?.balance || '0';

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const price = (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[extensionStorage.currency]) || 0;
  const value = times(displayAmount, price);

  return (
    <StyledButton onClick={onClick} disabled={amount === '0'}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{displayDenom}</Typography>
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
        {!isDefault && (
          <DeleteButton
            id="deleteButton"
            onClick={(e) => {
              e.stopPropagation();
              onClickDelete?.();
            }}
          >
            <Close16Icon />
          </DeleteButton>
        )}
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

type TokenItemErrorProps = Pick<TokenItemProps, 'token' | 'chain' | 'address' | 'onClickDelete'> & FallbackProps;

export function TokenItemError({ token, chain, address, onClickDelete, resetErrorBoundary }: TokenItemErrorProps) {
  useTokenBalanceSWR(chain, token.address, address);
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
            <Typography variant="h6">{t('pages.Wallet.components.cosmos.CoinList.components.TokenItem.index.networkError')}</Typography>
          </LeftTextErrorContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
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
        </RightTextContainer>
        <DeleteButton
          id="deleteButton"
          onClick={(e) => {
            e.stopPropagation();
            onClickDelete?.();
          }}
        >
          <Close16Icon />
        </DeleteButton>
      </RightContainer>

      {isLoading && <StyledAbsoluteLoading size="2rem" />}
    </StyledButton>
  );
}
