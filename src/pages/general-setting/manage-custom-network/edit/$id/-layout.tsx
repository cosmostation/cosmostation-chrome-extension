import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useCustomChain } from '@/hooks/useCustomChain';
import type { UniqueChainId } from '@/types/chain';
import { toastSuccess } from '@/utils/toast';

import DeleteBottomSheet from './-components/DeleteBottomSheet';
import { DeleteTextContainer, IconContainer } from './-styled';

import DeleteIcon from '@/assets/images/icons/TrashBin20.svg';

type LayoutProps = {
  id: string;
  children: JSX.Element;
};

export default function Layout({ id, children }: LayoutProps) {
  const { t } = useTranslation();
  const { history } = useRouter();

  const { removeCustomChain } = useCustomChain();

  const [isOpenDeleteBottomSheet, setIsOpenDeleteBottomSheet] = useState(false);

  const handleDelete = async (id: UniqueChainId) => {
    await removeCustomChain(id);

    history.back();

    toastSuccess(t('pages.general-setting.manage-custom-network.edit.$id.layout.deleteSuccess'));
  };

  return (
    <BaseLayout
      header={
        <>
          <Header
            leftContent={<NavigationPanel />}
            middleContent={<Base1300Text variant="h4_B">{t('pages.general-setting.manage-custom-network.edit.$id.header')}</Base1300Text>}
            rightContent={
              <IconTextButton
                onClick={() => {
                  setIsOpenDeleteBottomSheet(true);
                }}
                leadingIcon={
                  <IconContainer>
                    <DeleteIcon />
                  </IconContainer>
                }
              >
                <DeleteTextContainer>
                  <Typography variant="b3_M">{t('pages.general-setting.manage-custom-network.edit.$id.delete')}</Typography>
                </DeleteTextContainer>
              </IconTextButton>
            }
          />
          <DeleteBottomSheet
            open={isOpenDeleteBottomSheet}
            onClose={() => setIsOpenDeleteBottomSheet(false)}
            onClickConfirm={() => {
              handleDelete(id as UniqueChainId);
            }}
          />
        </>
      }
    >
      {children}
    </BaseLayout>
  );
}
