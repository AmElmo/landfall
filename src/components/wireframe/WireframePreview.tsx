"use client";

import { cn } from "@/lib/utils";
import type { LayoutTemplate, WireframeElement, StyleColors } from "@/lib/types";

interface WireframePreviewProps {
  template: LayoutTemplate;
  className?: string;
  compact?: boolean;
  styleColors?: StyleColors;
}

export function WireframePreview({ template, className, compact = false, styleColors }: WireframePreviewProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed flex flex-col justify-center",
        compact ? "p-4 py-6" : "p-6 py-8",
        className
      )}
      style={{
        backgroundColor: styleColors?.backgroundAlt || 'rgba(0,0,0,0.03)',
        borderColor: styleColors?.border ? `${styleColors.border}40` : 'rgba(0,0,0,0.1)',
      }}
    >
      <WireframeLayout structure={template.structure} elements={template.elements} compact={compact} styleColors={styleColors} />
    </div>
  );
}

interface WireframeLayoutProps {
  structure: string;
  elements: WireframeElement[];
  styleColors?: StyleColors;
  compact?: boolean;
}

function WireframeLayout({ structure, elements, compact }: WireframeLayoutProps) {
  // Render based on structure type
  switch (structure) {
    // Feature layouts
    case "3-column-grid":
      return <ThreeColumnGrid elements={elements} compact={compact} />;
    case "2-column-grid":
      return <TwoColumnGrid elements={elements} compact={compact} />;
    case "vertical-list":
      return <VerticalList elements={elements} compact={compact} />;
    case "alternating-rows":
      return <AlternatingRows elements={elements} compact={compact} />;
    case "bento-grid":
      return <BentoGrid elements={elements} compact={compact} />;

    // Hero layouts
    case "centered-stack":
      return <CenteredStack elements={elements} compact={compact} />;
    case "split-half":
      return <SplitHalf elements={elements} compact={compact} />;
    case "text-left-image-right":
      return <TextLeftImageRight elements={elements} compact={compact} />;
    case "fullwidth-bg":
    case "video-bg":
      return <FullwidthBackground elements={elements} compact={compact} isVideo={structure === "video-bg"} />;

    // Logo layouts
    case "logo-row":
    case "heading-logo-row":
      return <LogoRow elements={elements} compact={compact} hasHeading={structure === "heading-logo-row"} />;
    case "logo-marquee":
      return <LogoMarquee elements={elements} compact={compact} />;
    case "logo-grid":
      return <LogoGrid elements={elements} compact={compact} />;

    // How it works layouts
    case "numbered-steps":
      return <NumberedSteps elements={elements} compact={compact} />;
    case "vertical-timeline":
      return <VerticalTimeline elements={elements} compact={compact} />;
    case "step-cards":
      return <StepCards elements={elements} compact={compact} />;

    // Testimonials layouts
    case "single-featured":
      return <SingleFeatured elements={elements} compact={compact} />;
    case "carousel":
      return <Carousel elements={elements} compact={compact} />;
    case "testimonial-grid":
      return <TestimonialGrid elements={elements} compact={compact} />;
    case "testimonials-logos":
      return <TestimonialsWithLogos elements={elements} compact={compact} />;

    // Pricing layouts
    case "pricing-3-tiers":
      return <PricingThreeTiers elements={elements} compact={compact} />;
    case "pricing-2-tiers":
      return <PricingTwoTiers elements={elements} compact={compact} />;
    case "pricing-comparison":
      return <PricingComparison elements={elements} compact={compact} />;
    case "pricing-toggle":
      return <PricingToggle elements={elements} compact={compact} />;
    case "pricing-single":
      return <PricingSingle elements={elements} compact={compact} />;

    // FAQ layouts
    case "faq-accordion":
    case "faq-simple":
      return <FaqAccordion elements={elements} compact={compact} />;
    case "faq-2-col":
      return <FaqTwoColumn elements={elements} compact={compact} />;
    case "faq-categorized":
      return <FaqCategorized elements={elements} compact={compact} />;

    // CTA layouts
    case "cta-form":
      return <CtaForm elements={elements} compact={compact} />;
    case "cta-banner":
      return <CtaBanner elements={elements} compact={compact} />;
    case "cta-card":
      return <CtaCard elements={elements} compact={compact} />;

    // Team layouts
    case "team-grid":
    case "team-social":
      return <TeamGrid elements={elements} compact={compact} />;
    case "team-featured":
      return <TeamFeatured elements={elements} compact={compact} />;
    case "team-list":
      return <TeamList elements={elements} compact={compact} />;

    // Stats layouts
    case "stats-row":
    case "stats-cards":
    case "stats-icons":
      return <StatsRow elements={elements} compact={compact} />;
    case "stats-large":
      return <StatsLarge elements={elements} compact={compact} />;

    // Contact layouts
    case "contact-form":
      return <ContactForm elements={elements} compact={compact} />;
    case "contact-split":
      return <ContactSplit elements={elements} compact={compact} />;
    case "contact-map":
      return <ContactMap elements={elements} compact={compact} />;
    case "contact-cards":
      return <ContactCards elements={elements} compact={compact} />;
    case "contact-minimal":
      return <ContactMinimal elements={elements} compact={compact} />;

    // Content layouts
    case "content-featured":
      return <ContentFeatured elements={elements} compact={compact} />;
    case "content-list":
      return <ContentList elements={elements} compact={compact} />;

    default:
      return <GenericLayout elements={elements} compact={compact} />;
  }
}

