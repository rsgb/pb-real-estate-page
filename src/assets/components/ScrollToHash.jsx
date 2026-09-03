import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Scroll behaviour for client-side navigation:
 *  - with a hash: scroll the matching element into view (the section's CSS
 *    scroll-margin-top keeps it clear of the fixed AppBar);
 *  - without a hash: scroll to the top of the page, unless the navigation
 *    carried `state.preserveScroll` (a language switch on the same page).
 * Renders nothing. No-op during pre-rendering.
 */
export default function ScrollToHash() {
  const { pathname, hash, key, state } = useLocation();
  const preserveScroll = Boolean(state?.preserveScroll);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!hash) {
      // A language switch stays on the same page: don't throw the reader back
      // to the top.
      if (!preserveScroll) window.scrollTo({ top: 0, left: 0 });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    // The target usually exists as soon as the effect runs; retry once shortly
    // after in case the section mounts a tick later on a route change.
    // (setTimeout rather than requestAnimationFrame: rAF never fires while the
    // document is hidden.)
    if (scrollToTarget()) return;
    const timer = window.setTimeout(scrollToTarget, 60);
    return () => window.clearTimeout(timer);
  }, [pathname, hash, key, preserveScroll]);

  return null;
}
