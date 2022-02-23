import Joi from 'joi';

import { useTranslation } from '~/Popup/hooks/useTranslation';

export type ChangeNameForm = {
  name: string;
};

type useSchemaProps = {
  names: string[];
};

export function useSchema({ names }: useSchemaProps) {
  const { t } = useTranslation();
  const changeNameForm = Joi.object<ChangeNameForm>({
    name: Joi.string()
      .required()
      .invalid(...names)
      .min(1)
      .max(20)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.max': t('schema.common.string.max'),
        'any.invalid': t('schema.changeNameForm.name.any.invlid'),
      }),
  });

  return { changeNameForm };
}
