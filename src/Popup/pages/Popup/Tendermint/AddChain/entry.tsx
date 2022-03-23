import { v4 as uuidv4 } from 'uuid';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { responseToWeb } from '~/Popup/utils/message';
import type { TendermintChain } from '~/types/chain';

import {
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

export default function Entry() {
  const { currentQueue, deQueue } = useCurrentQueue();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { additionalChains } = chromeStorage;

  if (currentQueue?.message.method === 'ten_addChain') {
    const { message } = currentQueue;
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
          <Typography variant="h4">
            코스모스테이션에
            <br />
            블록체인 {message.params.chainName} 을(를) 추가합니다.
          </Typography>
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
                  message: currentQueue.message,
                  messageId: currentQueue.messageId,
                  origin: currentQueue.origin,
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

                const filteredAdditionalChains = additionalChains.filter((item) => item.chainName !== params.chainName);

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

                responseToWeb({
                  response: {
                    result: true,
                  },
                  message: currentQueue.message,
                  messageId: currentQueue.messageId,
                  origin: currentQueue.origin,
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

  return null;
}
