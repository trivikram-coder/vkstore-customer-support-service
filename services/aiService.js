
// 🔥 STEP 1: Extract intent + search + attribute using AI
const extractSearchData = async (message) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Extract structured data from user query.

Return ONLY JSON:
{
  "intent": "PRODUCT | ORDER | CART | PAYMENT | GENERAL",
  "search": "main product keyword",
  "attribute": "price | rating | details | null"
}

Examples:
"show dell laptop rating" →
{"intent":"PRODUCT","search":"dell laptop","attribute":"rating"}

"show ipad details" →
{"intent":"PRODUCT","search":"ipad","attribute":"details"}

"what is price of iphone" →
{"intent":"PRODUCT","search":"iphone","attribute":"price"}
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return JSON.parse(content);

  } catch (error) {
    console.error("Extractor Error:", error.message);
    return { intent: "GENERAL", search: "", attribute: null };
  }
};


// 🔥 STEP 2: Generate final AI response
const callAI = async (message, contextData = "", attribute = null) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are an e-commerce assistant.
The app name is Vk store scalable reliable application like amazon flipkart and meesho,you can add your own words founder Vikram and built in 2025
STRICT RULES:
- Use ONLY the provided context data.
- NEVER say "no information" if context exists.
- Do NOT use newline characters.
- Output must be a single clean sentence.
- If the data contains multiple values then order by numbers (1,2,3,..).
Ex:Iphone,Samsung are there in cart then you must order like 1. Iphone and its details , 2. Samsung and its details
SPECIAL RULE:
- If attribute = rating → return ONLY rating.
- If attribute = price → return ONLY price.
- If attribute = details → return full details.

Attribute: ${attribute}

Context Data:
${contextData}
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!data?.choices) {
      return "Sorry, I couldn't process your request.";
    }

    let reply = data.choices[0].message.content;

    // 🔥 Clean output (remove \n)
    reply = reply.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    return reply;

  } catch (error) {
    console.error("AI Error:", error.message);
    return "AI service failed. Try again later.";
  }
};

module.exports = { extractSearchData, callAI };