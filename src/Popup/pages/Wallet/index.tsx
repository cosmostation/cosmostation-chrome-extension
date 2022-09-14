import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';

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
