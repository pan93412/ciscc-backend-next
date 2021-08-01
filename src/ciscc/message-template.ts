import type { Infer } from "myzod";
import type { StrapiMessagesResponseEntrySchema } from "../strapi/strapi.interface";

export const ComplainMessage = ({
  created_at,
  id,
  message,
}: Infer<typeof StrapiMessagesResponseEntrySchema>) =>
  [
    "---",
    message,
    "---",
    "",
    `文章 ID：${id}`,
    `發表時間：${created_at.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`,
  ].join("\n");
