import { z } from '@/lib/zod';

export const BANNER_TITLE_MAX = 80;
export const BANNER_SUBTITLE_MAX = 200;
export const BANNER_CTA_TEXT_MAX = 30;
export const TEMPLATE_NAME_MAX = 60;
export const TEMPLATE_TITLE_MAX = 120;
export const TEMPLATE_CONTENT_MAX = 500;

const URL_MAX_LENGTH = 500;
const GOAL_MAX = 1_000_000;
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export const LINK_ERROR = 'Informe um link válido, começando com https://';
const GOAL_ERROR = 'Informe um número inteiro de 1 a 1.000.000';
const IMAGE_SIZE_ERROR = 'A imagem pode ter no máximo 4 MB';

function requiredText(max: number, label: string) {
  return z
    .string()
    .trim()
    .min(1, { error: `Informe ${label}` })
    .max(max, { error: `Use no máximo ${max} caracteres` });
}

export const bannerFormSchema = z.object({
  enabled: z.boolean(),
  title: requiredText(BANNER_TITLE_MAX, 'o título'),
  subtitle: z
    .string()
    .trim()
    .max(BANNER_SUBTITLE_MAX, { error: `Use no máximo ${BANNER_SUBTITLE_MAX} caracteres` }),
  ctaText: requiredText(BANNER_CTA_TEXT_MAX, 'o texto do botão'),
  ctaUrl: z
    .string()
    .trim()
    .pipe(z.url({ protocol: /^https$/, error: LINK_ERROR }).max(URL_MAX_LENGTH)),
  imageUrl: z
    .url({ protocol: /^https?$/ })
    .max(URL_MAX_LENGTH)
    .nullable(),
});

export type BannerFormValues = z.input<typeof bannerFormSchema>;
export type BannerInput = z.output<typeof bannerFormSchema>;

export const templateFormSchema = z.object({
  name: requiredText(TEMPLATE_NAME_MAX, 'o nome do template'),
  title: requiredText(TEMPLATE_TITLE_MAX, 'o título'),
  content: requiredText(TEMPLATE_CONTENT_MAX, 'o texto'),
});

export type TemplateFormValues = z.input<typeof templateFormSchema>;
export type TemplateInput = z.output<typeof templateFormSchema>;

const goalDigits = z
  .string()
  .trim()
  .transform((value) => value.replaceAll('.', ''));

function isGoal(value: string): boolean {
  const goal = Number(value);
  return /^\d+$/.test(value) && goal >= 1 && goal <= GOAL_MAX;
}

export const goalsFormSchema = z.object({
  monthlySignupGoal: goalDigits
    .refine((value) => value === '' || isGoal(value), { error: GOAL_ERROR })
    .transform((value) => (value === '' ? null : Number(value))),
  votingGoal: goalDigits
    .refine((value) => value !== '', { error: 'Informe a meta de votos', abort: true })
    .refine(isGoal, { error: GOAL_ERROR })
    .transform(Number),
});

export type GoalsFormValues = z.input<typeof goalsFormSchema>;

export const bannerImageSchema = z
  .file()
  .mime(['image/webp', 'image/png'], { error: 'Envie uma imagem WEBP ou PNG' })
  .max(IMAGE_MAX_BYTES, { error: IMAGE_SIZE_ERROR });

export const backImageSchema = z
  .file()
  .mime(['image/png', 'image/jpeg', 'image/webp'], { error: 'Envie uma imagem PNG, JPG ou WEBP' })
  .max(IMAGE_MAX_BYTES, { error: IMAGE_SIZE_ERROR });

const bannerValueSchema = z.object({
  enabled: z.boolean(),
  title: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaUrl: z.string(),
  imageUrl: z
    .string()
    .nullish()
    .transform((value) => value ?? null),
});

const templatesValueSchema = z.array(
  z.object({ id: z.string().optional(), name: z.string(), title: z.string(), content: z.string() }),
);

const goalValueSchema = z.number().int().nullable();

export const settingValueSchemas = {
  banner: bannerValueSchema,
  templates: templatesValueSchema,
  goal: goalValueSchema,
};
