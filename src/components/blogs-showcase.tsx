import React from "react";
import { useNavigate } from "react-router-dom";

// Import objects
import { BlogUtils } from "src/objects/blogs/utils";

// Import routes metadata
import { rootRoutesMetadata } from "src/routes/RootRoutes";

// Import states
import { useBlogsState } from "src/states/blogs";

// Import types
import type { BlogType } from "src/objects/blogs/types";

function BlogCard({ data }: { data: BlogType }) {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div
        onClick={() =>
          navigate(`${rootRoutesMetadata.get("blogs")?.path}/${data.id}`)
        }
        className="bg-secondary border border-primary border-b-4 mb-3 cursor-pointer overflow-hidden hover:shadow-[0_0_0_2px_hsl(var(--primary))]"
      >
        <img
          className="object-contain aspect-square object-center"
          src={data.cover}
        />
      </div>
      <div className="mb-3">
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
      <hr className="border-primary" />
      <div className="my-3">
        <h2
          onClick={() =>
            navigate(`${rootRoutesMetadata.get("projects")?.path}/${data.id}`)
          }
          className="font-semibold text-xl cursor-pointer hover:underline"
        >
          {data.name}
        </h2>
      </div>
      <div>
        <h2 className="font-semibold">Topics</h2>
        <p className="text-sm">{data.topics.join(", ")}</p>
      </div>
    </div>
  );
}

type BlogsShowcaseProps = {
  canShowAll?: boolean;
};

export function BlogsShowcase(props: BlogsShowcaseProps) {
  const { blogs } = useBlogsState();

  const Blogs = React.useMemo(() => {
    const result: Array<any> = [];

    if (!blogs) return <p className="text-center">Loading...</p>;

    const N = props.canShowAll ? blogs?.length : 5;
    for (let i = 0; i < N; i++) {
      result.push(<BlogCard key={blogs[i].id} data={blogs[i]} />);
    }

    return result;
  }, [blogs, props.canShowAll]);

  return (
    <div className="flex flex-1 max-w-[1280px] mx-auto py-3">
      <div className="grid grid-cols-3 gap-6 mb-3">{Blogs}</div>
    </div>
  );
}
