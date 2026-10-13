"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { contentUpdateChannel } from "@/features/content/cache";

/** Refreshes an open public preview when this browser saves CMS content. */
export function ContentRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    if (typeof BroadcastChannel === "undefined") {
      return () =>
        document.removeEventListener("visibilitychange", refreshWhenVisible);
    }
    const channel = new BroadcastChannel(contentUpdateChannel);
    channel.onmessage = (event) => {
      if (event.data === "updated") router.refresh();
    };
    return () => {
      channel.close();
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [router]);

  return null;
}
