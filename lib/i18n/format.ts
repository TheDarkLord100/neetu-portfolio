import { createElement, Fragment } from "react";

/** Fills `{name}` placeholders in a message, e.g. format("{platform} पर नीतू सिंह", { platform: "Pratilipi" }). */
export function format(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Like `format`, but values may be React nodes (e.g. a link inside a sentence):
 * formatParts("यह {series} का भाग 1 है", { series: <Link …/> }).
 */
export function formatParts(message: string, values: Record<string, React.ReactNode>): React.ReactNode[] {
  return message.split(/(\{\w+\})/g).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1];
    return createElement(Fragment, { key: i }, key && key in values ? values[key] : part);
  });
}
