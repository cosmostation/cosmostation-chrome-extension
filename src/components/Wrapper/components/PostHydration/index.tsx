import { useEffect } from 'react';

import { checkMissingAddresses, fixSeiAddress } from '@/utils/storageSync/newChain';

type PostHydrationProps = {
  children: JSX.Element;
};

export default function PostHydration({ children }: PostHydrationProps) {
  useEffect(() => {
    void (async () => {
      startPostHydrationWorks();
    })();
  }, []);

  return <>{children}</>;
}

function startPostHydrationWorks() {
  void checkMissingAddresses();
  void fixSeiAddress();
}
