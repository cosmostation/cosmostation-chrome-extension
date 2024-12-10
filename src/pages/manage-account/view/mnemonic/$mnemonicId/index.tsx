import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/view/mnemonic/$mnemonicId/')({
  component: ViewMnemonic,
});

function ViewMnemonic() {
  const params = Route.useParams();

  return (
    // NOTE 똑같은 param을 넘기는데 중복코드 같은데 프로바이더 구조로 개선 가능성 고려필요
    <Layout mnemonicId={params.mnemonicId}>
      <Entry mnemonicId={params.mnemonicId} />
    </Layout>
  );
}
