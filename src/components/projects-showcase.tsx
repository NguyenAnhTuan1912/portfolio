import React from "react";
import { useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";

// Import components
// import { Button } from "./ui/button";

// Import objects
import { ProjectUtils } from "src/objects/projects/utils";

// Import routes metadata
import { rootRoutesMetadata } from "src/routes/RootRoutes";

// Import states
import { useProjectsState } from "src/states/projects";

// Imports types
import type { ProjectType } from "src/objects/projects/types";

function ProjectCard({ data }: { data: ProjectType }) {
  const navigate = useNavigate();

  return (
    <div className="w-full flex items-start px-3 lg:px-0 lg:block">
      <div
        onClick={() =>
          navigate(`${rootRoutesMetadata.get("projects")?.path}/${data.id}`)
        }
        className="block max-w-[120px] lg:max-w-full me-3 lg:me-0 lg:mb-3 aspect-square bg-secondary border border-primary border-b-4 cursor-pointer overflow-hidden hover:shadow-[0_0_0_2px_hsl(var(--primary))]"
      >
        <img className="object-contain aspect-square" src={data.cover} />
      </div>
      <main>
        <div className="mb-3 hidden lg:block">
          <h2 className="text-sm">{data.type}</h2>
          <div className="flex items-center">
            <p className="text-sm text-destructive">
              {ProjectUtils.toProjectDateStr(data.startDate)}
            </p>
            <MoveRight className="mx-2" size={16} />
            <p className="text-sm text-destructive">
              {ProjectUtils.toProjectDateStr(data.endDate)}
            </p>
          </div>
        </div>
        <hr className="w-full border-primary hidden lg:block" />
        <div className="mb-3 lg:my-3">
          <h2
            onClick={() =>
              navigate(`${rootRoutesMetadata.get("projects")?.path}/${data.id}`)
            }
            className="font-semibold text-xl cursor-pointer hover:underline"
          >
            {data.name}
          </h2>
          <p className="text-sm">{data.description.short}</p>
        </div>
        <div>
          <h2 className="font-semibold">Stack</h2>
          {data.techStacks.map((techStack) => {
            return (
              <div key={techStack.value}>
                <p className="text-sm">
                  {techStack.data
                    .map((tech) => {
                      return (tech as any).name;
                    })
                    .join(", ")}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

type ProjectsShowcaseProps = {
  canShowAll?: boolean;
};

export default function ProjectsShowcase(props: ProjectsShowcaseProps) {
  const { projects } = useProjectsState();

  const Projects = React.useMemo(() => {
    const result: Array<any> = [];

    if (!projects) return <p className="text-center">Loading...</p>;

    const N = props.canShowAll ? projects?.length : 5;
    for (let i = 0; i < N; i++) {
      result.push(<ProjectCard key={projects[i].id} data={projects[i]} />);
    }

    return result;
  }, [projects, props.canShowAll]);

  return (
    <div className="flex flex-1 max-w-[1280px] mx-auto py-3">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 mb-3">
        {Projects}
      </div>
    </div>
  );
}
