import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useLedgerCosmos } from '~/Popup/hooks/useLedgerCosmos';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

export default function PrivateKey() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const ledgerCosmos = useLedgerCosmos();
  const { inMemory } = useInMemory();

  return (
    <Container>
      <Button
        type="button"
        onClick={async () => {
          const cosmos = await ledgerCosmos();

          // const publicKey = await cosmos.getPublicKey(new Uint8Array([44, 118, 0, 0, 0]));
          // console.log(publicKey);

          // const toHex = publicKey.compressed_pk.toString('hex');
          // console.log(toHex);

          // console.log(Buffer.from(toHex, 'hex'));
        }}
      >
        create transport
      </Button>
      <Button type="button" onClick={() => null}>
        get transport
      </Button>
      <Button type="button" onClick={() => null}>
        get transport
      </Button>
    </Container>
  );
}
