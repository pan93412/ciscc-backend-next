import type { Infer } from "myzod";
import type { StrapiMessagesResponseEntrySchema } from "../strapi/strapi.interface";

export const ComplainMessage = ({
  created_at,
  id,
  message,
}: Infer<typeof StrapiMessagesResponseEntrySchema>) =>
  [
    `#${id} @ <t:${Math.floor(created_at.getTime() / 1000)}:F>`,
    "---",
    message,
    "---",
    "想匿名說什麼？ → https://ciscc.pan93.tk",
    "想當訊息審核員？ → https://ciscc.pan93.tk/review",
  ].join("\n");
