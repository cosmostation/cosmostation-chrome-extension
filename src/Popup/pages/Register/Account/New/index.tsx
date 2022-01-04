import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as bip39 from 'bip39';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { ACCOUNT_COIN_TYPE } from '~/constants/chromeStorage';
import { THEME_TYPE } from '~/constants/theme';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { aesEncrypt } from '~/Popup/utils/crypto';

import type { NewMnemonicForm } from './useSchema';
import { useSchema } from './useSchema';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.backgroundColor,
}));

type Strength = 128 | 256;

export default function New() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { newMnemonicForm } = useSchema({ name: [...chromeStorage.accounts.map((account) => account.name), 'test'] });
  const { inMemory } = useInMemory();

  const [stength, setStrength] = useState<Strength>(128);
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic(stength));
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewMnemonicForm>({
    resolver: joiResolver(newMnemonicForm),
    mode: 'onSubmit',
    shouldFocusError: true,
    defaultValues: {
      coinType: ACCOUNT_COIN_TYPE.COSMOS,
      account: 0,
      change: 0,
      addressIndex: 0,
    },
  });

  const submit = async (data: NewMnemonicForm) => {
    console.log(data);

    if (inMemory.password) {
      const accountId = uuidv4();
      await setChromeStorage('accounts', [
        ...chromeStorage.accounts,
        {
          id: accountId,
          type: 'MNEMONIC',
          allowedOrigins: [],
          coinType: data.coinType,
          bip44: { account: `${data.account}'`, change: `${data.change}`, addressIndex: `${data.addressIndex}` },
          encryptedMnemonic: aesEncrypt(mnemonic, inMemory.password),
          name: data.name,
        },
      ]);

      await setChromeStorage('selectedAccountId', accountId);
    }
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <Container>
      <div>
        <ToggleButtonGroup
          value={stength}
          exclusive
          onChange={(_, newStrength: Strength | null) => {
            if (newStrength !== null) {
              setStrength(newStrength);
              setMnemonic(bip39.generateMnemonic(newStrength));
            }
          }}
          aria-label="text alignment"
        >
          <ToggleButton value={128} aria-label="left aligned">
            12
          </ToggleButton>
          <ToggleButton value={256} aria-label="right aligned">
            24
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div>{mnemonic}</div>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <TextField {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        </div>
        <div>
          <FormControl component="fieldset">
            <FormLabel component="legend">coin type</FormLabel>
            <Controller
              name="coinType"
              control={control}
              render={({ field }) => (
                <RadioGroup aria-label="coinType" {...field}>
                  <FormControlLabel value={ACCOUNT_COIN_TYPE.COSMOS} control={<Radio />} label="cosmos" />
                  <FormControlLabel value={ACCOUNT_COIN_TYPE.FOUNDATION} control={<Radio />} label="foundation" />
                </RadioGroup>
              )}
            />
          </FormControl>
        </div>
        <div>
          <Controller
            control={control}
            name="account"
            render={({ field }) => {
              const { onChange, ...remainder } = field;
              return (
                <TextField
                  {...remainder}
                  onChange={(event) => {
                    const { value } = event.currentTarget;

                    const toNumber = Number(value);

                    if (!Number.isNaN(toNumber)) {
                      if (toNumber < 0) {
                        return;
                      }
                      onChange(toNumber);
                    }
                  }}
                  error={!!errors.account}
                  helperText={errors.account?.message}
                />
              );
            }}
          />
          <Controller
            control={control}
            name="change"
            render={({ field }) => {
              const { onChange, ...remainder } = field;
              return (
                <TextField
                  {...remainder}
                  onChange={(event) => {
                    const { value } = event.currentTarget;

                    const toNumber = Number(value);

                    if (!Number.isNaN(toNumber)) {
                      if (toNumber < 0) {
                        return;
                      }
                      onChange(toNumber);
                    }
                  }}
                  error={!!errors.change}
                  helperText={errors.change?.message}
                />
              );
            }}
          />
          <Controller
            control={control}
            name="addressIndex"
            render={({ field }) => {
              const { onChange, ...remainder } = field;
              return (
                <TextField
                  {...remainder}
                  onChange={(event) => {
                    const { value } = event.currentTarget;

                    const toNumber = Number(value);

                    if (!Number.isNaN(toNumber)) {
                      if (toNumber < 0) {
                        return;
                      }
                      onChange(toNumber);
                    }
                  }}
                  error={!!errors.addressIndex}
                  helperText={errors.addressIndex?.message}
                />
              );
            }}
          />
        </div>
        <Button type="submit" variant="contained">
          register
        </Button>
      </form>
    </Container>
  );
}
