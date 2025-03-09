import { v4 as uuidv4 } from 'uuid';

import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_RDNS, COSMOSTATION_WALLET_NAME } from '@/constants/common';
import { EIP_6963_EVENTS } from '@/constants/evm/eip6963';
import type { EIP6963ProviderDetail, EIP6963ProviderInfo } from '@/types/evm/eip6963';

import { CosmostaionEthereum } from './evm';

const providerUUID = uuidv4();

const dispatchProviderAnnouncement = () => {
  const info: EIP6963ProviderInfo = {
    uuid: providerUUID,
    name: COSMOSTATION_WALLET_NAME,
    icon: COSMOSTATION_ENCODED_LOGO_IMAGE,
    rdns: COSMOSTATION_RDNS,
  };

  const detail: EIP6963ProviderDetail = Object.freeze({ info, provider: CosmostaionEthereum.getInstance() });

  window.dispatchEvent(
    new CustomEvent(EIP_6963_EVENTS.announce, {
      detail,
    }),
  );
};

export const announceEip6963Provider = () => {
  window.addEventListener(EIP_6963_EVENTS.request, () => {
    dispatchProviderAnnouncement();
  });

  dispatchProviderAnnouncement();
};
