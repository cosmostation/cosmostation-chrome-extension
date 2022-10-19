import Lock from '~/Popup/components/Lock';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Entry from './entry';
import Layout from './layout';

export default function Add() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'APTOS') {
    return (
      <Lock>
        <Layout>
          <Entry />
        </Layout>
      </Lock>
    );
  }

  return null;
}
