import z from "zod";

export const SendMessageDto = z.object(
  {
    phone: z.e164({ error: "INVALID_PHONE_NUMBER_FORMAT" }),
    message: z
      .string({
        error: "MESSAGE_MUST_BE_STRING",
      })
      .min(1, { error: "EMPTY_MESSAGE" }),
  },
  { error: "BODY_MUST_BE_OBJECT" },
);

export type SendMessageDtoType = z.infer<typeof SendMessageDto>;
