import { useState } from 'react';
import * as bip39 from 'bip39';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import { BottomContainer, Container, MnemonicContainer, MnemonicWordContainer, MnemonicWordNumberContainer, MnemonicWordTextContainer } from './styled';
import WarningDescription from '../components/WarningDescription';

export default function Entry() {
  const { navigate } = useNavigate();
  const [bits, setBits] = useState<128 | 256>(128);

  const mnemonic = bip39.generateMnemonic(bits);

  const splitedMnemonic = mnemonic.split(' ');

  return (
    <form>
      <Container>
        <WarningDescription>This phrase is the only way to recover your account. Do not share with anyone.</WarningDescription>
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

        <BottomContainer>
          <Button>Next</Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
