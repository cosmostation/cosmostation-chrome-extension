import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { TOKEN_TYPE } from '~/constants/cosmos';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { CosmosChain } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosAddNFTsCW721, CosAddNFTsCW721Response } from '~/types/message/cosmos';

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
  queue: Queue<CosAddNFTsCW721>;
  chain: CosmosChain;
};

// NOTE 브랜치 머지되면 그것의 코드를 사용할 것
export type CosmosNFT = {
  id: string;
  tokenId: string;
  baseChainUUID: string;
  // NOTE 721
  tokenType: typeof TOKEN_TYPE.CW20;
  ownerAddress: string;
  address: string;
};
export default function Entry({ queue, chain }: EntryProps) {
  const { deQueue } = useCurrentQueue();

  // NOTE useCurrentCosmosNFTs()로 교체
  // const { addCosmosTokens } = useCurrentCosmosTokens(chain);

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const { params } = message;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const nfts = useMemo(
    () =>
      params.nfts.map((param) => ({
        tokenId: param.tokenId,
        tokenType: TOKEN_TYPE.CW20,
        ownerAddress: address,
        address: param.contractAddress,
      })),
    [address, params.nfts],
  );

  return (
    <Container>
      <PopupHeader chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} account={currentAccount} />
      <ContentContainer>
        <SwitchIconContainer>
          <Token60Icon />
        </SwitchIconContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Cosmos.AddNFTs.entry.addTokens')}</Typography>
        </TitleContainer>
        <DescriptionContainer>
          <Typography variant="h5">{t('pages.Popup.Cosmos.AddNFTs.entry.question')}</Typography>
        </DescriptionContainer>
        <StyledDivider />
        <TokenInfoContainer>
          {/* {tokens.map((token, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <TokenItem token={token} chain={chain} address={address} key={`${token.address}${idx}`} />
          ))} */}
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
            {t('pages.Popup.Cosmos.AddNFTs.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              // await addCosmosTokens(nfts);

              const result: CosAddNFTsCW721Response = null;

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
            {t('pages.Popup.Cosmos.AddNFTs.entry.addButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
