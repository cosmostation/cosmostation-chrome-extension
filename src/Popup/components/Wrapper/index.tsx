import Layout from '~/Popup/components/Layout';

import Init from './Init';
import Routes from './Routes';

type WrapperType = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperType) {
  return (
    <Init>
      <Layout>
        <Routes>{children}</Routes>
      </Layout>
    </Init>
  );
}
