import z from "zod";


export const ZSurveyOpenTextQuestionInputType = z.enum(["text", "email", "url", "number", "phone"]);

export type TSurveyOpenTextQuestionInputType = z.infer<
  typeof ZSurveyOpenTextQuestionInputType
>;

export const ZSurveyLogicCondition = z.enum([
  "accepted",
  "clicked",
  "submitted",
  "skipped",
  "equals",
  "notEquals",
  "lessThan",
  "lessEqual",
  "greaterThan",
  "greaterEqual",
  "includesAll",
  "includesOne",
  "uploaded",
  "notUploaded",
  "booked",
  "isCompletelySubmitted",
  "isPartiallySubmitted",
]);

export enum TSurveyQuestionTypeZ {
  FileUpload = "fileUpload",
  OpenText = "openText",
  MultipleChoiceSingle = "multipleChoiceSingle",
  MultipleChoiceMulti = "multipleChoiceMulti",
  NPS = "nps",
  CTA = "cta",
  Rating = "rating",
  Consent = "consent",
  PictureSelection = "pictureSelection",
  Cal = "cal",
  Date = "date",
  Matrix = "matrix",
}

export const ZSurveyLogicBase = z.object({
  condition: ZSurveyLogicCondition.optional(),
  value: z.union([z.string(), z.array(z.string())]).optional(),
  destination: z.union([z.string(), z.literal("end")]).optional(),
});

export const ZSurveyQuestionBase = z.object({
  id: z.string(),
  type: z.string(),
  headline: z.object({
    default: z.string(),
  }),
  subheader: z.string().optional(),
  imageUrl: z.string().optional(),
  required: z.boolean(),
  buttonLabel: z.object({
    default: z.string().optional(),
  }),
  backButtonLabel: z.string().optional(),
  scale: z.enum(["number", "smiley", "star"]).optional(),
  range: z
    .union([
      z.literal(5),
      z.literal(3),
      z.literal(4),
      z.literal(7),
      z.literal(10),
    ])
    .optional(),
  mulitiselectvalidation: z.string().optional(),
  isDraft: z.boolean().optional(),
});

export const ZSurveyChoice = z.object({
  id: z.string(),
  label: z.object({
    default: z.string(),
  }),
});

export const ZSurveyMultipleChoiceSingleLogic = ZSurveyLogicBase.extend({
  condition: z.enum(["submitted", "skipped", "equals", "notEquals"]).optional(),
  value: z.string().optional(),
});

export const ZSurveyMultipleChoiceSingleQuestion = ZSurveyQuestionBase.extend({
  type: z.literal(TSurveyQuestionTypeZ.MultipleChoiceSingle),
  choices: z.array(ZSurveyChoice),
  logic: z.array(ZSurveyMultipleChoiceSingleLogic).optional(),
  shuffleOption: z.enum(["none", "all", "exceptLast"]).optional(),
  otherOptionPlaceholder: z.string().optional(),
});

export const ZSurveyMultipleChoiceMultiLogic = ZSurveyLogicBase.extend({
  condition: z
    .enum(["submitted", "skipped", "includesAll", "includesOne", "equals"])
    .optional(),
  value: z.union([z.array(z.string()), z.string()]).optional(),
});

// TSurveyQuestionType

export const ZSurveyMultipleChoiceMultiQuestion = ZSurveyQuestionBase.extend({
  type: z.literal(TSurveyQuestionTypeZ.MultipleChoiceMulti),
  choices: z.array(ZSurveyChoice),
  logic: z.array(ZSurveyMultipleChoiceMultiLogic).optional(),
  label: z.object({
    default: z.string(),
  }),
  shuffleOption: z.enum(["none", "all", "exceptLast"]).optional(),
  otherOptionPlaceholder: z.string().optional(),
});

export const ZSurveyOpenTextLogic = ZSurveyLogicBase.extend({
  condition: z.enum(["submitted", "skipped"]).optional(),
  value: z.undefined(),
});



export const ZSurveyOpenTextQuestion = ZSurveyQuestionBase.extend({
  type: z.literal(TSurveyQuestionTypeZ.OpenText),
  placeholder: z.string().optional(),
  longAnswer: z.boolean().optional(),
  logic: z.array(ZSurveyOpenTextLogic).optional(),
  inputType: ZSurveyOpenTextQuestionInputType.optional().default("text"),
});

export const ZSurveyQuestion = z.union([
  ZSurveyOpenTextQuestion,
  ZSurveyMultipleChoiceSingleQuestion,
  ZSurveyMultipleChoiceMultiQuestion,
]);

export const ZSurveyQuestions = z.array(ZSurveyQuestion);

export const ZSurvey = z.object({
  // id: z.string().cuid2(),
  // createdAt: z.date(),
  // updatedAt: z.date(),
  // name: z.string(),
  // environmentId: z.string(),
  // createdBy: z.string().nullable(),
  // autoClose: z.number().nullable(),
  // triggers: z.array(z.string()),
  // redirectUrl: z.string().url().nullable(),
  // recontactDays: z.number().nullable(),
  // welcomeCard: ZSurveyWelcomeCard,
  questions: ZSurveyQuestions,
  // thankYouCard: ZSurveyThankYouCard,
  // hiddenFields: ZSurveyHiddenFields,
  // delay: z.number(),
  // autoComplete: z.number().nullable(),
  // closeOnDate: z.date().nullable(),
  // productOverwrites: ZSurveyProductOverwrites.nullable(),
  // styling: ZSurveyStyling.nullable(),
  // surveyClosedMessage: ZSurveyClosedMessage.nullable(),
  // singleUse: ZSurveySingleUse.nullable(),
  // verifyEmail: ZSurveyVerifyEmail.nullable(),
  // pin: z.string().nullable().optional(),
  // resultShareKey: z.string().nullable(),
  // displayPercentage: z.number().min(1).max(100).nullable(),
});

export type TSurvey = z.infer<typeof ZSurvey>;

export const ZProduct = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  teamId: z.string(),
  recontactDays: z.number().int(),
  inAppSurveyBranding: z.boolean(),
  linkSurveyBranding: z.boolean(),
  // placement: ZPlacement,
  clickOutsideClose: z.boolean(),
  darkOverlay: z.boolean(),
  // environments: z.array(ZEnvironment),
  // brandColor: ZColor.nullish(),
  // highlightBorderColor: ZColor.nullish(),
  // languages: z.array(ZLanguage),
});

export type TSurveyQuestion = z.infer<typeof ZSurveyQuestion>;

export type TProduct = z.infer<typeof ZProduct>;

