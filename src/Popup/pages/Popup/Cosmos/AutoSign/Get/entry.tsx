import { useEffect } from 'react';

import { COSMOS_CHAINS } from '~/constants/chain';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentAutoSigns } from '~/Popup/hooks/useCurrent/useCurrentAutoSigns';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { CosGetAutoSign, CosGetAutoSignResponse } from '~/types/cosmos/message';

type EntryProps = {
  queue: Queue<CosGetAutoSign>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  const { currentAutoSigns } = useCurrentAutoSigns();

  const cosmosChains = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains];

  const { message, messageId, origin } = queue;

  const { params } = message;

  const chain = cosmosChains.find((item) => item.chainName === params.chainName);

  useEffect(() => {
    const currentTime = new Date().getTime();
    const autoSign = currentAutoSigns.find(
      (item) => item.accountId === currentAccount.id && item.chainId === chain?.id && item.origin === origin && item.startTime + item.duration > currentTime,
    );

    const result: CosGetAutoSignResponse = autoSign ? autoSign.startTime + autoSign.duration : null;

    responseToWeb({
      response: {
        result,
      },
      message,
      messageId,
      origin,
    });

    void deQueue();
  }, [chain?.id, currentAccount.id, currentAutoSigns, deQueue, message, messageId, origin]);

  return null;
}
