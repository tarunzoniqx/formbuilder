
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipHelper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import React, { forwardRef } from "react";
// import { AiOutlineInfoCircle } from "react-icons/ai";


interface FormInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
  label?: string;
  prefix?: string;
  error?: string;
  tooltipContent?: React.ReactNode;
  className ?: string,
}

export const FormInput = forwardRef<
  React.ElementRef<typeof Input>,
  FormInputProps
>(({ label, className, error, prefix, tooltipContent, ...props }, ref) => {
  return (
    <div className="flex w-full flex-col flex-wrap items-start gap-1">
      {/* LABEL */}
      {label && (
        <div className="flex items-center gap-1">
          <Label
            className={cn(
              "leading-9",
              props.required && "after:text-red-400 after:content-['*']"
            )}
            htmlFor={props?.id}
          >
            {label}
          </Label>
          {tooltipContent && (
            <TooltipHelper
              trigger={
                <Circle className="fill-muted-foreground" />
              }
            >
              {tooltipContent}
            </TooltipHelper>
          )}
        </div>
      )}
      {/* INPUT WITH OPTIONAL PREFIX */}
      <div className="flex w-full">
        {prefix && (
          <div
            className={cn(
              "inline-flex appearance-none items-center justify-center rounded-[4px] rounded-r-none  border border-r-0 border-border  bg-muted px-[15px] text-[15px] leading-none",
              error && "ring-1 ring-red-400"
            )}
          >
            {prefix}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            prefix && "rounded-l-none rounded-r-[4px]",
            error && "ring-1 ring-red-400",
            className
          )}
          {...props}
        />
      </div>
      {/* ERROR */}
      {error && <span className="text-[12px] text-red-700">{error}</span>}
    </div>
  );
});
