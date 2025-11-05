"use client";
import dynamic from "next/dynamic";
import { isIntegrationEnabled } from "@/lib/integrations-config";

// Lazy load Lottie player
const LottiePlayerLib = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => ({ default: mod.Player })),
  { ssr: false }
);

interface LottiePlayerProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function LottiePlayer({
  src,
  autoplay = true,
  loop = true,
  className,
  style,
}: LottiePlayerProps) {
  if (!isIntegrationEnabled("lottie")) {
    return (
      <div className={`flex items-center justify-center p-8 bg-muted rounded-lg ${className}`} style={style}>
        <p className="text-sm text-muted-foreground">Lottie animations are disabled</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={style}>
      <LottiePlayerLib
        src={src}
        autoplay={autoplay}
        loop={loop}
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}
