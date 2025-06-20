import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import ChainSelectBox from '@/components/ChainSelectBox';
import Base1000Text from '@/components/common/Base1000Text';
import BaseSelectBox from '@/components/common/BaseSelectBox';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import { PUBKEY_STYLE, PUBKEY_TYPE_MAP } from '@/constants/cosmos';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import type { CustomAsset } from '@/types/asset';
import type { ChainType, CustomCosmosChain } from '@/types/chain';
import type { NodeInfoPayload } from '@/types/nodeInfo';
import { get, isAxiosError } from '@/utils/axios';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { isNumber } from '@/utils/string';
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
import TextBottomSheet from './TextBottomSheet';
import type { AddChainForm } from './useSchema';
import { useSchema } from './useSchema';

import CosmosImage from '@/assets/images/chain/cosmos.png';

export const UNIVERSAL_NETWORK_ID = 'universal';

type CosmosProps = {
  id: string;
};

export default function Cosmos({ id }: CosmosProps) {
  const { t } = useTranslation();

  const { addedCustomChainList, editCustomChain } = useCustomChain();
  const { customAssets, editCustomAsset } = useCustomAssets();

  const matchingCustomChain = addedCustomChainList.find((chain) => isMatchingUniqueChainId(chain, id));
  const matchingCustomAsset = customAssets.find((asset) => getUniqueChainIdWithManual(asset.chainId, asset.chainType) === id);

  const [isOpenCosmwasmBottomSheet, setIsOpenCosmwasmBottomSheet] = useState(false);
  const [isOpenPubkeyStyleBottomSheet, setIsOpenPubkeyStyleBottomSheet] = useState(false);

  const [inputCosmwasm, setInputCosmwasm] = useState('');
  const [inputPubkeyStyle, setInputPubkeyStyle] = useState('');

  const isSupportCosmwasm = useMemo(() => {
    if (inputCosmwasm) {
      return inputCosmwasm;
    }

    return matchingCustomChain?.chainType === 'cosmos' ? (matchingCustomChain?.isCosmwasm ? 'True' : 'False') : 'False';
  }, [inputCosmwasm, matchingCustomChain]);

  const selectedPubkeyStyle = useMemo(() => {
    if (inputPubkeyStyle) {
      return inputPubkeyStyle;
    }

    return matchingCustomChain?.chainType === 'cosmos' ? matchingCustomChain?.accountTypes[0].pubkeyStyle : PUBKEY_STYLE.secp256k1;
  }, [matchingCustomChain?.accountTypes, matchingCustomChain?.chainType, inputPubkeyStyle]);

  const baseChainList = [
    {
      id: UNIVERSAL_NETWORK_ID,
      name: 'Cosmos Network',
      image: CosmosImage,
      chainType: 'cosmos' as ChainType,
    },
  ];

  const [isProcessing, setIsProcessing] = useState(false);

  const { addChainForm } = useSchema();

  const defaultValues: AddChainForm | undefined = (() => {
    if (matchingCustomChain?.chainType === 'cosmos' && matchingCustomAsset) {
      return {
        chainName: matchingCustomChain.name,
        mainAssetDenom: matchingCustomChain.mainAssetDenom,
        accountPrefix: matchingCustomChain.accountPrefix,
        lcdUrl: matchingCustomChain.lcdUrls[0].url,
        symbol: matchingCustomAsset.symbol,
        chainImage: matchingCustomChain.image || undefined,
        explorerURL: matchingCustomChain?.explorer?.url || undefined,
        tokenImageURL: matchingCustomAsset.image || undefined,
        decimals: matchingCustomAsset?.decimals || 6,
        coinType: matchingCustomChain.accountTypes[0].hdPath.split('/')[2].replace("'", '') || '118',
        defaultGasLimit: String(matchingCustomChain?.feeInfo.defaultGasLimit) || '300000',
        gasRateLow: matchingCustomChain?.feeInfo.gasRate[0].replace(matchingCustomChain.mainAssetDenom, '') || '0.00025',
        gasRateAverage: matchingCustomChain?.feeInfo.gasRate[1].replace(matchingCustomChain.mainAssetDenom, '') || '0.0025',
        gasRateHigh: matchingCustomChain?.feeInfo.gasRate[2].replace(matchingCustomChain.mainAssetDenom, '') || '0.025',
        coinGeckoId: matchingCustomAsset?.coinGeckoId || undefined,
      };
    }
  })();

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
    defaultValues: defaultValues,
  });

  const { chainName, mainAssetDenom, accountPrefix, lcdUrl, symbol } = watch();

  const gasRateError = useMemo(() => {
    const error = errors[''];
    if (error?.type === 'object.and') {
      return error.message;
    }
    return '';
  }, [errors]);

  const isButtonEnabled = chainName && mainAssetDenom && accountPrefix && lcdUrl && symbol && (isDirty || inputCosmwasm || inputPubkeyStyle);

  const submit = async (data: AddChainForm) => {
    try {
      if (!matchingCustomChain || !matchingCustomAsset) {
        throw Error('Failed to find matching custom chain');
      }
      setIsProcessing(true);

      const removedTrailingSlashUrl = data.lcdUrl.endsWith('/') ? data.lcdUrl.slice(0, -1) : data.lcdUrl;
      const nodeInfo = await get<NodeInfoPayload>(`${removedTrailingSlashUrl}/cosmos/base/tendermint/v1beta1/node_info`);

      if (!nodeInfo?.default_node_info?.network) {
        throw new Error(t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.restURLError'));
      }

      const chainId = nodeInfo.default_node_info.network;

      if (matchingCustomChain.chainId !== chainId) {
        throw new Error(t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.chainIdError'));
      }

      const formattedCoinType = data.coinType ? (data.coinType.endsWith("'") ? data.coinType : `${data.coinType}'`) : "118'";
      const removedTrailingSlashExplorerUrl = data.explorerURL?.endsWith('/') ? data.explorerURL.slice(0, -1) : data.explorerURL;

      const updatedChain: CustomCosmosChain = {
        id: matchingCustomChain.id,
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
        id: updatedChain.mainAssetDenom,
        chainId: updatedChain.id,
        chainType: 'cosmos',
        type: 'native',
        name: data.symbol,
        symbol: data.symbol,
        decimals: data.decimals || 6,
        image: data.tokenImageURL || '',
        coinGeckoId: data.coinGeckoId || '',
      };

      await editCustomChain(getUniqueChainId(matchingCustomChain), updatedChain);

      await editCustomAsset(getCoinId(matchingCustomAsset), mainCoin);

      toastSuccess(t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.success'));
      history.back();
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status) {
          toastError(t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.restURLError'));
        }
      } else {
        const message = (e as { message?: string }).message
          ? (e as { message: string }).message
          : t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.error');
        toastError(message);
      }
    } finally {
      setIsProcessing(false);
      reset();
    }
  };
  return (
    <>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <BaseBody>
          <Container>
            <ChainSelectBox
              chainList={baseChainList}
              currentChainId={getUniqueChainId(baseChainList[0])}
              disabled
              label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.network')}
              bottomSheetTitle={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.selectNetwork')}
              bottomSheetSearchPlaceholder={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.searchNetwork')}
            />
          </Container>
          <InputWrapper>
            <StandardInput
              label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.chainName')}
              error={!!errors.chainName}
              helperText={errors.chainName?.message}
              slotProps={{
                input: {
                  ...register('chainName'),
                },
              }}
            />
            <StandardInput
              label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.restURL')}
              error={!!errors.lcdUrl}
              helperText={errors.lcdUrl?.message}
              slotProps={{
                input: {
                  ...register('lcdUrl'),
                },
              }}
            />
            <StandardInput
              label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.denom')}
              error={!!errors.mainAssetDenom}
              helperText={errors.mainAssetDenom?.message}
              slotProps={{
                input: {
                  ...register('mainAssetDenom'),
                },
              }}
            />
            <StandardInput
              label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.symbol')}
              error={!!errors.symbol}
              helperText={errors.symbol?.message}
              slotProps={{
                input: {
                  ...register('symbol'),
                },
              }}
            />

            <StandardInput
              label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.accountPrefix')}
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
                    <Base1000Text variant="h4_B">{t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.advanced')}</Base1000Text>
                  </ItemLeftContainer>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                  <InputWrapper>
                    <StandardInput
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.decimals')}
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
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.coinTypePath')}
                      error={!!errors.coinType}
                      helperText={errors.coinType?.message}
                      slotProps={{
                        input: {
                          ...register('coinType'),
                        },
                      }}
                    />

                    <StandardInput
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.chainImage')}
                      error={!!errors.chainImage}
                      helperText={errors.chainImage?.message}
                      slotProps={{
                        input: {
                          ...register('chainImage'),
                        },
                      }}
                    />

                    <StandardInput
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.tokenImageURL')}
                      error={!!errors.tokenImageURL}
                      helperText={errors.tokenImageURL?.message}
                      slotProps={{
                        input: {
                          ...register('tokenImageURL'),
                        },
                      }}
                    />

                    <StandardInput
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.exploreURL')}
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
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.defaultGasLimit')}
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
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.gasRateLow')}
                      error={!!gasRateError}
                      helperText={gasRateError}
                      slotProps={{
                        input: {
                          ...register('gasRateLow'),
                        },
                      }}
                    />

                    <StandardInput
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.gasRateAverage')}
                      error={!!gasRateError}
                      helperText={gasRateError}
                      slotProps={{
                        input: {
                          ...register('gasRateAverage'),
                        },
                      }}
                    />

                    <StandardInput
                      label={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.gasRateHigh')}
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
        </BaseBody>
        <Footer>
          <Button type="submit" disabled={!isButtonEnabled} isProgress={isProcessing}>
            {t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.confirm')}
          </Button>
        </Footer>
      </FormContainer>
      <TextBottomSheet
        open={isOpenCosmwasmBottomSheet}
        onClose={() => setIsOpenCosmwasmBottomSheet(false)}
        optionValues={['True', 'False']}
        currentOptionValue={isSupportCosmwasm}
        onClickOption={(val) => {
          setInputCosmwasm(val);
        }}
        bottomSheetTitle={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.selectCosmwasm')}
      />
      <TextBottomSheet
        open={isOpenPubkeyStyleBottomSheet}
        onClose={() => setIsOpenPubkeyStyleBottomSheet(false)}
        optionValues={[PUBKEY_STYLE.secp256k1, PUBKEY_STYLE.ethsecp256k1]}
        currentOptionValue={selectedPubkeyStyle}
        onClickOption={(val) => {
          setInputPubkeyStyle(val);
        }}
        bottomSheetTitle={t('pages.general-setting.manage-custom-network.edit.$id.Entry.Cosmos.selectPubkeyStyle')}
      />
    </>
  );
}
