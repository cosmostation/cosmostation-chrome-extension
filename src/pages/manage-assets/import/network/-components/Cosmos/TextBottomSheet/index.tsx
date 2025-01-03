import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type TextBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  optionValues: string[];
  bottomSheetTitle: string;
  currentOptionValue?: string;
  onClickOption?: (val: string) => void;
};

export default function TextBottomSheet({ optionValues, currentOptionValue, bottomSheetTitle, onClickOption, onClose, ...remainder }: TextBottomSheetProps) {
  const onHandleClick = (val: string) => {
    onClickOption?.(val);
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{bottomSheetTitle}</Typography>
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
          {optionValues.map((item) => (
            <BaseOptionButton
              key={item}
              onClick={() => {
                onHandleClick(item);
              }}
              isActive={currentOptionValue === item}
              leftSecondHeader={<Base1300Text variant="b2_M">{item}</Base1300Text>}
              disableRightChevron
            />
          ))}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
