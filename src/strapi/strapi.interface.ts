import myzod from "myzod";

/**
 * The request of `/auth/local`
 */
export interface StrapiAuthRequest {
  identifier: string;
  password: string;
}

/**
 * The response of `/auth/local`
 */
export const StrapiAuthResponseSchema = myzod
  .object({
    jwt: myzod.string(),
  })
  .allowUnknownKeys();

/**
 * The request of `POST /messages`
 */
export interface StrapiMessagesPostRequest {
  message: string;
  ip_address: string;
}

/**
 * An entry of the response of `/messages`
 */
export const StrapiMessagesResponseEntrySchema = myzod
  .object({
    id: myzod.number(),
    message: myzod.string(),
    ip_address: myzod.string(),
    published: myzod.boolean(),
    approved: myzod.boolean(),
    created_at: myzod.date(),
    updated_at: myzod.date(),
  })
  .allowUnknownKeys();

/**
 * The response of `/messages`
 */
export const StrapiMessagesResponseSchema = myzod.array(
  StrapiMessagesResponseEntrySchema,
);
