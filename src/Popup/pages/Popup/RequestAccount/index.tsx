import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import ActivateChainRequest from '~/Popup/components/requests/ActivateChainRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';

import Entry from './entry';
import Layout from './layout';

export default function RequestAccount() {
  return (
    <Lock>
      <LedgerPublicKeyRequest>
        <AccessRequest>
          <ActivateChainRequest>
            <Layout>
              <Entry />
            </Layout>
          </ActivateChainRequest>
        </AccessRequest>
      </LedgerPublicKeyRequest>
    </Lock>
  );
}
