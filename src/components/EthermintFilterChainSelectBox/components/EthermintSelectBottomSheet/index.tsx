import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type EthermintSelectBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  bech32AddressPrefix?: string;
  onSelectOption?: (val: 'cosmos' | 'evm') => void;
};

export default function EthermintSelectBottomSheet({ bech32AddressPrefix, onClose, onSelectOption, ...remainder }: EthermintSelectBottomSheetProps) {
  const { t } = useTranslation();

  const options = ['evm', 'cosmos'] as const;

  const titleTextMap = {
    evm: t('pages.general-setting.address-book.add-address.components.EthermintSelectBottomSheet.index.evmTitle'),
    cosmos: t('pages.general-setting.address-book.add-address.components.EthermintSelectBottomSheet.index.cosmosTitle'),
  };

  const subtitleTextMap = {
    evm: t('pages.general-setting.address-book.add-address.components.EthermintSelectBottomSheet.index.evmSubtitle'),
    cosmos: t('pages.general-setting.address-book.add-address.components.EthermintSelectBottomSheet.index.cosmosSubtitle', {
      bech32Prefix: bech32AddressPrefix,
    }),
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
            <Typography variant="h2_B">{t('pages.general-setting.address-book.add-address.components.EthermintSelectBottomSheet.index.title')}</Typography>
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
