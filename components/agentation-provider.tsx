"use client";

import dynamic from "next/dynamic";

const Agentation = dynamic(
  () => import("agentation").then((mod) => ({ default: mod.Agentation })),
  { ssr: false }
);

export function AgentationProvider() {
  const isEnabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_AGENTATION === "true";

  if (!isEnabled) {
    return null;
  }

  const endpoint = process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT;

  return <Agentation endpoint={endpoint} />;
}
