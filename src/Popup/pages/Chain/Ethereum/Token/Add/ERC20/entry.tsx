import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { ButtonContainer, Container, Div, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';
import type { ImportTokenForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { importTokenForm } = useSchema();
  const { addEthereumToken } = useCurrentEthereumTokens();
  const { t } = useTranslation();

  const tokens = useTokensSWR();

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

  const submit = async (data: ImportTokenForm) => {
    try {
      const foundToken = tokens.data.find((item) => item.address.toLowerCase() === data.address.toLowerCase());

      const newToken = foundToken
        ? {
            address: foundToken.address,
            displayDenom: foundToken.displayDenom,
            decimals: foundToken.decimals,
            imageURL: foundToken.imageURL,
            coinGeckoId: foundToken.coinGeckoId,
          }
        : data;

      await addEthereumToken({ ...newToken, tokenType: 'ERC20' });

      enqueueSnackbar(t('pages.Chain.Ethereum.Token.Add.ERC20.entry.addTokenSnackbar'));
    } finally {
      reset();
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
            <Typography variant="h6">{t('pages.Chain.Ethereum.Token.Add.ERC20.entry.warning')}</Typography>
          </WarningTextContainer>
        </WarningContainer>
        <Div sx={{ marginBottom: '0.8rem' }}>
          <Input
            type="text"
            inputProps={register('address')}
            placeholder={t('pages.Chain.Ethereum.Token.Add.ERC20.entry.addressPlaceholder')}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        </Div>
        <Div sx={{ marginBottom: '0.8rem' }}>
          <Input
            type="text"
            inputProps={register('displayDenom')}
            error={!!errors.displayDenom}
            helperText={errors.displayDenom?.message}
            placeholder={t('pages.Chain.Ethereum.Token.Add.ERC20.entry.displayDenomPlaceholder')}
          />
        </Div>
        <Div sx={{ marginBottom: '0.8rem' }}>
          <Input
            type="number"
            inputProps={register('decimals')}
            error={!!errors.decimals}
            helperText={errors.decimals?.message}
            placeholder={t('pages.Chain.Ethereum.Token.Add.ERC20.entry.decimalsPlaceholder')}
          />
        </Div>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Chain.Ethereum.Token.Add.ERC20.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}
