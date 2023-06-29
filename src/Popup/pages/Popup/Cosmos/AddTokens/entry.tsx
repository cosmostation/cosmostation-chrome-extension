import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useTokensSWR } from '~/Popup/hooks/SWR/cosmos/useTokensSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { CosmosChain, CosmosToken } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosAddTokensCW20Internal, CosAddTokensCW20Response } from '~/types/message/cosmos';

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
  queue: Queue<CosAddTokensCW20Internal>;
  chain: CosmosChain;
};

export default function Entry({ queue, chain }: EntryProps) {
  const { deQueue } = useCurrentQueue();

  const { addCosmosTokens } = useCurrentCosmosTokens(chain);

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const officialTokens = useTokensSWR(chain);

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const { params } = message;

  const tokens: CosmosToken[] = useMemo(
    () =>
      params.tokens.map((param) => {
        const token = officialTokens.data?.find((item) => item.address.toLowerCase() === param.address.toLowerCase());

        if (token) {
          return {
            ...param,
            coinGeckoId: token?.coinGeckoId,
            imageURL: token?.image,
          };
        }

        return param;
      }),
    [officialTokens.data, params],
  );

  return (
    <Container>
      <PopupHeader chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} account={currentAccount} />
      <ContentContainer>
        <SwitchIconContainer>
          <Token60Icon />
        </SwitchIconContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Cosmos.AddTokens.entry.addTokens')}</Typography>
        </TitleContainer>
        <DescriptionContainer>
          <Typography variant="h5">{t('pages.Popup.Cosmos.AddTokens.entry.question')}</Typography>
        </DescriptionContainer>
        <StyledDivider />
        <TokenInfoContainer>
          {tokens.map((token, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <TokenItem token={token} chain={chain} address={address} key={`${token.address}${idx}`} />
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
            {t('pages.Popup.Cosmos.AddTokens.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              await addCosmosTokens(tokens);

              const result: CosAddTokensCW20Response = null;

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
            {t('pages.Popup.Cosmos.AddTokens.entry.addButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
