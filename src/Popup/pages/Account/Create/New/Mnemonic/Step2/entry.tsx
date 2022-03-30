import { useEffect, useMemo, useState } from 'react';
import * as bip39 from 'bip39';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { useRecoilState } from 'recoil';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/IconButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import HDPathDialog from '~/Popup/pages/Account/components/HDPathDialog';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';

import MnemonicButton from './components/Button';
import {
  BottomContainer,
  BottomSettingButtonContainer,
  Container,
  CopyButtonContainer,
  MnemonicContainer,
  MnemonicTitleContainer,
  MnemonicTitleLeftContainer,
  MnemonicTitleRightContainer,
  MnemonicWordContainer,
  MnemonicWordNumberContainer,
  MnemonicWordTextContainer,
} from './styled';
import WarningDescription from '../components/WarningDescription';

import Copy16Icon from '~/images/icons/Copy16.svg';
import Setting16Icon from '~/images/icons/Setting16.svg';

const mnemonicBits = {
  12: 128,
  24: 256,
} as const;

type MnemonicBits = ValueOf<typeof mnemonicBits>;

export default function Entry() {
  const { navigateBack, navigate } = useNavigate();
  const [bits, setBits] = useState<MnemonicBits>(mnemonicBits[12]);
  const [isOpenHDPathDialog, setIsOpenHDPathDialog] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [newAccount, setNewAccount] = useRecoilState(newMnemonicAccountState);

  const { t } = useTranslation();

  const mnemonic = useMemo(() => bip39.generateMnemonic(bits), [bits]);
  const splitedMnemonic = mnemonic.split(' ');

  useEffect(() => {
    if (!newAccount.accountName) {
      navigateBack(-2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNewAccount((prev) => ({ ...prev, mnemonic }));
  }, [mnemonic, setNewAccount]);

  return (
    <Container>
      <WarningDescription>{t('pages.Account.Create.New.Mnemonic.Step2.entry.description')}</WarningDescription>
      <MnemonicTitleContainer>
        <MnemonicTitleLeftContainer>
          <Typography variant="h4">{t('pages.Account.Create.New.Mnemonic.Step2.entry.seedPhrase')}</Typography>
        </MnemonicTitleLeftContainer>
        <MnemonicTitleRightContainer>
          <MnemonicButton isActvie={bits === mnemonicBits[12]} onClick={() => setBits(128)}>
            {t('pages.Account.Create.New.Mnemonic.Step2.entry.12Words')}
          </MnemonicButton>
          <MnemonicButton isActvie={bits === mnemonicBits[24]} onClick={() => setBits(256)}>
            {t('pages.Account.Create.New.Mnemonic.Step2.entry.24Words')}
          </MnemonicButton>
        </MnemonicTitleRightContainer>
      </MnemonicTitleContainer>
      <MnemonicContainer>
        {splitedMnemonic.map((word, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <MnemonicWordContainer key={index}>
            <MnemonicWordNumberContainer>
              <Typography variant="h5">{index + 1}</Typography>
            </MnemonicWordNumberContainer>
            <MnemonicWordTextContainer>
              <Typography variant="h5">{word}</Typography>
            </MnemonicWordTextContainer>
          </MnemonicWordContainer>
        ))}
      </MnemonicContainer>

      <CopyButtonContainer>
        <IconButton
          Icon={Copy16Icon}
          onClick={() => {
            if (copy(mnemonic)) {
              enqueueSnackbar(t('pages.Account.Create.New.Mnemonic.Step2.entry.copied'));
            }
          }}
        >
          {t('pages.Account.Create.New.Mnemonic.Step2.entry.copy')}
        </IconButton>
      </CopyButtonContainer>

      <BottomContainer>
        <BottomSettingButtonContainer>
          <IconButton Icon={Setting16Icon} onClick={() => setIsOpenHDPathDialog(true)}>
            {t('pages.Account.Create.New.Mnemonic.Step2.entry.hdPathSetting')}
          </IconButton>
        </BottomSettingButtonContainer>
        <Button
          onClick={() => {
            navigate('/account/create/new/mnemonic/step3');
          }}
        >
          {t('pages.Account.Create.New.Mnemonic.Step2.entry.next')}
        </Button>
      </BottomContainer>
      <HDPathDialog
        open={isOpenHDPathDialog}
        currentAddressIndex={Number(newAccount.addressIndex)}
        onSubmitHdPath={(data) => setNewAccount((prev) => ({ ...prev, addressIndex: `${data.addressIndex}` }))}
        onClose={() => setIsOpenHDPathDialog(false)}
      />
    </Container>
  );
}
