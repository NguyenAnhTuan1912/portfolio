// Import components
import { BlogsShowcase } from "src/components/blogs-showcase";

export default function BlogsPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center">
      <h1 className="text-3xl font-bold my-3">All of my blogs</h1>
      <BlogsShowcase canShowAll />
    </section>
  );
}
