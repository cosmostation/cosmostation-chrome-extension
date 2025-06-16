import { BROWSWER_NAME, BROWSWER_TYPE } from '@/constants/browser';

export const extension = __APP_BROWSER__ === 'chrome' ? chrome : browser;

export function getUserAgentName() {
  return window.navigator.userAgent.toLocaleLowerCase();
}

export function getBrowserKeyName() {
  const agentName = getUserAgentName();

  if (agentName.indexOf('edge') > -1) {
    return BROWSWER_TYPE.EDGE;
  }

  if (agentName.indexOf('edg/') > -1) {
    return BROWSWER_TYPE.EDGE_CHROMIUM;
  }

  if (agentName.indexOf('opr') > -1 && !!window.opr) {
    return BROWSWER_TYPE.OPERA;
  }
  if (agentName.indexOf('chrome') > -1 && !!window.chrome) {
    return BROWSWER_TYPE.CHROME;
  }
  if (agentName.indexOf('trident') > -1) {
    return BROWSWER_TYPE.IE;
  }
  if (agentName.indexOf('firefox') > -1) {
    return BROWSWER_TYPE.FIREFOX;
  }
  if (agentName.indexOf('safari') > -1) {
    return BROWSWER_TYPE.SAFARI;
  }

  return BROWSWER_TYPE.ETC;
}

export function getBrowserName() {
  const browserKey = getBrowserKeyName();

  return BROWSWER_NAME[browserKey];
}
