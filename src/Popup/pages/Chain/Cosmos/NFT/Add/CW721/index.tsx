import Lock from '~/Popup/components/Lock';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Entry from './entry';
import Layout from './layout';

export default function CW721() {
  const { currentChain } = useCurrentChain();

  // NOTE 기존의 코드는 currentChain.line === 'COSMOS' && currentChain.cosmWasm 이었음
  if (currentChain.line === 'COSMOS') {
    return (
      <Lock>
        <Layout>
          <Entry chain={currentChain} />
        </Layout>
      </Lock>
    );
  }

  return null;
}
