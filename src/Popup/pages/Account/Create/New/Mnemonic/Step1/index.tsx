import Lock from '~/Popup/components/Lock';

import Entry from './entry';
import Layout from './layout';

export default function Step1() {
  return (
    <Lock>
      <Layout>
        <Entry />
      </Layout>
    </Lock>
  );
}
