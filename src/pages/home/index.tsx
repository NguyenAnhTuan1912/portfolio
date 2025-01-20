import { useNavigate } from "react-router-dom";

// Import components
import TechstackShowcase from "src/components/techstack-showcase";
import ProjectsShowcase from "src/components/projects-showcase";
import { BlogsShowcase } from "src/components/blogs-showcase";

// Import routes metadata
import { rootRoutesMetadata } from "src/routes/RootRoutes";

// Import states
import { useSettingsState } from "src/states/settings";

// Import styles
import "./index.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { theme } = useSettingsState();

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex h-[calc(100dvh-52px)] items-center m-auto">
        <p className="max-w-[320px] text-3xl me-[120px]">
          <strong>Nguyen Anh Tuan</strong>, that is my name, is a{" "}
          <span className="bg-primary text-primary-foreground">curious</span>{" "}
          fullstack + cloud developer
        </p>
        <div className="relative w-[360px] aspect-square">
          <img
            className="absolute artwork-svg z-10"
            src={`/svg/temple_body-${theme}-01.svg`}
          />
          <img
            className="absolute artwork-svg z-10"
            src={`/svg/temple_head-${theme}-01.svg`}
          />
          <div className="artwork_effect w-full flex justify-center">
            <span className="dot--animate absolute z-20"></span>
            <span className="dot absolute z-20"></span>
          </div>
          <div className="absolute w-[150%] h-[2px] bg-primary/30 top-1/2 -left-1/4 rotate-[30deg]"></div>
          <div className="absolute w-[150%] h-[2px] bg-primary/30 top-1/2 -left-1/4 rotate-90"></div>
          <div className="absolute w-[150%] h-[2px] bg-primary/30 top-1/2 -left-1/4 -rotate-[30deg]"></div>
        </div>
      </div>
      <div className="w-full mt-6">
        <div className="w-full h-2 bg-primary"></div>
        <img src={`/svg/pagebreak-${theme}.svg`} />
        <div className="w-full h-2 bg-primary"></div>
      </div>
      <div className="flex flex-col">
        <div className="relative flex flex-col items-center w-full py-3 border-b border-primary">
          <h2 className="font-bold text-2xl">Techstack</h2>
          <p>What i knew</p>
        </div>
        <div className="w-full my-4">
          <TechstackShowcase />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="relative flex flex-col items-center w-full py-3 border-b border-primary">
          <h2 className="font-bold text-2xl">Projects</h2>
          <p>What i did</p>
        </div>
        <div className="w-full my-4">
          <ProjectsShowcase />
        </div>
        <div className="w-full">
          <p
            onClick={() => navigate(rootRoutesMetadata.get("projects")!.path)}
            className="text-center underline cursor-pointer"
          >
            View more
          </p>
        </div>
      </div>
      <div className="flex flex-col mb-3">
        <div className="relative flex flex-col items-center w-full py-3 border-b border-primary">
          <h2 className="font-bold text-2xl">Blogs</h2>
          <p>What i wrote</p>
        </div>
        <div className="w-full my-4">
          <BlogsShowcase />
        </div>
        <div className="w-full">
          <p className="text-center underline cursor-pointer">View more</p>
        </div>
      </div>
    </section>
  );
}
