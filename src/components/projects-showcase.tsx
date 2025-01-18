import { useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";

// Import components
import { Button } from "./ui/button";

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
    <div className="max-w-[240px]">
      <div
        onClick={() =>
          navigate(`${rootRoutesMetadata.get("projects")?.path}/${data.id}`)
        }
        className="border border-primary border-b-4 mb-3 cursor-pointer overflow-hidden hover:shadow-[0_0_0_2px_hsl(var(--primary))]"
      >
        <img
          className="max-w-[240px] object-contain aspect-square object-center"
          src={data.cover}
        />
      </div>
      <div className="mb-3">
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
    </div>
  );
}

export default function ProjectsShowcase() {
  const { projects } = useProjectsState();

  return (
    <div className="flex flex-1 max-w-[1280px] mx-auto py-3">
      <div className="flex gap-6 mb-3">
        {projects ? (
          projects.map((project) => {
            return <ProjectCard key={project.id} data={project} />;
          })
        ) : (
          <p className="text-center">Loading...</p>
        )}
      </div>
    </div>
  );
}
