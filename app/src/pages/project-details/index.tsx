import React from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Import components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "src/components/ui/carousel";
// Import components
import MDContent from "src/components/markdown";

// Import utils
import { ProjectUtils } from "src/objects/projects/utils";

// Import states
import { useProjectsState } from "src/states/projects";

// Import types
// import type { ProjectType } from "src/objects/projects/types";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useProjectsState();

  const data = React.useMemo(() => {
    return projects?.find((project) => project.id === id)!;
  }, [id, projects?.length]);

  React.useEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, []);

  if (!projects) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-1 flex-col max-w-[960px] mx-auto py-3">
      <div className="flex items-center justify-between  mb-3">
        <p
          onClick={() => navigate("/projects")}
          className="flex items-center cursor-pointer hover:underline"
        >
          <ArrowLeft className="me-3" size={16} /> Back
        </p>
        <p>Viewing project details</p>
      </div>
      <hr className="my-3" />
      <div className="mb-3">
        <h1 className="text-3xl font-bold">{data.name}</h1>
        <p>{data.description.short}</p>
      </div>
      <div className="mb-3 bg-secondary">
        <img className="w-full aspect-video object-contain" src={data.cover} />
      </div>
      <hr className="my-3" />
      <div className="mb-3 [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3">
        <h2 className="text-xl font-bold">Description</h2>
        <MDContent>{data.description.long}</MDContent>
      </div>
      <div>
        <h2 className="text-xl font-bold">Time</h2>
        <p>
          Start at:{" "}
          <span className="text-destructive">
            {ProjectUtils.toProjectDateStr(data.startDate)}
          </span>
        </p>
        <p>
          End at:{" "}
          <span className="text-destructive">
            {ProjectUtils.toProjectDateStr(data.endDate)}
          </span>
        </p>
      </div>
      <hr className="my-3" />
      <div>
        <h2 className="text-xl font-bold">Techstack</h2>
        {data.techStacks.map((techStack) => {
          return (
            <div key={techStack.value}>
              <span>{techStack.name}:</span>{" "}
              <span className="text-destructive">
                {techStack.data
                  .map((tech) => {
                    return (tech as any).name;
                  })
                  .join(", ")}
              </span>
            </div>
          );
        })}
      </div>
      <hr className="my-3" />
      <div className="mb-3">
        <h2 className="text-xl font-bold">Images</h2>
        <p className="mb-3">Some images of this project</p>
        <div className="flex justify-center">
          <Carousel className="w-full">
            <CarouselContent>
              {data.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <img
                      className="w-full aspect-video object-contain"
                      src={image}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold">Link</h2>
        <p>Access these links to get more information about this project</p>
        <ul>
          {data.links.map((link) => {
            return (
              <li key={link.id}>
                <strong>{link.name}:</strong>{" "}
                <a
                  className="hover:underline"
                  target="_blank"
                  href={link.value}
                >
                  {link.value}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
