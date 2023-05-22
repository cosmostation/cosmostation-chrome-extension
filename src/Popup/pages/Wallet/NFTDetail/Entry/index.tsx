import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Sui from './Sui';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'SUI') {
    return <Sui />;
  }

  return null;
}
