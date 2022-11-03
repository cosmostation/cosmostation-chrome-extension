import Lock from '~/Popup/components/Lock';

import Entry from './entry';
import Layout from './layout';

export default function SEARCHTOKEN() {
  return (
    <Lock>
      <Layout>
        <Entry currentTokens={null} />
      </Layout>
    </Lock>
  );
}
