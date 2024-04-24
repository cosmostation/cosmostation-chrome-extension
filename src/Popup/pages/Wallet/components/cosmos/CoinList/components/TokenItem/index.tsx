import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { CosmosChain, CosmosToken } from '~/types/chain';

import {
  Container,
  DeleteButton,
  LeftContainer,
  LeftImageContainer,
  LeftTextChainAmountContainer,
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
  TextChangeRateContainer,
} from './styled';

import Close16Icon from '~/images/icons/Close16.svg';
import RetryIcon from '~/images/icons/Retry.svg';

type TokenItemProps = {
  chain: CosmosChain;
  token: CosmosToken;
  address: string;
  onClick?: () => void;
  onClickDelete?: () => void;
};

export default function TokenItem({ chain, token, address, onClick, onClickDelete }: TokenItemProps) {
  const { t } = useTranslation();
  const { extensionStorage } = useExtensionStorage();

  const { currency } = extensionStorage;

  const { decimals, displayDenom, imageURL, coinGeckoId } = token;
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const cw20Balance = useTokenBalanceSWR(chain, token.address, address, { suspense: true });

  const amount = useMemo(() => cw20Balance.data?.balance || '0', [cw20Balance.data?.balance]);

  const displayAmount = useMemo(() => toDisplayDenomAmount(amount, decimals), [amount, decimals]);

  const price = useMemo(
    () => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[extensionStorage.currency]) || 0,
    [coinGeckoId, coinGeckoPrice.data, extensionStorage.currency],
  );

  const cap = useMemo(
    () => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [coinGeckoId, coinGeckoPrice.data, extensionStorage.currency],
  );

  const value = useMemo(() => times(displayAmount, price), [displayAmount, price]);

  const isAmountZero = useMemo(() => amount === '0', [amount]);

  return (
    <StyledButton onClick={isAmountZero ? undefined : onClick} data-is-disabled={isAmountZero}>
      <Tooltip
        title={isAmountZero ? t('pages.Wallet.components.cosmos.CoinList.components.TokenItem.index.invalidBalance') : ''}
        varient="error"
        placement="top"
        arrow
      >
        <Container>
          <LeftContainer>
            <LeftImageContainer>
              <Image src={imageURL} />
            </LeftImageContainer>
            <LeftTextContainer>
              <LeftTextChainContainer>
                <Typography variant="h5">{displayDenom}</Typography>
              </LeftTextChainContainer>
              <LeftTextChainAmountContainer>
                <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={extensionStorage.currency}>
                  {String(price)}
                </Number>

                <TextChangeRateContainer data-color={cap > 0 ? 'green' : cap < 0 ? 'red' : 'grey'}>
                  <Typography variant="h6n">{cap > 0 ? '+' : ''}</Typography>
                  <Number typoOfIntegers="h6n" typoOfDecimals="h8n" fixed={2}>
                    {String(cap)}
                  </Number>
                  <Typography variant="h8n">%</Typography>
                </TextChangeRateContainer>
              </LeftTextChainAmountContainer>
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
            {!token.default && (
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
        </Container>
      </Tooltip>
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
