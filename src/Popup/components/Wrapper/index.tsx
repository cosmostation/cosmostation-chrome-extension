import { Suspense } from 'react';

import Body from './Body';
import Init from './Init';
import Routes from './Routes';

type WrapperType = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperType) {
  return (
    <Body>
      <Init>
        <Routes>
          <Suspense fallback={null}>{children}</Suspense>
        </Routes>
      </Init>
    </Body>
  );
}
