import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import { ETHEREUM_CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { THEME_TYPE } from '~/constants/theme';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { aesEncrypt, sha512 } from '~/Popup/utils/crypto';

import type { MnemonicForm } from './useSchema';
import { useSchema } from './useSchema';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base01,
}));

export default function Mnemonic() {
  const navigate = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { mnemonicForm } = useSchema({ name: [...Object.values(chromeStorage.accountName), 'test'] });
  const { inMemory } = useInMemory();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MnemonicForm>({
    resolver: joiResolver(mnemonicForm),
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async (data: MnemonicForm) => {
    console.log(data);

    if (inMemory.password) {
      const accountId = uuidv4();
      await setChromeStorage('accounts', [
        ...chromeStorage.accounts,
        {
          id: accountId,
          type: 'MNEMONIC',
          bip44: { addressIndex: `${data.addressIndex}` },
          encryptedMnemonic: aesEncrypt(data.mnemonic, inMemory.password),
          encryptedPassword: aesEncrypt(inMemory.password, data.mnemonic),
          encryptedRestoreString: sha512(data.mnemonic),
        },
      ]);

      await setChromeStorage('selectedAccountId', accountId);

      await setChromeStorage('accountName', { ...chromeStorage.accountName, [accountId]: data.name });

      await setChromeStorage('selectedChainId', ETHEREUM_CHAINS[0].id);

      await setChromeStorage('allowedChainIds', [...chromeStorage.allowedChainIds, ETHEREUM_CHAINS[0].id]);

      await setChromeStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
    }
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <TextField {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        </div>

        <div>
          <TextField multiline rows={4} {...register('mnemonic')} error={!!errors.mnemonic} helperText={errors.mnemonic?.message} />
        </div>
        <div>
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
