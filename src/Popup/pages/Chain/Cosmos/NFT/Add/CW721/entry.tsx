import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import { useTokenInfoSWR } from '~/Popup/hooks/SWR/cosmos/useTokenInfoSWR';
import { useTokensSWR } from '~/Popup/hooks/SWR/cosmos/useTokensSWR';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';

import { ButtonContainer, Container, Div, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';
import type { ImportTokenForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  chain: CosmosChain;
};

export default function Entry({ chain }: EntryProps) {
  const [contractAddress, setContractAddress] = useState('');
  const { currentChain } = useCurrentChain();
  const tokens = useTokensSWR(chain);

  const { importTokenForm } = useSchema({ chain });
  const { addCosmosToken } = useCurrentCosmosTokens(chain);
  const { t } = useTranslation();

  const tokenInfo = useTokenInfoSWR(chain, contractAddress);

  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ImportTokenForm>({
    resolver: joiResolver(importTokenForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const handleOnChangeContractAddress = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContractAddress(event.currentTarget.value);
  };

  const submit = async (data: ImportTokenForm) => {
    if (tokenInfo.data) {
      const savedTokenInfo = tokens.data.find((item) => item.address === data.address);
      await addCosmosToken({
        address: data.address,
        decimals: tokenInfo.data.decimals,
        displayDenom: tokenInfo.data.symbol,
        tokenType: 'CW20',
        chainId: currentChain.id,
        imageURL: savedTokenInfo?.image ?? data.imageURL,
        coinGeckoId: savedTokenInfo?.coinGeckoId,
      });

      enqueueSnackbar(t('pages.Chain.Cosmos.Token.Add.CW20.entry.addTokenSnackbar'));

      setContractAddress('');
      reset();
    } else {
      enqueueSnackbar(t('pages.Chain.Cosmos.Token.Add.CW20.entry.addTokenErrorSnackbar'), { variant: 'error' });
    }
  };
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <WarningContainer>
          <WarningIconContainer>
            <Info16Icon />
          </WarningIconContainer>
          <WarningTextContainer>
            <Typography variant="h6">{t('pages.Chain.Cosmos.Token.Add.CW20.entry.warning')}</Typography>
          </WarningTextContainer>
        </WarningContainer>
        <Div sx={{ marginBottom: '0.8rem' }}>
          <Input
            type="text"
            inputProps={register('address')}
            placeholder={t('pages.Chain.Cosmos.Token.Add.CW20.entry.addressPlaceholder')}
            error={!!errors.address}
            helperText={errors.address?.message}
            onChange={handleOnChangeContractAddress}
            value={contractAddress}
          />
        </Div>
        <Div sx={{ marginBottom: '0.8rem' }}>
          <Input
            type="text"
            inputProps={register('imageURL')}
            error={!!errors.imageURL}
            helperText={errors.imageURL?.message}
            placeholder={t('pages.Chain.Cosmos.Token.Add.CW20.entry.imageURLPlaceholder')}
          />
        </Div>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Chain.Cosmos.Token.Add.CW20.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}
