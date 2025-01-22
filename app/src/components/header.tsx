import React from "react";
import { Sun, Moon, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Import components
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

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
  const { theme, toggleTheme } = useSettingsState();
  const navigate = useNavigate();
  const location = useLocation();

  const rootPath = location.pathname.split("/")[1];

  const routesMetadata = React.useMemo(() => [...rootRoutesMetadata], []);

  React.useEffect(() => {
    const title = "Nguyen Anh Tuan | ";
    // Change title
    switch (rootPath) {
      case "projects": {
        document.title = title + "Projects";
        break;
      }

      case "blogs": {
        document.title = title + "Blogs";
        break;
      }

      case "contact": {
        document.title = title + "Contact";
        break;
      }

      default: {
        document.title = title + "Home";
        break;
      }
    }
  }, [rootPath]);

  return (
    <header className="sticky top-0 flex items-center justify-between px-3 border-b border-primary z-50 bg-background">
      <div className="flex items-center py-2">
        <p className="font-semibold">
          {getRouteMetadata(routesMetadata, rootPath)[1].introduction}
        </p>
      </div>
      <div className="flex items-center">
        <div className="me-3 py-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => toggleTheme()}
                  variant="outline"
                  size="icon"
                >
                  {theme === "light" ? <Moon /> : <Sun />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {theme === "light"
                    ? "Switch to Dark theme"
                    : "Switch to Light theme"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="block lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Menu />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Explore</SheetTitle>
                <nav className="flex flex-col gap-2">
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
              </SheetHeader>
            </SheetContent>
          </Sheet>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Menu />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
        <nav className="flex gap-2 ps-3 py-2 border-l border-primary hidden lg:flex">
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
