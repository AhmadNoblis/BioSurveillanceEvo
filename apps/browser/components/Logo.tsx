import { clsx } from "clsx";
import { memo } from "react";
import colors from "tailwindcss/colors";

type LogoType = {
  wordmark?: boolean;
  className?: string;
  logoClassName?: string;
  chatAvatar?: boolean;
};

const Logo = ({
  wordmark = true,
  className,
  logoClassName,
  chatAvatar,
}: LogoType) => {
  return (
    <>
      <div className={clsx("flex", className)}>
        <svg
          viewBox={`0 0 ${wordmark ? "1912" : "613"} 613`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={clsx("h-auto w-full", logoClassName)}
        >
          {/* Existing SVG elements for the logo */}
          {/* ... */}

          {wordmark && (
            <>
              {/* Replace the following with SVG paths for "Noblis" */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                fill="currentColor"
                fontSize="150"
                dy=".3em"
              >
                Noblis
              </text>
            </>
          )}

          {/* Other existing SVG definitions */}
          {/* ... */}
        </svg>
      </div>
    </>
  );
};

export default memo(Logo);
