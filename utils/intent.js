const detectIntent = (message) => {
  const msg = message.toLowerCase();

  const productKeywords = [
    "product", "laptop", "phone", "mobile",
    "ipad", "iphone", "macbook", "dell",
    "hp", "electronics", "tv", "camera"
  ];

  if (productKeywords.some(word => msg.includes(word))) {
    return "PRODUCT";
  }

  if (msg.includes("order")) return "ORDER_STATUS";
  if (msg.includes("cart")) return "CART";
  if (msg.includes("payment")) return "PAYMENT";

  return "GENERAL";
};
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

  } catch (err) {
    console.error("Extractor Error:", err.message);
    return { intent: "GENERAL", search: "", attribute: null };
  }
};
module.exports = { detectIntent,extractSearchData };