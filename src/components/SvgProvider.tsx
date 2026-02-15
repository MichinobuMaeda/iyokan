import { type ProviderType } from "../types/Provider";
import SvgAppRegistration from "../icons/SvgAppRegistration";
import SvgRemove from "../icons/SvgRemove";
import SvgError from "../icons/SvgError";
import SvgBluesky from "../icons/SvgBluesky";
import SvgInstagram from "../icons/SvgInstagram";
import SvgMastodon from "../icons/SvgMastodon";
import SvgMisskey from "../icons/SvgMisskey";
import SvgThreads from "../icons/SvgThreads";
import SvgTumblr from "../icons/SvgTumblr";
import SvgTwitter from "../icons/SvgTwitter";
import SvgWordpress from "../icons/SvgWordpress";

export default function SvgProvider({
  type,
  disabled,
  error,
}: {
  type: ProviderType | null | undefined;
  disabled?: boolean;
  error?: boolean;
}) {
  if (error) {
    return <SvgError />;
  } else if (disabled) {
    return <SvgRemove />;
  } else {
    switch (type) {
      case "bluesky":
        return <SvgBluesky />;
      case "instagram":
        return <SvgInstagram />;
      case "mastodon":
        return <SvgMastodon />;
      case "misskey":
        return <SvgMisskey />;
      case "threads":
        return <SvgThreads />;
      case "tumblr":
        return <SvgTumblr />;
      case "twitter":
        return <SvgTwitter />;
      case "wordpress":
        return <SvgWordpress />;
      default:
        return <SvgAppRegistration />;
    }
  }
}
