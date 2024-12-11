import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import IconTextButton from '@/components/common/IconTextButton';
import OutlinedInput from '@/components/common/OutlinedInput';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { aesDecrypt } from '@/utils/crypto';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  Body,
  ControlInputButtonContainer,
  CopyText,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  IconContainer,
  MarginRightTypography,
  PrivateKeyViewerContainer,
  StyledIconTextButton,
  TopContainer,
  ViewIconContainer,
} from './-styled';

import PasteIcon from '@/assets/images/icons/Paste18.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();
  const { currentPassword } = useCurrentPassword();

  const [isViewPrivateKey, setIsViewPrivateKey] = useState(false);

  const { accounts } = useExtensionStorageStore((state) => state);
  const account = accounts.find((item) => item.id === accountId);

  const encryptedPrivateKey = account?.type === 'PRIVATE_KEY' ? account.encryptedPrivateKey : '';
  const decryptedPrivateKey = currentPassword ? `0x${aesDecrypt(encryptedPrivateKey, currentPassword)}` : '';

  const copyToClipboard = () => {
    copy(decryptedPrivateKey);
    toastSuccess(t('pages.manage-account.view.privateKey.entry.copied'));
  };

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.manage-account.view.privateKey.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.manage-account.view.privateKey.entry.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>

          <PrivateKeyViewerContainer>
            <TopContainer>
              <IconTextButton
                trailingIcon={<ViewIconContainer>{isViewPrivateKey ? <ViewHideIcon /> : <ViewIcon />}</ViewIconContainer>}
                onClick={() => {
                  setIsViewPrivateKey(!isViewPrivateKey);
                }}
              >
                <MarginRightTypography variant="b2_M">{t('pages.manage-account.view.privateKey.entry.privateKey')}</MarginRightTypography>
              </IconTextButton>
            </TopContainer>

            <OutlinedInput multiline minRows={5} type={isViewPrivateKey ? 'text' : 'password'} hideViewIcon disabled value={decryptedPrivateKey} />

            <ControlInputButtonContainer>
              {
                <StyledIconTextButton
                  leadingIcon={
                    <IconContainer>
                      <PasteIcon />
                    </IconContainer>
                  }
                  onClick={copyToClipboard}
                >
                  <CopyText variant="b3_R">{t('pages.manage-account.view.privateKey.entry.copy')}</CopyText>
                </StyledIconTextButton>
              }
            </ControlInputButtonContainer>
          </PrivateKeyViewerContainer>
        </Body>
      </BaseBody>
    </>
  );
}
