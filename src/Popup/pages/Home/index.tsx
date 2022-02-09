import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { THEME_TYPE } from '~/constants/theme';
import BottomNavigation from '~/Popup/components/BottomNavigation';
import Button from '~/Popup/components/common/Button';
import Checkbox from '~/Popup/components/common/Checkbox';
import TextField from '~/Popup/components/common/Input';
import Switch from '~/Popup/components/common/Switch';
import AccountButton from '~/Popup/components/Header/AccountButton';
import ChainButton from '~/Popup/components/Header/ChainButton';
import NetworkButton from '~/Popup/components/Header/NetworkButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrent } from '~/Popup/hooks/useCurrent';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useTranslation } from '~/Popup/hooks/useTranslation';
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
    <Container>
      <button type="button" onClick={handleOnClick}>
        register
      </button>
      <button
        type="button"
        onClick={() => {
          navigate('/register/password');
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
      <button
        type="button"
        onClick={async () => {
          await setChromeStorage('encryptedPassword', null);
        }}
      >
        password
      </button>
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
        <Button type="button" typoVarient="h4" Image={SendIcon} disabled>
          Receive
        </Button>
      </div>
      <div>
        <TextField multiline placeholder="패스워드" />
      </div>
      {process.env.RUN_MODE}
      <div>
        <Checkbox />
        <Checkbox defaultChecked />
      </div>
      <div>
        <Switch />
      </div>
      <div>
        <ChainButton>eohgoiwghwoighweoighwioe</ChainButton>
      </div>
      <div>
        <NetworkButton>eohgoiwghwoighweoighwioe</NetworkButton>
      </div>
      <div>
        <AccountButton isConnected />
      </div>
      <BottomNavigation />
    </Container>
  );
}
