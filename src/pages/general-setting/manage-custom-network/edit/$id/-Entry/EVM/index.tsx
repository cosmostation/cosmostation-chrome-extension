import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import ChainSelectBox from '@/components/ChainSelectBox';
import Base1000Text from '@/components/common/Base1000Text';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import type { CustomAsset } from '@/types/asset';
import type { ChainType, CustomEvmChain } from '@/types/chain';
import type { EvmRpc } from '@/types/evm/api';
import { isAxiosError } from '@/utils/axios';
import { requestRPC } from '@/utils/ethereum';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { toHex } from '@/utils/string';
import { toastError, toastSuccess } from '@/utils/toast';

import {
  AdvancedContainer,
  Container,
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

import EVMImage from '@/assets/images/chain/evm.png';

export const UNIVERSAL_NETWORK_ID = 'universal';

type EVMProps = {
  id: string;
};

export default function EVM({ id }: EVMProps) {
  const { t } = useTranslation();

  const { addedCustomChainList, editCustomChain } = useCustomChain();
  const { customAssets, editCustomAsset } = useCustomAssets();

  const matchingCustomChain = addedCustomChainList.find((chain) => isMatchingUniqueChainId(chain, id));
  const matchingCustomAsset = customAssets.find((asset) => getUniqueChainIdWithManual(asset.chainId, asset.chainType) === id);

  const baseChainList = [
    {
      id: UNIVERSAL_NETWORK_ID,
      name: 'EVM Network',
      image: EVMImage,
      chainType: 'evm' as ChainType,
    },
  ];

  const [isProcessing, setIsProcessing] = useState(false);

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
    defaultValues: {
      chainId: matchingCustomChain?.chainId,
      networkName: matchingCustomChain?.name,
      rpcURL: matchingCustomChain?.chainType === 'evm' ? matchingCustomChain?.rpcUrls[0].url : '',
      symbol: matchingCustomAsset?.symbol,
      chainImage: matchingCustomChain?.image || undefined,
      tokenImageURL: matchingCustomAsset?.image || undefined,
      explorerURL: matchingCustomChain?.explorer?.url,
    },
  });

  const { chainId, networkName, rpcURL, symbol } = watch();
  const isButtonEnabled = chainId && networkName && rpcURL && symbol && isDirty;

  const submit = async (data: AddNetworkForm) => {
    try {
      if (!matchingCustomChain || !matchingCustomAsset) {
        throw Error('Failed to find matching custom chain');
      }
      setIsProcessing(true);

      const removedTrailingSlashUrl = data.rpcURL.endsWith('/') ? data.rpcURL.slice(0, -1) : data.rpcURL;

      const response = await requestRPC<EvmRpc<string>>('eth_chainId', [], '1', removedTrailingSlashUrl);

      const convertChainId = toHex(data.chainId, { addPrefix: true, isStringNumber: true });

      if (response.result !== convertChainId) {
        throw Error(`Chain ID returned by RPC URL ${data.rpcURL} does not match ${data.chainId} (${convertChainId}) (result: ${response.result || ''})`);
      }

      const removedTrailingSlashExplorerUrl = data.explorerURL?.endsWith('/') ? data.explorerURL.slice(0, -1) : data.explorerURL;

      const updatedChain: CustomEvmChain = {
        id: matchingCustomChain.id,
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
            url: data.rpcURL,
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
        chainId: updatedChain.id,
        chainType: 'evm',
        type: 'native',
        name: data.symbol,
        symbol: data.symbol,
        decimals: 18,
        image: data.tokenImageURL || '',
        coinGeckoId: data.coinGeckoId || '',
      };

      await editCustomChain(getUniqueChainId(matchingCustomChain), updatedChain);

      await editCustomAsset(getCoinId(matchingCustomAsset), mainCoin);

      toastSuccess(t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.success'));
      history.back();
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status) {
          toastError(t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.restURLError'));
        }
      } else {
        const message = (e as { message?: string }).message
          ? (e as { message: string }).message
          : t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.error');
        toastError(message);
      }
    } finally {
      setIsProcessing(false);
      reset();
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(submit)}>
      <BaseBody>
        <Container>
          <ChainSelectBox
            chainList={baseChainList}
            currentChainId={getUniqueChainId(baseChainList[0])}
            disabled
            label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.network')}
            bottomSheetTitle={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.selectNetwork')}
            bottomSheetSearchPlaceholder={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.searchNetwork')}
          />
        </Container>
        <InputWrapper>
          <StandardInput
            label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.networkName')}
            error={!!errors.networkName}
            helperText={errors.networkName?.message}
            slotProps={{
              input: {
                ...register('networkName'),
              },
            }}
          />
          <StandardInput
            label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.rpcURL')}
            error={!!errors.rpcURL}
            helperText={errors.rpcURL?.message}
            slotProps={{
              input: {
                ...register('rpcURL'),
              },
            }}
          />
          <StandardInput
            label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.symbol')}
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
                  <Base1000Text variant="h4_B">{t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.advanced')}</Base1000Text>
                </ItemLeftContainer>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <InputWrapper>
                  <StandardInput
                    label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.chainImage')}
                    error={!!errors.chainImage}
                    helperText={errors.chainImage?.message}
                    slotProps={{
                      input: {
                        ...register('chainImage'),
                      },
                    }}
                  />
                  <StandardInput
                    label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.tokenImageURL')}
                    error={!!errors.tokenImageURL}
                    helperText={errors.tokenImageURL?.message}
                    slotProps={{
                      input: {
                        ...register('tokenImageURL'),
                      },
                    }}
                  />

                  <StandardInput
                    label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.exploreURL')}
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
      </BaseBody>
      <Footer>
        <Button type="submit" disabled={!isButtonEnabled} isProgress={isProcessing}>
          {t('pages.general-setting.manage-custom-network.edit.$id.Entry.EVM.confirm')}
        </Button>
      </Footer>
    </FormContainer>
  );
}
