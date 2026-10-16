import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crash-test")({
  head: () => ({ meta: [{ title: "Crash Test" }] }),
  component: () => {
    throw new Error("Cannot read properties of null (reading 'useState')");
  },
});
