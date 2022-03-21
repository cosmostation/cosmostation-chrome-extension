import AccessRequest from '~/Popup/components/AccessRequest';
import Lock from '~/Popup/components/Lock';

import Entry from './Entry';
import Layout from './layout';

export default function Wallet() {
  return (
    <Lock>
      <AccessRequest>
        <Layout>
          <Entry />
        </Layout>
      </AccessRequest>
    </Lock>
  );
}
