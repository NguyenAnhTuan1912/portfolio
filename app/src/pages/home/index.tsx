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
      <div className="flex h-[calc(100dvh-52px)] flex-col justify-center lg:flex-row items-center m-auto">
        <p className="max-w-[320px] text-center text-3xl lg:me-[120px]">
          <strong>Nguyen Anh Tuan</strong>, that is my name, is a{" "}
          <span className="bg-primary text-primary-foreground">curious</span>{" "}
          fullstack + cloud developer
        </p>
        <div className="relative w-[240px] lg:w-[360px] aspect-square">
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
      <div className="w-full flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center py-3 w-full border-y border-primary">
          <h2 className="font-bold text-2xl">My story</h2>
          <p>Something about me you should know...</p>
        </div>
        <div className="max-w-[720px] text-justify px-3 py-6 border-x border-primary">
          <p className="mb-3">
            &nbsp;&nbsp;&nbsp;&nbsp;In the beginning of this field, I had a
            strong interest for designing and coding, so I learnt and practice
            in the "front" of web developer to satisfy my interest.
          </p>
          <p className="mb-3">
            By the time, I went further in this field and I found that ... there
            are many things to explore! FrontEnd is an "ocean" and BackEnd is
            another "ocean" too ! It makes me have to put to the sea to explore
            new things. And I'm super happy with that experience / journey.
          </p>
          <p className="mb-3">
            In 2024, I had a big updated for myself. I started learning about
            Cloud Computing (AWS) at{" "}
            <span className="bg-yellow-400 font-bold">First Cloud Journey</span>{" "}
            program. Then, I was curious to know what{" "}
            <span className="bg-yellow-400 font-bold">Blockchain</span> is. And
            boom ! I have two parallel journeys, It's so hard at that time, but
            it's still fun.
          </p>
          <p>
            Now, I'm trying to make my career as a Journey to enjoy it as much
            as possible. That's all, you should scroll down to know more about
            my experiences.
          </p>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <div className="w-full h-2 bg-primary"></div>
        <img className="min-w-[1280px]" src={`/svg/pagebreak-${theme}.svg`} />
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
        <div className="relative flex flex-col items-center w-full py-3 border-y border-primary">
          <h2 className="font-bold text-2xl">Projects</h2>
          <p>What i did</p>
        </div>
        <div className="w-full my-4">
          <ProjectsShowcase />
        </div>
        <div className="w-full mb-3">
          <p
            onClick={() => navigate(rootRoutesMetadata.get("projects")!.path)}
            className="text-center underline cursor-pointer"
          >
            View more
          </p>
        </div>
      </div>
      <div className="flex flex-col mb-3">
        <div className="relative flex flex-col items-center w-full py-3 border-y border-primary">
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
