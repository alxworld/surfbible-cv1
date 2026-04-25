import { BOOK_NAMES } from "./osis";

export async function fetchPassageText(book: string, ref: string): Promise<string> {
  const name = BOOK_NAMES[book] ?? book;
  const query = `${name} ${ref}`;
  const res = await fetch(
    `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(query)}&include-headings=false&include-footnotes=false`,
    {
      headers: { Authorization: process.env.ESV_API_KEY! },
      next: { revalidate: 86400 },
    }
  );
  if (!res.ok) return "";
  const data = await res.json();
  return (data.passages?.[0] ?? "").trim();
}
