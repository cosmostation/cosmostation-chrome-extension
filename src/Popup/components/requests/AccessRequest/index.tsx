import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';

import {
  AccentNameContainer,
  BottomContainer,
  CheckContainer,
  CheckItemContainer,
  CheckListContainer,
  Container,
  ContentsContainer,
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
  const { currentQueue, deQueue } = useCurrentQueue();
  const { currentAccount, addAllowedOrigin, currentAccountAllowedOrigins, currentAccountSuiPermissions, addSuiPermissions } = useCurrentAccount();

  const { name } = currentAccount;

  const { t, language } = useTranslation();

  const currentAccountSuiPermissionTypes = currentAccountSuiPermissions
    .filter((permission) => permission.origin === currentQueue?.origin)
    .map((permission) => permission.permission);

  if (
    (!currentQueue?.channel && currentQueue?.origin && !currentAccountAllowedOrigins.includes(currentQueue.origin)) ||
    (!currentQueue?.channel &&
      currentQueue &&
      currentQueue.message.method === 'sui_connect' &&
      !currentQueue.message.params.every((permission) => currentAccountSuiPermissionTypes.includes(permission)))
  ) {
    return (
      <BaseLayout>
        <Container>
          <PopupHeader account={currentAccount} origin={currentQueue?.origin} />
          <ContentsContainer>
            <LogoContainer>
              <Image src={logoImg} />
            </LogoContainer>
            <TitleContainer>
              <Typography variant="h2">Access request</Typography>
            </TitleContainer>
            <DescriptionContainer>
              {language === 'ko' ? (
                <Typography variant="h4">
                  {currentQueue.origin} {t('components.requests.AccessRequest.index.upDescription1')}
                  <br />
                  <AccentNameContainer>{name}</AccentNameContainer>
                  {t('components.requests.AccessRequest.index.upDescription2')}
                </Typography>
              ) : (
                <Typography variant="h4">
                  {currentQueue.origin} {t('components.requests.AccessRequest.index.upDescription1')}
                  <br />
                  {t('components.requests.AccessRequest.index.upDescription2')}
                  <br />
                  <AccentNameContainer>{name}</AccentNameContainer>
                  {t('components.requests.AccessRequest.index.upDescription3')}
                </Typography>
              )}
            </DescriptionContainer>
            <StyledDivider />
            <Description2Container>
              <Typography variant="h5">{t('components.requests.AccessRequest.index.downDescription')}</Typography>
            </Description2Container>
            <CheckListContainer>
              {currentQueue.message.method === 'sui_connect' ? (
                <>
                  {currentQueue.message.params.includes('viewAccount') && (
                    <CheckItemContainer>
                      <CheckContainer>
                        <Check24Icon />
                      </CheckContainer>
                      <TextContainer>
                        <Typography variant="h5">{t('components.requests.AccessRequest.index.downItem1')}</Typography>
                      </TextContainer>
                    </CheckItemContainer>
                  )}
                  {currentQueue.message.params.includes('suggestTransactions') && (
                    <CheckItemContainer>
                      <CheckContainer>
                        <Check24Icon />
                      </CheckContainer>
                      <TextContainer>
                        <Typography variant="h5">{t('components.requests.AccessRequest.index.downItem2')}</Typography>
                      </TextContainer>
                    </CheckItemContainer>
                  )}
                </>
              ) : (
                <>
                  <CheckItemContainer>
                    <CheckContainer>
                      <Check24Icon />
                    </CheckContainer>
                    <TextContainer>
                      <Typography variant="h5">{t('components.requests.AccessRequest.index.downItem1')}</Typography>
                    </TextContainer>
                  </CheckItemContainer>
                  <CheckItemContainer>
                    <CheckContainer>
                      <Check24Icon />
                    </CheckContainer>
                    <TextContainer>
                      <Typography variant="h5">{t('components.requests.AccessRequest.index.downItem2')}</Typography>
                    </TextContainer>
                  </CheckItemContainer>
                  <CheckItemContainer>
                    <CheckContainer>
                      <Check24Icon />
                    </CheckContainer>
                    <TextContainer>
                      <Typography variant="h5">{t('components.requests.AccessRequest.index.downItem3')}</Typography>
                    </TextContainer>
                  </CheckItemContainer>
                </>
              )}
            </CheckListContainer>
          </ContentsContainer>
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

                if (currentQueue.message.method === 'sui_connect') {
                  await addSuiPermissions(currentQueue.message.params, currentQueue.origin);
                }
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