// Layout-specific renderers
function ThreeColumnGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardElements = elements.filter(e => e.type === 'card');

  return (
    <div className={cn("space-y-6", compact && "space-y-3")}>
      {/* Header */}
      <div className="text-center space-y-2">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Cards */}
      <div className={cn("grid grid-cols-3 gap-4", compact && "gap-2")}>
        {cardElements.map((card, i) => {
          const repeatCount = card.repeat || 1;
          return Array.from({ length: repeatCount }).map((_, j) => (
            <WireframeCard key={`${i}-${j}`} element={card} compact={compact} />
          ));
        })}
      </div>
    </div>
  );
}

function TwoColumnGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardElements = elements.filter(e => e.type === 'card');

  return (
    <div className={cn("space-y-6", compact && "space-y-3")}>
      {/* Header */}
      <div className="text-center space-y-2">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Cards */}
      <div className={cn("grid grid-cols-2 gap-5", compact && "gap-2")}>
        {cardElements.map((card, i) => {
          const repeatCount = card.repeat || 1;
          return Array.from({ length: repeatCount }).map((_, j) => (
            <WireframeCard key={`${i}-${j}`} element={card} compact={compact} size="medium" />
          ));
        })}
      </div>
    </div>
  );
}

function VerticalList({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const listElements = elements.filter(e => e.type === 'list');

  return (
    <div className={cn("space-y-6", compact && "space-y-3")}>
      {/* Header */}
      <div className="space-y-2">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* List items */}
      <div className={cn("space-y-4", compact && "space-y-2")}>
        {listElements.map((list, i) => {
          const repeatCount = list.repeat || 1;
          return Array.from({ length: compact ? Math.min(repeatCount, 3) : repeatCount }).map((_, j) => (
            <div key={`${i}-${j}`} className="flex items-start gap-3">
              <div className={cn(
                "rounded bg-primary/30 flex-shrink-0",
                compact ? "w-4 h-4" : "w-6 h-6"
              )} />
              <div className="flex-1 space-y-1">
                <div className={cn(
                  "bg-muted-foreground/40 rounded",
                  compact ? "h-2 w-2/3" : "h-3 w-3/4"
                )} />
                <div className={cn(
                  "bg-muted-foreground/20 rounded",
                  compact ? "h-1.5 w-full" : "h-2 w-full"
                )} />
              </div>
            </div>
          ));
        })}
      </div>
    </div>
  );
}

