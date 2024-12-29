import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import TextButton from '@/components/common/TextButton';
import { useChainList } from '@/hooks/useChainList.ts';
import type { ChainType, CosmosChain, UniqueChainId } from '@/types/chain.ts';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator.ts';
import { aptosAddressRegex, bitcoinAddressRegex, ethereumAddressRegex, getCosmosAddressRegex, suiAddressRegex } from '@/utils/regex';
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

  const dummyAddressList = [
    {
      id: '471c6230-bc54-47d2-aa9d-61e7c3ab0ba3',
      label: 'test',
      address: 'cosmos1p3ucd3ptpw902fluyjzhq3ffgq4ntddac9sa3s',
      chainId: 'cosmos-cosmos' as UniqueChainId,
      memo: 'test Memo',
    },

    {
      id: '914f2218-ccdf-4e45-9501-9e96def4c2dc',
      label: 'test',
      address: 'cosmos1p3ucd3ptpw902fluyjzhq3ffgq4ntddac9sa3s',
      chainId: 'cosmos-cosmos' as UniqueChainId,
      memo: 'ENS',
    },
    {
      id: '0c182fbc-1101-45aa-a4f5-76ba046b9265',
      label: 'test',
      address: 'cosmos1p3ucd3ptpw902fluyjzhq3ffgq4ntddac9sa3s',
      chainId: 'cosmos-cosmos' as UniqueChainId,
      memo: 'dm,ajfklsadnknsdakfnfjsadknjdnbjafsjknjkdsjkfksksdahufhhdsjkfhjkashdjfkasjkbjksbdajbasbsjkadsjafakh',
    },
    {
      id: 'e88c574e-101a-4f4d-9cca-9791e98cda44',
      label: 'test',
      address: 'cosmos1p3ucd3ptpw902fluyjzhq3ffgq4ntddac9sa3s',
      chainId: 'cosmos-cosmos' as UniqueChainId,
    },
  ];

  const currentAddressItem = dummyAddressList.find((item) => item.id === id);

  const [currentChainId, setCurrentChainId] = useState<UniqueChainId | undefined>(currentAddressItem?.chainId);
  const currentChain = baseChainList.find((chain) => isMatchingUniqueChainId(chain, currentChainId));

  const isDisplayMemo = currentChain?.chainType === 'cosmos';
  const isUniversalChain = currentChainId === `${UNIVERSAL_EVM_NETWORK_ID}-evm`;

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
    if (!currentChainId || !currentAddressItem) {
      toastError(t('pages.general-setting.address-book.edit-address.$id.entry.failedToGetChainId'));
      return;
    }
    const newAddressInfo = produce(currentAddressItem, (draft) => {
      draft.label = data.label;
      draft.address = data.address;
      draft.memo = data.memo;
    });

    console.log('🚀 ~ submit ~ newAddressInfo:', newAddressInfo);

    // const newAddressBook = [...addressBook, newAddressInfo];
    // await setExtensionStorage('addressBook', newAddressBook);
    toastSuccess(t('pages.general-setting.address-book.edit-address.$id.entry.editAddressSuccess'));
    reset();
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
          {/* FIXME 선택 가능한지 확인 필요 */}
          <ChainSelectBox
            chainList={baseChainList}
            currentChainId={currentChainId}
            onClickChain={(chainId) => {
              setCurrentChainId(chainId);
            }}
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
            <TextButton variant="redHyperlink" typoVarient="b2_M">
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
