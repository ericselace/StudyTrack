const QUOTE_API_URL = "https://dummyjson.com/quotes/random";

export async function getDailyQuote() {
  try {
    const response = await fetch(QUOTE_API_URL);

    if (!response.ok) {
      throw new Error("Unable to retrieve the quote.");
    }

    const data = await response.json();

    return {
      quote: data.quote,
      author: data.author,
    };
  } catch (error) {
    console.error("Quote API error:", error);

    return {
      quote: "Great things are done by a series of small things brought together.",
      author: "Vincent van Gogh",
    };
  }
}