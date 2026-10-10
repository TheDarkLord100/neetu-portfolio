/** Fills `{name}` placeholders in a message, e.g. format("{platform} पर नीतू सिंह", { platform: "Pratilipi" }). */
export function format(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
