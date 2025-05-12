import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import validate, { Network } from 'bitcoin-address-validation';
import { isValidAddress } from 'ethereumjs-util';
import { produce } from 'immer';
import { joiResolver } from '@hookform/resolvers/joi';
import { isValidIotaAddress } from '@iota/iota-sdk/utils';
import { Typography } from '@mui/material';
import { isValidSuiAddress } from '@mysten/sui/utils';
import { useRouter } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import TextButton from '@/components/common/TextButton';
import { useAddressBook } from '@/hooks/useAddressBook';
import { useChainList } from '@/hooks/useChainList.ts';
import type { ChainType, CosmosChain, UniqueChainId } from '@/types/chain.ts';
import { isBitcoinChain } from '@/utils/chain';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator.ts';
import { aptosAddressRegex, getCosmosAddressRegex } from '@/utils/regex';
import { toastError, toastSuccess } from '@/utils/toast';

import { Container, FooterContainer, FormContainer, InputWrapper, RedTextContainer, UniversalContainer } from './-styled';
import type { AddressBookForm } from './-useSchema';
import { useSchema } from './-useSchema';

import EVMImage from '@/assets/images/chain/evm.png';

const UNIVERSAL_EVM_NETWORK_ID = 'universal';

type EntryProps = {
  id: string;
};

export default function Entry({ id }: EntryProps) {
  const { t } = useTranslation();
  const { history } = useRouter();

  const { addressBookList, editAddressItem, removeAddressItem } = useAddressBook();

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

  const currentAddressItem = addressBookList.find((item) => item.id === id);

  const [currentChainId, setCurrentChainId] = useState<UniqueChainId | undefined>(currentAddressItem?.chainId);
  const currentChain = baseChainList.find((chain) => isMatchingUniqueChainId(chain, currentChainId));

  const isDisplayMemo = currentChain?.chainType === 'cosmos';
  const isUniversalChain = currentChainId === `${UNIVERSAL_EVM_NETWORK_ID}__evm`;

  const checkIsValidAddress = (address: string) => {
    if (currentChain?.chainType === 'cosmos') {
      const chainCasted = currentChain as CosmosChain;
      return getCosmosAddressRegex(chainCasted.accountPrefix, [39]).test(address);
    }

    if (currentChain?.chainType === 'evm') {
      return isValidAddress(address);
    }

    if (currentChain?.chainType === 'aptos') {
      return aptosAddressRegex.test(address);
    }

    if (currentChain?.chainType === 'sui') {
      return isValidSuiAddress(address);
    }

    if (currentChain?.chainType === 'iota') {
      return isValidIotaAddress(address);
    }

    if (isBitcoinChain(currentChain)) {
      const network = currentChain.isTestnet ? Network.testnet : Network.mainnet;
      return validate(address, network);
    }
    return false;
  };

  const { addressBookForm } = useSchema({ checkIsValidAddress });

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

  const submit = async (data: AddressBookForm) => {
    if (!currentChainId || !currentAddressItem) {
      toastError(t('pages.general-setting.address-book.edit-address.$id.entry.failedToGetChainId'));
      return;
    }
    const newAddressInfo = produce(currentAddressItem, (draft) => {
      draft.label = data.label;
      draft.address = data.address;
      draft.memo = data.memo;
    });

    await editAddressItem(newAddressInfo);
    toastSuccess(t('pages.general-setting.address-book.edit-address.$id.entry.editAddressSuccess'));
    reset();
    history.back();
  };

  const deleteAddressItem = async () => {
    if (!currentAddressItem) {
      toastError(t('pages.general-setting.address-book.edit-address.$id.entry.failedToDeleteAddress'));
      return;
    }

    await removeAddressItem(currentAddressItem.id);
    toastSuccess(t('pages.general-setting.address-book.edit-address.$id.entry.deleteAddressSuccess'));
    history.back();
  };

  useEffect(() => {
    reset({
      address: currentAddressItem?.address,
      label: currentAddressItem?.label,
      memo: currentAddressItem?.memo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            disabled
            label={t('pages.general-setting.address-book.edit-address.$id.entry.network')}
            rightAdornmentComponent={
              isUniversalChain ? (
                <UniversalContainer>
                  <Typography variant="b3_M">{t('pages.general-setting.address-book.edit-address.$id.entry.universal')}</Typography>
                </UniversalContainer>
              ) : undefined
            }
            bottomSheetTitle={t('pages.general-setting.address-book.edit-address.$id.entry.selectNetwork')}
            bottomSheetSearchPlaceholder={t('pages.general-setting.address-book.edit-address.$id.entry.searchNetwork')}
          />
        </Container>
        <InputWrapper>
          <StandardInput
            label={t('pages.general-setting.address-book.edit-address.$id.entry.label')}
            error={!!errors.label}
            helperText={errors.label?.message}
            slotProps={{
              input: {
                ...register('label'),
              },
            }}
          />

          <StandardInput
            label={t('pages.general-setting.address-book.edit-address.$id.entry.address')}
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
              label={t('pages.general-setting.address-book.edit-address.$id.entry.memo')}
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
        <FooterContainer>
          <Base1300Text variant="b3_R">{t('pages.general-setting.address-book.edit-address.$id.entry.deleteAddressDescription')}</Base1300Text>
          <RedTextContainer>
            <TextButton onClick={deleteAddressItem} variant="redHyperlink" typoVarient="b2_M">
              {t('pages.general-setting.address-book.edit-address.$id.entry.deleteAddress')}
            </TextButton>
          </RedTextContainer>
        </FooterContainer>
        <Button type="submit" disabled={!isButtonEnabled}>
          {t('pages.general-setting.address-book.edit-address.$id.entry.confirm')}
        </Button>
      </BaseFooter>
    </FormContainer>
  );
}
