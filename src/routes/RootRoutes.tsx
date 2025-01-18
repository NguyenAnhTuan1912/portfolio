// import React from "react";
import { Outlet, useRoutes, Navigate } from "react-router-dom";

// Import layouts
import MainLayout from "src/layouts/main-layout";

// Import pages
import HomePage from "src/pages/home";
import ProjectsPage from "src/pages/projects";
import BlogsPage from "src/pages/blogs";
import ContactPage from "src/pages/contact";
import ProjectDetailsPage from "src/pages/project-details";

// Import utils
// import { CookieUtils } from "src/utils/cookies";

// Import types
import type { RouteObject } from "react-router-dom";

export const rootRoutesMetadata = new Map([
  [
    "home",
    {
      path: "/",
      name: "Home",
      introduction: "About me",
    },
  ],
  [
    "projects",
    {
      path: "/projects",
      name: "My Projects",
      introduction: "View all my projects",
    },
  ],
  [
    "blogs",
    {
      path: "/blogs",
      name: "Blogs",
      introduction: "Read my blogs",
    },
  ],
  [
    "contact",
    {
      path: "/contact",
      name: "Contact",
      introduction: "Contact me",
    },
  ],
]);

const rootRoutes: Array<RouteObject> = [
  {
    path: "/",
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      {
        path: rootRoutesMetadata.get("home")?.path,
        element: <HomePage />,
      },
      {
        path: rootRoutesMetadata.get("projects")?.path,
        element: <ProjectsPage />,
      },
      {
        path: rootRoutesMetadata.get("blogs")?.path,
        element: <BlogsPage />,
      },
      {
        path: rootRoutesMetadata.get("contact")?.path,
        element: <ContactPage />,
      },
      {
        path: `${rootRoutesMetadata.get("projects")?.path}/:id`,
        element: <ProjectDetailsPage />,
      },
      {
        path: "/home",
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

export default function RootRoutes() {
  return useRoutes(rootRoutes);
}
