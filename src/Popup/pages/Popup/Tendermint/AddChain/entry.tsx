import { v4 as uuidv4 } from 'uuid';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';
import type { TendermintChain } from '~/types/chain';
import type { Queue } from '~/types/chromeStorage';
import type { TenAddChain, TenAddChainResponse } from '~/types/tendermint/message';

import {
  AccentSpan,
  BottomButtonContainer,
  BottomContainer,
  Container,
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
  queue: Queue<TenAddChain>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { additionalChains } = chromeStorage;

  const { t, language } = useTranslation();

  const { message, messageId, origin } = queue;
  return (
    <Container>
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
            {origin} {t('pages.Popup.Tendermint.AddChain.entry.description1')}
            <br />
            {t('pages.Popup.Tendermint.AddChain.entry.description2')}
            <br />
            {t('pages.Popup.Tendermint.AddChain.entry.description3')} <AccentSpan>{message.params.chainName}</AccentSpan>{' '}
            {t('pages.Popup.Tendermint.AddChain.entry.description4')}
          </Typography>
        ) : (
          <Typography variant="h4">
            {origin} {t('pages.Popup.Tendermint.AddChain.entry.description1')}
            <br />
            {t('pages.Popup.Tendermint.AddChain.entry.description2')} <AccentSpan>{message.params.chainName}</AccentSpan>
            <br />
            {t('pages.Popup.Tendermint.AddChain.entry.description3')}
          </Typography>
        )}
      </DescriptionContainer>

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

              const { addressPrefix, baseDenom, chainId, chainName, displayDenom, restURL, coinGeckoId, coinType, decimals, gasRate, imageURL, sendGas } =
                params;

              const filteredAdditionalChains = additionalChains.filter((item) => item.chainName.toLowerCase() !== chainName.toLowerCase());

              const newChain: TendermintChain = {
                id: uuidv4(),
                line: 'TENDERMINT',
                type: '',
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
                  coinType: coinType ? `${coinType}'` : "118'",
                },
                decimals: decimals ?? 6,
                gasRate: gasRate ?? { average: '0.025', low: '0.0025', tiny: '0.00025' },
                imageURL,
                gas: { send: sendGas ?? '100000' },
              };

              await setChromeStorage('additionalChains', [...filteredAdditionalChains, newChain]);

              const result: TenAddChainResponse = true;

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
