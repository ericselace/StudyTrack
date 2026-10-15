const SCRIPTURE_API_URL =
  "https://openscriptureapi.org/api/scriptures/v1/lds/en";

const DAILY_VERSES = [
  { book: "john", chapter: 14, verse: 27 },
  { book: "alma", chapter: 32, verse: 21 },
  { book: "proverbs", chapter: 3, verse: 5 },
  { book: "philippians", chapter: 4, verse: 13 },
  { book: "mosiah", chapter: 2, verse: 17 },
];

export async function getDailyScripture() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) /
      (1000 * 60 * 60 * 24),
  );

  const index = dayOfYear % DAILY_VERSES.length;
  const dailyVerse = DAILY_VERSES[index];

  const url =
    `${SCRIPTURE_API_URL}/book/${dailyVerse.book}/` +
    `${dailyVerse.chapter}/${dailyVerse.verse}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to retrieve today's scripture.");
    }

    const data = await response.json();

    return {
      reference: data.reference,
      text: data.text,
      source: "Open Scripture API",
    };
  } catch (error) {
    console.error("Scripture API error:", error);
    return null;
  }
}