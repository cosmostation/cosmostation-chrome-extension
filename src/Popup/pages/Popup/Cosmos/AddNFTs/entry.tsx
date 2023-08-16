import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { TOKEN_TYPE } from '~/constants/cosmos';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import Tooltip from '~/Popup/components/common/Tooltip';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useOwnedNFTsTokenIDsSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useOwnedNFTsTokenIDsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { CosmosChain } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosAddNFTsCW721, CosAddNFTsCW721Response } from '~/types/message/cosmos';

import NFTItem from './components/NFTItem';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  DescriptionContainer,
  NFTInfoContainer,
  StyledDivider,
  SwitchIconContainer,
  TitleContainer,
} from './styled';

import Token60Icon from '~/images/icons/Token60.svg';

type EntryProps = {
  queue: Queue<CosAddNFTsCW721>;
  chain: CosmosChain;
};

export default function Entry({ queue, chain }: EntryProps) {
  const { deQueue } = useCurrentQueue();

  const { addCosmosNFTs } = useCurrentCosmosNFTs();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const { params } = message;

  const nfts = useMemo(
    () =>
      params.nfts.map((param) => ({
        tokenId: param.tokenId,
        tokenType: TOKEN_TYPE.CW721,
        ownerAddress: address,
        address: param.contractAddress,
      })),
    [address, params.nfts],
  );

  const ownedTokenIds = useOwnedNFTsTokenIDsSWR({ chain, contractAddresses: nfts.map((item) => item.address), ownerAddress: address });

  const errorMessage = useMemo(() => {
    if (ownedTokenIds.error) {
      return t('pages.Popup.Cosmos.AddNFTs.entry.networkError');
    }
    if (!ownedTokenIds.data.find((item) => item.tokens.includes(nfts.find((nft) => nft.address === item.contractAddress)?.tokenId || ''))) {
      return t('pages.Popup.Cosmos.AddNFTs.entry.notOwned');
    }
    return '';
  }, [nfts, ownedTokenIds.data, ownedTokenIds.error, t]);

  return (
    <Container>
      <PopupHeader chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} account={currentAccount} />
      <ContentContainer>
        <SwitchIconContainer>
          <Token60Icon />
        </SwitchIconContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Cosmos.AddNFTs.entry.addNFTs')}</Typography>
        </TitleContainer>
        <DescriptionContainer>
          <Typography variant="h5">{t('pages.Popup.Cosmos.AddNFTs.entry.question')}</Typography>
        </DescriptionContainer>
        <StyledDivider />
        <NFTInfoContainer>
          {nfts.map((token, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <NFTItem key={`${token.address}${idx}`} chain={chain} contractAddress={token.address} tokenId={token.tokenId} />
          ))}
        </NFTInfoContainer>
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
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                disabled={!!errorMessage}
                onClick={async () => {
                  await addCosmosNFTs(nfts);

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
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
