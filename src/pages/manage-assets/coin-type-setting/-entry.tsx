import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinTypeSelector from '@/components/CoinTypeSelector';
import Button from '@/components/common/Button';
import InformationPanel from '@/components/InformationPanel';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { getDefaultAccountTypes } from '@/libs/accountType';
import { Route as Dashboard } from '@/pages/index';
import type { ChainToAccountTypeMap } from '@/types/account';
import type { ChainAccountType } from '@/types/chain';
import { toastError, toastSuccess } from '@/utils/toast';
import { addPreferAccountType } from '@/utils/zustand/preferAccountType';

import { Body, Footer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currentAccount } = useCurrentAccount();

  const [preferAccountTypes, setPreferAccountTypes] = useState<ChainToAccountTypeMap>({});

  const setUp = async () => {
    try {
      await addPreferAccountType(currentAccount.id, preferAccountTypes);

      navigate({
        to: Dashboard.to,
      });

      toastSuccess(t('pages.manage-assets.coin-type-setting.entry.setupSuccess'));
    } catch {
      toastError(t('pages.manage-assets.coin-type-setting.entry.setupError'));
    }
  };

  const updateAccountType = (key: string, newAccountType: ChainAccountType) => {
    setPreferAccountTypes((prevAccountTypes) =>
      produce(prevAccountTypes, (draft) => {
        draft[key] = newAccountType;
      }),
    );
  };

  useEffect(() => {
    const fetchDefaultAccountTypes = async () => {
      const defaultPreferAccountTypes = await getDefaultAccountTypes();
      if (defaultPreferAccountTypes) {
        setPreferAccountTypes(defaultPreferAccountTypes);
      }
    };

    fetchDefaultAccountTypes();
  }, []);
  return (
    <>
      <BaseBody>
        <Body>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.manage-assets.coin-type-setting.entry.infoTitle')}</Typography>}
            body={<Typography variant="b4_R_Multiline">{t('pages.manage-assets.coin-type-setting.entry.infoBody')}</Typography>}
          />
          <CoinTypeSelector
            accountId={currentAccount.id}
            currentPreferAccountTypes={preferAccountTypes}
            variant="filtered"
            onClickChainType={(id, acc) => {
              updateAccountType(id, acc);
            }}
          />
        </Body>
      </BaseBody>
      <Footer>
        <Button
          onClick={async () => {
            await setUp();
          }}
        >
          {t('pages.manage-assets.coin-type-setting.entry.complete')}
        </Button>
      </Footer>
    </>
  );
}
