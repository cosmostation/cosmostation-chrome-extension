import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import { THEME_TYPE } from '~/constants/theme';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { emitToWeb } from '~/Popup/utils/message';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

export default function Account() {
  const { navigate } = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  return (
    <Container>
      <Button
        type="button"
        variant="contained"
        color="info"
        onClick={() => {
          navigate('/register/account/ledger');
        }}
      >
        Ledger
      </Button>
      <Button
        type="button"
        variant="contained"
        color="warning"
        onClick={() => {
          navigate('/register/account/mnemonic');
        }}
      >
        Mnemonic
      </Button>
      <Button
        type="button"
        variant="contained"
        onClick={() => {
          navigate('/register/account/private-key');
        }}
      >
        Private Key
      </Button>
    </Container>
  );
}
