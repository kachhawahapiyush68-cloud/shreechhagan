import {
  getHelpContent,
  getPrivacyContent,
  getTermsContent,
} from "@/features/content/api/content.api";
import type { ContentSlug } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export const contentQueryKeys = {
  privacy: ["content", "privacy"] as const,
  help: ["content", "help"] as const,
  terms: ["content", "terms"] as const,
};

const STALE_MS = 1000 * 60 * 10; // 10 min — content rarely changes

export function usePrivacyContentQuery() {
  return useQuery({
    queryKey: contentQueryKeys.privacy,
    queryFn: getPrivacyContent,
    staleTime: STALE_MS,
    retry: 2,
  });
}
export function useHelpContentQuery() {
  return useQuery({
    queryKey: contentQueryKeys.help,
    queryFn: getHelpContent,
    staleTime: STALE_MS,
    retry: 2,
  });
}
export function useTermsContentQuery() {
  return useQuery({
    queryKey: contentQueryKeys.terms,
    queryFn: getTermsContent,
    staleTime: STALE_MS,
    retry: 2,
  });
}

// unified hook — used by the content viewer screen
export function useContentQuery(slug: ContentSlug) {
  const privacy = usePrivacyContentQuery();
  const help = useHelpContentQuery();
  const terms = useTermsContentQuery();
  if (slug === "privacy") return privacy;
  if (slug === "help") return help;
  return terms;
}
