import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function Md({
  hardBreak,
  children,
}: {
  hardBreak?: boolean;
  children: string;
}) {
  return (
    <div className="markdown">
      <Markdown
        remarkPlugins={hardBreak ? [remarkGfm, remarkBreaks] : [remarkGfm]}
      >
        {children}
      </Markdown>
    </div>
  );
}
