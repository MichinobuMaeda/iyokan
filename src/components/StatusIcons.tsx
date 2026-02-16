import { type PostStatus } from "../types/Post";
import SvgDeleteForever from "../icons/SvgDeleteForever";
import SvgPause from "../icons/SvgPause";
import SvgSchedule from "../icons/SvgSchedule";
import SvgCheck from "../icons/SvgCheck";

export default function StatusIcons({ type }: { type: PostStatus }) {
  switch (type) {
    case "canceled":
      return <SvgDeleteForever />;
    case "paused":
      return <SvgPause />;
    case "scheduled":
      return <SvgSchedule />;
    case "finished":
      return <SvgCheck />;
  }
}
