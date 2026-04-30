
/* =========================================================
   🔥 STEP 1: AI INTENT + ENTITY EXTRACTION (SMART)
========================================================= */
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
You are an intelligent intent detection system for an e-commerce platform.

Return ONLY JSON:
{
  "intent": "PRODUCT | CART | ORDER | PAYMENT | SUPPORT | GENERAL",
  "search": "main keyword or null",
  "attribute": "price | rating | details | null",
  "issueType": "login | payment | cart | bug | ui | performance | null"
}

Rules:
- If user asks about products → PRODUCT
- If about cart → CART
- If about orders → ORDER
- If about payments → PAYMENT
- If user has problem/issue → SUPPORT
- Otherwise → GENERAL

Examples:

"show dell laptop rating" →
{"intent":"PRODUCT","search":"dell laptop","attribute":"rating","issueType":null}

"my payment failed" →
{"intent":"SUPPORT","search":null,"attribute":null,"issueType":"payment"}

"app is slow" →
{"intent":"SUPPORT","search":null,"attribute":null,"issueType":"performance"}

"what is in my cart" →
{"intent":"CART","search":null,"attribute":null,"issueType":null}
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
    return {
      intent: "GENERAL",
      search: null,
      attribute: null,
      issueType: null
    };
  }
};


/* =========================================================
   🔥 STEP 2: MAIN AI RESPONSE ENGINE (SMART ASSISTANT)
========================================================= */
const callAI = async (message, contextData = "", attribute = null, issueType = null) => {
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
You are a smart AI assistant for VK Store (built by Vikram in 2025), similar to Amazon, Flipkart, Meesho.

Your responsibilities:
- Help users with products, cart, orders, payments
- Solve user issues (login, payment failure, bugs, slow app)
- Provide helpful guidance like real support agent

STRICT RULES:
- Use context data if available
- If context exists → NEVER say "no information"
- If no context → still help intelligently
- No newline characters
- Output must be a single clean sentence
- If multiple items → number them (1,2,3)

ATTRIBUTE RULES:
- rating → only rating
- price → only price
- details → full info

SUPPORT RULES:
- login issue → suggest re-login, clear storage
- payment issue → suggest retry, check balance
- cart issue → suggest refresh, re-add items
- bug → suggest refresh or contact support
- performance → suggest network check

Context:
${contextData}

Attribute: ${attribute}
IssueType: ${issueType}
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
      return "Sorry, something went wrong. Please try again.";
    }

    let reply = data.choices[0].message.content;

    // 🔥 Clean formatting
    reply = reply.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    return reply;

  } catch (error) {
    console.error("AI Error:", error.message);
    return "AI service failed. Please try again later.";
  }
};

module.exports = { extractSearchData, callAI };