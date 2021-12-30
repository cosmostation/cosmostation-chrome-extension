import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { joiResolver } from '@hookform/resolvers/joi';
import { Button, CircularProgress, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { styled } from '@mui/material/styles';

import { TRANSPORT_TYPE } from '~/constants/ledger';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useLedgerCosmos } from '~/Popup/hooks/useLedgerCosmos';
import type { TransportType } from '~/types/ledger';

import type { Step1Form } from './useSchema';
import { useSchema } from './useSchema';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

export default function PrivateKey() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { transport, cosmosApp } = useLedgerCosmos();
  const { inMemory } = useInMemory();

  const [isLoading, setIsLoading] = useState(false);
  const { step1FormSchema } = useSchema();

  const step1Form = useForm<Step1Form>({
    resolver: joiResolver(step1FormSchema),
    mode: 'all',
    shouldFocusError: true,
    defaultValues: {
      transportType: TRANSPORT_TYPE.USB,
    },
  });

  const step1HandleSubmit = async (data: Step1Form) => {
    setIsLoading(true);
    console.log(data);
    try {
      const cosmos = await cosmosApp(data.transportType, false);

      try {
        await cosmos.init();
      } catch (e) {
        console.log(e);
        setIsLoading(false);
      }
    } catch (e) {
      // await cosmos.cl
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <form onSubmit={step1Form.handleSubmit(step1HandleSubmit)}>
        <FormControl component="fieldset">
          <FormLabel component="legend">transport type</FormLabel>
          <Controller
            control={step1Form.control}
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
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress /> : 'connection'}
        </Button>
      </form>
    </Container>
  );
}
