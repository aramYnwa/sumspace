import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from '@/types/budget';
import { format, subMonths, startOfMonth, endOfMonth, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const presets = [
    {
      label: 'This Week',
      getValue: () => ({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { weekStartsOn: 1 }),
      }),
    },
    {
      label: 'Last Week',
      getValue: () => ({
        from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
        to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      }),
    },
    {
      label: 'This Month',
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      label: 'Last Month',
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: 'Last 3 Months',
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 2)),
        to: endOfMonth(new Date()),
      }),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-2 font-mono text-sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-2" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-1 flex-wrap">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="ghost"
            size="sm"
            onClick={() => onDateRangeChange(preset.getValue())}
            className={cn("text-xs")}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
