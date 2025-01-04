import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter } from '@tanstack/react-router';

import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentCustomCW20Tokens } from '@/hooks/useCurrentCustomCW20Tokens';
import type { CosmosCw20Asset } from '@/types/asset';
import type { UniqueChainId } from '@/types/chain';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { isNumber } from '@/utils/string';
import { toastError, toastSuccess } from '@/utils/toast';

import { FormContainer, InputWrapper } from './styled';
import type { ImportCustomCW20TokenForm } from './useSchema';
import { useSchema } from './useSchema';

type CW20Props = {
  chainId: UniqueChainId;
};

export default function CW20({ chainId }: CW20Props) {
  const { t } = useTranslation();
  const { history } = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);

  const { addCustomCW20Token } = useCurrentCustomCW20Tokens();
  const { chainList } = useChainList();

  const currentChain = chainList?.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const { importCustomCW20TokenForm } = useSchema({
    chain: currentChain,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<ImportCustomCW20TokenForm>({
    resolver: joiResolver(importCustomCW20TokenForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { address, symbol, decimals } = watch();
  const isButtonEnabled = address && symbol && decimals && isDirty;

  const submit = async (data: ImportCustomCW20TokenForm) => {
    try {
      setIsProcessing(true);

      const { address, symbol, decimals, logoUrl } = data;
      const { id } = parseUniqueChainId(chainId);

      const newToken: CosmosCw20Asset = {
        type: 'cw20',
        name: symbol,
        symbol,
        decimals,
        image: logoUrl,
        id: address,
        chainId: id,
        chainType: 'cosmos',
      };

      const storedCW20Assets = await getExtensionLocalStorage('cw20Assets');

      const isAlreadySupport = storedCW20Assets.some((item) => item.id.toLowerCase() === newToken.id.toLowerCase() && item.chainId === newToken.chainId);

      if (isAlreadySupport) {
        toastError(t('pages.manage-assets.import.assets.components.CW20.index.supportedAssets'));
        return;
      }

      await addCustomCW20Token(newToken);

      toastSuccess(t('pages.manage-assets.import.assets.components.CW20.index.success'));
      history.back();
    } catch {
      toastError(t('pages.manage-assets.import.assets.components.CW20.index.error'));
    } finally {
      setIsProcessing(false);
      reset();
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(submit)}>
      <InputWrapper>
        <StandardInput
          label={t('pages.manage-assets.import.assets.components.CW20.index.contractAddress')}
          error={!!errors.address}
          helperText={errors.address?.message}
          slotProps={{
            input: {
              ...register('address'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.assets.components.CW20.index.symbol')}
          error={!!errors.symbol}
          helperText={errors.symbol?.message}
          slotProps={{
            input: {
              ...register('symbol'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.assets.components.CW20.index.decimals')}
          error={!!errors.decimals}
          helperText={errors.decimals?.message}
          slotProps={{
            input: {
              ...register('decimals', {
                setValueAs: (v: string) => (v && isNumber(v) ? v : ''),
              }),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.assets.components.CW20.index.logoUrl')}
          error={!!errors.logoUrl}
          helperText={errors.logoUrl?.message}
          slotProps={{
            input: {
              ...register('logoUrl'),
            },
          }}
        />
      </InputWrapper>
      <BaseFooter>
        <Button type="submit" disabled={!isButtonEnabled} isProgress={isProcessing}>
          {t('pages.manage-assets.import.assets.components.CW20.index.addCustomCrypto')}
        </Button>
      </BaseFooter>
    </FormContainer>
  );
}
