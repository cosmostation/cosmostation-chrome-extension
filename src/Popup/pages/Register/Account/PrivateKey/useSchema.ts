import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type PrivateKeyForm = {
  privateKey: string;
  name: string;
};

type useSchemaProps = {
  name: string[];
};

export function useSchema({ name }: useSchemaProps) {
  const { t } = useTranslation();

  const privateKeyForm = Joi.object<PrivateKeyForm>({
    privateKey: Joi.string()
      .required()
      .privateKey()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        privateKey: t('schema.privateKeyForm.privateKey'),
      }),
    name: Joi.string()
      .required()
      .invalid(...name)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.PrivateKeyForm.name.any.invlid'),
      }),
  });

  return { privateKeyForm };
}
