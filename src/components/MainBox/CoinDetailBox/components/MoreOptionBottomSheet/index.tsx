import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledOptionButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type MoreOptionBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  buttonProps: {
    icon: JSX.Element;
    title: string;
    subTitle?: string;
    onClick: () => void;
  }[];
};

export default function MoreOptionBottomSheet({ buttonProps, onClose, ...remainder }: MoreOptionBottomSheetProps) {
  const { t } = useTranslation();

  const onHandleClose = () => {
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onHandleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.header')}</Typography>
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
          {buttonProps.map((props) => {
            return (
              <StyledOptionButton
                key={props.title}
                onClick={props.onClick}
                leftContent={props.icon}
                leftSecondHeader={<Base1300Text variant="b2_M">{props.title}</Base1300Text>}
                leftSecondBody={props.subTitle ? <Base1000Text variant="b4_R">{props.subTitle}</Base1000Text> : undefined}
              />
            );
          })}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
