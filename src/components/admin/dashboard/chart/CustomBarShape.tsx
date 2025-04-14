
import React from "react";

interface CustomBarShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  activeBarIndex: number | null;
}

export const CustomBarShape: React.FC<CustomBarShapeProps> = ({
  x,
  y,
  width,
  height,
  index,
  activeBarIndex,
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={2}
      ry={2}
      fill={
        activeBarIndex === index
          ? "#3fcf8e" // Light mode hover color for active bar
          : activeBarIndex !== null
          ? "#16b674" // Light mode hover color for inactive bars
          : "#10b981" // Default color
      }
      className={`
        ${activeBarIndex === index
          ? "dark:fill-[#3ecf8e]" // Dark mode hover color for active bar
          : activeBarIndex !== null
          ? "dark:fill-[#006239]" // Dark mode hover color for inactive bars
          : "dark:fill-[#10b981]"} // Default dark mode color
        transition-colors duration-300 ease-in-out
      `}
    />
  );
};
