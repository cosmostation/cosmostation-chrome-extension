import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import { THEME_TYPE } from '~/constants/theme';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { emitToWeb } from '~/Popup/utils/message';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

export default function HOME() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { setInMemory } = useInMemory();

  const handleOnClick = () => {
    navigate('/register');
  };

  const handleTheme = async () => {
    await setChromeStorage('theme', chromeStorage.theme === THEME_TYPE.LIGHT ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
  };

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
        password
      </button>
      <button type="button" onClick={handleTheme}>
        Theme
      </button>
      <Button
        type="button"
        onClick={() => {
          emitToWeb({ type: 'accountChanged', message: { data: '', error: null } });
        }}
      >
        Emit
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
      <Button type="button" onClick={() => null}>
        cosmos
      </Button>
      HOME
      {process.env.RUN_MODE}
    </Container>
  );
}
