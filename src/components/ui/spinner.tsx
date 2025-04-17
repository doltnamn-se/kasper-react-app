
import { type LucideProps } from 'lucide-react';

type SpinnerVariantProps = Omit<SpinnerProps, 'variant'>;

const Ring = ({ size = 24, color = "#20f922", centerSize = 3, ...props }: SpinnerVariantProps & { color?: string, centerSize?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 44 44"
    stroke={color}
    {...props}
  >
    <title>Loading...</title>
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd" strokeWidth="2">
      <circle cx="22" cy="22" r="1">
        <animate
          attributeName="r"
          begin="0s"
          dur="2.2s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          begin="0s"
          dur="2.2s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="22" cy="22" r="1">
        <animate
          attributeName="r"
          begin="-1.1s"
          dur="2.2s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          begin="-1.1s"
          dur="2.2s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite"
        />
      </circle>
    </g>
    <circle 
      cx="22" 
      cy="22" 
      r={centerSize} 
      fill={color}
      filter="url(#glow)"
      stroke="none"
    />
  </svg>
);

export type SpinnerProps = LucideProps & {
  variant?: 'ring';
  centerSize?: number;
};

export const Spinner = ({ ...props }: SpinnerProps) => {
  return <Ring {...props} />;
};
