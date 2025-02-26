import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';
import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';
import BaseOptionButton from '../common/BaseOptionButton';

import Close24Icon from 'assets/images/icons/Close24.svg';

type EthermintSendBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  bech32AddressPrefix?: string;
  onSelectOption?: (val: 'cosmos' | 'evm') => void;
};

export default function EthermintSendBottomSheet({ bech32AddressPrefix, onClose, onSelectOption, ...remainder }: EthermintSendBottomSheetProps) {
  const { t } = useTranslation();

  const options = ['evm', 'cosmos'] as const;

  const titleTextMap = {
    cosmos: t('components.EthermintSendBottomSheet.index.cosmosTitle'),
    evm: t('components.EthermintSendBottomSheet.index.evmTitle'),
  };

  const subtitleTextMap = {
    cosmos: t('components.EthermintSendBottomSheet.index.cosmosSubtitle', {
      bech32Prefix: bech32AddressPrefix,
    }),
    evm: t('components.EthermintSendBottomSheet.index.evmSubtitle'),
  };

  const onHandleClick = (val: 'cosmos' | 'evm') => {
    onSelectOption?.(val);
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
            <Typography variant="h2_B">{t('components.EthermintSendBottomSheet.index.title')}</Typography>
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
          {options.map((item) => (
            <BaseOptionButton
              key={item}
              onClick={() => {
                onHandleClick(item);
              }}
              leftSecondHeader={<Base1300Text variant="b2_M">{titleTextMap[item]}</Base1300Text>}
              leftSecondBody={<Base1000Text variant="b4_R">{subtitleTextMap[item]}</Base1000Text>}
              disableRightChevron
            />
          ))}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
