import { BROWSWER_ICON } from '@/constants/browser';
import { getBrowserKeyName } from '@/utils/browser';

export default function BrowserIcon() {
  const BrowserIcon = (() => {
    const browserKey = getBrowserKeyName();

    return BROWSWER_ICON[browserKey];
  })();

  return <BrowserIcon />;
}
