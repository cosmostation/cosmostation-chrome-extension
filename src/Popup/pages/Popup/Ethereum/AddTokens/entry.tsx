import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type { EthcAddTokens, EthcAddTokensParams, EthcAddTokensResponse } from '~/types/message/ethereum';

import TokenItem from './components/TokenItem';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  DescriptionContainer,
  StyledDivider,
  SwitchIconContainer,
  TitleContainer,
  TokenInfoContainer,
} from './styled';

import Token60Icon from '~/images/icons/Token60.svg';

type EntryProps = {
  queue: Queue<EthcAddTokens>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();
  const { addEthereumTokens } = useCurrentEthereumTokens();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const officialTokens = useTokensSWR();

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const { params } = message;

  const tokens: EthcAddTokensParams = useMemo(
    () =>
      params.map((param) => {
        const token = officialTokens.data?.find((item) => item.address.toLowerCase() === param.address.toLowerCase());

        if (token) {
          return {
            ...param,
            address: token.address,
            displayDenom: token.displayDenom,
            decimals: token.decimals,
            imageURL: token.imageURL,
            coinGeckoId: token.coinGeckoId,
          };
        }

        return param;
      }),
    [officialTokens.data, params],
  );

  return (
    <Container>
      <Header network={currentEthereumNetwork} origin={origin} />
      <ContentContainer>
        <SwitchIconContainer>
          <Token60Icon />
        </SwitchIconContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Ethereum.AddTokens.entry.addTokens')}</Typography>
        </TitleContainer>
        <DescriptionContainer>
          <Typography variant="h5">{t('pages.Popup.Ethereum.AddTokens.entry.question')}</Typography>
        </DescriptionContainer>
        <StyledDivider />
        <TokenInfoContainer>
          {tokens.map((token, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <TokenItem token={token} key={`${token.address}${idx}`} />
          ))}
        </TokenInfoContainer>
      </ContentContainer>
      <BottomContainer>
        <BottomButtonContainer>
          <OutlineButton
            onClick={async () => {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.USER_REJECTED_REQUEST,
                    message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                  },
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            {t('pages.Popup.Ethereum.AddTokens.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              await addEthereumTokens(tokens);

              const result: EthcAddTokensResponse = null;

              responseToWeb({
                response: {
                  result,
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            {t('pages.Popup.Ethereum.AddTokens.entry.addButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
