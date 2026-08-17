/* Server component. Renders JSON-LD without next/script so it lands in the
   initial HTML — crawlers should never depend on hydration to see it. */

export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      /* JSON.stringify output is escaped for the one sequence that can break
         out of a script element. */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
