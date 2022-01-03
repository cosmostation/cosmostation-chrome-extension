import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { TRANSPORT_TYPE } from '~/constants/ledger';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useLedgerCosmos } from '~/Popup/hooks/useLedgerCosmos';
import type { TransportType } from '~/types/ledger';

import type { LedgerForm } from './useSchema';
import { useSchema } from './useSchema';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

export default function PrivateKey() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { cosmosApp, createTransport, closeTransport } = useLedgerCosmos();
  const { inMemory } = useInMemory();

  const [isLoading, setIsLoading] = useState(false);
  const { ledgerFormSchema } = useSchema({ name: [...chromeStorage.accounts.map((account) => account.name), 'test'] });

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<LedgerForm>({
    resolver: joiResolver(ledgerFormSchema),
    mode: 'all',
    shouldFocusError: true,
    defaultValues: {
      transportType: TRANSPORT_TYPE.USB,
    },
  });

  const step1HandleSubmit = async (data: LedgerForm) => {
    setIsLoading(true);
    console.log(data);
    try {
      await createTransport(data.transportType);

      try {
        const cosmos = await cosmosApp();

        const publicKey = await cosmos.getPublicKey(new Uint8Array([44, 118, 0, 0, 0]));

        await setChromeStorage('accounts', [
          ...chromeStorage.accounts,
          {
            type: 'LEDGER',
            allowedOrigins: [],
            name: data.name,
            publicKey: publicKey.compressed_pk.toString('hex'),
            bip44: { coinType: '118', account: '0', change: '0', addressIndex: '0' },
          },
        ]);
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      // await cosmos.cl
      console.log(e);
    } finally {
      await closeTransport();
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(step1HandleSubmit)}>
        <FormControl component="fieldset">
          <FormLabel component="legend">transport type</FormLabel>
          <Controller
            control={control}
            name="transportType"
            render={({ field }) => (
              <RadioGroup aria-label="transportType" {...field}>
                <FormControlLabel value={TRANSPORT_TYPE.USB} control={<Radio />} label="USB" />
                <FormControlLabel value={TRANSPORT_TYPE.HID} control={<Radio />} label="HID" />
                <FormControlLabel value={TRANSPORT_TYPE.BLUETOOTH} control={<Radio />} label="Bluetooth" />
              </RadioGroup>
            )}
          />
        </FormControl>
        <TextField {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress /> : 'connection'}
        </Button>
      </form>
    </Container>
  );
}
