export function normalizeEventDetail(eventDetail: unknown) {
  const isFirefox = __APP_BROWSER__ === 'firefox';

  return isFirefox && typeof cloneInto === 'function' ? cloneInto(eventDetail, window) : eventDetail;
}
