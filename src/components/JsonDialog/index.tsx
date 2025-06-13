import { useTranslation } from 'react-i18next';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import { Body, Container, ContentsContainer, Header, HeaderTitle, JsonContainer, StyledButton, StyledDialog } from './styled';
import Base1000Text from '../common/Base1000Text';
import CopyButton from '../CopyButton';

import Close24Icon from 'assets/images/icons/Close24.svg';

type JsonDialogProps = Omit<DialogProps, 'children'> & {
  jsonString: string;
  title?: string;
};

export default function JsonDialog({ jsonString, title, onClose, ...remainder }: JsonDialogProps) {
  const { t } = useTranslation();

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
              copyString={jsonString}
            />
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'backdropClick');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <ContentsContainer>
            <JsonContainer>
              <Base1000Text variant="b3_M_Multiline">{jsonString}</Base1000Text>
            </JsonContainer>
          </ContentsContainer>
        </Body>
      </Container>
    </StyledDialog>
  );
}
