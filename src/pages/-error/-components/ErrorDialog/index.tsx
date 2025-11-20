import { useTranslation } from 'react-i18next';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';
import { useLocation } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import CopyButton from '@/components/CopyButton';
import { errorStringify } from '@/utils/string';

import { Body, Container, ContentsContainer, Header, HeaderTitle, InfoRow, JsonContainer, Label, StyledButton, StyledDialog } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type ErrorDialogProps = Omit<DialogProps, 'children'> & {
  error: Error;
  title?: string;
};

export default function ErrorDialog({ error, title, onClose, ...remainder }: ErrorDialogProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const errorString = errorStringify(error, location.pathname);

  return (
    <StyledDialog {...remainder} onClose={onClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{title || t('components.JsonPopover.title')}</Typography>
            <CopyButton
              varient="dark"
              iconSize={{
                width: 1.6,
                height: 1.6,
              }}
              copyString={errorString}
            />
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <ContentsContainer>
            {error.name && (
              <InfoRow>
                <Label>
                  <Base1300Text variant="b2_B">{'Type'}</Base1300Text>
                </Label>
                <JsonContainer>
                  <Base1000Text variant="b3_M_Multiline">{error.name}</Base1000Text>
                </JsonContainer>
              </InfoRow>
            )}
            {error.message && (
              <InfoRow>
                <Label>
                  <Base1300Text variant="b2_B">{'Message'}</Base1300Text>
                </Label>
                <JsonContainer>
                  <Base1000Text variant="b3_M_Multiline">{error.message}</Base1000Text>
                </JsonContainer>
              </InfoRow>
            )}
            {location.pathname && (
              <InfoRow>
                <Label>
                  <Base1300Text variant="b2_B">{'Location'}</Base1300Text>
                </Label>
                <JsonContainer>
                  <Base1000Text variant="b3_M_Multiline">{location.pathname}</Base1000Text>
                </JsonContainer>
              </InfoRow>
            )}
            {error.stack && (
              <InfoRow>
                <Label>
                  <Base1300Text variant="b2_B">{'Stack'}</Base1300Text>
                </Label>
                <JsonContainer>
                  <Base1000Text variant="b3_M_Multiline">{error.stack}</Base1000Text>
                </JsonContainer>
              </InfoRow>
            )}
          </ContentsContainer>
        </Body>
      </Container>
    </StyledDialog>
  );
}
