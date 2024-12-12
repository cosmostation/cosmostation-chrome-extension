import type { StringSchema } from 'joi';

import Joi from '@/utils/joi';

import type { CheckWord } from '.';

export type MnemonicCheckForm = Record<string, string>;

type useSchemaProps = {
  words: CheckWord[];
};

export function useSchema({ words }: useSchemaProps) {
  const schema = words.reduce<Record<string, StringSchema>>((acc, cur) => {
    acc[`word${cur.index}`] = Joi.string().valid(cur.word);
    return acc;
  }, {});

  const mnemonicCheckForm = Joi.object<MnemonicCheckForm>(schema);

  return { mnemonicCheckForm };
}
