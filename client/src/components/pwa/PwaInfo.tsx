import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { InstallButton } from "./InstallButton";
import { Download, Smartphone, Wifi, Clock, Zap } from "lucide-react";

export function PwaInfo() {
  const { isInstalled } = usePwaInstall();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          {isInstalled ? "App Installed" : "Install Madifa App"}
        </CardTitle>
        <CardDescription>
          {isInstalled 
            ? "Madifa is installed as an app on your device" 
            : "Install Madifa on your device for a better experience"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <Wifi className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Offline Access</h4>
                <p className="text-sm text-muted-foreground">Access downloaded content without an internet connection</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Faster Experience</h4>
                <p className="text-sm text-muted-foreground">Enjoy quicker load times and smoother performance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Background Sync</h4>
                <p className="text-sm text-muted-foreground">Your watchlist and history sync automatically when you're back online</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">App-like Experience</h4>
                <p className="text-sm text-muted-foreground">Runs like a native app with home screen icon and fullscreen mode</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between bg-muted/50 px-6 py-4">
        {isInstalled ? (
          <div className="text-sm text-muted-foreground">
            Madifa is installed as an app on your device
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              <Download className="h-4 w-4 inline mr-1" />
              Install now to get the best experience
            </div>
            <InstallButton showIcon={false} />
          </>
        )}
      </CardFooter>
    </Card>
  );
}