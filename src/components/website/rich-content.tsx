import sanitizeHtml from "sanitize-html";

/**
 * Post HTML is emitted by the constrained Tiptap editor and sanitized in the
 * server action before persistence. Keeping rendering server-side avoids adding
 * editor JavaScript to public article pages.
 */
export function RichContent({ html }: { html: string }) {
  const cleanHtml = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "b",
      "i",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        { rel: "noopener noreferrer" },
        true,
      ),
    },
  });
  return (
    <div
      className="prose-bhumi"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
