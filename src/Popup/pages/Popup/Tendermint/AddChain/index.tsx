import AccessRequest from '~/Popup/components/AccessRequest';
import Lock from '~/Popup/components/Lock';

import Entry from './entry';
import Layout from './layout';

export default function AddChain() {
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
