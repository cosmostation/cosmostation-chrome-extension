import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter } from '@tanstack/react-router';

import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import { useCurrentCustomERC20Tokens } from '@/hooks/useCurrentCustomERC20Tokens';
import type { EvmErc20Asset } from '@/types/asset';
import type { UniqueChainId } from '@/types/chain';
import { parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { isNumber } from '@/utils/string';
import { toastError, toastSuccess } from '@/utils/toast';

import { FormContainer, InputWrapper } from './styled';
import type { ImportCustomERC20TokenForm } from './useSchema';
import { useSchema } from './useSchema';

type ERC20Props = {
  chainId: UniqueChainId;
};

export default function ERC20({ chainId }: ERC20Props) {
  const { t } = useTranslation();
  const { history } = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);

  const { addCustomERC20Token } = useCurrentCustomERC20Tokens();

  const { importCustomERC20TokenForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<ImportCustomERC20TokenForm>({
    resolver: joiResolver(importCustomERC20TokenForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { address, symbol, decimals } = watch();
  const isButtonEnabled = address && symbol && decimals && isDirty;

  const submit = async (data: ImportCustomERC20TokenForm) => {
    try {
      setIsProcessing(true);

      const { address, symbol, decimals, logoUrl } = data;
      const { id } = parseUniqueChainId(chainId);

      const newToken: EvmErc20Asset = {
        type: 'erc20',
        name: symbol,
        symbol,
        decimals,
        image: logoUrl,
        id: address,
        chainId: id,
        chainType: 'evm',
      };

      const storedERC20Assets = await getExtensionLocalStorage('erc20Assets');

      const isAlreadySupport = storedERC20Assets.some((item) => item.id.toLowerCase() === newToken.id.toLowerCase() && item.chainId === newToken.chainId);

      if (isAlreadySupport) {
        toastError(t('pages.manage-assets.import.assets.components.ERC20.index.supportedAssets'));
        return;
      }

      await addCustomERC20Token(newToken);

      toastSuccess(t('pages.manage-assets.import.assets.components.ERC20.index.success'));
      history.back();
    } catch {
      toastError(t('pages.manage-assets.import.assets.components.ERC20.index.error'));
    } finally {
      setIsProcessing(false);
      reset();
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(submit)}>
      <InputWrapper>
        <StandardInput
          label={t('pages.manage-assets.import.assets.components.ERC20.index.contractAddress')}
          error={!!errors.address}
          helperText={errors.address?.message}
          slotProps={{
            input: {
              ...register('address'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.assets.components.ERC20.index.symbol')}
          error={!!errors.symbol}
          helperText={errors.symbol?.message}
          slotProps={{
            input: {
              ...register('symbol'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.assets.components.ERC20.index.decimals')}
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
          label={t('pages.manage-assets.import.assets.components.ERC20.index.logoUrl')}
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
          {t('pages.manage-assets.import.assets.components.ERC20.index.addCustomCrypto')}
        </Button>
      </BaseFooter>
    </FormContainer>
  );
}
