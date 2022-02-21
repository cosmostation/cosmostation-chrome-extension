import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { THEME_TYPE } from '~/constants/theme';
import BottomSheet from '~/Popup/components/common/BottomSheet';
import Button from '~/Popup/components/common/Button';
import Checkbox from '~/Popup/components/common/Checkbox';
import Dialog from '~/Popup/components/common/Dialog';
import TextField from '~/Popup/components/common/Input';
import Popover from '~/Popup/components/common/Popover';
import Switch from '~/Popup/components/common/Switch';
import Header from '~/Popup/components/Header';
import Lock from '~/Popup/components/Lock';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrent } from '~/Popup/hooks/useCurrent';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import WalletHeader from '~/Popup/pages/Wallet/Header';
import { emitToWeb } from '~/Popup/utils/message';

import SendIcon from '~/images/icons/Send.svg';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base01,
}));

export default function HOME() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { inMemory, setInMemory } = useInMemory();
  const { changeLanguage, language } = useTranslation();
  const current = useCurrent();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const { currentAccount } = current;

  const handleOnClick = () => {
    navigate('/register');
  };

  const handleTheme = async () => {
    await setChromeStorage('theme', chromeStorage.theme === THEME_TYPE.LIGHT ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
  };

  if (!currentAccount) {
    return null;
  }

  console.log('ddd');

  return (
    <Lock>
      <Container>
        <button type="button" onClick={handleOnClick}>
          register
        </button>
        <button
          type="button"
          onClick={() => {
            navigate('/wallet');
          }}
        >
          <Typography variant="h1">코스모스테이션 월렛</Typography>
        </button>
        <Typography variant="h1n">149.000000</Typography>
        <Typography variant="h1">Cosmostation Wallet</Typography>
        <button type="button" onClick={handleTheme}>
          Theme
        </button>
        <Button
          type="button"
          onClick={() => {
            emitToWeb({ type: 'accountChanged', message: { result: '', error: null } });
          }}
        >
          Log in
        </Button>
        {/* <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        open
      </button> */}
        <button
          type="button"
          onClick={async () => {
            await setInMemory('password', null);
          }}
        >
          clear
        </button>
        <Button
          type="button"
          onClick={async () => {
            await changeLanguage(language === 'ko' ? 'en' : 'ko');
          }}
        >
          변경
        </Button>
        HOME
        <div>{currentAccount.name}</div>
        <div>{currentAccount.type}</div>
        <div>
          <Button type="button" typoVarient="h4" Icon={SendIcon} onClick={handleClick}>
            Receive
          </Button>
        </div>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          wegegweg
        </Popover>
        {/* <BottomSheet open={open} onClose={() => setOpen(false)}>
        weoighewoihweoghweoighiwoge weoighewoihweoghweoighiwoge weoighewoihweoghweoighiwoge weoighewoihweoghweoighiwoge weoighewoihweoghweoighiwoge
        weoighewoihweoghweoighiwoge weoighewoihweoghweoighiwoge
      </BottomSheet> */}
      </Container>
    </Lock>
  );
}
