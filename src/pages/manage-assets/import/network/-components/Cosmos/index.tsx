import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import BaseSelectBox from '@/components/common/BaseSelectBox';
import Button from '@/components/common/Button/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import { useChainList } from '@/hooks/useChainList';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import type { CustomAsset } from '@/types/asset';
import type { CustomCosmosChain } from '@/types/chain';
import type { NodeInfoPayload } from '@/types/nodeInfo';
import { get, isAxiosError } from '@/utils/axios';
import { isNumber } from '@/utils/string';
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
import TextBottomSheet from './TextBottomSheet';
import type { AddChainForm } from './useSchema';
import { useSchema } from './useSchema';

const PUBKEY_STYLE = {
  secp256k1: 'secp256k1',
  ethsecp256k1: 'ethsecp256k1',
};

const PUBKEY_TYPE_MAP = {
  [PUBKEY_STYLE.secp256k1]: '/cosmos.crypto.secp256k1.PubKey',
  [PUBKEY_STYLE.ethsecp256k1]: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
};

export default function Cosmos() {
  const { t } = useTranslation();
  const { history } = useRouter();

  const { addCustomChain } = useCustomChain();
  const { addCustomAsset } = useCustomAssets();

  const { chainList } = useChainList();

  const [isProcessing, setIsProcessing] = useState(false);

  const [isOpenCosmwasmBottomSheet, setIsOpenCosmwasmBottomSheet] = useState(false);
  const [isOpenPubkeyStyleBottomSheet, setIsOpenPubkeyStyleBottomSheet] = useState(false);

  const [isSupportCosmwasm, setIsSupportCosmwasm] = useState('False');
  const [selectedPubkeyStyle, setSelectedPubkeyStyle] = useState(PUBKEY_STYLE.secp256k1);

  const cosmosChains = [...(chainList?.allCosmosChains || [])];
  const invalidChainIds = cosmosChains?.map((chain) => chain.chainId) || [];

  const { addChainForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<AddChainForm>({
    resolver: joiResolver(addChainForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const gasRateError = useMemo(() => {
    const error = errors[''];
    if (error?.type === 'object.and') {
      return error.message;
    }
    return '';
  }, [errors]);

  const { chainName, mainAssetDenom, accountPrefix, lcdUrl, symbol } = watch();
  const isButtonEnabled = chainName && mainAssetDenom && accountPrefix && lcdUrl && symbol && isDirty;

  const submit = async (data: AddChainForm) => {
    try {
      setIsProcessing(true);

      const removedTrailingSlashUrl = data.lcdUrl.endsWith('/') ? data.lcdUrl.slice(0, -1) : data.lcdUrl;
      const nodeInfo = await get<NodeInfoPayload>(`${removedTrailingSlashUrl}/cosmos/base/tendermint/v1beta1/node_info`);

      if (!nodeInfo?.default_node_info?.network) {
        throw new Error(t('pages.manage-assets.import.network.components.Cosmos.index.restURLError'));
      }
      if (invalidChainIds.includes(nodeInfo?.default_node_info?.network)) {
        throw new Error(t('pages.manage-assets.import.network.components.Cosmos.index.invalidChainId'));
      }

      const chainId = nodeInfo.default_node_info.network;

      const formattedCoinType = data.coinType ? (data.coinType.endsWith("'") ? data.coinType : `${data.coinType}'`) : "118'";
      const removedTrailingSlashExplorerUrl = data.explorerURL?.endsWith('/') ? data.explorerURL.slice(0, -1) : data.explorerURL;

      const newChain: CustomCosmosChain = {
        id: uuidv4(),
        chainId,
        chainType: 'cosmos',
        name: data.chainName,
        image: data.chainImage || '',
        mainAssetDenom: data.mainAssetDenom,
        chainDefaultCoinDenoms: [data.mainAssetDenom],
        accountPrefix: data.accountPrefix,
        isCosmwasm: isSupportCosmwasm === 'True',
        isEvm: false,
        lcdUrls: [
          {
            provider: 'Custom',
            url: data.lcdUrl,
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
          isSimulable: false,
          isFeemarketEnabled: false,
          defaultFeeRateKey: '0',
          gasRate: [
            `${data.gasRateLow || 0.00025}${data.mainAssetDenom}`,
            `${data.gasRateAverage || 0.0025}${data.mainAssetDenom}`,
            `${data.gasRateHigh || 0.025}${data.mainAssetDenom}`,
          ],
          defaultGasLimit: data.defaultGasLimit || '300000',
          gasCoefficient: 1.3,
        },
        accountTypes: [
          {
            hdPath: `m/44'/${formattedCoinType}/0'/0/\${index}`,
            pubkeyStyle: selectedPubkeyStyle,
            pubkeyType: PUBKEY_TYPE_MAP[selectedPubkeyStyle],
          },
        ],
      };

      const mainCoin: CustomAsset = {
        id: data.mainAssetDenom,
        chainId: newChain.id,
        chainType: 'cosmos',
        type: 'native',
        name: data.symbol,
        symbol: data.symbol,
        decimals: data.decimals || 6,
        image: data.tokenImageURL || '',
        coinGeckoId: data.coinGeckoId || '',
      };
      await addCustomChain(newChain);

      await addCustomAsset(mainCoin);

      toastSuccess(t('pages.manage-assets.import.network.components.Cosmos.index.success'));
      history.back();
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status) {
          toastError(t('pages.manage-assets.import.network.components.Cosmos.index.restURLError'));
        }
      } else {
        const message = (e as { message?: string }).message
          ? (e as { message: string }).message
          : t('pages.manage-assets.import.network.components.Cosmos.index.error');
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
          label={t('pages.manage-assets.import.network.components.Cosmos.index.chainName')}
          error={!!errors.chainName}
          helperText={errors.chainName?.message}
          slotProps={{
            input: {
              ...register('chainName'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.network.components.Cosmos.index.restURL')}
          error={!!errors.lcdUrl}
          helperText={errors.lcdUrl?.message}
          slotProps={{
            input: {
              ...register('lcdUrl'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.network.components.Cosmos.index.denom')}
          error={!!errors.mainAssetDenom}
          helperText={errors.mainAssetDenom?.message}
          slotProps={{
            input: {
              ...register('mainAssetDenom'),
            },
          }}
        />
        <StandardInput
          label={t('pages.manage-assets.import.network.components.Cosmos.index.symbol')}
          error={!!errors.symbol}
          helperText={errors.symbol?.message}
          slotProps={{
            input: {
              ...register('symbol'),
            },
          }}
        />

        <StandardInput
          label={t('pages.manage-assets.import.network.components.Cosmos.index.accountPrefix')}
          error={!!errors.accountPrefix}
          helperText={errors.accountPrefix?.message}
          slotProps={{
            input: {
              ...register('accountPrefix'),
            },
          }}
        />

        <AdvancedContainer>
          <StyledAccordion>
            <StyledAccordionSummary aria-controls={'advanced-option-aria-control'} id={'advanced-option-id'}>
              <ItemLeftContainer>
                <Base1000Text variant="h4_B">{t('pages.manage-assets.import.network.components.Cosmos.index.advanced')}</Base1000Text>
              </ItemLeftContainer>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <InputWrapper>
                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.decimals')}
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
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.coinTypePath')}
                  error={!!errors.coinType}
                  helperText={errors.coinType?.message}
                  slotProps={{
                    input: {
                      ...register('coinType'),
                    },
                  }}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.chainImage')}
                  error={!!errors.chainImage}
                  helperText={errors.chainImage?.message}
                  slotProps={{
                    input: {
                      ...register('chainImage'),
                    },
                  }}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.tokenImageURL')}
                  error={!!errors.tokenImageURL}
                  helperText={errors.tokenImageURL?.message}
                  slotProps={{
                    input: {
                      ...register('tokenImageURL'),
                    },
                  }}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.exploreURL')}
                  error={!!errors.explorerURL}
                  helperText={errors.explorerURL?.message}
                  slotProps={{
                    input: {
                      ...register('explorerURL'),
                    },
                  }}
                />
                <BaseSelectBox
                  label={t('pages.general-setting.address-book.add-address.entry.cosmwasm')}
                  isOpenBottomSheet={isOpenCosmwasmBottomSheet}
                  onClick={() => setIsOpenCosmwasmBottomSheet(true)}
                  value={isSupportCosmwasm}
                />

                <BaseSelectBox
                  label={t('pages.general-setting.address-book.add-address.entry.pubkeyStyle')}
                  isOpenBottomSheet={isOpenPubkeyStyleBottomSheet}
                  onClick={() => setIsOpenPubkeyStyleBottomSheet(true)}
                  value={selectedPubkeyStyle}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.defaultGasLimit')}
                  error={!!errors.defaultGasLimit}
                  helperText={errors.defaultGasLimit?.message}
                  slotProps={{
                    input: {
                      ...register('defaultGasLimit', {
                        setValueAs: (v: string) => (v && isNumber(v) ? v : ''),
                      }),
                    },
                  }}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.gasRateLow')}
                  error={!!gasRateError}
                  helperText={gasRateError}
                  slotProps={{
                    input: {
                      ...register('gasRateLow'),
                    },
                  }}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.gasRateAverage')}
                  error={!!gasRateError}
                  helperText={gasRateError}
                  slotProps={{
                    input: {
                      ...register('gasRateAverage'),
                    },
                  }}
                />

                <StandardInput
                  label={t('pages.manage-assets.import.network.components.Cosmos.index.gasRateHigh')}
                  error={!!gasRateError}
                  helperText={gasRateError}
                  slotProps={{
                    input: {
                      ...register('gasRateHigh'),
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
          {t('pages.manage-assets.import.network.components.Cosmos.index.addCustomNetwork')}
        </Button>
      </Footer>
      <TextBottomSheet
        open={isOpenCosmwasmBottomSheet}
        onClose={() => setIsOpenCosmwasmBottomSheet(false)}
        optionValues={['True', 'False']}
        currentOptionValue={isSupportCosmwasm}
        onClickOption={(val) => {
          setIsSupportCosmwasm(val);
        }}
        bottomSheetTitle={t('pages.manage-assets.import.network.components.Cosmos.index.selectCosmwasm')}
      />
      <TextBottomSheet
        open={isOpenPubkeyStyleBottomSheet}
        onClose={() => setIsOpenPubkeyStyleBottomSheet(false)}
        optionValues={[PUBKEY_STYLE.secp256k1, PUBKEY_STYLE.ethsecp256k1]}
        currentOptionValue={selectedPubkeyStyle}
        onClickOption={(val) => {
          setSelectedPubkeyStyle(val);
        }}
        bottomSheetTitle={t('pages.manage-assets.import.network.components.Cosmos.index.selectPubkeyStyle')}
      />
    </FormContainer>
  );
}
