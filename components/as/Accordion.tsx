"use client";

import { useRef, useState, type ReactNode } from "react";

export interface AccordionItem {
  /** "01" or "DAY 01" */
  n?: string;
  /** Secondary label shown between number and title — the itinerary date. */
  meta?: string | null;
  title: string;
  body: ReactNode;
}

interface Props {
  items: AccordionItem[];
  /** Index open on first paint. -1 for all closed. */
  initial?: number;
  /** Allow more than one panel open at a time. */
  multiple?: boolean;
  idPrefix: string;
}

/* Height is animated from a measured scrollHeight rather than
   max-height guesswork, so long answers never clip and short ones
   never crawl. The reduced-motion path drops the transition in CSS. */

export default function Accordion({ items, initial = -1, multiple = false, idPrefix }: Props) {
  const [open, setOpen] = useState<number[]>(initial >= 0 ? [initial] : []);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  function toggle(i: number) {
    setOpen((prev) => {
      const isOpen = prev.includes(i);
      if (isOpen) return prev.filter((n) => n !== i);
      return multiple ? [...prev, i] : [i];
    });
  }

  return (
    <div className="s-acc">
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        const panelId = `${idPrefix}-p-${i}`;
        const btnId = `${idPrefix}-b-${i}`;
        const el = panels.current[i];

        return (
          <div className="s-acc-item" data-open={isOpen} key={`${idPrefix}-${i}`}>
            <h3 style={{ margin: 0 }}>
              <button
                id={btnId}
                type="button"
                className="s-acc-q"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
              >
                {item.n ? <span className="s-acc-n">{item.n}</span> : null}
                <span className="s-acc-t">
                  {item.meta ? (
                    <span className="s-acc-n" style={{ marginRight: 14 }}>
                      {item.meta}
                    </span>
                  ) : null}
                  {item.title}
                </span>
                <span className="s-acc-i" aria-hidden="true">
                  {isOpen ? "–" : "+"}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className="s-acc-a"
              ref={(node) => {
                panels.current[i] = node;
              }}
              style={{ height: isOpen ? (el ? el.scrollHeight : "auto") : 0 }}
              /* Closed panels stay out of the tab order and the
                 accessibility tree; height:0 alone would not. */
              inert={!isOpen}
            >
              <div className="s-acc-a-in">{item.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
