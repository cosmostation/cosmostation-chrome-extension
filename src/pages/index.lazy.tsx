import { useTranslation } from 'react-i18next';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
  component: Index,
  errorComponent: () => <div>Failed to load</div>,
});

function Index() {
  Buffer.from('Hello from Index!').toString('base64');

  const { t } = useTranslation();
  return (
    <div className="p-2">
      <h3>{t('forTest')}</h3>
    </div>
  );
}
