import { useEffect, useMemo, useState } from 'react';
import * as bip39 from 'bip39';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Icon, Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/IconButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import HDPathDialog from '~/Popup/pages/Account/components/HDPathDialog';
import { newAccountState } from '~/Popup/recoils/newAccount';

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
  const { navigate } = useNavigate();
  const [bits, setBits] = useState<MnemonicBits>(mnemonicBits[12]);
  const [isOpenHDPathDialog, setIsOpenHDPathDialog] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [newAccount, setNewAccount] = useRecoilState(newAccountState);

  const mnemonic = useMemo(() => bip39.generateMnemonic(bits), [bits]);
  const splitedMnemonic = mnemonic.split(' ');

  return (
    <Container>
      <WarningDescription>This phrase is the only way to recover your account. Do not share with anyone.</WarningDescription>
      <MnemonicTitleContainer>
        <MnemonicTitleLeftContainer>
          <Typography variant="h4">Seed Phrase</Typography>
        </MnemonicTitleLeftContainer>
        <MnemonicTitleRightContainer>
          <MnemonicButton isActvie={bits === mnemonicBits[12]} onClick={() => setBits(128)}>
            12 words
          </MnemonicButton>
          <MnemonicButton isActvie={bits === mnemonicBits[24]} onClick={() => setBits(256)}>
            24 words
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
              enqueueSnackbar(`copied!`);
            }
          }}
        >
          Copy
        </IconButton>
      </CopyButtonContainer>

      <BottomContainer>
        <BottomSettingButtonContainer>
          <IconButton Icon={Setting16Icon} onClick={() => setIsOpenHDPathDialog(true)}>
            HD path setting
          </IconButton>
        </BottomSettingButtonContainer>
        <Button onClick={() => setNewAccount((prev) => ({ ...prev, mnemonic }))}>Next</Button>
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
