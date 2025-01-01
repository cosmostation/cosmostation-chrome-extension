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
    // NOTE: 계정 첫 생성 플로우 중 발생하는 데이터는 전역변수에 저장 후 최종 단계에서 스토리지 set
    // NOTE setNewAccount((prev) => ({ ...prev, accountName: data.name })); 이런식으로 단계마다 데이터를 추가하는 형태로 진행
    // TODO 게정 첫 생성 플로우 중 유저 이탈 시 기존 입력 데이터 모두 삭제 처리.
    <Layout>
      <Entry />
    </Layout>
  );
}
