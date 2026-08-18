import LottieModule from "lottie-react";
import type { LottieComponentProps } from "lottie-react";

// Fix for some Vite / ESM interop issues
const Lottie = (LottieModule as any).default ?? LottieModule;

interface AnimationProps extends Omit<LottieComponentProps, "animationData"> {
  source: object;
  height?: number | string;
  width?: number | string;
  className?: string;
}

const Animation = ({
  source,
  height = 200,
  width = 200,
  loop = true,
  autoplay = true,
  className = "",
  style,
  ...rest
}: AnimationProps) => {
  if (!source) {
    console.warn("Animation: source is missing");
    return null;
  }

  return (
    <Lottie
      animationData={source}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={{
        height,
        width,
        ...style,
      }}
      {...rest}
    />
  );
};

export default Animation;