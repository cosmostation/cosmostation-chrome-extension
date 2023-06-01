import type { COMMON_NO_POPUP_METHOD_TYPE } from '~/constants/message/common';

import type { Providers } from '../extensionStorage';

export type CosmosPopupMethodType = ValueOf<typeof COMMON_NO_POPUP_METHOD_TYPE>;

export type ComProviders = {
  method: typeof COMMON_NO_POPUP_METHOD_TYPE.COM__PROVIDERS;
  params?: undefined;
  id?: number | string;
};

export type ComProvidersResponse = Providers;
