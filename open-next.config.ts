import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages built ahead of time (the homepage, templates, guides) are served as they are.
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache });
