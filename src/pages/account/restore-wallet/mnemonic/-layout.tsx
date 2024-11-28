// NOTE index.tsx

// import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';

// import Lock from '~/Popup/components/Lock';

// import Entry from './entry';
// import Layout from './layout';

// export default function Step1() {
//   return (
//     <Lock>
//       <Layout>
//         <Entry />
//       </Layout>
//     </Lock>
//   );
// }

// NOTE layout.tsx

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  //   const { t } = useTranslation();

  return <BaseLayout>{children}</BaseLayout>;
}
