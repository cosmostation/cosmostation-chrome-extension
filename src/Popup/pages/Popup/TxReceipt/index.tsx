import Lock from '~/Popup/components/Lock';

import Entry from './Entry';
import Layout from './layout';

export default function TxReceipt() {
  return (
    <Lock>
      <Layout>
        <Entry />
      </Layout>
    </Lock>
  );
}
