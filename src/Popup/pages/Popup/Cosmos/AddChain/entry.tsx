import { v4 as uuidv4 } from 'uuid';
import { Typography } from '@mui/material';

import { COSMOS_DEFAULT_SEND_GAS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';
import type { CosmosChain } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosAddChain, CosAddChainResponse } from '~/types/message/cosmos';

import {
  AccentSpan,
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentsContainer,
  DescriptionContainer,
  LogoContainer,
  StyledDivider,
  TitleContainer,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  queue: Queue<CosAddChain>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { additionalChains } = extensionStorage;

  const { t, language } = useTranslation();

  const { message, messageId, origin } = queue;
  return (
    <Container>
      <PopupHeader origin={origin} />
      <ContentsContainer>
        <LogoContainer>
          <Image src={logoImg} />
        </LogoContainer>
        <TitleContainer>
          <Typography variant="h2">Chain add request</Typography>
        </TitleContainer>
        <StyledDivider />

        <DescriptionContainer>
          {language === 'ko' ? (
            <Typography variant="h4">
              {origin} {t('pages.Popup.Cosmos.AddChain.entry.description1')}
              <br />
              {t('pages.Popup.Cosmos.AddChain.entry.description2')}
              <br />
              {t('pages.Popup.Cosmos.AddChain.entry.description3')} <AccentSpan>{message.params.chainName}</AccentSpan>{' '}
              {t('pages.Popup.Cosmos.AddChain.entry.description4')}
            </Typography>
          ) : (
            <Typography variant="h4">
              {origin} {t('pages.Popup.Cosmos.AddChain.entry.description1')}
              <br />
              {t('pages.Popup.Cosmos.AddChain.entry.description2')} <AccentSpan>{message.params.chainName}</AccentSpan>
              <br />
              {t('pages.Popup.Cosmos.AddChain.entry.description3')}
            </Typography>
          )}
        </DescriptionContainer>
      </ContentsContainer>

      <BottomContainer>
        <WarningContainer>
          <WarningIconContainer>
            <Info16Icon />
          </WarningIconContainer>
          <WarningTextContainer>
            <Typography variant="h5">Experimental Feature for the brave-hearted cosmonauts.</Typography>
          </WarningTextContainer>
        </WarningContainer>
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
            Cancel
          </OutlineButton>
          <Button
            onClick={async () => {
              const { params } = message;

              const {
                addressPrefix,
                baseDenom,
                chainId,
                chainName,
                displayDenom,
                restURL,
                coinGeckoId,
                coinType,
                decimals,
                gasRate,
                tokenImageURL,
                imageURL,
                sendGas,
                type,
                cosmWasm,
              } = params;

              const filteredAdditionalChains = additionalChains.filter((item) => item.chainName.toLowerCase() !== chainName.toLowerCase());

              const newChain: CosmosChain = {
                id: uuidv4(),
                line: 'COSMOS',
                type: type || '',
                chainId,
                chainName,
                displayDenom,
                baseDenom,
                bech32Prefix: { address: addressPrefix },
                restURL,
                coinGeckoId,
                bip44: {
                  purpose: "44'",
                  account: "0'",
                  change: '0',
                  coinType: coinType ? (coinType.endsWith("'") ? coinType : `${coinType}'`) : "118'",
                },
                decimals: decimals ?? 6,
                gasRate: gasRate ?? { average: '0.025', low: '0.0025', tiny: '0.00025' },
                tokenImageURL: tokenImageURL || imageURL,
                imageURL: imageURL || tokenImageURL,
                gas: { send: sendGas ?? COSMOS_DEFAULT_SEND_GAS },
                cosmWasm,
              };

              await setExtensionStorage('additionalChains', [...filteredAdditionalChains, newChain]);

              const result: CosAddChainResponse = true;

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
            Confirm
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
