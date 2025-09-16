import { cn } from "@/lib/utils";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveWrapper({ children, className }: ResponsiveWrapperProps) {
  const { isMobile, isTablet } = useMobileResponsive();
  
  return (
    <div 
      className={cn(
        "w-full max-w-full overflow-hidden",
        {
          "px-2 py-3": isMobile,
          "px-4 py-4": isTablet,
          "px-6 py-6": !isMobile && !isTablet
        },
        className
      )}
    >
      <div className="max-w-full overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveGridProps) {
  return (
    <div 
      className={cn(
        "grid gap-3 sm:gap-4 md:gap-6",
        `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`,
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "small" | "medium" | "large";
}

export function ResponsiveCard({ 
  children, 
  className, 
  padding = "medium" 
}: ResponsiveCardProps) {
  const { isMobile } = useMobileResponsive();
  
  const paddingClasses = {
    none: "",
    small: isMobile ? "p-2" : "p-3",
    medium: isMobile ? "p-3" : "p-4 md:p-6",
    large: isMobile ? "p-4" : "p-6 md:p-8"
  };
  
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-lg shadow-card",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}