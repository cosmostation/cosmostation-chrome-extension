import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import StandardInput from '@/components/common/StandardInput';
import { isNaturalNumberRegex } from '@/utils/regex';

import ChainPathInfo from './components/ChainPathInfo';
import {
  Body,
  ChainInfoContainer,
  ChainInfoTitle,
  ConfirmButton,
  Container,
  DescriptionText,
  Header,
  HeaderTitle,
  StyledBottomSheet,
  StyledButton,
} from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

// NOTE dummy data
const MajorChainPath = [
  {
    chainName: 'BITCOIN',
    chainImage: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    hdPath: 'm / 44’ / 0’ / 0’ / 0 / ${index}',
  },
  {
    chainName: 'BITCOIN',
    chainImage: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    hdPath: 'm / 44’ / 0’ / 0’ / 0 / ${index}',
  },
  {
    chainName: 'BITCOIN',
    chainImage: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    hdPath: 'm / 44’ / 0’ / 0’ / 0 / ${index}',
  },
];

type HdPathBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentHdPath: string;
  onChangeHpPath?: (val: string) => void;
};

export default function HdPathBottomSheet({ currentHdPath, onClose, onChangeHpPath, ...remainder }: HdPathBottomSheetProps) {
  const { t } = useTranslation();

  const [selectedHdPath, setSelectedHdPath] = useState(currentHdPath);

  // NOTE 니모닉 복원시에는 제한 없음, 하지만 다른 경우에는 9까지만 가능
  const errorMsg = (() => {
    if (!selectedHdPath) {
      return t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.emptyHdPath');
    }

    if (Number(selectedHdPath) > 10) {
      return t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.invalidHdPathIndex');
    }
  })();

  const onHandleChangeHpPath = (val: string) => {
    if (!val) {
      onChangeHpPath?.(currentHdPath);
    } else {
      onChangeHpPath?.(val);
    }
  };

  const onHandleClose = () => {
    if (!selectedHdPath) {
      setSelectedHdPath(currentHdPath);
    }
    onClose?.({}, 'backdropClick');
  };

  const confirm = () => {
    onHandleChangeHpPath(selectedHdPath);
    onHandleClose();
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onHandleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h3_B">{t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.header')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={onHandleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          {/* TODO 멀티라인 타이포로 변경 필요, 멀티라인 타이포 키 추가 필요 */}
          <DescriptionText variant="b3_R">{t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.description')}</DescriptionText>
          <StandardInput
            label={t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.lastHdPath')}
            onChange={(e) => {
              if (e.currentTarget.value && !isNaturalNumberRegex.test(e.currentTarget.value)) {
                return;
              }

              setSelectedHdPath(e.currentTarget.value);
            }}
            value={selectedHdPath}
            error={!!errorMsg}
            helperText={errorMsg}
          />

          <ChainInfoTitle variant="b3_M">{t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.majorChains')}</ChainInfoTitle>
          <ChainInfoContainer>
            {MajorChainPath.map((item) => (
              <ChainPathInfo key={item.chainName} {...item} currentHdPathIndex={selectedHdPath} />
            ))}
          </ChainInfoContainer>
          <ConfirmButton onClick={confirm} disabled={!selectedHdPath}>
            {t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.confirm')}
          </ConfirmButton>
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
