"use client";

import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { Plus, Check, Play, ImageIcon } from "lucide-react";
import type { LayoutTemplate, WireframeElement, StyleColors, ImageInspiration } from "@/lib/types";

// Visual element types that can have inspirations (excludes icons/logos which are typically standard)
const VISUAL_ELEMENT_TYPES = ["image", "video", "avatar"] as const;
type VisualElementType = typeof VISUAL_ELEMENT_TYPES[number];

function isVisualElement(type: string): type is VisualElementType {
  return VISUAL_ELEMENT_TYPES.includes(type as VisualElementType);
}

// Check if a template has any visual elements with roles that can have inspirations
export function templateHasInteractiveVisuals(template: LayoutTemplate): boolean {
  const checkElements = (elements: WireframeElement[]): boolean => {
    for (const el of elements) {
      if (isVisualElement(el.type) && el.role) {
        return true;
      }
      if (el.children && checkElements(el.children)) {
        return true;
      }
    }
    return false;
  };
  return checkElements(template.elements);
}

// Context to pass interactive mode props down the tree
interface WireframeInteractiveContext {
  interactive: boolean;
  imageInspirations: ImageInspiration[];
  onVisualClick?: (elementRole: string, elementType: string) => void;
}

const InteractiveContext = createContext<WireframeInteractiveContext>({
  interactive: false,
  imageInspirations: [],
});

interface WireframePreviewProps {
  template: LayoutTemplate;
  className?: string;
  compact?: boolean;
  styleColors?: StyleColors;
  // Interactive mode props
  interactive?: boolean;
  imageInspirations?: ImageInspiration[];
  onVisualClick?: (elementRole: string, elementType: string) => void;
}

