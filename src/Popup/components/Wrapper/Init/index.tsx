import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { CHAINS, COSMOS_CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { MAINNET as APTOS_NETWORK_MAINNET } from '~/constants/chain/aptos/network/mainnet';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { CURRENCY_TYPE, LANGUAGE_TYPE } from '~/constants/chromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { chromeSessionStorageDefault, chromeSessionStorageState } from '~/Popup/recoils/chromeSessionStorage';
import { chromeStorageDefault, chromeStorageState } from '~/Popup/recoils/chromeStorage';
import { getAllSessionStorage } from '~/Popup/utils/chromeSessionStorage';
import { getAllStorage, setStorage } from '~/Popup/utils/chromeStorage';
import type { Chain, CosmosChain } from '~/types/chain';
import type { LanguageType, Providers } from '~/types/chromeStorage';

type InitType = {
  children: JSX.Element;
};

export default function Init({ children }: InitType) {
  const [isLoading, setIsLoading] = useState(true);

  const [chromeStorage, setChromeStorage] = useRecoilState(chromeStorageState);
  const setChromeSessionStorage = useSetRecoilState(chromeSessionStorageState);

  const { changeLanguage, language } = useTranslation();

  const officialChainLowercaseNames = CHAINS.map((item) => item.chainName.toLowerCase());
  const officialChainIds = CHAINS.map((item) => item.id);

  const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());
  const officialEthereumNetworkChainIds = ETHEREUM_NETWORKS.map((item) => item.chainId);

  const handleOnStorageChange = (_: unknown, areaName: 'sync' | 'local' | 'managed' | 'session') => {
    if (areaName === 'local') {
      void (async () => {
        setChromeStorage({ ...chromeStorageDefault, ...(await getAllStorage()) });
      })();
    }

    if (areaName === 'session') {
      void (async () => {
        setChromeSessionStorage({ ...chromeSessionStorageDefault, ...(await getAllSessionStorage()) });
      })();
    }
  };

  useEffect(() => {
    chrome.storage.onChanged.addListener(handleOnStorageChange);

    void (async () => {
      const originChromeSessionStorage = await getAllSessionStorage();
      setChromeSessionStorage({ ...chromeSessionStorageDefault, ...originChromeSessionStorage });

      const originChromeStorage = await getAllStorage();
      setChromeStorage({ ...chromeStorageDefault, ...originChromeStorage });

      if (language && !originChromeStorage.currency) {
        const newCurrency = language.startsWith('ko')
          ? CURRENCY_TYPE.KRW
          : language.startsWith('ja')
          ? CURRENCY_TYPE.JPY
          : language.startsWith('zh')
          ? CURRENCY_TYPE.CNY
          : CURRENCY_TYPE.USD;

        await setStorage('currency', newCurrency);
      }

      if (language && !originChromeStorage.language) {
        const languageType = Object.values(LANGUAGE_TYPE) as string[];
        const newLanguage = (languageType.includes(language) ? language : 'en') as LanguageType;
        await changeLanguage(newLanguage);
        await setStorage('language', newLanguage);
      }

      if (!originChromeStorage.theme) {
        const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'DARK' : 'LIGHT';

        await setStorage('theme', theme);
      }

      if (originChromeStorage.additionalChains.find((item) => officialChainLowercaseNames.includes(item.chainName.toLowerCase()))) {
        const newAdditionalChains = originChromeStorage.additionalChains.filter((item) => !officialChainLowercaseNames.includes(item.chainName.toLowerCase()));

        await setStorage('additionalChains', newAdditionalChains);
      }

      if (originChromeStorage.additionalChains.filter(isCosmos).find((item) => officialCosmosLowercaseChainIds.includes(item.chainId.toLowerCase()))) {
        const newAdditionalChains = originChromeStorage.additionalChains.filter(
          (item) => !(item.line === 'COSMOS' && officialCosmosLowercaseChainIds.includes(item.chainId)),
        );

        await setStorage('additionalChains', newAdditionalChains);
      }

      // 한달 후 삭제 코드
      if (originChromeStorage.additionalChains.filter((item) => item.line === ('TENDERMINT' as 'COSMOS')).length > 0) {
        const newAdditionalChains = originChromeStorage.additionalChains.map((item) => ({ ...item, line: 'COSMOS' })) as CosmosChain[];

        await setStorage('additionalChains', newAdditionalChains);
      }

      if (originChromeStorage.additionalEthereumNetworks.find((item) => officialEthereumNetworkChainIds.includes(item.chainId))) {
        const newAdditionalEthereumNetworks = originChromeStorage.additionalEthereumNetworks.filter(
          (item) => !officialEthereumNetworkChainIds.includes(item.chainId),
        );

        await setStorage('additionalEthereumNetworks', newAdditionalEthereumNetworks);
      }

      if (!originChromeStorage.allowedChainIds?.filter((item) => officialChainIds.includes(item)).length) {
        await setStorage('allowedChainIds', [ETHEREUM.id, COSMOS.id, APTOS.id]);
        await setStorage('selectedChainId', COSMOS.id);
      }

      if (!originChromeStorage.selectedAptosNetworkId) {
        await setStorage('selectedAptosNetworkId', APTOS_NETWORK_MAINNET.id);
      }

      const currentTime = new Date().getTime();

      if (originChromeStorage.autoSigns?.filter((item) => item.startTime + item.duration < currentTime).length) {
        const newAutoSigns = originChromeStorage.autoSigns.filter((item) => item.startTime + item.duration > currentTime);
        await setStorage('autoSigns', newAutoSigns);
      }

      if (
        originChromeStorage.providers?.aptos === undefined ||
        originChromeStorage.providers?.metamask === undefined ||
        originChromeStorage.providers?.keplr === undefined
      ) {
        const newProviders: Providers = {
          aptos: originChromeStorage.providers?.aptos === undefined ? true : originChromeStorage.providers?.aptos,
          keplr: originChromeStorage.providers?.keplr === undefined ? true : originChromeStorage.providers?.keplr,
          metamask: originChromeStorage.providers?.metamask === undefined ? true : originChromeStorage.providers?.metamask,
        };

        await setStorage('providers', newProviders);
      }

      setIsLoading(false);
    })();

    return () => {
      chrome.storage.onChanged.removeListener(handleOnStorageChange);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <>
      {children}
      <Helmet>
        <link rel="icon" href={`favicon${chromeStorage.theme === 'LIGHT' ? '' : '-dark'}.ico`} />
      </Helmet>
    </>
  );
}

function isCosmos(item: Chain): item is CosmosChain {
  return item.line === 'COSMOS';
}
