import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';

export async function refreshOriginConnectionTime(accountId: string, origin: string) {
  const storedApprovedOrigins = await getExtensionLocalStorage('approvedOrigins');

  const lastConnectedAt = new Date().getTime();

  const newApprovedOrigins = storedApprovedOrigins.map((approvedOrigin) =>
    approvedOrigin.accountId === accountId && approvedOrigin.origin === origin ? { ...approvedOrigin, lastConnectedAt } : approvedOrigin,
  );

  await setExtensionLocalStorage('approvedOrigins', newApprovedOrigins);
}
