import React from "react";

// Import objects
import { ProjectUtils } from "./objects/projects/utils";

// Import routes
import RootRoutes from "./routes/RootRoutes";

// Import states
import { useTechstacksState } from "./states/techstacks";
import { useSettingsState } from "./states/settings";
import { useProjectsState } from "./states/projects";
import { useBlogsState } from "./states/blogs";

import "./App.css";

function App() {
  const { theme } = useSettingsState();
  const { setTechStacks } = useTechstacksState();
  const { setProjects } = useProjectsState();
  const { setBlogs } = useBlogsState();

  // Fecth data
  React.useEffect(() => {
    console.log("Request data");
    const getTechStacksPromise = import("src/assets/techstack/data.json");
    const getProjectsPromise = import("src/assets/projects/data.json");
    const getBlogsPromise = import("src/assets/blogs/data.json");

    Promise.all([
      getTechStacksPromise,
      getProjectsPromise,
      getBlogsPromise,
    ]).then((values) => {
      let [techStacksDefault, projectsDefault, blogsDefault] = values;
      let techStacks = techStacksDefault.default;
      let projects = projectsDefault.default;
      let blogs = blogsDefault.default;

      // Transform projects before add
      projects = ProjectUtils.mergeTechStacks(projects as any, techStacks);

      setTechStacks(techStacks);
      setProjects(projects as any);
      setBlogs(blogs);
    });
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return <RootRoutes />;
}

export default App;
