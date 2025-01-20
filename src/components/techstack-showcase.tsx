// import React from "react";

// Import state
import { useTechstacksState } from "src/states/techstacks";

// Import types
import type { TechType } from "src/objects/techstacks/types";

function TechCard({ data }: { data: TechType }) {
  return (
    <div className="flex h-fit">
      <div className="flex items-center w-[32px] h-[32px] aspect-square">
        <img src={`/icons/${data.value}.svg`} />
      </div>
      <h2 className="ms-3 text-lg">{data.name}</h2>
    </div>
  );
}

export default function TechstackShowcase() {
  const { techStacks } = useTechstacksState();

  return (
    <div className="flex flex-col gap-6 flex-1 max-w-[1280px] mx-auto py-3">
      {techStacks ? (
        techStacks.map((techStack) => {
          return (
            <div className="mb-3" key={techStack.value}>
              <h2 className="font-bold text-center mb-3">{techStack.name}</h2>
              <div className="flex justify-center gap-6">
                {techStack.data.map((tech) => (
                  <TechCard key={tech.id} data={tech} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
}
