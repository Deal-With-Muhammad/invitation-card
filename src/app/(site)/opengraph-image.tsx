import { OG_SIZE, renderSiteOg } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: free online invitation maker for weddings, nikah and birthdays`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderSiteOg();
}
