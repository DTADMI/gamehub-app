"use client";

import type {EmblaOptionsType} from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import React, {useCallback, useEffect, useState} from "react";

type CarouselProps = {
  children: React.ReactNode;
  options?: EmblaOptionsType;
  className?: string;
};

export function Carousel({children, options, className}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
      // Use snap points for predictable paging by viewport
      dragFree: false,
    ...options,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

    const scrollByViewport = useCallback(
        (direction: 1 | -1) => {
            if (!emblaApi) {
                return;
            }
            const snaps = emblaApi.scrollSnapList();
            const selected = emblaApi.selectedScrollSnap();
            // Estimate slides in view as difference between next/prev snap indices that change visibility
            // Fallback to 1 if unknown
            let group = 1;
            try {
                // Embla v8: slidesInView has no parameters
                const inView = emblaApi.slidesInView();
                if (inView && inView.length > 0) {
                    group = Math.max(1, inView.length);
                }
            } catch {
                // ignore and use group = 1
            }

            const target =
                direction === 1
                    ? Math.min(selected + group, snaps.length - 1)
                    : Math.max(selected - group, 0);
            emblaApi.scrollTo(target);
        },
        [emblaApi],
    );

  return (
      <div className={className ?? "relative"}>
          <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                  {React.Children.map(children, (child) => (
                      <div className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                          {child}
                      </div>
                  ))}
              </div>
          </div>
          <div className="absolute -top-14 right-0 flex gap-2">
              <button
                  aria-label="Previous"
                  className="inline-flex items-center justify-center rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-50"
                  onClick={() => scrollByViewport(-1)}
                  disabled={!canPrev}
              >
                  <ChevronLeft className="h-4 w-4"/>
              </button>
              <button
                  aria-label="Next"
                  className="inline-flex items-center justify-center rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-50"
                  onClick={() => scrollByViewport(1)}
                  disabled={!canNext}
              >
                  <ChevronRight className="h-4 w-4"/>
              </button>
          </div>
      </div>
  );
}

export default Carousel;
