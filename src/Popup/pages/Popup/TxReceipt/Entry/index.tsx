import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { CHAINS } from '~/constants/chain';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';

import Aptos from './Aptos/entry';
import Cosmos from './Cosmos/entry';
import Ethereum from './Ethereum/entry';
import Sui from './Sui/entry';

export default function Entry() {
  const params = useParams();
  const { currentChain } = useCurrentChain();

  const chain = useMemo(
    () => (params?.chainId ? CHAINS.find((item) => isEqualsIgnoringCase(item.id, params.chainId)) || currentChain : currentChain),
    [currentChain, params.chainId],
  );

  const txHash = useMemo(() => params.txhash || '', [params.txhash]);

  if (chain.line === 'COSMOS') {
    return <Cosmos chain={chain} txHash={txHash} />;
  }

  if (chain.line === 'ETHEREUM') {
    return <Ethereum txHash={txHash} />;
  }

  if (chain.line === 'APTOS') {
    return <Aptos txHash={txHash} />;
  }

  if (chain.line === 'SUI') {
    return <Sui txDigest={txHash} />;
  }

  return null;
}
