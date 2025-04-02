import { createFileRoute, redirect } from '@tanstack/react-router';

import { Route as AddWallet } from '@/pages/account/add-wallet';
import { getExtensionLocalStorage } from '@/utils/storage';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/set-password/')({
  component: SetPassword,
  loader: async () => {
    const comparisonPasswordHash = await getExtensionLocalStorage('comparisonPasswordHash');

    const isAlreadySetPassword = !!comparisonPasswordHash;

    if (isAlreadySetPassword) {
      return redirect({
        to: AddWallet.to,
      });
    }
  },
});

function SetPassword() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
