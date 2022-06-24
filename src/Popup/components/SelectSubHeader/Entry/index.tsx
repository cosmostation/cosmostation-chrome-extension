import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Ethereum from './Ethereum';
import Tendermint from './Tendermint';

type EntryProps = {
  isShowChain: boolean;
};

export default function Entry({ isShowChain }: EntryProps) {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'TENDERMINT') {
    return <Tendermint chain={currentChain} isShowChain={isShowChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum chain={currentChain} isShowChain={isShowChain} />;
  }

  return null;
}
