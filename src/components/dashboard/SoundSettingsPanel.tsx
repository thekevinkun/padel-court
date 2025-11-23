import { Volume2, VolumeX, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

import { useSoundSettings } from "@/contexts/SoundSettingsContext";

const SoundSettingsPanel = () => {
  const { soundEnabled, volume, setSoundEnabled, setVolume, testSound } =
    useSoundSettings();

  const soundTests = [
    { type: "NEW_BOOKING" as const, label: "New Booking" },
    { type: "PAYMENT_RECEIVED" as const, label: "Payment Success" },
    { type: "PAYMENT_FAILED" as const, label: "Payment Failed" },
    { type: "CANCELLATION" as const, label: "Cancellation" },
  ];

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-forest" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
          Sound Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Master Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Sounds</Label>
            <p className="text-xs text-muted-foreground">
              Play audio for notifications
            </p>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
        </div>

        {/* Volume Control */}
        {soundEnabled && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Volume</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={(values) => setVolume(values[0] / 100)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Test Sounds */}
            <div className="pt-2 border-t">
              <Label className="text-sm font-medium mb-2 block">
                Test Sounds
              </Label>
              <div className="space-y-2">
                {soundTests.map((sound) => (
                  <Button
                    key={sound.type}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => testSound(sound.type)}
                  >
                    <Play className="w-3 h-3 mr-2" />
                    {sound.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Sounds only play when this tab is active
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SoundSettingsPanel;
