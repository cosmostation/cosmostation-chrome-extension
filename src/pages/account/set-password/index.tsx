import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/set-password/')({
  component: SetPassword,
  // FIXME comparisonPasswordHash이 로컬스토리지에 존재하면  '/account/add-wallet/'로 리다이렉트
  // 없으면 SetPassword 컴포넌트 렌더링
});

function SetPassword() {
  return (
    // NOTE: 계정 첫 생성 플로우 중 발생하는 데이터는 전역변수에 저장 후 최종 단계에서 스토리지 set
    // NOTE setNewAccount((prev) => ({ ...prev, accountName: data.name })); 이런식으로 단계마다 데이터를 추가하는 형태로 진행
    // TODO 게정 첫 생성 플로우 중 유저 이탈 시 기존 입력 데이터 모두 삭제 처리.
    // TODO: 로컬 스토리지에 비밀번호가 있는지 확인하고 있다면 add-wallet 페이지로 이동
    <Layout>
      <Entry />
    </Layout>
  );
}
