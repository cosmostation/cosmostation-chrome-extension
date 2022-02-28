import type { StringSchema } from 'joi';

import Joi from '~/Popup/utils/joi';

import type { CheckWord } from './entry';

export type Step3Form = Record<string, string>;

type useSchemaProps = {
  words: CheckWord[];
};

export function useSchema({ words }: useSchemaProps) {
  const schema = words.reduce<Record<string, StringSchema>>((acc, cur) => {
    acc[`word${cur.index}`] = Joi.string().valid(cur.word);
    return acc;
  }, {});

  const step3Form = Joi.object<Step3Form>(schema);

  return { step3Form };
}
