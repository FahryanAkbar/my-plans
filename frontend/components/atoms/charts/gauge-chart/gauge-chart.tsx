"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
  PieChart, 
  Pie as RechartsPie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Sector,
  PieProps
} from "recharts";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/atoms";

interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  payload?: {
    name: string;
    value: number;
    count?: number;
    color: string;
  };
}

interface ExtendedPieProps extends PieProps {
  activeIndex?: number | number[];
  activeShape?: (props: ActiveShapeProps) => React.ReactElement;
}

const Pie = RechartsPie as React.ComponentType<ExtendedPieProps>;

export interface GaugeSegment {
  name: string;
  value: number;
  color: string;
}

export interface GaugeValueSegment {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface GaugeChartProps {
  data: GaugeSegment[];
  value?: number;
  valueSegments?: GaugeValueSegment[];
  min?: number;
  max?: number;
  label?: string;
  subLabel?: string;
  innerRadius?: number | `${number}%`;
  outerRadius?: number | `${number}%`;
  startAngle?: number;
  endAngle?: number;
  className?: string;
  height?: number | string;
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const { 
    cx = 0, 
    cy = 0, 
    innerRadius = 0, 
    outerRadius = 0, 
    startAngle = 0, 
    endAngle = 0, 
    fill = "var(--primary)" 
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4} 
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 12px color-mix(in srgb, ${fill} 30%, transparent))` }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12} 
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="opacity-60"
      />
    </g>
  );
};

export const GaugeChart = ({
  data,
  value = 0,
  valueSegments,
  min = 0,
  max = 100,
  label,
  subLabel,
  innerRadius = "70%",
  outerRadius = "100%",
  startAngle = 180,
  endAngle = 0,
  className,
  height = 200,
}: GaugeChartProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);


  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };
  
  const normalizedValue = useMemo(() => {
    if (valueSegments) {
      const sum = valueSegments.reduce((acc, curr) => acc + curr.value, 0);
      return Math.min(Math.max(sum, min), max);
    }
    return Math.min(Math.max(value, min), max);
  }, [value, valueSegments, min, max]);

  const progressData = useMemo(() => {
    if (valueSegments) {
      const segments = valueSegments.map(s => ({ 
        name: s.name, 
        value: s.value, 
        count: s.count,
        fill: s.color 
      }));
      const totalFilled = valueSegments.reduce((acc, curr) => acc + curr.value, 0);
      return [
        ...segments,
        { name: "Remaining", value: Math.max(max - totalFilled, 0), count: 0, fill: "transparent" }
      ];
    }
    return [
      { name: "Progress", value: normalizedValue - min, count: 0, fill: "var(--primary)" },
      { name: "Remaining", value: max - normalizedValue, count: 0, fill: "transparent" },
    ];
  }, [normalizedValue, valueSegments, min, max]);

  const activeSegment = useMemo(() => {
    if (activeIndex !== -1 && progressData[activeIndex]) {
      return progressData[activeIndex];
    }
    return null;
  }, [activeIndex, progressData]);

  return (
    <div 
      className={cn("relative w-full flex flex-col items-center justify-center overflow-hidden", className)} 
      style={{ height }}
    >
      <div className="h-full w-full flex items-center justify-center">
        {isMounted ? (
          <ResponsiveContainer width="100%" height={height as number} minWidth={0} minHeight={0} debounce={100}>

        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="100%" 
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-bg-${index}`} 
                fill={entry.color} 
                className={cn(
                  "transition-all duration-500",
                  activeIndex !== -1 ? "opacity-5" : "opacity-10"
                )}
              />
            ))}
          </Pie>

          <Pie
            data={progressData}
            cx="50%"
            cy="100%"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={0}
            dataKey="value"
            nameKey="name"
            stroke="none"
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {progressData.map((entry, index) => (
              <Cell 
                key={`cell-fill-${index}`} 
                fill={entry.fill} 
                className={cn(
                  "transition-all duration-500",
                  entry.fill === "transparent" ? "opacity-0" : 
                  activeIndex !== -1 && activeIndex !== index ? "opacity-20 saturate-50" : "opacity-100",
                  activeIndex === index && "drop-shadow-[0_0_20px_rgba(0,0,0,0.15)]"
                )} 
              />
            ))}
          </Pie>

          <Tooltip 
            content={({ active, payload }) => {
              return null;
            }}
          />
        </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-muted/5 animate-pulse rounded-full" />
        )}
      </div>


      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-none">
        <Typography className={cn(
          "font-black leading-none tracking-tighter transition-all duration-500 ease-out",
          activeSegment ? "text-2xl opacity-100 scale-100" : "text-4xl opacity-100 scale-100"
        )}>
          {activeSegment ? (
            <span style={{ color: activeSegment.fill }}>
              {activeSegment.count !== undefined ? `${activeSegment.count} Tasks` : `${activeSegment.value}%`}
            </span>
          ) : (
            label || normalizedValue
          )}
        </Typography>
        <Typography className={cn(
          "font-black uppercase tracking-[0.2em] mt-3 text-muted-foreground transition-all duration-500",
          activeSegment ? "text-[12px] opacity-100 translate-y-0" : "text-[11px] opacity-60"
        )}>
          {activeSegment ? activeSegment.name : subLabel}
        </Typography>
      </div>
    </div>
  );
};
