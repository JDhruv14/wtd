"use client";

import { DayCell } from "@/components/day-cell";
import type { DayData } from "@/lib/types";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface CalendarMonthProps {
  days: DayData[];
  onDayClick: (day: DayData) => void;
  selectedDate: string | null;
  isOptimistic?: boolean;
  forceShowIcons?: boolean;
  filterColor?: string | null;
}

export function CalendarMonth({
  days,
  onDayClick,
  selectedDate,
  isOptimistic = false,
  forceShowIcons = false,
  filterColor,
}: CalendarMonthProps) {
  if (days.length === 0) return null;

  const [yyyy, mm] = days[0].date.split("-").map(Number);
  const startPadding = new Date(yyyy, mm - 1, 1).getDay();
  const startCells = Array.from({ length: startPadding }, (_, i) => i);
  const endPadding = (7 - ((startPadding + days.length) % 7)) % 7;
  const endCells = Array.from({ length: endPadding }, (_, i) => i);

  return (
    <div className="flex flex-col w-full select-none">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 justify-items-center px-2 mb-0.5">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="h-6 flex items-center justify-center w-10">
            <span className="font-mono text-[9px] font-medium text-muted-foreground/35 uppercase tracking-wider">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 justify-items-center px-2 gap-y-0.5">
        {startCells.map(i => <div key={`s${i}`} className="w-10 h-10" />)}
        {days.map(day => (
          <DayCell
            key={day.date}
            day={day.day}
            size="sm"
            iconName={day.iconName}
            forceShowIcon={forceShowIcons}
            filterColor={filterColor}
            isSkipped={!day.hasContent}
            isToday={day.isToday}
            isSelected={day.date === selectedDate}
            isOptimistic={isOptimistic && day.date === selectedDate}
            primaryColor={day.primaryColor}
            onClick={() => onDayClick(day)}
          />
        ))}
        {endCells.map(i => <div key={`e${i}`} className="w-10 h-10" />)}
      </div>
    </div>
  );
}
