import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';

import Entry from './entry';
import Layout from './layout';

export default function RequestAccount() {
  return (
    <Lock>
      <AccessRequest>
        <ActivateChainRequest>
          <Layout>
            <Entry />
          </Layout>
        </ActivateChainRequest>
      </AccessRequest>
    </Lock>
  );
}
