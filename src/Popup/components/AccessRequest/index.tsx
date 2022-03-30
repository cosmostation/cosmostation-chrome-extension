import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';

import {
  BottomContainer,
  CheckContainer,
  CheckItemContainer,
  CheckListContainer,
  Container,
  Description2Container,
  DescriptionContainer,
  LogoContainer,
  StyledDivider,
  TextContainer,
  TitleContainer,
} from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type AccessRequestProps = {
  children: JSX.Element;
};

export default function AccessRequest({ children }: AccessRequestProps) {
  const { chromeStorage } = useChromeStorage();
  const { currentQueue, deQueue } = useCurrentQueue();
  const { currentAccount, addAllowedOrigin } = useCurrentAccount();

  const { allowedOrigins } = currentAccount;

  const { t } = useTranslation();

  if (currentQueue?.channel !== 'In' && currentQueue?.origin && !allowedOrigins.includes(currentQueue?.origin)) {
    return (
      <BaseLayout>
        <Container>
          <LogoContainer>
            <Image src={logoImg} />
          </LogoContainer>
          <TitleContainer>
            <Typography variant="h2">Access request</Typography>
          </TitleContainer>
          <DescriptionContainer>
            <Typography variant="h4">
              {currentQueue.origin} {t('components.AccessRequest.index.upDescription1')}
              <br />
              {t('components.AccessRequest.index.upDescription2')}
            </Typography>
          </DescriptionContainer>
          <StyledDivider />
          <Description2Container>
            <Typography variant="h5">{t('components.AccessRequest.index.downDescription')}</Typography>
          </Description2Container>
          <CheckListContainer>
            <CheckItemContainer>
              <CheckContainer>
                <Check24Icon />
              </CheckContainer>
              <TextContainer>
                <Typography variant="h5">{t('components.AccessRequest.index.downItem1')}</Typography>
              </TextContainer>
            </CheckItemContainer>
            <CheckItemContainer>
              <CheckContainer>
                <Check24Icon />
              </CheckContainer>
              <TextContainer>
                <Typography variant="h5">{t('components.AccessRequest.index.downItem2')}</Typography>
              </TextContainer>
            </CheckItemContainer>
            <CheckItemContainer>
              <CheckContainer>
                <Check24Icon />
              </CheckContainer>
              <TextContainer>
                <Typography variant="h5">{t('components.AccessRequest.index.downItem3')}</Typography>
              </TextContainer>
            </CheckItemContainer>
          </CheckListContainer>
          <BottomContainer>
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
                await addAllowedOrigin(currentQueue.origin);
              }}
            >
              Confirm
            </Button>
          </BottomContainer>
        </Container>
      </BaseLayout>
    );
  }
  return children;
}
