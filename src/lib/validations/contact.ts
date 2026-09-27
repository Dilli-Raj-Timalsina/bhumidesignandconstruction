import { z } from "zod";

import {
  contactMessageStatusSchema,
  idSchema,
  nullableText,
  requiredText,
} from "./common";

/** Schema accepted by the public contact endpoint/server action. */
export const contactMessageSchema = z
  .object({
    name: requiredText("Name", 120),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address.")
      .max(254, "Email must be 254 characters or fewer."),
    phone: nullableText(50),
    subject: requiredText("Subject", 200),
    message: requiredText("Message", 10_000),
  })
  .strict();

export const contactMessageStatusUpdateSchema = z
  .object({
    id: idSchema,
    status: contactMessageStatusSchema,
  })
  .strict();

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type ContactMessageStatusUpdateInput = z.infer<
  typeof contactMessageStatusUpdateSchema
>;
