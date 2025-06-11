import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';

import { shorterAddress } from '@/utils/string';
import { toastDefault } from '@/utils/toast';

import type { TextButtonProps } from '../common/TextButton';
import TextButton from '../common/TextButton';

type ShortAddressCopyButtonProps = TextButtonProps & {
  children: string;
};

export default function ShortAddressCopyButton({ children, ...remainder }: ShortAddressCopyButtonProps) {
  const [shorterAddressText, setShorterAddressText] = useState(children);
  const { t } = useTranslation();

  const copyToClipboard = () => {
    copy(children);
    toastDefault(t('components.MainBox.CoinDetailBox.index.copied'));
  };

  useEffect(() => {
    const updateTruncatedText = () => {
      const width = window.innerWidth;

      let length = 12;

      if (width < 380) length = 16;
      else if (width < 400) length = 18;
      else if (width < 420) length = 20;
      else if (width < 440) length = 22;
      else if (width < 460) length = 24;
      else if (width < 480) length = 30;
      else if (width < 520) length = 32;
      else length = 34;

      setShorterAddressText(shorterAddress(children, length) || '');
    };

    updateTruncatedText();

    window.addEventListener('resize', updateTruncatedText);
    return () => {
      window.removeEventListener('resize', updateTruncatedText);
    };
  }, [children]);

  return (
    <TextButton onClick={copyToClipboard} {...remainder}>
      {shorterAddressText}
    </TextButton>
  );
}
