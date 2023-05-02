import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { APTOS_NETWORKS, CHAINS, COSMOS_CHAINS, ETHEREUM_NETWORKS, SUI_NETWORKS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { MAINNET as APTOS_NETWORK_MAINNET } from '~/constants/chain/aptos/network/mainnet';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { MAINNET as SUI_NETWORK_MAINNET } from '~/constants/chain/sui/network/mainnet';
import { SUI } from '~/constants/chain/sui/sui';
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

  const officialEthereumNetworkIds = ETHEREUM_NETWORKS.map((item) => item.id);
  const officialAptosNetworkIds = APTOS_NETWORKS.map((item) => item.id);
  const officialSuiNetworkIds = SUI_NETWORKS.map((item) => item.id);

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

      const legacyAptosNetworkIds = ['997a3322-ba19-4252-ac28-b9509a1bddcb'];

      if (originChromeStorage.shownAptosNetworkIds?.some((id) => legacyAptosNetworkIds.includes(id))) {
        await setStorage(
          'shownAptosNetworkIds',
          originChromeStorage.shownAptosNetworkIds.filter((id) => !legacyAptosNetworkIds.includes(id)),
        );
      }

      if (legacyAptosNetworkIds.includes(originChromeStorage.selectedAptosNetworkId)) {
        await setStorage('selectedAptosNetworkId', APTOS_NETWORK_MAINNET.id);
      }

      const legacySuiNetworkIds = ['997a3322-ba19-4252-ac28-b9509a1bddcb', '44d6259f-9382-4085-bd37-0be77226965b', '788aab81-6f84-4bc3-b47e-57a6a5ac0e32'];

      if (originChromeStorage.shownSuiNetworkIds?.some((id) => legacySuiNetworkIds.includes(id))) {
        await setStorage(
          'shownSuiNetworkIds',
          originChromeStorage.shownSuiNetworkIds.filter((id) => !legacySuiNetworkIds.includes(id)),
        );
      }

      if (legacySuiNetworkIds.includes(originChromeStorage.selectedSuiNetworkId)) {
        await setStorage('selectedSuiNetworkId', SUI_NETWORK_MAINNET.id);
      }

      const legacyChainIds = ['88ce1a83-0180-4601-a3d7-12089f586dd8'];

      if (
        (!originChromeStorage.allowedChainIds?.includes(ETHEREUM.id) &&
          originChromeStorage.shownEthereumNetworkIds?.filter((item) => officialEthereumNetworkIds.includes(item)).length > 0) ||
        (!originChromeStorage.allowedChainIds?.includes(APTOS.id) &&
          originChromeStorage.shownAptosNetworkIds?.filter((item) => officialAptosNetworkIds.includes(item)).length > 0) ||
        (!originChromeStorage.allowedChainIds?.includes(SUI.id) &&
          originChromeStorage.shownSuiNetworkIds?.filter((item) => officialSuiNetworkIds.includes(item)).length > 0) ||
        originChromeStorage.allowedChainIds?.some((id) => legacyChainIds.includes(id))
      ) {
        const allowedChainList: Chain['id'][] = [];
        if (
          !originChromeStorage.allowedChainIds?.includes(ETHEREUM.id) &&
          originChromeStorage.shownEthereumNetworkIds?.filter((item) => officialEthereumNetworkIds.includes(item)).length > 0
        ) {
          allowedChainList.push(ETHEREUM.id);
        }

        if (
          !originChromeStorage.allowedChainIds?.includes(APTOS.id) &&
          originChromeStorage.shownAptosNetworkIds?.filter((item) => officialAptosNetworkIds.includes(item)).length > 0
        ) {
          allowedChainList.push(APTOS.id);
        }

        if (
          !originChromeStorage.allowedChainIds?.includes(SUI.id) &&
          originChromeStorage.shownSuiNetworkIds?.filter((item) => officialSuiNetworkIds.includes(item)).length > 0
        ) {
          allowedChainList.push(SUI.id);
        }

        const newAllowedChainIds = [...originChromeStorage.allowedChainIds, ...allowedChainList];

        const filteredNewAllowedChainIds = originChromeStorage.allowedChainIds?.some((id) => legacyChainIds.includes(id))
          ? newAllowedChainIds.filter((id) => !legacyChainIds.includes(id))
          : newAllowedChainIds;

        await setStorage('allowedChainIds', filteredNewAllowedChainIds);
      }

      if (!originChromeStorage.selectedAptosNetworkId) {
        await setStorage('selectedAptosNetworkId', APTOS_NETWORK_MAINNET.id);
      }

      if (!originChromeStorage.selectedSuiNetworkId) {
        await setStorage('selectedSuiNetworkId', SUI_NETWORK_MAINNET.id);
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
          aptos: originChromeStorage.providers?.aptos === undefined ? false : originChromeStorage.providers?.aptos,
          keplr: originChromeStorage.providers?.keplr === undefined ? false : originChromeStorage.providers?.keplr,
          metamask: originChromeStorage.providers?.metamask === undefined ? false : originChromeStorage.providers?.metamask,
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
