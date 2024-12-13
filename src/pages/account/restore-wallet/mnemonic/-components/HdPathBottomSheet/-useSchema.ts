import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';
import { isNaturalNumberRegex } from '@/utils/regex';

export type HdPathIndexForm = {
  hdPathIndex: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const newAccountForm = Joi.object<HdPathIndexForm>({
    hdPathIndex: Joi.string()
      .required()
      .pattern(/^[0-9]$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.common.string.pattern.invalidRange'),
      }),
  });

  // TODO 초기생성, 니모닉 복구 플래그에 따라서 스키마 변경
  //  -> 초기생성은 10 미만, 니모닉 복구는 제한없음으로 변경
  const restoreAccountForm = Joi.object<HdPathIndexForm>({
    hdPathIndex: Joi.string()
      .required()
      .pattern(isNaturalNumberRegex)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.common.string.pattern.invalidRange'),
      }),
  });

  return { newAccountForm, restoreAccountForm };
}
