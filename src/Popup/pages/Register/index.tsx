import { useNavigate } from 'react-router-dom';

import { useTranslation } from '~/Popup/hooks/useTranslation';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOnClick = () => {
    navigate(-1);
  };
  return (
    <div>
      <button type="button" onClick={handleOnClick}>
        back
      </button>
      {t('page.dddd.dddd')}
      {t('common:page.dddd.abc')}
    </div>
  );
}