export function WireframePreview({
  template,
  className,
  compact = false,
  styleColors,
  interactive = false,
  imageInspirations = [],
  onVisualClick,
}: WireframePreviewProps) {
  return (
    <InteractiveContext.Provider value={{ interactive, imageInspirations, onVisualClick }}>
      <div
        className={cn(
          "rounded-lg bg-neutral-100 flex flex-col justify-center",
          compact ? "p-3" : "p-10 py-14",
          className
        )}
      >
        <WireframeLayout structure={template.structure} elements={template.elements} compact={compact} styleColors={styleColors} />
      </div>
    </InteractiveContext.Provider>
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

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-8")}>
      {/* Header */}
      <div className={cn("text-center", compact ? "space-y-0.5" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800 leading-tight", compact ? "text-[10px]" : "text-xl")}>
              {compact ? "Features" : "Features section heading"}
            </p>
            <p className={cn("text-neutral-500 max-w-2xl mx-auto", compact ? "text-[8px]" : "text-sm")}>
              Lorem ipsum dolor sit amet
            </p>
          </>
        )}
      </div>

      {/* Cards */}
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-6")}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn("text-center", compact ? "space-y-1" : "space-y-3")}>
            <div className={cn("bg-neutral-200 rounded-md mx-auto flex items-center justify-center", compact ? "w-5 h-5" : "w-12 h-12")}>
              <div className={cn("bg-neutral-400 rounded", compact ? "w-2 h-2" : "w-5 h-5")} />
            </div>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[8px]" : "text-base")}>
              {compact ? "Feature" : "Feature title"}
            </p>
            {!compact && (
              <p className="text-neutral-500 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TwoColumnGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-8")}>
      {/* Header */}
      <div className={cn("text-center", compact ? "space-y-0.5" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800 leading-tight", compact ? "text-[10px]" : "text-xl")}>
              {compact ? "Features" : "Features section heading"}
            </p>
            <p className={cn("text-neutral-500 max-w-2xl mx-auto", compact ? "text-[8px]" : "text-sm")}>
              Lorem ipsum dolor sit amet
            </p>
          </>
        )}
      </div>

      {/* Cards */}
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-6")}>
        {[1, 2].map((i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200", compact ? "p-2" : "p-5")}>
            <div className={cn("bg-neutral-200 rounded-md flex items-center justify-center", compact ? "w-5 h-5 mb-1" : "w-10 h-10 mb-3")}>
              <div className={cn("bg-neutral-400 rounded", compact ? "w-2 h-2" : "w-4 h-4")} />
            </div>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[8px] mb-0.5" : "text-base mb-2")}>
              {compact ? "Feature" : "Feature title"}
            </p>
            {!compact && (
              <p className="text-neutral-500 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalList({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const listElements = elements.filter(e => e.type === 'list');

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {/* Header */}
      <div className={cn(compact ? "space-y-0.5" : "space-y-2")}>
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* List items */}
      <div className={cn(compact ? "space-y-1.5" : "space-y-4")}>
        {listElements.map((list, i) => {
          const repeatCount = list.repeat || 1;
          return Array.from({ length: compact ? Math.min(repeatCount, 3) : repeatCount }).map((_, j) => (
            <div key={`${i}-${j}`} className={cn("flex items-start", compact ? "gap-2" : "gap-3")}>
              <div className={cn(
                "rounded bg-neutral-200 flex-shrink-0",
                compact ? "w-4 h-4" : "w-6 h-6"
              )} />
              <div className={cn("flex-1", compact ? "space-y-0" : "space-y-1")}>
                <p className={cn("font-medium text-neutral-800", compact ? "text-[8px]" : "text-sm")}>
                  Feature {j + 1}
                </p>
                {!compact && (
                  <p className="text-neutral-500 text-xs">
                    Lorem ipsum dolor sit amet consectetur
                  </p>
                )}
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
    <div className={cn(compact ? "space-y-3" : "space-y-8")}>
      {/* Header */}
      <div className={cn("text-center", compact ? "space-y-0.5" : "space-y-2")}>
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Alternating rows */}
      <div className={cn(compact ? "space-y-3" : "space-y-8")}>
        {cardElements.map((card, i) => {
          const repeatCount = card.repeat || 1;
          return Array.from({ length: compact ? Math.min(repeatCount, 2) : repeatCount }).map((_, j) => {
            const isEven = j % 2 === 0;
            // Find the image element in this card's children and give it an indexed role
            const imageChild = card.children?.find(c => c.type === 'image');
            const indexedImageElement = imageChild ? {
              ...imageChild,
              role: imageChild.role ? `${imageChild.role}-${j + 1}` : undefined
            } : null;

            return (
              <div key={`${i}-${j}`} className={cn(
                "flex items-center",
                compact ? "gap-3" : "gap-8",
                !isEven && "flex-row-reverse"
              )}>
                {indexedImageElement ? (
                  <div className={cn(
                    "flex-shrink-0 rounded-lg overflow-hidden",
                    compact ? "w-16 h-12" : "w-2/5 aspect-[4/3]"
                  )}>
                    <WireframeElementRenderer element={indexedImageElement} compact={compact} />
                  </div>
                ) : (
                  <div className={cn(
                    "bg-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0",
                    compact ? "w-16 h-12" : "w-2/5 aspect-[4/3]"
                  )}>
                    <ImageIcon className={cn("text-neutral-400", compact ? "w-4 h-4" : "w-8 h-8")} />
                  </div>
                )}
                <div className={cn("flex-1", compact ? "space-y-0.5" : "space-y-2")}>
                  <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px]" : "text-base")}>
                    Feature {j + 1}
                  </p>
                  {!compact && (
                    <p className="text-neutral-500 text-sm leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
                    </p>
                  )}
                  {!compact && (
                    <button className="text-neutral-900 font-medium text-sm flex items-center gap-1 mt-2">
                      Learn more <span>→</span>
                    </button>
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
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {/* Header */}
      <div className={cn("text-center", compact ? "space-y-0.5" : "space-y-2")}>
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Bento layout */}
      <div className={cn(
        "grid grid-cols-3 grid-rows-2",
        compact ? "gap-1.5" : "gap-3"
      )}>
        {/* Large card spanning 2 cols */}
        <div className={cn(
          "col-span-2 row-span-1 bg-white rounded border border-neutral-200",
          compact ? "p-1.5 space-y-0.5" : "p-3 space-y-2"
        )}>
          <div className={cn("bg-neutral-200 rounded", compact ? "w-3 h-3" : "w-5 h-5")} />
          <p className={cn("font-medium text-neutral-800", compact ? "text-[8px]" : "text-sm")}>
            Feature 1
          </p>
          {!compact && (
            <p className="text-neutral-500 text-xs">
              Lorem ipsum dolor sit amet
            </p>
          )}
        </div>

        {/* Tall card spanning 2 rows */}
        <div className={cn(
          "row-span-2 bg-white rounded border border-neutral-200 flex flex-col justify-center text-center",
          compact ? "p-1.5 space-y-0.5" : "p-3 space-y-2"
        )}>
          <div className={cn("bg-neutral-200 rounded mx-auto", compact ? "w-3 h-3" : "w-6 h-6")} />
          <p className={cn("font-medium text-neutral-800", compact ? "text-[8px]" : "text-sm")}>
            Feature 2
          </p>
        </div>

        {/* Two small cards */}
        <div className={cn(
          "bg-white rounded border border-neutral-200 flex items-center",
          compact ? "p-1 gap-1" : "p-2 gap-2"
        )}>
          <div className={cn("bg-neutral-200 rounded flex-shrink-0", compact ? "w-2.5 h-2.5" : "w-4 h-4")} />
          <p className={cn("text-neutral-800", compact ? "text-[7px]" : "text-xs")}>Feature 3</p>
        </div>
        <div className={cn(
          "bg-white rounded border border-neutral-200 flex items-center",
          compact ? "p-1 gap-1" : "p-2 gap-2"
        )}>
          <div className={cn("bg-neutral-200 rounded flex-shrink-0", compact ? "w-2.5 h-2.5" : "w-4 h-4")} />
          <p className={cn("text-neutral-800", compact ? "text-[7px]" : "text-xs")}>Feature 4</p>
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
  // Separate text content from buttons
  const textElements = elements.filter(e =>
    e.type !== 'button-primary' && e.type !== 'button-secondary'
  );
  const hasButtons = elements.some(e =>
    e.type === 'button-primary' || e.type === 'button-secondary'
  );

  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "space-y-2" : "space-y-8")}>
      {textElements.map((el, i) => (
        <WireframeElementRenderer key={i} element={el} compact={compact} />
      ))}
      {hasButtons && (
        <div className={cn("flex justify-center gap-3", compact ? "pt-1" : "pt-4")}>
          <button className={cn("bg-neutral-900 text-white font-medium rounded", compact ? "px-3 py-1.5 text-[10px]" : "px-6 py-3 text-sm")}>
            Button
          </button>
          <button className={cn("bg-white text-neutral-900 font-medium rounded border border-neutral-300", compact ? "px-3 py-1.5 text-[10px]" : "px-6 py-3 text-sm")}>
            Button
          </button>
        </div>
      )}
    </div>
  );
}

function SplitHalf({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  // Filter out buttons - we'll render them separately to control layout
  const textElements = elements.filter(e =>
    e.type !== 'image' && e.type !== 'video' &&
    e.type !== 'button-primary' && e.type !== 'button-secondary'
  );
  const imageElement = elements.find(e => e.type === 'image' || e.type === 'video');

  return (
    <div className={cn("flex items-center", compact ? "gap-4" : "gap-12")}>
      <div className={cn("flex-1", compact ? "space-y-2" : "space-y-5")}>
        {textElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
        <div className={cn("flex gap-3", compact ? "pt-1" : "pt-4")}>
          <button className={cn("bg-neutral-900 text-white font-medium rounded", compact ? "px-3 py-1.5 text-[10px]" : "px-6 py-3 text-sm")}>
            Button
          </button>
          <button className={cn("bg-white text-neutral-900 font-medium rounded border border-neutral-300", compact ? "px-3 py-1.5 text-[10px]" : "px-6 py-3 text-sm")}>
            Button
          </button>
        </div>
      </div>
      <div className="flex-1">
        {imageElement ? (
          <WireframeElementRenderer element={imageElement} compact={compact} />
        ) : (
          <div className={cn("bg-neutral-300 rounded-lg flex items-center justify-center w-full", compact ? "h-20" : "min-h-[320px]")}>
            <ImageIcon className={cn("text-neutral-400", compact ? "w-6 h-6" : "w-12 h-12")} />
          </div>
        )}
      </div>
    </div>
  );
}

function TextLeftImageRight({ compact }: { elements: WireframeElement[]; compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "gap-4" : "gap-10")}>
      <div className={cn("flex-1", compact ? "space-y-1.5" : "space-y-4")}>
        <p className={cn("text-neutral-500 font-medium uppercase tracking-wide", compact ? "text-[8px]" : "text-xs")}>
          Tagline
        </p>
        <p className={cn("font-bold text-neutral-800 leading-tight", compact ? "text-sm" : "text-2xl")}>
          {compact ? "Section heading" : "Medium length section heading goes here"}
        </p>
        <p className={cn("text-neutral-500 leading-relaxed", compact ? "text-[10px] line-clamp-2" : "text-sm")}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <div className={cn("flex gap-2", compact ? "pt-0.5" : "pt-2")}>
          <button className={cn("bg-neutral-900 text-white font-medium rounded", compact ? "px-2 py-1 text-[9px]" : "px-5 py-2.5 text-sm")}>
            Button
          </button>
          <button className={cn("text-neutral-900 font-medium flex items-center gap-0.5", compact ? "text-[9px]" : "text-sm")}>
            Button <span>→</span>
          </button>
        </div>
      </div>
      <div className={cn("flex-1 bg-neutral-300 rounded-lg flex items-center justify-center", compact ? "h-20" : "min-h-[240px]")}>
        <ImageIcon className={cn("text-neutral-400", compact ? "w-6 h-6" : "w-12 h-12")} />
      </div>
    </div>
  );
}

function FullwidthBackground({ compact, isVideo }: { elements: WireframeElement[]; compact?: boolean; isVideo?: boolean }) {
  return (
    <div className={cn(
      "relative bg-neutral-600 rounded-lg flex flex-col items-center justify-center",
      compact ? "h-24 p-3" : "min-h-[220px] p-10"
    )}>
      {/* Background image placeholder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        {isVideo ? (
          <div className={cn("rounded-full bg-neutral-500 flex items-center justify-center", compact ? "w-8 h-8" : "w-16 h-16")}>
            <Play className={cn("text-neutral-400 ml-0.5", compact ? "w-3 h-3" : "w-8 h-8")} fill="currentColor" />
          </div>
        ) : (
          <ImageIcon className={cn("text-neutral-500", compact ? "w-8 h-8" : "w-16 h-16")} />
        )}
      </div>
      {/* Overlay content */}
      <p className={cn("text-white font-bold text-center relative z-10", compact ? "text-xs mb-1" : "text-2xl mb-3")}>
        {compact ? "Section heading" : "Medium length heading goes here"}
      </p>
      <p className={cn("text-white/70 text-center relative z-10", compact ? "text-[9px] mb-1.5" : "text-sm mb-4")}>
        Lorem ipsum dolor sit amet
      </p>
      <button className={cn(
        "bg-white text-neutral-900 font-medium rounded relative z-10",
        compact ? "px-2 py-1 text-[9px]" : "px-5 py-2.5 text-sm"
      )}>
        Button
      </button>
    </div>
  );
}

// Logo layouts
function LogoRow({ elements, compact, hasHeading }: { elements: WireframeElement[]; compact?: boolean; hasHeading?: boolean }) {
  const labelEl = elements.find(e => e.type === 'label');
  const imageEl = elements.find(e => e.type === 'image');
  const logoCount = imageEl?.repeat || 5;
  const displayCount = compact ? Math.min(logoCount, 4) : logoCount;

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-4")}>
      {hasHeading && labelEl && (
        <p className={cn("text-center text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
          {compact ? "Trusted by" : "Trusted by leading companies"}
        </p>
      )}
      <div className={cn("flex items-center justify-center", compact ? "gap-4" : "gap-8")}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i} className={cn("bg-neutral-200 rounded flex items-center justify-center", compact ? "w-10 h-6" : "w-16 h-10")}>
            <span className={cn("text-neutral-400 font-medium", compact ? "text-[7px]" : "text-xs")}>Logo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoMarquee({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const labelEl = elements.find(e => e.type === 'label');
  const displayCount = compact ? 5 : 7;

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-4")}>
      {labelEl && (
        <p className={cn("text-center text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
          {compact ? "Partners" : "Our partners"}
        </p>
      )}
      <div className={cn("flex items-center justify-center overflow-hidden", compact ? "gap-3" : "gap-6")}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i} className={cn("bg-neutral-200 rounded flex items-center justify-center flex-shrink-0", compact ? "w-8 h-5" : "w-14 h-8")}>
            <span className={cn("text-neutral-400 font-medium", compact ? "text-[6px]" : "text-xs")}>Logo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const labelEl = elements.find(e => e.type === 'label');
  const displayCount = compact ? 4 : 8;

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-4")}>
      {labelEl && (
        <p className={cn("text-center text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
          {compact ? "Featured in" : "As featured in"}
        </p>
      )}
      <div className={cn("grid grid-cols-4", compact ? "gap-2" : "gap-4")}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i} className={cn("bg-neutral-200 rounded flex items-center justify-center mx-auto", compact ? "w-10 h-6" : "w-16 h-10")}>
            <span className={cn("text-neutral-400 font-medium", compact ? "text-[6px]" : "text-xs")}>Logo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// How it works layouts
function NumberedSteps({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const steps = [
    { title: "Sign up", desc: "Create your account" },
    { title: "Configure", desc: "Set up your preferences" },
    { title: "Launch", desc: "Start using the app" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
              {compact ? "How it works" : "How it works"}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[9px]" : "text-sm")}>
              {compact ? "3 easy steps" : "Get started in three easy steps"}
            </p>
          </>
        )}
      </div>
      <div className={cn("flex items-start justify-center", compact ? "gap-3" : "gap-6")}>
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center flex-1 text-center">
            <div className={cn(
              "rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold",
              compact ? "w-6 h-6 text-[10px] mb-1.5" : "w-10 h-10 text-sm mb-3"
            )}>
              {i + 1}
            </div>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px] mb-0.5" : "text-sm mb-1")}>
              {compact ? `Step ${i + 1}` : step.title}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-xs")}>
              {compact ? "Description" : step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalTimeline({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const steps = [
    { title: "Create account", desc: "Sign up with your email" },
    { title: "Set up profile", desc: "Add your details" },
    { title: "Connect apps", desc: "Integrate with your tools" },
    { title: "Start using", desc: "Begin your journey" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className="text-center">
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
            {compact ? "Process" : "Our process"}
          </p>
        )}
      </div>
      <div className={cn("relative", compact ? "pl-4" : "pl-6")}>
        <div className={cn("absolute top-0 bottom-0 w-0.5 bg-neutral-200", compact ? "left-1" : "left-1.5")} />
        {steps.slice(0, compact ? 3 : 4).map((step, i) => (
          <div key={i} className={cn("relative flex items-start", compact ? "gap-2 mb-2" : "gap-4 mb-4")}>
            <div className={cn("rounded-full bg-neutral-900 flex-shrink-0 z-10", compact ? "w-2.5 h-2.5 -ml-[5px]" : "w-3.5 h-3.5 -ml-[7px]")} />
            <div className="flex-1">
              <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px]" : "text-sm")}>
                {compact ? `Step ${i + 1}` : step.title}
              </p>
              <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-xs")}>
                {compact ? "Description" : step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCards({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const steps = [
    { icon: "📝", title: "Register", desc: "Create your account" },
    { icon: "⚙️", title: "Setup", desc: "Configure settings" },
    { icon: "🚀", title: "Launch", desc: "Go live" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
            {compact ? "Steps" : "Getting started"}
          </p>
        )}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-4")}>
        {steps.map((step, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200 text-center", compact ? "p-2" : "p-4")}>
            <div className={cn("bg-neutral-100 rounded-lg mx-auto flex items-center justify-center", compact ? "w-6 h-6 mb-1.5" : "w-12 h-12 mb-3")}>
              <span className={compact ? "text-xs" : "text-xl"}>{step.icon}</span>
            </div>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px] mb-0.5" : "text-sm mb-1")}>
              {compact ? `Step ${i + 1}` : step.title}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-xs")}>
              {compact ? "Desc" : step.desc}
            </p>
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
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Testimonials" : "What our customers say"}
        </p>
      )}
      <div className={cn("bg-white rounded-lg border border-neutral-200 text-center mx-auto", compact ? "p-3 max-w-[200px]" : "p-8 max-w-xl")}>
        <p className={cn("text-neutral-600 italic", compact ? "text-[9px] mb-2" : "text-lg mb-4")}>
          {compact ? "\"Great product!\"" : "\"This product has completely transformed how we work. Highly recommended!\""}
        </p>
        <div className={cn("bg-neutral-300 rounded-full mx-auto", compact ? "w-6 h-6 mb-1" : "w-12 h-12 mb-2")} />
        <p className={cn("font-medium text-neutral-800", compact ? "text-[9px]" : "text-sm")}>
          {compact ? "John D." : "John Doe"}
        </p>
        <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-xs")}>
          {compact ? "CEO" : "CEO at Company"}
        </p>
      </div>
    </div>
  );
}

function Carousel({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Reviews" : "Customer reviews"}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button className={cn("bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0", compact ? "w-5 h-5" : "w-8 h-8")}>
          <span className={cn("text-neutral-500", compact ? "text-[10px]" : "text-sm")}>←</span>
        </button>
        <div className={cn("flex-1 bg-white rounded-lg border border-neutral-200 text-center", compact ? "p-2" : "p-6")}>
          <p className={cn("text-neutral-600 italic", compact ? "text-[9px] mb-1.5" : "text-base mb-3")}>
            {compact ? "\"Amazing service!\"" : "\"Amazing service and great support team!\""}
          </p>
          <div className={cn("bg-neutral-300 rounded-full mx-auto", compact ? "w-5 h-5 mb-1" : "w-10 h-10 mb-2")} />
          <p className={cn("font-medium text-neutral-800", compact ? "text-[8px]" : "text-sm")}>
            {compact ? "Sarah" : "Sarah Smith"}
          </p>
        </div>
        <button className={cn("bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0", compact ? "w-5 h-5" : "w-8 h-8")}>
          <span className={cn("text-neutral-500", compact ? "text-[10px]" : "text-sm")}>→</span>
        </button>
      </div>
    </div>
  );
}

function TestimonialGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const testimonials = [
    { quote: "Excellent product!", name: "John D.", role: "CEO" },
    { quote: "Best in class service.", name: "Sarah M.", role: "CTO" },
    { quote: "Highly recommend!", name: "Mike B.", role: "Designer" },
    { quote: "Game changer for us.", name: "Lisa P.", role: "Manager" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Reviews" : "What people say"}
        </p>
      )}
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-4")}>
        {testimonials.slice(0, compact ? 4 : 4).map((t, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200", compact ? "p-2" : "p-4")}>
            <p className={cn("text-neutral-600 italic", compact ? "text-[8px] mb-1.5" : "text-sm mb-3")}>
              {compact ? `"Quote ${i + 1}"` : `"${t.quote}"`}
            </p>
            <div className="flex items-center gap-1.5">
              <div className={cn("bg-neutral-300 rounded-full", compact ? "w-4 h-4" : "w-8 h-8")} />
              <div>
                <p className={cn("font-medium text-neutral-800", compact ? "text-[8px]" : "text-sm")}>{compact ? `Name` : t.name}</p>
                <p className={cn("text-neutral-500", compact ? "text-[7px]" : "text-xs")}>{compact ? "Role" : t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsWithLogos({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const testimonials = [
    { company: "Acme Inc", quote: "Transformed our workflow" },
    { company: "Tech Co", quote: "Best tool we've used" },
    { company: "StartupXYZ", quote: "Highly recommended" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Trusted by" : "Trusted by leading companies"}
        </p>
      )}
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-4")}>
        {testimonials.map((t, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200 text-center", compact ? "p-2" : "p-4")}>
            <div className={cn("bg-neutral-200 rounded mx-auto flex items-center justify-center", compact ? "w-12 h-5 mb-1.5" : "w-20 h-8 mb-3")}>
              <span className={cn("text-neutral-500 font-medium", compact ? "text-[7px]" : "text-xs")}>
                {compact ? "Logo" : t.company}
              </span>
            </div>
            <p className={cn("text-neutral-600 italic", compact ? "text-[8px] mb-1" : "text-sm mb-2")}>
              {compact ? "\"Quote\"" : `"${t.quote}"`}
            </p>
            <p className={cn("text-neutral-500 font-medium", compact ? "text-[7px]" : "text-xs")}>
              {compact ? "- Name" : `- ${t.company} Team`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pricing layouts
function PricingThreeTiers({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const plans = ['Basic', 'Pro', 'Enterprise'];
  const prices = ['$19', '$49', '$99'];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-8")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-3")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800 leading-tight", compact ? "text-xs" : "text-2xl")}>
              {compact ? "Pricing" : "Pricing plans"}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[9px]" : "text-sm")}>
              {compact ? "Choose your plan" : "Simple, transparent pricing for everyone."}
            </p>
          </>
        )}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-1.5" : "gap-6")}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn(
            "bg-white rounded-lg border border-neutral-200",
            i === 1 && "border-neutral-900 ring-1 ring-neutral-900",
            compact ? "p-1.5" : "p-6"
          )}>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[8px] mb-0.5" : "text-base mb-2")}>{plans[i]}</p>
            <p className={cn("font-bold text-neutral-900", compact ? "text-sm mb-1" : "text-3xl mb-4")}>
              {prices[i]}<span className={cn("text-neutral-500 font-normal", compact ? "text-[7px]" : "text-sm")}>/mo</span>
            </p>
            {!compact && (
              <div className="space-y-2 mb-6">
                {['Feature one', 'Feature two', 'Feature three'].map((feature, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="bg-neutral-200 rounded-full flex-shrink-0 w-5 h-5" />
                    <span className="text-neutral-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            )}
            <button className={cn(
              "font-medium rounded w-full",
              i === 1 ? "bg-neutral-900 text-white" : "bg-white text-neutral-900 border border-neutral-300",
              compact ? "py-1 text-[8px]" : "py-2.5 text-sm"
            )}>
              {compact ? "Start" : "Get started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingTwoTiers({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const plans = [
    { name: "Starter", price: "$29", features: ["5 projects", "Basic support", "1GB storage"] },
    { name: "Pro", price: "$79", features: ["Unlimited projects", "Priority support", "10GB storage", "API access"] }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
            {compact ? "Pricing" : "Simple pricing"}
          </p>
        )}
      </div>
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-6")}>
        {plans.map((plan, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200", compact ? "p-2" : "p-5")}>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px] mb-0.5" : "text-base mb-1")}>
              {compact ? `Plan ${i + 1}` : plan.name}
            </p>
            <p className={cn("font-bold text-neutral-900", compact ? "text-sm mb-1.5" : "text-2xl mb-3")}>
              {plan.price}<span className={cn("text-neutral-500 font-normal", compact ? "text-[7px]" : "text-sm")}>/mo</span>
            </p>
            {!compact && (
              <div className="space-y-1.5 mb-4">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-neutral-400 text-xs">✓</span>
                    <span className="text-neutral-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            )}
            <button className={cn(
              "font-medium rounded w-full",
              i === 1 ? "bg-neutral-900 text-white" : "bg-white text-neutral-900 border border-neutral-300",
              compact ? "py-1 text-[8px]" : "py-2 text-sm"
            )}>
              {compact ? "Select" : "Get started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingComparison({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const plans = ["Free", "Pro", "Enterprise"];
  const features = ["Projects", "Storage", "Support", "API"];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
            {compact ? "Compare" : "Compare plans"}
          </p>
        )}
      </div>
      <div className={cn("bg-white rounded-lg border border-neutral-200", compact ? "p-2" : "p-4")}>
        <div className={cn("grid grid-cols-4 border-b border-neutral-100", compact ? "gap-1 pb-1.5 mb-1.5" : "gap-3 pb-3 mb-3")}>
          <div />
          {plans.map((plan, i) => (
            <p key={i} className={cn("text-center font-semibold text-neutral-800", compact ? "text-[8px]" : "text-sm")}>
              {compact ? `Plan ${i + 1}` : plan}
            </p>
          ))}
        </div>
        {features.slice(0, compact ? 3 : 4).map((feature, i) => (
          <div key={i} className={cn("grid grid-cols-4", compact ? "gap-1 py-1" : "gap-3 py-2")}>
            <p className={cn("text-neutral-600", compact ? "text-[8px]" : "text-sm")}>
              {compact ? `Feature ${i + 1}` : feature}
            </p>
            {plans.map((_, j) => (
              <div key={j} className="flex justify-center">
                <span className={cn("text-neutral-400", compact ? "text-[10px]" : "text-sm")}>✓</span>
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
  const plans = ["Basic", "Pro", "Team"];
  const prices = ["$9", "$29", "$99"];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
            {compact ? "Pricing" : "Choose your plan"}
          </p>
        )}
      </div>
      <div className="flex justify-center">
        <div className={cn("bg-neutral-100 rounded-full flex", compact ? "p-0.5" : "p-1")}>
          <button className={cn("bg-white rounded-full font-medium text-neutral-800 shadow-sm", compact ? "px-3 py-1 text-[8px]" : "px-4 py-1.5 text-xs")}>
            Monthly
          </button>
          <button className={cn("rounded-full font-medium text-neutral-500", compact ? "px-3 py-1 text-[8px]" : "px-4 py-1.5 text-xs")}>
            Yearly
          </button>
        </div>
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-1.5" : "gap-4")}>
        {plans.map((plan, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200 text-center", compact ? "p-1.5" : "p-4")}>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[8px] mb-0.5" : "text-sm mb-1")}>
              {compact ? `Plan ${i + 1}` : plan}
            </p>
            <p className={cn("font-bold text-neutral-900", compact ? "text-sm mb-1" : "text-xl mb-2")}>
              {prices[i]}<span className={cn("text-neutral-500 font-normal", compact ? "text-[6px]" : "text-xs")}>/mo</span>
            </p>
            <button className={cn(
              "font-medium rounded w-full bg-neutral-900 text-white",
              compact ? "py-1 text-[7px]" : "py-1.5 text-xs"
            )}>
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSingle({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const features = ["Unlimited projects", "Priority support", "API access", "Custom domain", "Analytics"];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
            {compact ? "One plan" : "Simple pricing"}
          </p>
        )}
      </div>
      <div className={cn("bg-white rounded-lg border border-neutral-200 mx-auto text-center", compact ? "p-3 max-w-[160px]" : "p-6 max-w-sm")}>
        <p className={cn("font-bold text-neutral-900", compact ? "text-lg mb-1" : "text-3xl mb-2")}>
          $49<span className={cn("text-neutral-500 font-normal", compact ? "text-[8px]" : "text-sm")}>/month</span>
        </p>
        <p className={cn("text-neutral-500", compact ? "text-[8px] mb-2" : "text-sm mb-4")}>
          {compact ? "All features" : "Everything you need"}
        </p>
        {!compact && (
          <div className="space-y-2 mb-4 text-left">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-neutral-400 text-xs">✓</span>
                <span className="text-neutral-600 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        )}
        <button className={cn("font-medium rounded w-full bg-neutral-900 text-white", compact ? "py-1.5 text-[8px]" : "py-2.5 text-sm")}>
          {compact ? "Start" : "Get started"}
        </button>
      </div>
    </div>
  );
}

// FAQ layouts
function FaqAccordion({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const questions = [
    "How do I get started with your product?",
    "What payment methods do you accept?",
    "Can I cancel my subscription anytime?",
    "Do you offer customer support?",
    "Is there a free trial available?"
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
              {compact ? "FAQ" : "Frequently asked questions"}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[9px]" : "text-sm")}>
              {compact ? "Common questions" : "Find answers to common questions"}
            </p>
          </>
        )}
      </div>
      <div className={cn(compact ? "space-y-1.5" : "space-y-3")}>
        {questions.slice(0, compact ? 4 : 5).map((question, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200", compact ? "px-2 py-1.5" : "px-4 py-3")}>
            <div className="flex items-center justify-between">
              <p className={cn("text-neutral-800 font-medium", compact ? "text-[9px]" : "text-sm")}>
                {compact ? `Question ${i + 1}?` : question}
              </p>
              <span className={cn("text-neutral-400", compact ? "text-[10px]" : "text-sm")}>+</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqTwoColumn({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const faqs = [
    { q: "How do I sign up?", a: "Click the sign up button and follow the steps." },
    { q: "What's the pricing?", a: "We offer flexible plans starting at $9/mo." },
    { q: "Is support included?", a: "Yes, all plans include 24/7 support." },
    { q: "Can I upgrade later?", a: "Yes, upgrade anytime from settings." },
    { q: "Do you offer refunds?", a: "30-day money back guarantee." },
    { q: "Is my data secure?", a: "Yes, we use enterprise encryption." }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
              {compact ? "FAQ" : "Frequently asked questions"}
            </p>
          </>
        )}
      </div>
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-6")}>
        {faqs.slice(0, compact ? 4 : 6).map((faq, i) => (
          <div key={i} className={compact ? "space-y-0.5" : "space-y-2"}>
            <p className={cn("font-medium text-neutral-800", compact ? "text-[9px]" : "text-sm")}>
              {compact ? `Question ${i + 1}?` : faq.q}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
              {compact ? "Answer here" : faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqCategorized({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const categories = ["Getting Started", "Billing", "Support"];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "FAQ" : "Help Center"}
        </p>
      )}
      <div className={cn(compact ? "space-y-2" : "space-y-4")}>
        {categories.slice(0, compact ? 2 : 3).map((category, i) => (
          <div key={i}>
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px] mb-1" : "text-sm mb-2")}>
              {compact ? `Category ${i + 1}` : category}
            </p>
            <div className={cn(compact ? "space-y-1" : "space-y-2")}>
              {[1, 2].map((j) => (
                <div key={j} className={cn("bg-white rounded border border-neutral-200", compact ? "px-2 py-1" : "px-3 py-2")}>
                  <p className={cn("text-neutral-700", compact ? "text-[8px]" : "text-sm")}>
                    {compact ? `Question ${j}?` : `How do I ${category.toLowerCase()} question ${j}?`}
                  </p>
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
    <div className={cn("text-center", compact ? "space-y-3" : "space-y-5")}>
      <div className={compact ? "space-y-1" : "space-y-2"}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
              {compact ? "Subscribe now" : "Subscribe to our newsletter"}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[9px]" : "text-sm")}>
              {compact ? "Get updates" : "Get the latest updates and news"}
            </p>
          </>
        )}
      </div>
      <div className={cn("flex justify-center", compact ? "gap-1.5" : "gap-2")}>
        <div className={cn("bg-white border border-neutral-300 rounded flex items-center", compact ? "h-7 px-2" : "h-10 px-4")}>
          <span className={cn("text-neutral-400", compact ? "text-[8px]" : "text-sm")}>Enter your email</span>
        </div>
        <button className={cn("bg-neutral-900 text-white font-medium rounded", compact ? "px-3 py-1.5 text-[9px]" : "px-5 py-2.5 text-sm")}>
          {compact ? "Submit" : "Subscribe"}
        </button>
      </div>
    </div>
  );
}

function CtaBanner({ compact }: { elements: WireframeElement[]; compact?: boolean }) {
  return (
    <div className={cn(
      "bg-neutral-900 rounded-lg flex items-center justify-between",
      compact ? "p-3" : "p-6"
    )}>
      <div className={compact ? "space-y-0.5" : "space-y-1"}>
        <p className={cn("font-bold text-white", compact ? "text-xs" : "text-xl")}>
          {compact ? "Get started today" : "Ready to get started?"}
        </p>
        <p className={cn("text-white/70", compact ? "text-[9px]" : "text-sm")}>
          {compact ? "Start your journey" : "Start your free trial today"}
        </p>
      </div>
      <button className={cn("bg-white text-neutral-900 font-medium rounded", compact ? "px-3 py-1.5 text-[9px]" : "px-5 py-2.5 text-sm")}>
        {compact ? "Start" : "Get started"}
      </button>
    </div>
  );
}

function CtaCard({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const cardEl = elements.find(e => e.type === 'card');

  return (
    <div className={cn("bg-white rounded-lg border border-neutral-200 text-center mx-auto", compact ? "p-4 max-w-[200px]" : "p-8 max-w-md")}>
      {cardEl?.children?.map((child, i) => (
        <div key={i} className="mb-2">
          <WireframeElementRenderer element={child} compact={compact} />
        </div>
      )) || (
        <>
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs mb-1" : "text-xl mb-2")}>
            {compact ? "Get started" : "Start your free trial"}
          </p>
          <p className={cn("text-neutral-500", compact ? "text-[9px] mb-2" : "text-sm mb-4")}>
            {compact ? "No credit card required" : "No credit card required. Cancel anytime."}
          </p>
          <button className={cn("bg-neutral-900 text-white font-medium rounded", compact ? "px-4 py-1.5 text-[9px]" : "px-6 py-2.5 text-sm")}>
            {compact ? "Start" : "Get started free"}
          </button>
        </>
      )}
    </div>
  );
}

// Team layouts
function TeamGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const teamMembers = [
    { name: "John Smith", role: "CEO" },
    { name: "Sarah Chen", role: "CTO" },
    { name: "Mike Brown", role: "Designer" },
    { name: "Lisa Park", role: "Developer" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
              {compact ? "Our Team" : "Meet our team"}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[9px]" : "text-sm")}>
              {compact ? "The people behind" : "The talented people behind our success"}
            </p>
          </>
        )}
      </div>
      <div className={cn("grid grid-cols-4", compact ? "gap-2" : "gap-4")}>
        {teamMembers.map((member, i) => (
          <div key={i} className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
            <div className={cn("bg-neutral-300 rounded-full mx-auto", compact ? "w-8 h-8" : "w-16 h-16")} />
            <p className={cn("font-medium text-neutral-800", compact ? "text-[8px]" : "text-sm")}>
              {compact ? `Name ${i + 1}` : member.name}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[7px]" : "text-xs")}>
              {compact ? "Role" : member.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamFeatured({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const teamMembers = [
    { name: "John Smith", role: "CEO", bio: "Leading the company vision" },
    { name: "Sarah Chen", role: "CTO", bio: "Building great products" },
    { name: "Mike Brown", role: "Design", bio: "Creating beautiful experiences" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
            {compact ? "Our Team" : "Meet our leadership"}
          </p>
        )}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-6")}>
        {teamMembers.map((member, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200 text-center", compact ? "p-2" : "p-4")}>
            <div className={cn("bg-neutral-300 rounded-lg mx-auto", compact ? "w-full h-10 mb-1.5" : "w-full h-24 mb-3")} />
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px]" : "text-base")}>
              {compact ? `Name ${i + 1}` : member.name}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[8px] mb-0.5" : "text-sm mb-1")}>
              {compact ? "Role" : member.role}
            </p>
            {!compact && (
              <p className="text-neutral-400 text-xs">{member.bio}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamList({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const teamMembers = [
    { name: "John Smith", role: "CEO" },
    { name: "Sarah Chen", role: "CTO" },
    { name: "Mike Brown", role: "Designer" },
    { name: "Lisa Park", role: "Developer" },
    { name: "Tom Wilson", role: "Marketing" },
    { name: "Anna Lee", role: "Sales" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Team" : "Our team"}
        </p>
      )}
      <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-4")}>
        {teamMembers.slice(0, compact ? 4 : 6).map((member, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn("bg-neutral-300 rounded-full flex-shrink-0", compact ? "w-6 h-6" : "w-12 h-12")} />
            <div>
              <p className={cn("font-medium text-neutral-800", compact ? "text-[9px]" : "text-sm")}>
                {compact ? `Name ${i + 1}` : member.name}
              </p>
              <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-xs")}>
                {compact ? "Role" : member.role}
              </p>
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
  const stats = [
    { value: "100+", label: "Customers" },
    { value: "50K", label: "Downloads" },
    { value: "99%", label: "Uptime" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Our numbers" : "Trusted by thousands"}
        </p>
      )}
      <div className={cn("grid grid-cols-4", compact ? "gap-2" : "gap-6")}>
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <p className={cn("font-bold text-neutral-900", compact ? "text-sm mb-0.5" : "text-3xl mb-1")}>
              {compact ? stat.value.slice(0, 3) : stat.value}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsLarge({ compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const stats = [
    { value: "500+", label: "Happy customers worldwide" },
    { value: "99.9%", label: "Service uptime guaranteed" },
    { value: "10M+", label: "Transactions processed" }
  ];

  return (
    <div className={cn("grid grid-cols-3", compact ? "gap-3" : "gap-8")}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <p className={cn("font-bold text-neutral-900", compact ? "text-lg mb-0.5" : "text-4xl mb-2")}>
            {compact ? stat.value.slice(0, 4) : stat.value}
          </p>
          <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
            {compact ? "Description" : stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// Contact layouts
function ContactForm({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-8")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-3")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800 leading-tight", compact ? "text-xs" : "text-2xl")}>
              {compact ? "Contact" : "Contact us"}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[9px]" : "text-sm")}>
              {compact ? "Get in touch" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
            </p>
          </>
        )}
      </div>
      <div className={cn("bg-white rounded-lg border border-neutral-200 mx-auto", compact ? "p-2 space-y-1.5 max-w-[140px]" : "p-6 space-y-5 max-w-md")}>
        {compact ? (
          <>
            <div className="bg-white border border-neutral-300 rounded w-full h-4" />
            <div className="bg-white border border-neutral-300 rounded w-full h-4" />
            <div className="bg-white border border-neutral-300 rounded w-full h-6" />
            <button className="bg-neutral-900 text-white font-medium rounded w-full py-1 text-[8px]">
              Submit
            </button>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-neutral-700 font-medium text-sm">Name</label>
              <div className="bg-white border border-neutral-300 rounded w-full h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-neutral-700 font-medium text-sm">Email</label>
              <div className="bg-white border border-neutral-300 rounded w-full h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-neutral-700 font-medium text-sm">Message</label>
              <div className="bg-white border border-neutral-300 rounded w-full h-32" />
            </div>
            <div className="flex items-center gap-2">
              <div className="border border-neutral-300 rounded w-5 h-5" />
              <span className="text-neutral-600 text-sm">I accept the terms</span>
            </div>
            <button className="bg-neutral-900 text-white font-medium rounded w-full py-3 text-sm">
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ContactSplit({ compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const contactMethods = [
    { label: "hello@company.com" },
    { label: "+1 (555) 123-4567" },
    { label: "123 Main Street" }
  ];

  return (
    <div className={cn("flex", compact ? "gap-3" : "gap-8")}>
      <div className={cn("flex-1", compact ? "space-y-2" : "space-y-4")}>
        <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-xl")}>
          Get in touch
        </p>
        <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
          {compact ? "We'd love to hear from you" : "We'd love to hear from you. Send us a message."}
        </p>
        <div className={compact ? "space-y-1" : "space-y-2"}>
          {contactMethods.map((method, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn("bg-neutral-300 rounded", compact ? "w-3 h-3" : "w-5 h-5")} />
              <span className={cn("text-neutral-600", compact ? "text-[8px]" : "text-sm")}>
                {compact ? `Contact ${i + 1}` : method.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={cn("flex-1 bg-white rounded-lg border border-neutral-200", compact ? "p-2 space-y-1" : "p-4 space-y-3")}>
        <div className={cn("bg-white border border-neutral-300 rounded w-full", compact ? "h-5" : "h-10")} />
        <div className={cn("bg-white border border-neutral-300 rounded w-full", compact ? "h-5" : "h-10")} />
        <div className={cn("bg-white border border-neutral-300 rounded w-full", compact ? "h-8" : "h-20")} />
        <button className={cn("bg-neutral-900 text-white font-medium rounded", compact ? "px-3 py-1 text-[8px]" : "px-4 py-2 text-sm")}>
          {compact ? "Send" : "Send message"}
        </button>
      </div>
    </div>
  );
}

function ContactMap({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Find us" : "Find us"}
        </p>
      )}
      <div className={cn("flex", compact ? "gap-2" : "gap-6")}>
        <div className={cn("flex-1 bg-neutral-200 rounded-lg flex items-center justify-center", compact ? "h-20" : "h-40")}>
          <span className={cn("text-neutral-400", compact ? "text-xs" : "text-sm")}>Map</span>
        </div>
        <div className={cn("flex-1 bg-white rounded-lg border border-neutral-200", compact ? "p-2 space-y-1" : "p-4 space-y-3")}>
          <div className={cn("bg-white border border-neutral-300 rounded w-full", compact ? "h-4" : "h-10")} />
          <div className={cn("bg-white border border-neutral-300 rounded w-full", compact ? "h-4" : "h-10")} />
          <div className={cn("bg-white border border-neutral-300 rounded w-full", compact ? "h-6" : "h-16")} />
          <button className={cn("bg-neutral-900 text-white font-medium rounded", compact ? "px-2 py-1 text-[8px]" : "px-4 py-2 text-sm")}>
            {compact ? "Submit" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactCards({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cards = [
    { title: "Email", desc: "hello@company.com", cta: "Send email" },
    { title: "Chat", desc: "Start a live chat", cta: "Start chat" },
    { title: "Phone", desc: "+1 (555) 123-4567", cta: "Call us" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
        {headerElements.length > 0 ? (
          headerElements.map((el, i) => (
            <WireframeElementRenderer key={i} element={el} compact={compact} />
          ))
        ) : (
          <>
            <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
              {compact ? "Contact" : "Contact us"}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[9px]" : "text-sm")}>
              {compact ? "Get in touch" : "Choose how you'd like to reach us"}
            </p>
          </>
        )}
      </div>
      <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-4")}>
        {cards.map((card, i) => (
          <div key={i} className={cn("bg-white rounded-lg border border-neutral-200 text-center", compact ? "p-2" : "p-4")}>
            <div className={cn("bg-neutral-300 rounded-lg mx-auto", compact ? "w-6 h-6 mb-1" : "w-10 h-10 mb-2")} />
            <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px] mb-0.5" : "text-sm mb-1")}>
              {compact ? `Method ${i + 1}` : card.title}
            </p>
            <p className={cn("text-neutral-500", compact ? "text-[8px] mb-1" : "text-xs mb-2")}>
              {compact ? "Contact info" : card.desc}
            </p>
            <button className={cn("text-neutral-900 font-medium", compact ? "text-[8px]" : "text-xs")}>
              {compact ? "Contact" : card.cta} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactMinimal({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading' && e.role === 'section-title');

  return (
    <div className={cn("text-center", compact ? "space-y-2" : "space-y-4")}>
      {headerEl ? (
        <WireframeElementRenderer element={headerEl} compact={compact} />
      ) : (
        <p className={cn("font-bold text-neutral-800", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Contact" : "Get in touch"}
        </p>
      )}
      <p className={cn("text-neutral-600 font-medium", compact ? "text-[10px]" : "text-lg")}>
        hello@company.com
      </p>
      <div className={cn("flex justify-center", compact ? "gap-2" : "gap-3")}>
        {["X", "In", "Fb", "Ig"].map((social, i) => (
          <div key={i} className={cn("bg-neutral-200 rounded-full flex items-center justify-center", compact ? "w-5 h-5" : "w-8 h-8")}>
            <span className={cn("text-neutral-500 font-medium", compact ? "text-[7px]" : "text-xs")}>{social}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Content layouts
function ContentFeatured({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Latest posts" : "Latest from our blog"}
        </p>
      )}
      <div className={cn("flex", compact ? "gap-2" : "gap-6")}>
        <div className={cn("flex-[2] bg-white rounded-lg border border-neutral-200", compact ? "p-2" : "p-4")}>
          <div className={cn("bg-neutral-200 rounded-lg w-full flex items-center justify-center", compact ? "h-14 mb-2" : "h-32 mb-4")}>
            <ImageIcon className={cn("text-neutral-400", compact ? "w-4 h-4" : "w-8 h-8")} />
          </div>
          <p className={cn("text-neutral-500 uppercase font-medium", compact ? "text-[7px] mb-0.5" : "text-xs mb-1")}>
            {compact ? "Category" : "Technology"}
          </p>
          <p className={cn("font-semibold text-neutral-800", compact ? "text-[9px] mb-0.5" : "text-lg mb-2")}>
            {compact ? "Featured article title" : "How to build better products faster"}
          </p>
          <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-sm")}>
            {compact ? "Description..." : "Learn the best practices for modern product development."}
          </p>
        </div>
        <div className={cn("flex-1", compact ? "space-y-1.5" : "space-y-4")}>
          {["Second post title", "Third post title"].map((title, i) => (
            <div key={i} className={cn("bg-white rounded-lg border border-neutral-200", compact ? "p-1.5" : "p-3")}>
              <div className={cn("bg-neutral-200 rounded w-full flex items-center justify-center", compact ? "h-8 mb-1" : "h-16 mb-2")}>
                <ImageIcon className={cn("text-neutral-400", compact ? "w-3 h-3" : "w-5 h-5")} />
              </div>
              <p className={cn("font-medium text-neutral-800", compact ? "text-[8px]" : "text-sm")}>
                {compact ? `Post ${i + 2}` : title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentList({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerEl = elements.find(e => e.type === 'heading');
  const posts = [
    { title: "Getting started with our platform", date: "Dec 15" },
    { title: "Best practices for team collaboration", date: "Dec 12" },
    { title: "New features announcement", date: "Dec 10" },
    { title: "How to optimize your workflow", date: "Dec 8" }
  ];

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {headerEl ? (
        <div className="text-center">
          <WireframeElementRenderer element={headerEl} compact={compact} />
        </div>
      ) : (
        <p className={cn("font-bold text-neutral-800 text-center", compact ? "text-xs" : "text-2xl")}>
          {compact ? "Articles" : "Recent articles"}
        </p>
      )}
      <div className={cn(compact ? "space-y-1.5" : "space-y-4")}>
        {posts.slice(0, compact ? 3 : 4).map((post, i) => (
          <div key={i} className={cn("flex", compact ? "gap-2" : "gap-4")}>
            <div className={cn("bg-neutral-200 rounded-lg flex-shrink-0 flex items-center justify-center", compact ? "w-12 h-8" : "w-24 h-16")}>
              <ImageIcon className={cn("text-neutral-400", compact ? "w-3 h-3" : "w-5 h-5")} />
            </div>
            <div className="flex-1">
              <p className={cn("font-medium text-neutral-800", compact ? "text-[9px] mb-0.5" : "text-sm mb-1")}>
                {compact ? `Article ${i + 1}` : post.title}
              </p>
              <p className={cn("text-neutral-500", compact ? "text-[8px]" : "text-xs")}>
                {compact ? "Description" : "A brief description of the article content..."}
              </p>
              <p className={cn("text-neutral-400", compact ? "text-[7px]" : "text-xs")}>
                {compact ? "Date" : post.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Relume-style element renderer with actual text
function WireframeElementRenderer({ element, compact }: { element: WireframeElement; compact?: boolean }) {
  const { interactive, imageInspirations, onVisualClick } = useContext(InteractiveContext);

  // Check if this is a visual element that can have inspiration
  const isVisual = isVisualElement(element.type);
  const hasRole = !!element.role;
  const canHaveInspiration = isVisual && hasRole && interactive;
  const inspiration = canHaveInspiration ? imageInspirations.find(i => i.elementRole === element.role) : undefined;
  const hasInspiration = !!inspiration;
  const inspirationImageUrl = inspiration?.path || inspiration?.url;

  // Wrapper for interactive visual elements
  const InteractiveWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    if (!canHaveInspiration) {
      return <div className={className}>{children}</div>;
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onVisualClick?.(element.role!, element.type);
        }}
        className={cn(
          className,
          "relative group cursor-pointer transition-all overflow-hidden",
          "hover:ring-2 hover:ring-primary hover:ring-offset-1",
          hasInspiration && "ring-1 ring-primary/50"
        )}
      >
        {inspirationImageUrl ? (
          <img
            src={inspirationImageUrl}
            alt="Reference"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          children
        )}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity",
          hasInspiration ? "bg-black/20 opacity-0 group-hover:opacity-100" : "bg-primary/10 opacity-0 group-hover:opacity-100"
        )}>
          <div className={cn(
            "rounded-full p-1",
            hasInspiration ? "bg-primary text-primary-foreground" : "bg-background border shadow-sm"
          )}>
            {hasInspiration ? (
              <Check className="w-3 h-3" />
            ) : (
              <Plus className="w-3 h-3 text-primary" />
            )}
          </div>
        </div>
      </button>
    );
  };

  const size = element.size || "medium";
  const align = element.align || "left";
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  switch (element.type) {
    case "heading":
      return (
        <p className={cn(
          "font-bold text-neutral-800 leading-tight",
          alignClass,
          size === "large" && (compact ? "text-xs" : "text-2xl"),
          size === "medium" && (compact ? "text-[11px]" : "text-xl"),
          size === "small" && (compact ? "text-[10px] font-semibold" : "text-base font-semibold"),
        )}>
          {compact
            ? (size === "large" ? "Section heading" : size === "medium" ? "Heading" : "Title")
            : (size === "large" ? "Medium length section heading goes here" : size === "medium" ? "Section heading" : "Feature title")
          }
        </p>
      );

    case "subheading":
      return (
        <p className={cn(
          "text-neutral-500 leading-relaxed",
          alignClass,
          compact ? "text-[9px]" : "text-sm",
        )}>
          {compact ? "Lorem ipsum dolor sit amet" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </p>
      );

    case "paragraph":
      return (
        <p className={cn(
          "text-neutral-500 leading-relaxed",
          alignClass,
          compact ? "text-[9px] line-clamp-2" : "text-sm",
        )}>
          {compact ? "Lorem ipsum dolor sit amet." : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
        </p>
      );

    case "label":
      return (
        <p className={cn(
          "text-neutral-500 font-medium uppercase tracking-wide",
          alignClass,
          compact ? "text-[8px]" : "text-xs",
        )}>
          Tagline
        </p>
      );

    case "icon":
      return (
        <div className={cn(
          "bg-neutral-300 rounded-md flex items-center justify-center",
          size === "large" && (compact ? "w-8 h-8" : "w-12 h-12"),
          size === "medium" && (compact ? "w-6 h-6" : "w-10 h-10"),
          size === "small" && (compact ? "w-5 h-5" : "w-8 h-8"),
        )}>
          <div className={cn(
            "bg-neutral-400 rounded",
            compact ? "w-3 h-3" : "w-4 h-4"
          )} />
        </div>
      );

    case "button-primary":
      return (
        <button className={cn(
          "bg-neutral-900 text-white font-medium rounded",
          compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm",
        )}>
          Button
        </button>
      );

    case "button-secondary":
      return (
        <button className={cn(
          "bg-white text-neutral-900 font-medium rounded border border-neutral-300",
          compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm",
        )}>
          Button
        </button>
      );

    case "image":
      return (
        <InteractiveWrapper className={cn(
          "bg-neutral-300 rounded-lg flex items-center justify-center w-full",
          compact ? "h-16" : "min-h-[200px]"
        )}>
          <ImageIcon className={cn("text-neutral-400", compact ? "w-5 h-5" : "w-12 h-12")} />
        </InteractiveWrapper>
      );

    case "video":
      return (
        <InteractiveWrapper className={cn(
          "bg-neutral-300 rounded-lg flex items-center justify-center w-full relative",
          compact ? "h-16" : "min-h-[200px]"
        )}>
          <div className={cn("rounded-full bg-neutral-400/50 flex items-center justify-center", compact ? "w-6 h-6" : "w-14 h-14")}>
            <Play className={cn("text-neutral-500 ml-0.5", compact ? "w-3 h-3" : "w-6 h-6")} fill="currentColor" />
          </div>
        </InteractiveWrapper>
      );

    case "avatar":
      return (
        <InteractiveWrapper className={cn(
          "bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0",
          compact ? "w-10 h-10" : "w-14 h-14"
        )}>
          <svg
            className={cn("text-neutral-400", compact ? "w-5 h-5" : "w-7 h-7")}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          </svg>
        </InteractiveWrapper>
      );

    case "logo":
      return (
        <InteractiveWrapper className={cn(
          "bg-neutral-300 rounded flex items-center justify-center",
          compact ? "w-20 h-8" : "w-28 h-10"
        )}>
          <span className={cn("text-neutral-500 font-medium", compact ? "text-xs" : "text-sm")}>Logo</span>
        </InteractiveWrapper>
      );

    case "input":
      return (
        <div className="space-y-1">
          <label className={cn("text-neutral-700 font-medium", compact ? "text-xs" : "text-sm")}>
            Label
          </label>
          <div className={cn(
            "bg-white border border-neutral-300 rounded w-full",
            compact ? "h-9" : "h-11"
          )} />
        </div>
      );

    default:
      return null;
  }
}

export default WireframePreview;
