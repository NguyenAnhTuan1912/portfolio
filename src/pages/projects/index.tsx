// Import components
import ProjectsShowcase from "src/components/projects-showcase";

export default function ProjectsPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center">
      <h1 className="text-3xl font-bold my-3">All of my projects</h1>
      <ProjectsShowcase canShowAll />
    </section>
  );
}
