import Lock from '~/Popup/components/Lock';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Entry from './entry';
import Layout from './layout';

export default function CW721() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS' && currentChain.cosmWasm) {
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
