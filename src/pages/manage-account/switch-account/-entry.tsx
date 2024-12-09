import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button/index.tsx';
import { Route as AddWallet } from '@/pages/account/add-wallet';

import MnemonicAccount from './-components/MnemonicAccount';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // const mnemonicList = ['b58662f8-cde7-444f-a394-180e6f441afc', 'b58662f8-cde7-444f-a394-180e6f441afc'];

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <MnemonicAccount mnemonicRestoreString="c37b134dcf0daa6fb42b82261b56d835fee00ebc369c63860046b9e84d9c57928a5a366d6619e1a4faa14c414c119b659fe9acd04ad9d898228e5bf22e5440db" />
        </EdgeAligner>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            navigate({ to: AddWallet.to });
          }}
        >
          {t('pages.manage-account.switch-account.layout.addWallet')}
        </Button>
      </BaseFooter>
    </>
  );
}
