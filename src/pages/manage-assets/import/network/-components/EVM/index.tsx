import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Button from '@/components/common/Button/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useChainList } from '@/hooks/useChainList';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import type { CustomAsset } from '@/types/asset';
import type { CustomEvmChain } from '@/types/chain';
import type { EvmRpc } from '@/types/evm/api';
import { isAxiosError } from '@/utils/axios';
import { requestRPC } from '@/utils/ethereum';
import { toHex } from '@/utils/string';
import { toastError, toastSuccess } from '@/utils/toast';

import {
  AdvancedContainer,
  Footer,
  FormContainer,
  InputWrapper,
  ItemLeftContainer,
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
} from './styled';
import type { AddNetworkForm } from './useSchema';
import { useSchema } from './useSchema';

export default function EVM() {
  const { t } = useTranslation();
  const { history } = useRouter();

  const { addCustomChain } = useCustomChain();
  const { addCustomAsset } = useCustomAssets();

  const { chainList } = useChainList();

  const [isProcessing, setIsProcessing] = useState(false);

  const evmChains = [...(chainList?.allEVMChains || [])];
  const invalidChainIds = evmChains?.map((chain) => chain.chainId) || [];

  const { addNetworkForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<AddNetworkForm>({
    resolver: joiResolver(addNetworkForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { chainId, networkName, rpcURL, symbol } = watch();
  const isButtonEnabled = chainId && networkName && rpcURL && symbol && isDirty;

  const submit = async (data: AddNetworkForm) => {
    try {
      setIsProcessing(true);

      const removedTrailingSlashUrl = data.rpcURL.endsWith('/') ? data.rpcURL.slice(0, -1) : data.rpcURL;

      const response = await requestRPC<EvmRpc<string>>('eth_chainId', [], '1', removedTrailingSlashUrl);

      const convertChainId = toHex(data.chainId, { addPrefix: true, isStringNumber: true });

      if (response.result !== convertChainId) {
        throw Error(`Chain ID returned by RPC URL ${data.rpcURL} does not match ${data.chainId} (${convertChainId}) (result: ${response.result || ''})`);
      }

      if (invalidChainIds.includes(convertChainId)) {
        throw Error(`Can't add ${data.chainId}`);
      }

      const removedTrailingSlashExplorerUrl = data.explorerURL?.endsWith('/') ? data.explorerURL.slice(0, -1) : data.explorerURL;

      const newChain: CustomEvmChain = {
        id: uuidv4(),
        chainId: convertChainId,
        chainType: 'evm',
        name: data.networkName,
        image: data.chainImage || '',
        mainAssetDenom: NATIVE_EVM_COIN_ADDRESS,
        chainDefaultCoinDenoms: [NATIVE_EVM_COIN_ADDRESS],
        isCosmos: false,
        rpcUrls: [
          {
            provider: 'Custom',
            url: removedTrailingSlashUrl,
          },
        ],
        explorer: {
          name: 'Custom',
          url: removedTrailingSlashExplorerUrl || '',
          account: '',
          tx: '',
          proposal: '',
        },
        feeInfo: {
          isEip1559: false,
          gasCoefficient: 1.3,
        },
        accountTypes: [
          {
            hdPath: "m/44'/60'/0'/0/${index}",
            pubkeyStyle: 'keccak256',
            isDefault: null,
          },
        ],
      };

      const mainCoin: CustomAsset = {
        id: NATIVE_EVM_COIN_ADDRESS,
        chainId: newChain.id,
        chainType: 'evm',
        type: 'native',
        name: data.symbol,
        symbol: data.symbol,
        decimals: 18,
        image: data.tokenImageURL || '',
        coinGeckoId: data.coinGeckoId || '',
      };

      await addCustomChain(newChain);

      await addCustomAsset(mainCoin);

      toastSuccess(t('pages.manage-assets.import.network.components.EVM.index.success'));
      history.back();
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status) {
          toastError(t('pages.manage-assets.import.network.components.EVM.index.restURLError'));
        }
      } else {
        const message = (e as { message?: string }).message
          ? (e as { message: string }).message
          : t('pages.manage-assets.import.network.components.EVM.index.error');
        toastError(message);
      }
    } finally {
      setIsProcessing(false);
      reset();
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(submit)}>
      <InputWrapper>
        <StandardInput
          label={t('pages.manage-assets.import.network.components.EVM.index.networkName')}
          error={!!errors.networkName}
          helperText={errors.networkName?.message}
          slotProps={{
            input: {
              ...register('networkName'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.network.components.EVM.index.rpcURL')}
          error={!!errors.rpcURL}
          helperText={errors.rpcURL?.message}
          slotProps={{
            input: {
              ...register('rpcURL'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.network.components.EVM.index.chainId')}
          error={!!errors.chainId}
          helperText={errors.chainId?.message}
          slotProps={{
            input: {
              ...register('chainId'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.network.components.EVM.index.symbol')}
          error={!!errors.symbol}
          helperText={errors.symbol?.message}
          slotProps={{
            input: {
              ...register('symbol'),
            },
          }}
        />

        <AdvancedContainer>
          <StyledAccordion>
            <StyledAccordionSummary aria-controls={'advanced-option-aria-control'} id={'advanced-option-id'}>
              <ItemLeftContainer>
                <Base1000Text variant="h4_B">{t('pages.manage-assets.import.network.components.EVM.index.advanced')}</Base1000Text>
              </ItemLeftContainer>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <InputWrapper>
                <StandardInput
                  label={t('pages.manage-assets.import.network.components.EVM.index.chainImage')}
                  error={!!errors.chainImage}
                  helperText={errors.chainImage?.message}
                  slotProps={{
                    input: {
                      ...register('chainImage'),
                    },
                  }}
                />
                <StandardInput
                  label={t('pages.manage-assets.import.network.components.EVM.index.tokenImageURL')}
                  error={!!errors.tokenImageURL}
                  helperText={errors.tokenImageURL?.message}
                  slotProps={{
                    input: {
                      ...register('tokenImageURL'),
                    },
                  }}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.EVM.index.exploreURL')}
                  error={!!errors.explorerURL}
                  helperText={errors.explorerURL?.message}
                  slotProps={{
                    input: {
                      ...register('explorerURL'),
                    },
                  }}
                />
              </InputWrapper>
            </StyledAccordionDetails>
          </StyledAccordion>
        </AdvancedContainer>
      </InputWrapper>
      <Footer>
        <Button type="submit" disabled={!isButtonEnabled} isProgress={isProcessing}>
          {t('pages.manage-assets.import.network.components.EVM.index.addCustomNetwork')}
        </Button>
      </Footer>
    </FormContainer>
  );
}
