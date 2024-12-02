import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import IconTextButton from '@/components/common/IconTextButton';
import OutlinedInput from '@/components/common/OutlinedInput';
import SetAccountNameBottomSheet from '@/components/SetAccountNameBottomSheet';
import { toastError } from '@/utils/toast';

import {
  Body,
  ControlInputButtonContainer,
  ControlInputText,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  FormContainer,
  IconContainer,
  MarginRightTypography,
  PrivateKeyInputWrapper,
  StyledIconTextButton,
  TopContainer,
  ViewIconContainer,
} from './-styled';
import type { PrivateKeyForm } from './-useSchema';
import { useSchema } from './-useSchema';

import CloseIcon from '@/assets/images/icons/Close24.svg';
import PasteIcon from '@/assets/images/icons/Paste18.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

export default function Entry() {
  const { t } = useTranslation();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  const [isViewPrivateKey, setIsViewPrivateKey] = useState(false);

  const { privateKeyForm } = useSchema();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PrivateKeyForm>({
    resolver: joiResolver(privateKeyForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const { privateKey } = watch();
  const isPrivateKeyEntered = !!privateKey;

  const pasteFromClipboard = async () => {
    const clipboard = await navigator.clipboard.readText();

    reset({
      privateKey: clipboard,
    });
  };

  const clearAll = () => {
    reset({
      privateKey: '',
    });
  };

  const submit = (data: PrivateKeyForm) => {
    console.log('🚀 ~ submit ~ data:', data);
    setIsOpenSetAccountNameBottomSheet(true);
  };

  const setUpAccount = (accountName: string) => {
    // NOTE prev에는 프라이빗키나 uuid같은 데이터가 들어가야함
    // NOTE setNewAccount((prev) => ({ ...prev, accountName: data.name })); 이런식으로 단계마다 데이터를 추가하는 형태로 진행
    // NOTE 계정 생성 후 밸런스 fetch
    // NOTE 주요 밸런스 fetch될때 까지 가벼운 로딩
    // NOTE 로딩 후 대시보드로 이동
    console.log('🚀 ~ setUpAccount ~ accountName:', accountName);
  };

  useEffect(() => {
    if (errors.privateKey?.message) {
      toastError(errors.privateKey.message);
    }
  }, [errors]);

  return (
    <>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <BaseBody>
          <Body>
            <DescriptionContainer>
              <DescriptionTitle variant="h2_B">{t('pages.account.restore-wallet.privatekey.index.title')}</DescriptionTitle>
              <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.account.restore-wallet.privatekey.index.subTitle')}</DescriptionSubTitle>
            </DescriptionContainer>
            <PrivateKeyInputWrapper>
              <TopContainer>
                <IconTextButton
                  trailingIcon={<ViewIconContainer>{isViewPrivateKey ? <ViewHideIcon /> : <ViewIcon />}</ViewIconContainer>}
                  onClick={() => {
                    setIsViewPrivateKey(!isViewPrivateKey);
                  }}
                >
                  <MarginRightTypography variant="b2_M">{t('pages.account.restore-wallet.privatekey.index.privateKey')}</MarginRightTypography>
                </IconTextButton>
              </TopContainer>

              <Controller
                name="privateKey"
                control={control}
                render={({ field }) => (
                  <OutlinedInput
                    placeholder={t('pages.account.restore-wallet.privatekey.index.enterPrivateKey')}
                    multiline
                    minRows={5}
                    type={isViewPrivateKey ? 'text' : 'password'}
                    error={!!errors.privateKey}
                    // NOTE: 다른것처럼 register가 적용이 안된다??
                    // slotProps={{
                    //   input: {
                    //     ...register('privateKey', { setValueAs: (v: string) => v.trim() }),
                    //   },
                    // }}
                    {...field}
                  />
                )}
              />

              <ControlInputButtonContainer>
                {isPrivateKeyEntered ? (
                  <StyledIconTextButton
                    leadingIcon={
                      <IconContainer>
                        <CloseIcon />
                      </IconContainer>
                    }
                    onClick={clearAll}
                  >
                    <ControlInputText variant="b3_R">{t('pages.account.restore-wallet.privatekey.index.clearAll')}</ControlInputText>
                  </StyledIconTextButton>
                ) : (
                  <StyledIconTextButton
                    leadingIcon={
                      <IconContainer>
                        <PasteIcon />
                      </IconContainer>
                    }
                    onClick={pasteFromClipboard}
                  >
                    <ControlInputText variant="b3_R">{t('pages.account.restore-wallet.privatekey.index.pasteFromClipboard')}</ControlInputText>
                  </StyledIconTextButton>
                )}
              </ControlInputButtonContainer>
            </PrivateKeyInputWrapper>
          </Body>
        </BaseBody>
        <BaseFooter>
          <Button type="submit" disabled={!isPrivateKeyEntered}>
            {t('pages.account.restore-wallet.privatekey.index.next')}
          </Button>
        </BaseFooter>
      </FormContainer>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setAccountName={setUpAccount}
      />
    </>
  );
}
