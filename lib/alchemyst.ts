import AlchemystAI from "@alchemystai/sdk";

const alchemystClient = new AlchemystAI({
  apiKey: process.env.ALCHEMYST_AI_API_KEY,
});

export async function searchContext(query: string) {
  try {
    const { contexts } = await alchemystClient.v1.context.search({
      query,
      similarity_threshold: 0.8,
      minimum_similarity_threshold: 0.5,
      scope: "internal",
      metadata: null,
    });

    if (contexts && contexts.length > 0) {
      return contexts.map((c: any) => c.content || JSON.stringify(c)).join('\n\n');
    }
    return "";
  } catch (error) {
    console.error("Alchemyst search failed:", error);
    return "";
  }
}