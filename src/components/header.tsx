import React from "react";
import { Sun, Moon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Import components
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// Import states
import { useSettingsState } from "src/states/settings";

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
  const { theme, setTheme } = useSettingsState();
  const navigate = useNavigate();
  const location = useLocation();

  const rootPath = location.pathname.split("/")[1];

  const routesMetadata = React.useMemo(() => [...rootRoutesMetadata], []);

  return (
    <header className="sticky top-0 flex items-center justify-between px-3 border-b border-primary z-50 bg-background">
      <div className="flex items-center py-2">
        <p className="font-semibold">
          {getRouteMetadata(routesMetadata, rootPath)[1].introduction}
        </p>
      </div>
      <div className="flex items-center">
        <div className="me-3">
          <TooltipProvider>
            {theme === "light" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setTheme("dark")}
                    variant="outline"
                    size="icon"
                  >
                    <Moon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to Dark theme</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setTheme("light")}
                    variant="outline"
                    size="icon"
                  >
                    <Sun />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to Light theme</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
        <nav className="flex gap-2 ps-3 py-2 border-l border-primary">
          {routesMetadata.map((metadata) => {
            let isCurrentShown = rootPath === metadata[0];

            if (rootPath === "" && metadata[0] === "home")
              isCurrentShown = true;

            return (
              <Button
                key={metadata[1].path}
                variant={isCurrentShown ? "default" : "outline"}
                onClick={() => navigate(metadata[1].path)}
              >
                <p
                  className={
                    isCurrentShown ? "text-background" : "text-primary"
                  }
                >
                  {metadata[1].name}
                </p>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