function AlternatingRows({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardElements = elements.filter(e => e.type === 'card');

  return (
    <div className={cn("space-y-6", compact && "space-y-3")}>
      {/* Header */}
      <div className="text-center space-y-2">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Alternating rows */}
      <div className={cn("space-y-5", compact && "space-y-2")}>
        {cardElements.map((card, i) => {
          const repeatCount = card.repeat || 1;
          return Array.from({ length: compact ? Math.min(repeatCount, 2) : repeatCount }).map((_, j) => {
            const isEven = j % 2 === 0;
            return (
              <div key={`${i}-${j}`} className={cn("flex gap-4 items-center", !isEven && "flex-row-reverse")}>
                <div className={cn(
                  "bg-muted-foreground/20 rounded flex items-center justify-center",
                  compact ? "w-14 h-10" : "w-24 h-16"
                )}>
                  <ImagePlaceholder compact={compact} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className={cn(
                    "bg-muted-foreground/40 rounded",
                    compact ? "h-2 w-3/4" : "h-3 w-3/4"
                  )} />
                  <div className={cn(
                    "bg-muted-foreground/20 rounded",
                    compact ? "h-1.5 w-full" : "h-2 w-full"
                  )} />
                  {!compact && (
                    <div className="h-3 w-16 bg-muted-foreground/30 rounded mt-2" />
                  )}
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

function BentoGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-6", compact && "space-y-3")}>
      {/* Header */}
      <div className="text-center space-y-2">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Bento layout */}
      <div className={cn(
        "grid grid-cols-3 grid-rows-2 gap-3",
        compact && "gap-1.5"
      )}>
        {/* Large card spanning 2 cols */}
        <div className={cn(
          "col-span-2 row-span-1 bg-background rounded border p-3 space-y-2",
          compact && "p-1.5 space-y-1"
        )}>
          <div className={cn("w-5 h-5 bg-primary/30 rounded", compact && "w-3 h-3")} />
          <div className={cn("h-2.5 bg-muted-foreground/40 rounded w-1/2", compact && "h-1.5")} />
          <div className={cn("h-2 bg-muted-foreground/20 rounded w-3/4", compact && "h-1")} />
        </div>

        {/* Tall card spanning 2 rows */}
        <div className={cn(
          "row-span-2 bg-background rounded border p-3 flex flex-col justify-center space-y-2",
          compact && "p-1.5 space-y-1"
        )}>
          <div className={cn("w-6 h-6 bg-primary/30 rounded mx-auto", compact && "w-3 h-3")} />
          <div className={cn("h-2.5 bg-muted-foreground/40 rounded w-2/3 mx-auto", compact && "h-1.5")} />
        </div>

        {/* Two small cards */}
        <div className={cn(
          "bg-background rounded border p-2 flex items-center gap-2",
          compact && "p-1 gap-1"
        )}>
          <div className={cn("w-4 h-4 bg-primary/30 rounded", compact && "w-2 h-2")} />
          <div className={cn("h-2 bg-muted-foreground/40 rounded flex-1", compact && "h-1")} />
        </div>
        <div className={cn(
          "bg-background rounded border p-2 flex items-center gap-2",
          compact && "p-1 gap-1"
        )}>
          <div className={cn("w-4 h-4 bg-primary/30 rounded", compact && "w-2 h-2")} />
          <div className={cn("h-2 bg-muted-foreground/40 rounded flex-1", compact && "h-1")} />
        </div>
      </div>
    </div>
  );
}

function GenericLayout({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-1.5")}>
      {elements.map((el, i) => (
        <WireframeElementRenderer key={i} element={el} compact={compact} />
      ))}
    </div>
  );
}

// Hero layouts
function CenteredStack({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "space-y-2" : "space-y-4")}>
      {elements.map((el, i) => (
        <WireframeElementRenderer key={i} element={el} compact={compact} />
      ))}
    </div>
  );
}

function SplitHalf({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const textElements = elements.filter(e => e.type !== 'image' && e.type !== 'video');
  const imageElement = elements.find(e => e.type === 'image' || e.type === 'video');

  return (
    <div className={cn("flex items-center", compact ? "gap-3" : "gap-6")}>
      <div className={cn("flex-1 space-y-2", compact && "space-y-1")}>
        {textElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("flex-1", compact ? "h-16" : "h-24")}>
        {imageElement && <WireframeElementRenderer element={imageElement} compact={compact} />}
      </div>
    </div>
  );
}

function TextLeftImageRight({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const textElements = elements.filter(e => e.type !== 'image');

  return (
    <div className={cn("flex items-center", compact ? "gap-3" : "gap-6")}>
      <div className={cn("flex-1 space-y-2", compact && "space-y-1")}>
        {textElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn(compact ? "w-20 h-14" : "w-32 h-20", "bg-muted-foreground/20 rounded flex items-center justify-center")}>
        <ImagePlaceholder compact={compact} />
      </div>
    </div>
  );
}

function FullwidthBackground({ compact, isVideo }: { elements: WireframeElement[]; compact?: boolean; isVideo?: boolean }) {
  return (
    <div className={cn(
      "relative bg-muted-foreground/20 rounded flex flex-col items-center justify-center",
      compact ? "h-20 p-3" : "h-32 p-6"
    )}>
      {isVideo ? (
        <div className={cn(
          "absolute right-2 top-2 w-0 h-0 border-t-transparent border-b-transparent border-l-muted-foreground/40",
          compact ? "border-t-[3px] border-b-[3px] border-l-[5px]" : "border-t-[4px] border-b-[4px] border-l-[6px]"
        )} />
      ) : (
        <ImagePlaceholder compact={compact} />
      )}
      <div className={cn("bg-white/80 rounded", compact ? "h-3 w-1/2 mb-1" : "h-4 w-1/2 mb-2")} />
      <div className={cn("bg-white/60 rounded", compact ? "h-2 w-1/3 mb-2" : "h-3 w-1/3 mb-3")} />
      <div className={cn("bg-primary/60 rounded", compact ? "h-4 w-14" : "h-5 w-20")} />
    </div>
  );
}

// Logo layouts
function LogoRow({ elements, compact, hasHeading }: { elements: WireframeElement[]; compact?: boolean; hasHeading?: boolean }) {
  const labelEl = elements.find(e => e.type === 'label');
  const logoCount = elements.find(e => e.type === 'image')?.repeat || 5;

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {hasHeading && labelEl && (
        <div className={cn("mx-auto bg-muted-foreground/30 rounded", compact ? "h-2 w-24" : "h-2.5 w-32")} />
      )}
      <div className={cn("flex items-center justify-center", compact ? "gap-3" : "gap-6")}>
        {Array.from({ length: compact ? Math.min(logoCount, 4) : logoCount }).map((_, i) => (
          <div key={i} className={cn("bg-muted-foreground/20 rounded", compact ? "w-8 h-5" : "w-12 h-8")} />
        ))}
      </div>
    </div>
  );
}

function LogoMarquee({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const labelEl = elements.find(e => e.type === 'label');

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {labelEl && (
        <div className={cn("mx-auto bg-muted-foreground/30 rounded", compact ? "h-2 w-24" : "h-2.5 w-32")} />
      )}
      <div className={cn("flex items-center justify-center overflow-hidden", compact ? "gap-2" : "gap-4")}>
        {Array.from({ length: compact ? 5 : 7 }).map((_, i) => (
          <div key={i} className={cn("bg-muted-foreground/20 rounded flex-shrink-0", compact ? "w-7 h-4" : "w-10 h-6")} />
        ))}
      </div>
    </div>
  );
}

function LogoGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const labelEl = elements.find(e => e.type === 'label');

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {labelEl && (
        <div className={cn("mx-auto bg-muted-foreground/30 rounded", compact ? "h-2 w-24" : "h-2.5 w-32")} />
      )}
      <div className={cn("grid grid-cols-4", compact ? "gap-2" : "gap-4")}>
        {Array.from({ length: compact ? 4 : 8 }).map((_, i) => (
          <div key={i} className={cn("bg-muted-foreground/20 rounded mx-auto", compact ? "w-8 h-5" : "w-12 h-8")} />
        ))}
      </div>
    </div>
  );
}

// How it works layouts
function NumberedSteps({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardEl = elements.find(e => e.type === 'card');
  const stepCount = cardEl?.repeat || 3;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("flex items-start justify-center", compact ? "gap-2" : "gap-4")}>
        {Array.from({ length: stepCount }).map((_, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className={cn(
              "rounded-full bg-primary/40 flex items-center justify-center font-bold text-primary/80 mb-2",
              compact ? "w-5 h-5 text-[8px]" : "w-8 h-8 text-xs"
            )}>
              {i + 1}
            </div>
            <div className={cn("bg-muted-foreground/40 rounded w-3/4 mx-auto", compact ? "h-2 mb-1" : "h-2.5 mb-1")} />
            <div className={cn("bg-muted-foreground/20 rounded w-full", compact ? "h-1.5" : "h-2")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalTimeline({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const listEl = elements.find(e => e.type === 'list');
  const stepCount = listEl?.repeat || 4;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("relative pl-4", compact && "pl-3")}>
        <div className={cn("absolute left-1.5 top-0 bottom-0 w-0.5 bg-muted-foreground/20", compact && "left-1")} />
        {Array.from({ length: compact ? Math.min(stepCount, 3) : stepCount }).map((_, i) => (
          <div key={i} className={cn("relative flex items-start gap-3 mb-3", compact && "gap-2 mb-2")}>
            <div className={cn("rounded-full bg-primary/40 flex-shrink-0", compact ? "w-2 h-2" : "w-3 h-3")} />
            <div className="flex-1 space-y-1">
              <div className={cn("bg-muted-foreground/40 rounded", compact ? "h-2 w-2/3" : "h-2.5 w-2/3")} />
              <div className={cn("bg-muted-foreground/20 rounded", compact ? "h-1.5 w-full" : "h-2 w-full")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCards({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardEl = elements.find(e => e.type === 'card');
  const stepCount = cardEl?.repeat || 3;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-4")}>
        {Array.from({ length: stepCount }).map((_, i) => (
          <div key={i} className={cn("bg-background rounded border p-2 space-y-1", compact && "p-1.5")}>
            <div className={cn("bg-primary/30 rounded mx-auto", compact ? "w-4 h-4" : "w-6 h-6")} />
            <div className={cn("bg-muted-foreground/40 rounded w-3/4 mx-auto", compact ? "h-1.5" : "h-2")} />
            <div className={cn("bg-muted-foreground/20 rounded w-full", compact ? "h-1" : "h-1.5")} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Testimonials layouts
function SingleFeatured({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("bg-background rounded border p-4 text-center", compact && "p-2")}>
        <div className={cn("bg-muted-foreground/20 rounded w-3/4 mx-auto", compact ? "h-2 mb-1" : "h-3 mb-2")} />
        <div className={cn("bg-muted-foreground/20 rounded w-1/2 mx-auto mb-3", compact ? "h-2" : "h-3")} />
        <div className={cn("rounded-full bg-muted-foreground/30 mx-auto", compact ? "w-6 h-6 mb-1" : "w-10 h-10 mb-2")} />
        <div className={cn("bg-muted-foreground/40 rounded w-1/4 mx-auto", compact ? "h-1.5 mb-0.5" : "h-2 mb-1")} />
        <div className={cn("bg-muted-foreground/20 rounded w-1/5 mx-auto", compact ? "h-1" : "h-1.5")} />
      </div>
    </div>
  );
}

function Carousel({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className={cn("bg-muted-foreground/20 rounded flex-shrink-0", compact ? "w-4 h-4" : "w-6 h-6")} />
        <div className={cn("flex-1 bg-background rounded border p-3 text-center", compact && "p-2")}>
          <div className={cn("bg-muted-foreground/20 rounded w-full mb-2", compact ? "h-2" : "h-3")} />
          <div className={cn("rounded-full bg-muted-foreground/30 mx-auto", compact ? "w-5 h-5 mb-1" : "w-8 h-8 mb-2")} />
          <div className={cn("bg-muted-foreground/40 rounded w-1/3 mx-auto", compact ? "h-1.5" : "h-2")} />
        </div>
        <div className={cn("bg-muted-foreground/20 rounded flex-shrink-0", compact ? "w-4 h-4" : "w-6 h-6")} />
      </div>
    </div>
  );
}

function TestimonialGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const cardEl = elements.find(e => e.type === 'card');
  const count = cardEl?.repeat || 4;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-3")}>
        {Array.from({ length: compact ? Math.min(count, 4) : count }).map((_, i) => (
          <div key={i} className={cn("bg-background rounded border p-2 space-y-1", compact && "p-1.5")}>
            <div className={cn("bg-muted-foreground/20 rounded w-full", compact ? "h-1.5" : "h-2")} />
            <div className="flex items-center gap-1">
              <div className={cn("rounded-full bg-muted-foreground/30", compact ? "w-3 h-3" : "w-5 h-5")} />
              <div className={cn("bg-muted-foreground/40 rounded", compact ? "h-1 w-8" : "h-1.5 w-12")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsWithLogos({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-3")}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn("bg-background rounded border p-2 space-y-2", compact && "p-1.5 space-y-1")}>
            <div className={cn("bg-muted-foreground/30 rounded w-12 h-6 mx-auto", compact && "w-8 h-4")} />
            <div className={cn("bg-muted-foreground/20 rounded w-full", compact ? "h-1.5" : "h-2")} />
            <div className={cn("bg-muted-foreground/40 rounded w-1/2", compact ? "h-1" : "h-1.5")} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Pricing layouts
function PricingThreeTiers({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-3")}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn(
            "bg-background rounded border p-2 space-y-2",
            i === 1 && "border-primary/50 ring-1 ring-primary/20",
            compact && "p-1.5 space-y-1"
          )}>
            <div className={cn("bg-muted-foreground/30 rounded w-1/2 mx-auto", compact ? "h-1.5" : "h-2")} />
            <div className={cn("bg-muted-foreground/50 rounded w-2/3 mx-auto", compact ? "h-3" : "h-4")} />
            <div className="space-y-0.5">
              {Array.from({ length: compact ? 2 : 3 }).map((_, j) => (
                <div key={j} className={cn("bg-muted-foreground/20 rounded w-full", compact ? "h-1" : "h-1.5")} />
              ))}
            </div>
            <div className={cn("bg-primary/40 rounded w-full", compact ? "h-3" : "h-4")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingTwoTiers({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("grid grid-cols-2", compact ? "gap-3" : "gap-4")}>
        {[0, 1].map((i) => (
          <div key={i} className={cn("bg-background rounded border p-3 space-y-2", compact && "p-2 space-y-1.5")}>
            <div className={cn("bg-muted-foreground/30 rounded w-1/3", compact ? "h-2" : "h-2.5")} />
            <div className={cn("bg-muted-foreground/50 rounded w-1/2", compact ? "h-4" : "h-5")} />
            <div className="space-y-0.5">
              {Array.from({ length: compact ? 3 : 4 }).map((_, j) => (
                <div key={j} className={cn("bg-muted-foreground/20 rounded w-full", compact ? "h-1.5" : "h-2")} />
              ))}
            </div>
            <div className={cn("bg-primary/40 rounded w-full", compact ? "h-4" : "h-5")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingComparison({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("bg-background rounded border p-2", compact && "p-1.5")}>
        <div className={cn("grid grid-cols-4 gap-2 mb-2", compact && "gap-1 mb-1")}>
          <div />
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center">
              <div className={cn("bg-muted-foreground/40 rounded w-2/3 mx-auto", compact ? "h-1.5" : "h-2")} />
            </div>
          ))}
        </div>
        {Array.from({ length: compact ? 3 : 4 }).map((_, i) => (
          <div key={i} className={cn("grid grid-cols-4 gap-2 py-1", compact && "gap-1")}>
            <div className={cn("bg-muted-foreground/20 rounded", compact ? "h-1.5" : "h-2")} />
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex justify-center">
                <div className={cn("bg-primary/30 rounded-full", compact ? "w-2 h-2" : "w-3 h-3")} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingToggle({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className="flex justify-center">
        <div className={cn("bg-muted-foreground/20 rounded-full flex", compact ? "p-0.5" : "p-1")}>
          <div className={cn("bg-primary/40 rounded-full", compact ? "w-10 h-4" : "w-14 h-5")} />
          <div className={cn("rounded-full", compact ? "w-10 h-4" : "w-14 h-5")} />
        </div>
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-3")}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("bg-background rounded border p-2 space-y-1.5", compact && "p-1.5 space-y-1")}>
            <div className={cn("bg-muted-foreground/30 rounded w-1/2 mx-auto", compact ? "h-1.5" : "h-2")} />
            <div className={cn("bg-muted-foreground/50 rounded w-2/3 mx-auto", compact ? "h-2.5" : "h-3")} />
            <div className={cn("bg-primary/40 rounded w-full", compact ? "h-3" : "h-4")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSingle({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("bg-background rounded border p-4 max-w-xs mx-auto", compact && "p-2")}>
        <div className={cn("bg-muted-foreground/50 rounded w-1/3 mx-auto mb-2", compact ? "h-4" : "h-5")} />
        <div className={cn("bg-muted-foreground/20 rounded w-full mb-3", compact ? "h-2" : "h-2.5")} />
        <div className="space-y-1 mb-3">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={cn("bg-primary/30 rounded-full", compact ? "w-2 h-2" : "w-3 h-3")} />
              <div className={cn("bg-muted-foreground/20 rounded flex-1", compact ? "h-1.5" : "h-2")} />
            </div>
          ))}
        </div>
        <div className={cn("bg-primary/40 rounded w-full", compact ? "h-4" : "h-5")} />
      </div>
    </div>
  );
}

// FAQ layouts
function FaqAccordion({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const listEl = elements.find(e => e.type === 'list');
  const count = listEl?.repeat || 5;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("space-y-2", compact && "space-y-1")}>
        {Array.from({ length: compact ? Math.min(count, 4) : count }).map((_, i) => (
          <div key={i} className={cn("bg-background rounded border p-2", compact && "p-1.5")}>
            <div className="flex items-center justify-between">
              <div className={cn("bg-muted-foreground/40 rounded", compact ? "h-2 w-2/3" : "h-2.5 w-2/3")} />
              <div className={cn("bg-muted-foreground/30 rounded", compact ? "w-3 h-3" : "w-4 h-4")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqTwoColumn({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardEl = elements.find(e => e.type === 'card');
  const count = cardEl?.repeat || 6;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-3")}>
        {Array.from({ length: compact ? Math.min(count, 4) : count }).map((_, i) => (
          <div key={i} className={cn("space-y-1", compact && "space-y-0.5")}>
            <div className={cn("bg-muted-foreground/40 rounded", compact ? "h-2 w-3/4" : "h-2.5 w-3/4")} />
            <div className={cn("bg-muted-foreground/20 rounded", compact ? "h-1.5 w-full" : "h-2 w-full")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqCategorized({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const cardEl = elements.find(e => e.type === 'card');
  const categoryCount = cardEl?.repeat || 3;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("space-y-3", compact && "space-y-2")}>
        {Array.from({ length: compact ? 2 : categoryCount }).map((_, i) => (
          <div key={i}>
            <div className={cn("bg-muted-foreground/40 rounded mb-2", compact ? "h-2.5 w-1/4" : "h-3 w-1/4")} />
            <div className={cn("space-y-1", compact && "space-y-0.5")}>
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className={cn("bg-background rounded border p-1.5", compact && "p-1")}>
                  <div className={cn("bg-muted-foreground/30 rounded", compact ? "h-1.5 w-2/3" : "h-2 w-2/3")} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CTA layouts
function CtaForm({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("text-center", compact ? "space-y-2" : "space-y-4")}>
      <div className="space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("flex justify-center", compact ? "gap-1" : "gap-2")}>
        <div className={cn("bg-background border rounded", compact ? "h-5 w-32" : "h-6 w-48")} />
        <div className={cn("bg-primary/50 rounded", compact ? "h-5 w-14" : "h-6 w-20")} />
      </div>
    </div>
  );
}

function CtaBanner({ compact }: { elements: WireframeElement[]; compact?: boolean }) {
  return (
    <div className={cn(
      "bg-primary/20 rounded flex items-center justify-between",
      compact ? "p-3" : "p-5"
    )}>
      <div className="space-y-1">
        <div className={cn("bg-primary/60 rounded", compact ? "h-2.5 w-24" : "h-3 w-32")} />
        <div className={cn("bg-primary/40 rounded", compact ? "h-2 w-16" : "h-2.5 w-24")} />
      </div>
      <div className={cn("bg-white/80 rounded", compact ? "h-5 w-14" : "h-6 w-20")} />
    </div>
  );
}

function CtaCard({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const cardEl = elements.find(e => e.type === 'card');

  return (
    <div className={cn("bg-background rounded border p-4 text-center max-w-md mx-auto", compact && "p-3")}>
      {cardEl?.children?.map((child, i) => (
        <div key={i} className="mb-2">
          <WireframeElementRenderer element={child} compact={compact} />
        </div>
      )) || (
        <>
          <div className={cn("bg-muted-foreground/40 rounded w-2/3 mx-auto mb-2", compact ? "h-3" : "h-4")} />
          <div className={cn("bg-muted-foreground/20 rounded w-full mb-3", compact ? "h-2" : "h-2.5")} />
          <div className={cn("bg-primary/50 rounded w-1/3 mx-auto", compact ? "h-5" : "h-6")} />
        </>
      )}
    </div>
  );
}

// Team layouts
function TeamGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardEl = elements.find(e => e.type === 'card');
  const count = cardEl?.repeat || 4;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("grid grid-cols-4", compact ? "gap-2" : "gap-3")}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <div className={cn("bg-muted-foreground/20 rounded-full mx-auto", compact ? "w-8 h-8" : "w-12 h-12")} />
            <div className={cn("bg-muted-foreground/40 rounded w-2/3 mx-auto", compact ? "h-1.5" : "h-2")} />
            <div className={cn("bg-muted-foreground/20 rounded w-1/2 mx-auto", compact ? "h-1" : "h-1.5")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamFeatured({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-4")}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn("bg-background rounded border p-2 text-center", compact && "p-1.5")}>
            <div className={cn("bg-muted-foreground/20 rounded-lg mx-auto mb-2", compact ? "w-full h-10" : "w-full h-16")} />
            <div className={cn("bg-muted-foreground/40 rounded w-2/3 mx-auto", compact ? "h-2 mb-0.5" : "h-2.5 mb-1")} />
            <div className={cn("bg-muted-foreground/20 rounded w-1/2 mx-auto mb-1", compact ? "h-1.5" : "h-2")} />
            <div className={cn("bg-muted-foreground/15 rounded w-full", compact ? "h-2" : "h-3")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamList({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const listEl = elements.find(e => e.type === 'list');
  const count = listEl?.repeat || 6;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-3")}>
        {Array.from({ length: compact ? Math.min(count, 4) : count }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn("bg-muted-foreground/20 rounded-full flex-shrink-0", compact ? "w-6 h-6" : "w-10 h-10")} />
            <div className="flex-1">
              <div className={cn("bg-muted-foreground/40 rounded", compact ? "h-1.5 w-2/3 mb-0.5" : "h-2 w-2/3 mb-1")} />
              <div className={cn("bg-muted-foreground/20 rounded", compact ? "h-1 w-1/2" : "h-1.5 w-1/2")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats layouts
function StatsRow({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const cardEl = elements.find(e => e.type === 'card');
  const count = cardEl?.repeat || 4;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("grid grid-cols-4", compact ? "gap-2" : "gap-4")}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="text-center">
            <div className={cn("bg-primary/40 rounded w-2/3 mx-auto mb-1", compact ? "h-4" : "h-6")} />
            <div className={cn("bg-muted-foreground/30 rounded w-full", compact ? "h-1.5" : "h-2")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsLarge({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const cardEl = elements.find(e => e.type === 'card');
  const count = cardEl?.repeat || 3;

  return (
    <div className={cn("grid grid-cols-3", compact ? "gap-3" : "gap-6")}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="text-center">
          <div className={cn("bg-primary/50 rounded w-1/2 mx-auto mb-2", compact ? "h-6" : "h-10")} />
          <div className={cn("bg-muted-foreground/30 rounded w-3/4 mx-auto", compact ? "h-2" : "h-3")} />
        </div>
      ))}
    </div>
  );
}

// Contact layouts
function ContactForm({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("bg-background rounded border p-3 max-w-sm mx-auto space-y-2", compact && "p-2 space-y-1.5")}>
        <div className={cn("bg-background border rounded w-full", compact ? "h-4" : "h-5")} />
        <div className={cn("bg-background border rounded w-full", compact ? "h-4" : "h-5")} />
        <div className={cn("bg-background border rounded w-full", compact ? "h-8" : "h-12")} />
        <div className={cn("bg-primary/50 rounded", compact ? "h-4 w-20" : "h-5 w-24")} />
      </div>
    </div>
  );
}

function ContactSplit({ compact }: { elements: WireframeElement[]; compact?: boolean }) {
  return (
    <div className={cn("flex", compact ? "gap-3" : "gap-6")}>
      <div className={cn("flex-1 space-y-3", compact && "space-y-2")}>
        <div className={cn("bg-muted-foreground/40 rounded", compact ? "h-3 w-2/3" : "h-4 w-2/3")} />
        <div className={cn("bg-muted-foreground/20 rounded", compact ? "h-2 w-full" : "h-2.5 w-full")} />
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={cn("bg-muted-foreground/30 rounded", compact ? "w-3 h-3" : "w-4 h-4")} />
              <div className={cn("bg-muted-foreground/20 rounded", compact ? "h-1.5 w-20" : "h-2 w-24")} />
            </div>
          ))}
        </div>
      </div>
      <div className={cn("flex-1 bg-background rounded border p-2 space-y-1.5", compact && "p-1.5 space-y-1")}>
        <div className={cn("bg-background border rounded w-full", compact ? "h-3" : "h-4")} />
        <div className={cn("bg-background border rounded w-full", compact ? "h-3" : "h-4")} />
        <div className={cn("bg-background border rounded w-full", compact ? "h-6" : "h-8")} />
        <div className={cn("bg-primary/50 rounded", compact ? "h-3 w-16" : "h-4 w-20")} />
      </div>
    </div>
  );
}

function ContactMap({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("flex", compact ? "gap-2" : "gap-4")}>
        <div className={cn("flex-1 bg-muted-foreground/20 rounded flex items-center justify-center", compact ? "h-20" : "h-32")}>
          <div className={cn("text-muted-foreground/40", compact ? "text-xs" : "text-sm")}>Map</div>
        </div>
        <div className={cn("flex-1 bg-background rounded border p-2 space-y-1.5", compact && "p-1.5 space-y-1")}>
          <div className={cn("bg-background border rounded w-full", compact ? "h-3" : "h-4")} />
          <div className={cn("bg-background border rounded w-full", compact ? "h-3" : "h-4")} />
          <div className={cn("bg-background border rounded w-full", compact ? "h-5" : "h-6")} />
          <div className={cn("bg-primary/50 rounded", compact ? "h-3 w-14" : "h-4 w-20")} />
        </div>
      </div>
    </div>
  );
}

function ContactCards({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-3")}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn("bg-background rounded border p-2 text-center", compact && "p-1.5")}>
            <div className={cn("bg-primary/30 rounded mx-auto mb-1", compact ? "w-5 h-5" : "w-8 h-8")} />
            <div className={cn("bg-muted-foreground/40 rounded w-2/3 mx-auto mb-0.5", compact ? "h-1.5" : "h-2")} />
            <div className={cn("bg-muted-foreground/20 rounded w-full mb-1", compact ? "h-1" : "h-1.5")} />
            <div className={cn("bg-muted-foreground/30 rounded w-1/2 mx-auto", compact ? "h-3" : "h-4")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactMinimal({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading' && e.role === 'section-title');

  return (
    <div className={cn("text-center", compact ? "space-y-3" : "space-y-4")}>
      {headerEl && <WireframeElementRenderer element={headerEl} compact={compact} />}
      <div className={cn("bg-primary/40 rounded w-1/3 mx-auto", compact ? "h-3" : "h-4")} />
      <div className={cn("flex justify-center", compact ? "gap-2" : "gap-3")}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("bg-muted-foreground/30 rounded", compact ? "w-5 h-5" : "w-7 h-7")} />
        ))}
      </div>
    </div>
  );
}

// Content layouts
function ContentFeatured({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("flex", compact ? "gap-2" : "gap-4")}>
        <div className={cn("flex-[2] bg-background rounded border p-2", compact && "p-1.5")}>
          <div className={cn("bg-muted-foreground/20 rounded w-full mb-2", compact ? "h-12" : "h-20")} />
          <div className={cn("bg-muted-foreground/30 rounded w-1/4 mb-1", compact ? "h-1.5" : "h-2")} />
          <div className={cn("bg-muted-foreground/40 rounded w-3/4 mb-1", compact ? "h-2" : "h-2.5")} />
          <div className={cn("bg-muted-foreground/20 rounded w-full", compact ? "h-1.5" : "h-2")} />
        </div>
        <div className={cn("flex-1 space-y-2", compact && "space-y-1")}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={cn("bg-background rounded border p-1.5", compact && "p-1")}>
              <div className={cn("bg-muted-foreground/20 rounded w-full mb-1", compact ? "h-6" : "h-8")} />
              <div className={cn("bg-muted-foreground/40 rounded w-3/4", compact ? "h-1.5" : "h-2")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentList({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const listEl = elements.find(e => e.type === 'list');
  const count = listEl?.repeat || 4;

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {headerEl && (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      )}
      <div className={cn("space-y-2", compact && "space-y-1.5")}>
        {Array.from({ length: compact ? Math.min(count, 3) : count }).map((_, i) => (
          <div key={i} className={cn("flex", compact ? "gap-2" : "gap-3")}>
            <div className={cn("bg-muted-foreground/20 rounded flex-shrink-0", compact ? "w-12 h-8" : "w-20 h-14")} />
            <div className="flex-1 space-y-1">
              <div className={cn("bg-muted-foreground/40 rounded", compact ? "h-2 w-3/4" : "h-2.5 w-3/4")} />
              <div className={cn("bg-muted-foreground/20 rounded", compact ? "h-1.5 w-full" : "h-2 w-full")} />
              <div className={cn("bg-muted-foreground/30 rounded", compact ? "h-1 w-16" : "h-1.5 w-20")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card renderer
function WireframeCard({ element, compact, size = "small" }: { element: WireframeElement; compact?: boolean; size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: compact ? "p-2" : "p-3",
    medium: compact ? "p-2.5" : "p-4",
    large: compact ? "p-3" : "p-5",
  };

  return (
    <div className={cn(
      "bg-background rounded border",
      compact ? "space-y-1.5" : "space-y-2",
      sizeClasses[size]
    )}>
      {element.children?.map((child, i) => (
        <WireframeElementRenderer key={i} element={child} compact={compact} />
      ))}
    </div>
  );
}

// Element renderer
function WireframeElementRenderer({ element, compact }: { element: WireframeElement; compact?: boolean }) {
  const sizeMap = {
    small: { height: compact ? "h-2" : "h-2.5", iconSize: compact ? "w-3 h-3" : "w-5 h-5" },
    medium: { height: compact ? "h-2.5" : "h-3", iconSize: compact ? "w-4 h-4" : "w-6 h-6" },
    large: { height: compact ? "h-3" : "h-4", iconSize: compact ? "w-5 h-5" : "w-8 h-8" },
  };

  const size = element.size || "medium";
  const styles = sizeMap[size];

  switch (element.type) {
    case "heading":
      return (
        <div className={cn(
          "bg-muted-foreground/40 rounded",
          styles.height,
          element.align === "center" ? "mx-auto w-1/2" : element.align === "right" ? "ml-auto w-1/2" : "w-3/4"
        )} />
      );

    case "subheading":
      return (
        <div className={cn(
          "bg-muted-foreground/25 rounded",
          compact ? "h-2" : "h-2.5",
          element.align === "center" ? "mx-auto w-1/3" : element.align === "right" ? "ml-auto w-1/3" : "w-1/2"
        )} />
      );

    case "paragraph":
      return (
        <div className={cn(
          "bg-muted-foreground/20 rounded",
          compact ? "h-1.5" : "h-2",
          "w-full"
        )} />
      );

    case "icon":
      return (
        <div className={cn(
          "bg-primary/30 rounded",
          styles.iconSize
        )} />
      );

    case "button-primary":
      return (
        <div className={cn(
          "bg-primary/50 rounded",
          compact ? "h-4 w-12" : "h-5 w-16"
        )} />
      );

    case "button-secondary":
      return (
        <div className={cn(
          "bg-muted-foreground/30 rounded border",
          compact ? "h-4 w-12" : "h-5 w-16"
        )} />
      );

    case "image":
      return (
        <div className={cn(
          "bg-muted-foreground/20 rounded flex items-center justify-center",
          compact ? "h-10 w-full" : "h-16 w-full"
        )}>
          <ImagePlaceholder compact={compact} />
        </div>
      );

    case "video":
      return (
        <div className={cn(
          "bg-muted-foreground/20 rounded flex items-center justify-center",
          compact ? "h-10 w-full" : "h-16 w-full"
        )}>
          <div className={cn(
            "w-0 h-0 border-t-transparent border-b-transparent border-l-muted-foreground/40",
            compact ? "border-t-[4px] border-b-[4px] border-l-[6px]" : "border-t-[6px] border-b-[6px] border-l-[9px]"
          )} />
        </div>
      );

    case "input":
      return (
        <div className={cn(
          "bg-background border rounded",
          compact ? "h-4" : "h-5",
          "w-full"
        )} />
      );

    case "label":
      return (
        <div className={cn(
          "bg-muted-foreground/30 rounded",
          compact ? "h-1.5 w-1/4" : "h-2 w-1/3"
        )} />
      );

    default:
      return null;
  }
}

function ImagePlaceholder({ compact }: { compact?: boolean }) {
  return (
    <svg
      className={cn("text-muted-foreground/30", compact ? "w-5 h-5" : "w-8 h-8")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

export default WireframePreview;
