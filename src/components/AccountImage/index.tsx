import { getHashIndex } from '@/utils/string';

import accountImages from './accountImages';
import { StyledAccountImage } from './styled';

interface AccountImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  accountId?: string;
}

function getAccountImage(uuid: string): string {
  const index = getHashIndex(uuid, accountImages.length);
  return accountImages[index];
}

export default function AccountImage({ accountId, ...remainder }: AccountImageProps) {
  const src = accountId ? getAccountImage(accountId) : undefined;

  return <StyledAccountImage src={src} {...remainder} />;
}
