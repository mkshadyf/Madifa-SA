import { Button, ButtonProps } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InstallButtonProps extends Omit<ButtonProps, "onClick"> {
  showIcon?: boolean;
  tooltipText?: string;
}

export function InstallButton({
  variant = "default",
  size = "default",
  className,
  children,
  showIcon = true,
  tooltipText = "Install Madifa as an app",
  ...props
}: InstallButtonProps) {
  const { isInstallable, isInstalled, installApp } = usePwaInstall();
  const [installInProgress, setInstallInProgress] = useState(false);

  // Don't render if not installable or already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setInstallInProgress(true);
    await installApp();
    setInstallInProgress(false);
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleInstall}
      disabled={installInProgress}
      {...props}
    >
      {showIcon && <Download className="h-4 w-4 mr-2" />}
      {children || "Install App"}
    </Button>
  );

  if (tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}