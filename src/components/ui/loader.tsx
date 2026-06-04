import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gradient start color. Defaults to the brand turquoise. */
  fromColor?: string;
  /** Gradient end color. Defaults to the brand purple. */
  toColor?: string;
}

/**
 * Circular gradient ring spinner with a soft blurred shadow.
 *
 * Ported from a styled-components source to a plain inline <style> block so it
 * stays a Server Component (no "use client", no CSS-in-JS runtime/registry).
 * The gooey edge comes from an SVG blur+contrast filter; the spin is a pure CSS
 * keyframe animating stroke-dashoffset.
 */
const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, fromColor = "#2ae5dc", toColor = "#4740ff", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("loader-ring relative", className)}
        role="status"
        aria-label="Cargando"
        {...props}
      >
        {/* SVG filter used to merge the rounded stroke ends into a gooey shape */}
        <svg className="loader-gegga" aria-hidden="true">
          <defs>
            <filter id="loader-gegga">
              <feGaussianBlur in="SourceGraphic" stdDeviation={7} result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10"
                result="inreGegga"
              />
              <feComposite in="SourceGraphic" in2="inreGegga" operator="atop" />
            </filter>
          </defs>
        </svg>

        <svg className="loader-snurra" width={200} height={200} viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient
              id="loader-gradient"
              x1={40}
              y1={40}
              x2={160}
              y2={160}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor={fromColor} />
              <stop offset={1} stopColor={toColor} />
            </linearGradient>
          </defs>
          <path
            className="loader-halvan"
            d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"
          />
          <circle className="loader-strecken" cx={100} cy={100} r={64} />
        </svg>

        <svg className="loader-skugga" width={200} height={200} viewBox="0 0 200 200" aria-hidden="true">
          <path
            className="loader-halvan"
            d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"
          />
          <circle className="loader-strecken" cx={100} cy={100} r={64} />
        </svg>

        <style>
          {`
            .loader-gegga {
              width: 0;
              height: 0;
              position: absolute;
            }

            .loader-snurra {
              filter: url(#loader-gegga);
            }

            .loader-halvan {
              animation: loader-snurra 10s infinite linear;
              stroke-dasharray: 180 800;
              fill: none;
              stroke: url(#loader-gradient);
              stroke-width: 23;
              stroke-linecap: round;
            }

            .loader-strecken {
              animation: loader-snurra 3s infinite linear;
              stroke-dasharray: 26 54;
              fill: none;
              stroke: url(#loader-gradient);
              stroke-width: 23;
              stroke-linecap: round;
            }

            .loader-skugga {
              filter: blur(5px);
              opacity: 0.3;
              position: absolute;
              inset: 0;
              transform: translate(3px, 3px);
            }

            @keyframes loader-snurra {
              0% {
                stroke-dashoffset: 0;
              }
              100% {
                stroke-dashoffset: -403px;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .loader-halvan,
              .loader-strecken {
                animation-duration: 24s;
              }
            }
          `}
        </style>
      </div>
    );
  }
);
Loader.displayName = "Loader";

export { Loader };
export default Loader;
