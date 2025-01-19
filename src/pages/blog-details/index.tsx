import React from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Import utils
import { BlogUtils } from "src/objects/blogs/utils";

// Import states
import { useBlogsState } from "src/states/blogs";

// Import types
// import type { BlogType } from "src/objects/blogs/types";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blogs } = useBlogsState();

  const data = React.useMemo(() => {
    return blogs?.find((project) => project.id === id)!;
  }, [id, blogs?.length]);

  React.useEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, []);

  if (!blogs) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-1 flex-col max-w-[960px] w-full mx-auto py-3">
      <div className="flex items-center justify-between  mb-3">
        <p
          onClick={() => navigate(-1)}
          className="flex items-center cursor-pointer hover:underline"
        >
          <ArrowLeft className="me-3" size={16} /> Back
        </p>
        <p>Reading blog</p>
      </div>
      <hr className="my-3" />
      <div className="mb-3">
        <h1 className="text-3xl font-bold mb-1">{data.name}</h1>
        <p>{data.description}</p>
        <img
          className="w-full aspect-video object-contain my-3"
          src={data.cover}
        />
        <div>
          <p className="text-sm">
            <span className="me-2">Create at:</span>
            <span className="text-destructive">
              {BlogUtils.toBlogDateStr(data.createdAt)}
            </span>
          </p>
          <p className="text-sm">
            <span className="me-2">Update at:</span>
            <span className="text-destructive">
              {BlogUtils.toBlogDateStr(data.updatedAt)}
            </span>
          </p>
        </div>
      </div>
      <hr className="my-3" />
      <div className="content"></div>
    </div>
  );
}
