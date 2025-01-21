import React from "react";

// Import objects
import { ProjectUtils } from "./objects/projects/utils";
import { BlogUtils } from "./objects/blogs/utils";

// Import routes
import RootRoutes from "./routes/RootRoutes";

// Import states
import { useTechstacksState } from "./states/techstacks";
import { useSettingsState } from "./states/settings";
import { useProjectsState } from "./states/projects";
import { useBlogsState } from "./states/blogs";
import { useContactsState } from "./states/contact";

import "./App.css";

function App() {
  const { theme } = useSettingsState();
  const { setTechStacks } = useTechstacksState();
  const { setProjects } = useProjectsState();
  const { setBlogs } = useBlogsState();
  const { setContactStacks } = useContactsState();

  // Fecth data
  React.useEffect(() => {
    console.log("Request data");
    const getTechStacksPromise = fetch("/data/techstack/data.json").then(
      (res) => res.json()
    );
    const getProjectsPromise = fetch("/data/projects/data.json").then((res) =>
      res.json()
    );
    const getBlogsPromise = fetch("/data/blogs/data.json").then((res) =>
      res.json()
    );
    const getContactsPromise = fetch("/data/contact/data.json").then((res) =>
      res.json()
    );

    Promise.all([
      getTechStacksPromise,
      getProjectsPromise,
      getBlogsPromise,
      getContactsPromise,
    ]).then((values) => {
      let [techStacks, projects, blogs, contact] = values;

      // Transform projects & blogs before add
      projects = ProjectUtils.sortNewest(
        ProjectUtils.mergeTechStacks(projects as any, techStacks)
      );
      blogs = BlogUtils.sortNewest(blogs);

      setTechStacks(techStacks);
      setProjects(projects as any);
      setBlogs(blogs);
      setContactStacks(contact);
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
