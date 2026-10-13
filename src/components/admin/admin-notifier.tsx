"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { contentUpdateChannel } from "@/features/content/cache";

/** Shows the result of a server-action redirect without persisting status in the database. */
export function AdminNotifier() {
  const searchParams = useSearchParams();
  const shown = useRef<string | null>(null);
  const notice = searchParams.get("notice");
  const noticeId = searchParams.get("noticeId");
  const error = searchParams.get("error");

  useEffect(() => {
    const next = error
      ? `error:${error}`
      : notice
        ? `notice:${noticeId ?? notice}`
        : null;
    if (!next || shown.current === next) return;
    shown.current = next;
    if (error) toast.error(error);
    if (notice) {
      toast.success(notice);
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(contentUpdateChannel);
        channel.postMessage("updated");
        channel.close();
      }
    }
  }, [error, notice, noticeId]);

  return null;
}
