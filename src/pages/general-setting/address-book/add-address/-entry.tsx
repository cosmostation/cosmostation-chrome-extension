import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import InformationPanel from '@/components/InformationPanel';
import { useAddressBook } from '@/hooks/useAddressBook';
import { useChainList } from '@/hooks/useChainList.ts';
import type { ChainType, CosmosChain, UniqueChainId } from '@/types/chain.ts';
import type { AddressInfo } from '@/types/extension';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator.ts';
import { aptosAddressRegex, bitcoinAddressRegex, ethereumAddressRegex, getCosmosAddressRegex, suiAddressRegex } from '@/utils/regex';
import { toastError, toastSuccess } from '@/utils/toast';

import { Container, FormContainer, InformationPanelContainer, InputWrapper, UniversalContainer } from './-styled';
import type { AddressBookForm } from './-useSchema';
import { useSchema } from './-useSchema';

import EVMImage from '@/assets/images/chain/evm.png';

export const UNIVERSAL_EVM_NETWORK_ID = 'universal';

export default function Entry() {
  const { t } = useTranslation();
  const { history } = useRouter();

  const { addAddressItem } = useAddressBook();

  const { flatChainList } = useChainList();

  const baseChainList = [
    {
      id: UNIVERSAL_EVM_NETWORK_ID,
      name: 'EVM Network',
      image: EVMImage,
      chainType: 'evm' as ChainType,
    },
    ...flatChainList,
  ];

  const defaultChain = baseChainList[0] || undefined;
  const defaultChainId = defaultChain ? getUniqueChainId(defaultChain) : undefined;

  const [currentChainId, setCurrentChainId] = useState<UniqueChainId | undefined>(defaultChainId);
  const currentChain = baseChainList.find((chain) => isMatchingUniqueChainId(chain, currentChainId));

  const isDisplayMemo = currentChain?.chainType === 'cosmos';
  const isUniversalChain = currentChainId === `${UNIVERSAL_EVM_NETWORK_ID}__evm`;

  const regex = (() => {
    if (currentChain?.chainType === 'cosmos') {
      const chainCasted = currentChain as CosmosChain;
      return getCosmosAddressRegex(chainCasted.accountPrefix, [39]);
    }

    if (currentChain?.chainType === 'evm') {
      return ethereumAddressRegex;
    }

    if (currentChain?.chainType === 'aptos') {
      return aptosAddressRegex;
    }

    if (currentChain?.chainType === 'sui') {
      return suiAddressRegex;
    }

    if (currentChain?.chainType === 'bitcoin') {
      return bitcoinAddressRegex;
    }

    return /^.*$/;
  })();

  const { addressBookForm } = useSchema({ regex });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddressBookForm>({
    resolver: joiResolver(addressBookForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const { address, label } = watch();
  const isButtonEnabled = address && label;

  // TODO : Implement submit function
  const submit = async (data: AddressBookForm) => {
    if (!currentChainId) {
      toastError(t('pages.general-setting.address-book.add-address.entry.failedToGetChainId'));
      return;
    }
    const newAddressInfo: AddressInfo = { id: uuidv4(), chainId: currentChainId, ...data };

    await addAddressItem(newAddressInfo);
    toastSuccess(t('pages.general-setting.address-book.add-address.entry.addAddressSuccess'));
    reset();
    history.back();
  };

  useEffect(() => {
    if (!currentChainId) {
      setCurrentChainId(defaultChainId);
    }
  }, [currentChainId, defaultChainId]);

  return (
    <FormContainer onSubmit={handleSubmit(submit)}>
      <BaseBody>
        <Container>
          <ChainSelectBox
            chainList={baseChainList}
            currentChainId={currentChainId}
            onClickChain={(chainId) => {
              setCurrentChainId(chainId);
            }}
            label={t('pages.general-setting.address-book.add-address.entry.network')}
            rightAdornmentComponent={
              isUniversalChain ? (
                <UniversalContainer>
                  <Typography variant="b3_M">{t('pages.general-setting.address-book.add-address.entry.universal')}</Typography>
                </UniversalContainer>
              ) : undefined
            }
            bottomSheetTitle={t('pages.general-setting.address-book.add-address.entry.selectNetwork')}
            bottomSheetSearchPlaceholder={t('pages.general-setting.address-book.add-address.entry.searchNetwork')}
          />
        </Container>
        <InputWrapper>
          <StandardInput
            label={t('pages.general-setting.address-book.add-address.entry.label')}
            error={!!errors.label}
            helperText={errors.label?.message}
            slotProps={{
              input: {
                ...register('label'),
              },
            }}
          />

          <StandardInput
            label={t('pages.general-setting.address-book.add-address.entry.address')}
            error={!!errors.address}
            helperText={errors.address?.message}
            slotProps={{
              input: {
                ...register('address'),
              },
            }}
          />
          {isDisplayMemo && (
            <StandardInput
              label={t('pages.general-setting.address-book.add-address.entry.memo')}
              error={!!errors.memo}
              helperText={errors.memo?.message}
              multiline
              maxRows={3}
              slotProps={{
                input: {
                  ...register('memo'),
                },
              }}
            />
          )}
        </InputWrapper>
      </BaseBody>
      <BaseFooter>
        {(isDisplayMemo || isUniversalChain) && (
          <InformationPanelContainer>
            <InformationPanel
              varitant="info"
              title={
                <Typography variant="b3_M">
                  {isDisplayMemo
                    ? t('pages.general-setting.address-book.add-address.entry.memoInfo')
                    : t('pages.general-setting.address-book.add-address.entry.unversalAddressInfo')}
                </Typography>
              }
              body={
                <Typography variant="b4_R_Multiline">
                  {isDisplayMemo
                    ? t('pages.general-setting.address-book.add-address.entry.memoInfoDescription')
                    : t('pages.general-setting.address-book.add-address.entry.unversalAddressInfoDescription')}
                </Typography>
              }
            />
          </InformationPanelContainer>
        )}

        <Button type="submit" disabled={!isButtonEnabled}>
          {t('pages.general-setting.address-book.add-address.entry.confirm')}
        </Button>
      </BaseFooter>
    </FormContainer>
  );
}
