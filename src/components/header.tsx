import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Import components
import { Button } from "./ui/button";

// Import root routes metadata
import { rootRoutesMetadata } from "src/routes/RootRoutes";

function getRouteMetadata(routesMetadata: Array<any>, currentRootPath: string) {
  return routesMetadata.find((metadata) => {
    let isCurrentShown = currentRootPath === metadata[0];

    if (currentRootPath === "" && metadata[0] === "home") isCurrentShown = true;

    return isCurrentShown;
  });
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const rootPath = location.pathname.split("/")[1];

  const routesMetadata = React.useMemo(() => [...rootRoutesMetadata], []);

  return (
    <header className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center">
        <p className="font-semibold">
          {getRouteMetadata(routesMetadata, rootPath)[1].introduction}
        </p>
      </div>
      <nav className="flex gap-2">
        {routesMetadata.map((metadata) => {
          let isCurrentShown = rootPath === metadata[0];

          if (rootPath === "" && metadata[0] === "home") isCurrentShown = true;

          return (
            <Button
              key={metadata[1].path}
              variant={isCurrentShown ? "default" : "ghost"}
              onClick={() => navigate(metadata[1].path)}
            >
              {metadata[1].name}
            </Button>
          );
        })}
      </nav>
    </header>
  );
}
