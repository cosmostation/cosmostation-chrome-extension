import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/set-password/')({
  component: SetPassword,
});

function SetPassword() {
  return (
    // NOTE: 계정 첫 생성 플로우 중 발생하는 데이터는 전역변수에 저장 후 최종 단계에서 스토리지 set
    // TODO 게정 첫 생성 플로우 중 유저 이탈 시 기존 입력 데이터 모두 삭제 처리.
    // TODO: 로컬 스토리지에 비밀번호가 있는지 확인하고 있다면 add-wallet 페이지로 이동
    <Layout>
      <Entry />
    </Layout>
  );
}
