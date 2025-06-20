import { BROWSER_ICON } from '@/constants/browser';
import { getBrowserKeyName } from '@/utils/browser';

export default function BrowserIcon() {
  const IconComponent = (() => {
    const browserKey = getBrowserKeyName();
    return BROWSER_ICON[browserKey] ?? null;
  })();

  return IconComponent ? <IconComponent /> : null;
}
