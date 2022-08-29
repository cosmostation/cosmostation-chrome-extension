import { useEffect } from 'react';

import { COSMOS_CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentAutoSigns } from '~/Popup/hooks/useCurrent/useCurrentAutoSigns';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { CosDeleteAutoSign, CosDeleteAutoSignResponse } from '~/types/message/cosmos';

type EntryProps = {
  queue: Queue<CosDeleteAutoSign>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage } = useChromeStorage();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  const { autoSigns } = chromeStorage;
  const { removeAutoSign } = useCurrentAutoSigns();

  const cosmosChains = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains];

  const { message, messageId, origin } = queue;

  const { params } = message;

  const chain = cosmosChains.find((item) => item.chainName === params.chainName);

  useEffect(() => {
    void (async () => {
      const autoSign = autoSigns.find((item) => item.accountId === currentAccount.id && item.chainId === chain?.id && item.origin === origin);

      if (autoSign) {
        await removeAutoSign(autoSign);
      }

      const result: CosDeleteAutoSignResponse = null;

      responseToWeb({
        response: {
          result,
        },
        message,
        messageId,
        origin,
      });

      void deQueue();
    })();
  }, [autoSigns, chain?.id, currentAccount.id, deQueue, message, messageId, origin, removeAutoSign]);

  return null;
}
