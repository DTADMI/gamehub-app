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
    const [emblaRef, emblaApi] = useEmblaCarousel({loop: false, dragFree: true, ...options});
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
                    onClick={() => emblaApi?.scrollPrev()}
                    disabled={!canPrev}
                >
                    <ChevronLeft className="h-4 w-4"/>
                </button>
                <button
                    aria-label="Next"
                    className="inline-flex items-center justify-center rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-50"
                    onClick={() => emblaApi?.scrollNext()}
                    disabled={!canNext}
                >
                    <ChevronRight className="h-4 w-4"/>
                </button>
            </div>
        </div>
    );
}

export default Carousel;
