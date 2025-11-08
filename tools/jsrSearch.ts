import z from "zod";
import { Tool } from "../../agents/mod.ts";

export default new Tool({
  name: "Search JSR",
  description:
    "Searches the JSR (Jsr.io) registry for packages, modules, and documentation using the Orama search API.",
  parameters: z.object({
    term: z.string().min(1).describe("Search term to find in JSR"),
    limit: z.number().int().min(1).default(5).describe(
      "Maximum results to return",
    ),
    mode: z.enum(["fulltext", "exact"]).default("fulltext").describe(
      "Search mode",
    ),
  }),
  /**
   * The execute function can be async. The Agent will await it.
   */
  async execute({ param }) {
    const { term, limit, mode } = param;

    const searchQuery = {
      term,
      limit,
      mode,
      boost: {
        id: 3,
        scope: 2,
        name: 1,
        description: 0.5,
      },
    };

    const body = new URLSearchParams();
    body.append("q", JSON.stringify(searchQuery));
    body.append("version", "1.3.20");
    body.append("id", "h4hh0t8pyfj7e36kusgmkya3");
    body.append(
      "visitorId",
      crypto.getRandomValues(new Uint8Array(12)).reduce(
        (acc, val) => acc + val.toString(16).padStart(2, "0"),
        "",
      ),
    );

    try {
      const response = await fetch(
        "https://cloud.orama.run/v1/indexes/jsr-j7uqzz/search?api-key=rdpUADH0pFZIEx9xLyLIkPGTP4ypc9Wq",
        {
          method: "POST",
          headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded",
            "pragma": "no-cache",
          },
          body: body.toString(),
          mode: "cors",
          credentials: "omit",
        },
      );

      if (!response.ok) {
        throw new Error(
          `JSR search API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      throw new Error(
        `Failed to search JSR: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  },
});
