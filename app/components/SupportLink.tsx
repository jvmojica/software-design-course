import { siteConfig } from "~/site.config";

export function SupportLink({ url = siteConfig.supportUrl }: { url?: string }) {
  if (!url) return null;
  return (
    <a className="support-link" href={url} target="_blank" rel="noopener noreferrer">
      ♥ Support this course
    </a>
  );
}
