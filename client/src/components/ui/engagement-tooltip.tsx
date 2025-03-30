import React, { useState, useRef, ReactNode } from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, ThumbsDown, HelpCircle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';
type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TooltipAlign = 'start' | 'center' | 'end';

export interface EngagementTooltipProps {
  id: string; // Unique identifier for this tooltip to track dismissals
  children: ReactNode;
  title: string;
  description: string;
  interactive?: boolean;
  dismissible?: boolean;
  feedbackEnabled?: boolean;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  onFeedback?: (feedback: 'helpful' | 'not-helpful') => void;
  className?: string;
  maxWidth?: number;
  placement?: TooltipPlacement;
  side?: TooltipSide;
  align?: TooltipAlign;
  showInitially?: boolean;
  forceShow?: boolean;
  delay?: number;
}

export const EngagementTooltip: React.FC<EngagementTooltipProps> = ({
  id,
  children,
  title,
  description,
  interactive = true,
  dismissible = true,
  feedbackEnabled = true,
  actionLabel,
  actionIcon,
  onAction,
  onFeedback,
  className,
  maxWidth = 320,
  placement = 'top',
  side = 'top',
  align = 'center',
  showInitially = false,
  forceShow = false,
  delay = 100,
}) => {
  const [open, setOpen] = useState(showInitially);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [dismissedTooltips, setDismissedTooltips] = useLocalStorage<string[]>('madifa-dismissed-tooltips', []);
  const isDismissed = dismissedTooltips.includes(id) && !forceShow;
  const triggerRef = useRef<HTMLDivElement>(null);

  // Handle tooltip dismissal
  const handleDismiss = () => {
    setOpen(false);
    if (dismissible && !dismissedTooltips.includes(id)) {
      setDismissedTooltips([...dismissedTooltips, id]);
    }
  };

  // Handle feedback submission
  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    if (onFeedback) {
      onFeedback(type);
    }
    
    // Auto-dismiss after feedback if dismissible
    if (dismissible) {
      setTimeout(() => {
        handleDismiss();
      }, 1000);
    }
  };

  // If this tooltip has been dismissed, don't render it
  if (isDismissed && !forceShow) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger ref={triggerRef} className={className} asChild>
          <div>{children}</div>
        </TooltipTrigger>
        
        <AnimatePresence>
          {open && (
            <TooltipContent
              side={side}
              align={align}
              asChild
              sideOffset={5}
              alignOffset={5}
              aria-live="polite"
            >
              <motion.div
                className={cn(
                  "z-50 overflow-hidden",
                  interactive ? "p-0" : "py-2 px-3"
                )}
                style={{ maxWidth }}
                initial={{ opacity: 0, scale: 0.96, y: placement === 'bottom' ? -8 : placement === 'top' ? 8 : 0, x: placement === 'left' ? 8 : placement === 'right' ? -8 : 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {interactive ? (
                  <div className="flex flex-col w-full">
                    {/* Header with title and dismiss button */}
                    <div className="flex items-center justify-between bg-primary px-3 py-2 text-primary-foreground">
                      <div className="font-semibold tracking-tight">{title}</div>
                      {dismissible && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 p-0 text-primary-foreground opacity-70 hover:opacity-100 hover:bg-primary-foreground/10" 
                          onClick={handleDismiss}
                          aria-label="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="px-3 py-2 text-sm">{description}</div>
                    
                    {/* Action button */}
                    {actionLabel && onAction && (
                      <div className="px-3 pb-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => {
                            onAction();
                            if (dismissible) handleDismiss();
                          }}
                        >
                          {actionIcon && <span className="mr-2">{actionIcon}</span>}
                          {actionLabel}
                        </Button>
                      </div>
                    )}
                    
                    {/* Feedback section */}
                    {feedbackEnabled && (
                      <div className="px-3 pb-2 pt-1 border-t">
                        {feedback ? (
                          <p className="text-xs text-center text-muted-foreground">
                            {feedback === 'helpful' ? 'Thanks for your feedback!' : 'Thanks for letting us know.'}
                          </p>
                        ) : (
                          <div className="flex flex-col space-y-1">
                            <p className="text-xs text-center text-muted-foreground">
                              Was this helpful?
                            </p>
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs flex items-center gap-1"
                                onClick={() => handleFeedback('helpful')}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                Yes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs flex items-center gap-1"
                                onClick={() => handleFeedback('not-helpful')}
                              >
                                <ThumbsDown className="h-3 w-3" />
                                No
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>{description}</div>
                )}
              </motion.div>
            </TooltipContent>
          )}
        </AnimatePresence>
      </Tooltip>
    </TooltipProvider>
  );
};

export const FeatureHighlight: React.FC<Omit<EngagementTooltipProps, 'id'> & { featureId: string; persistent?: boolean }> = ({
  featureId,
  persistent = false,
  ...props
}) => {
  return (
    <EngagementTooltip
      id={`feature-highlight-${featureId}`}
      dismissible={!persistent}
      actionIcon={<HelpCircle className="h-4 w-4" />}
      actionLabel="Learn More"
      feedbackEnabled={false}
      {...props}
    />
  );
};

export const FeatureOnboarding: React.FC<Omit<EngagementTooltipProps, 'id'> & { step: number; totalSteps?: number }> = ({
  step,
  totalSteps = 1,
  showInitially = true,
  dismissible = false,
  ...props
}) => {
  return (
    <EngagementTooltip
      id={`onboarding-step-${step}`}
      showInitially={showInitially}
      dismissible={dismissible}
      feedbackEnabled={false}
      {...props}
    />
  );
};

export const PersonalizationTip: React.FC<Omit<EngagementTooltipProps, 'id'> & { tipId: string }> = ({
  tipId,
  ...props
}) => {
  return (
    <EngagementTooltip
      id={`personalization-tip-${tipId}`}
      actionIcon={<Heart className="h-4 w-4" />}
      {...props}
    />
  );
};