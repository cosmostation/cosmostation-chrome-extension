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
import { CURRENCY_TYPE, LANGUAGE_TYPE } from '~/constants/extensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { extensionSessionStorageDefault, extensionSessionStorageState } from '~/Popup/recoils/extensionSessionStorage';
import { extensionStorageDefault, extensionStorageState } from '~/Popup/recoils/extensionStorage';
import { extension } from '~/Popup/utils/extension';
import { getAllSessionStorage } from '~/Popup/utils/extensionSessionStorage';
import { getAllStorage, setStorage } from '~/Popup/utils/extensionStorage';
import type { Chain, CosmosChain } from '~/types/chain';
import type { LanguageType, Providers } from '~/types/extensionStorage';

type InitType = {
  children: JSX.Element;
};

export default function Init({ children }: InitType) {
  const [isLoading, setIsLoading] = useState(true);

  const [extensionStorage, setExtensionStorage] = useRecoilState(extensionStorageState);
  const setExtensionSessionStorage = useSetRecoilState(extensionSessionStorageState);

  const { changeLanguage, language } = useTranslation();

  const officialChainLowercaseNames = CHAINS.map((item) => item.chainName.toLowerCase());
  const officialChainIds = CHAINS.map((item) => item.id);

  const officialEthereumNetworkIds = ETHEREUM_NETWORKS.map((item) => item.id);
  const officialAptosNetworkIds = APTOS_NETWORKS.map((item) => item.id);
  const officialSuiNetworkIds = SUI_NETWORKS.map((item) => item.id);

  const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());
  const officialEthereumNetworkChainIds = ETHEREUM_NETWORKS.map((item) => item.chainId);

  const handleOnStorageChange = (_: unknown, areaName: string) => {
    void (async () => {
      if (areaName === 'local') {
        setExtensionStorage({ ...extensionStorageDefault, ...(await getAllStorage()) });
      }

      if (areaName === 'session') {
        setExtensionSessionStorage({ ...extensionSessionStorageDefault, ...(await getAllSessionStorage()) });
      }
    })();
  };

  useEffect(() => {
    extension.storage.onChanged.addListener(handleOnStorageChange);

    void (async () => {
      const originExtensionSessionStorage = await getAllSessionStorage();
      setExtensionSessionStorage({ ...extensionSessionStorageDefault, ...originExtensionSessionStorage });

      const originExtensionStorage = await getAllStorage();
      setExtensionStorage({ ...extensionStorageDefault, ...originExtensionStorage });

      if (language && !originExtensionStorage.currency) {
        const newCurrency = language.startsWith('ko')
          ? CURRENCY_TYPE.KRW
          : language.startsWith('ja')
          ? CURRENCY_TYPE.JPY
          : language.startsWith('zh')
          ? CURRENCY_TYPE.CNY
          : CURRENCY_TYPE.USD;

        await setStorage('currency', newCurrency);
      }

      if (language && !originExtensionStorage.language) {
        const languageType = Object.values(LANGUAGE_TYPE) as string[];
        const newLanguage = (languageType.includes(language) ? language : 'en') as LanguageType;
        await changeLanguage(newLanguage);
        await setStorage('language', newLanguage);
      }

      if (!originExtensionStorage.theme) {
        const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'DARK' : 'LIGHT';

        await setStorage('theme', theme);
      }

      if (originExtensionStorage.additionalChains.find((item) => officialChainLowercaseNames.includes(item.chainName.toLowerCase()))) {
        const newAdditionalChains = originExtensionStorage.additionalChains.filter(
          (item) => !officialChainLowercaseNames.includes(item.chainName.toLowerCase()),
        );

        await setStorage('additionalChains', newAdditionalChains);
      }

      if (originExtensionStorage.additionalChains.filter(isCosmos).find((item) => officialCosmosLowercaseChainIds.includes(item.chainId.toLowerCase()))) {
        const newAdditionalChains = originExtensionStorage.additionalChains.filter(
          (item) => !(item.line === 'COSMOS' && officialCosmosLowercaseChainIds.includes(item.chainId)),
        );

        await setStorage('additionalChains', newAdditionalChains);
      }

      // 한달 후 삭제 코드
      if (originExtensionStorage.additionalChains.filter((item) => item.line === ('TENDERMINT' as 'COSMOS')).length > 0) {
        const newAdditionalChains = originExtensionStorage.additionalChains.map((item) => ({ ...item, line: 'COSMOS' })) as CosmosChain[];

        await setStorage('additionalChains', newAdditionalChains);
      }

      if (originExtensionStorage.additionalEthereumNetworks.find((item) => officialEthereumNetworkChainIds.includes(item.chainId))) {
        const newAdditionalEthereumNetworks = originExtensionStorage.additionalEthereumNetworks.filter(
          (item) => !officialEthereumNetworkChainIds.includes(item.chainId),
        );

        await setStorage('additionalEthereumNetworks', newAdditionalEthereumNetworks);
      }

      if (!originExtensionStorage.allowedChainIds?.filter((item) => officialChainIds.includes(item)).length) {
        await setStorage('allowedChainIds', [ETHEREUM.id, COSMOS.id, APTOS.id]);
        await setStorage('selectedChainId', COSMOS.id);
      }

      const legacyAptosNetworkIds = ['997a3322-ba19-4252-ac28-b9509a1bddcb'];

      if (originExtensionStorage.shownAptosNetworkIds?.some((id) => legacyAptosNetworkIds.includes(id))) {
        await setStorage(
          'shownAptosNetworkIds',
          originExtensionStorage.shownAptosNetworkIds.filter((id) => !legacyAptosNetworkIds.includes(id)),
        );
      }

      if (legacyAptosNetworkIds.includes(originExtensionStorage.selectedAptosNetworkId)) {
        await setStorage('selectedAptosNetworkId', APTOS_NETWORK_MAINNET.id);
      }

      const legacySuiNetworkIds = ['997a3322-ba19-4252-ac28-b9509a1bddcb', '44d6259f-9382-4085-bd37-0be77226965b', '788aab81-6f84-4bc3-b47e-57a6a5ac0e32'];

      if (originExtensionStorage.shownSuiNetworkIds?.some((id) => legacySuiNetworkIds.includes(id))) {
        await setStorage(
          'shownSuiNetworkIds',
          originExtensionStorage.shownSuiNetworkIds.filter((id) => !legacySuiNetworkIds.includes(id)),
        );
      }

      if (legacySuiNetworkIds.includes(originExtensionStorage.selectedSuiNetworkId)) {
        await setStorage('selectedSuiNetworkId', SUI_NETWORK_MAINNET.id);
      }

      const legacyChainIds = ['88ce1a83-0180-4601-a3d7-12089f586dd8'];

      if (
        (!originExtensionStorage.allowedChainIds?.includes(ETHEREUM.id) &&
          originExtensionStorage.shownEthereumNetworkIds?.filter((item) => officialEthereumNetworkIds.includes(item)).length > 0) ||
        (!originExtensionStorage.allowedChainIds?.includes(APTOS.id) &&
          originExtensionStorage.shownAptosNetworkIds?.filter((item) => officialAptosNetworkIds.includes(item)).length > 0) ||
        (!originExtensionStorage.allowedChainIds?.includes(SUI.id) &&
          originExtensionStorage.shownSuiNetworkIds?.filter((item) => officialSuiNetworkIds.includes(item)).length > 0) ||
        originExtensionStorage.allowedChainIds?.some((id) => legacyChainIds.includes(id))
      ) {
        const allowedChainList: Chain['id'][] = [];
        if (
          !originExtensionStorage.allowedChainIds?.includes(ETHEREUM.id) &&
          originExtensionStorage.shownEthereumNetworkIds?.filter((item) => officialEthereumNetworkIds.includes(item)).length > 0
        ) {
          allowedChainList.push(ETHEREUM.id);
        }

        if (
          !originExtensionStorage.allowedChainIds?.includes(APTOS.id) &&
          originExtensionStorage.shownAptosNetworkIds?.filter((item) => officialAptosNetworkIds.includes(item)).length > 0
        ) {
          allowedChainList.push(APTOS.id);
        }

        if (
          !originExtensionStorage.allowedChainIds?.includes(SUI.id) &&
          originExtensionStorage.shownSuiNetworkIds?.filter((item) => officialSuiNetworkIds.includes(item)).length > 0
        ) {
          allowedChainList.push(SUI.id);
        }

        const newAllowedChainIds = [...originExtensionStorage.allowedChainIds, ...allowedChainList];

        const filteredNewAllowedChainIds = originExtensionStorage.allowedChainIds?.some((id) => legacyChainIds.includes(id))
          ? newAllowedChainIds.filter((id) => !legacyChainIds.includes(id))
          : newAllowedChainIds;

        await setStorage('allowedChainIds', filteredNewAllowedChainIds);
      }

      if (!originExtensionStorage.selectedAptosNetworkId) {
        await setStorage('selectedAptosNetworkId', APTOS_NETWORK_MAINNET.id);
      }

      if (!originExtensionStorage.selectedSuiNetworkId) {
        await setStorage('selectedSuiNetworkId', SUI_NETWORK_MAINNET.id);
      }

      if (!originExtensionStorage.address) {
        await setStorage('address', {});
      }

      if (
        originExtensionStorage.providers?.aptos === undefined ||
        originExtensionStorage.providers?.metamask === undefined ||
        originExtensionStorage.providers?.keplr === undefined
      ) {
        const newProviders: Providers = {
          aptos: originExtensionStorage.providers?.aptos === undefined ? false : originExtensionStorage.providers?.aptos,
          keplr: originExtensionStorage.providers?.keplr === undefined ? false : originExtensionStorage.providers?.keplr,
          metamask: originExtensionStorage.providers?.metamask === undefined ? false : originExtensionStorage.providers?.metamask,
        };

        await setStorage('providers', newProviders);
      }

      setIsLoading(false);
    })();

    return () => {
      extension.storage.onChanged.removeListener(handleOnStorageChange);
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
        <link rel="icon" href={`favicon${extensionStorage.theme === 'LIGHT' ? '' : '-dark'}.ico`} />
      </Helmet>
    </>
  );
}

function isCosmos(item: Chain): item is CosmosChain {
  return item.line === 'COSMOS';
}
