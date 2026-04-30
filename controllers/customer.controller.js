const axios = require("axios");
const { extractSearchData, callAI } = require("../services/aiService");

const chatWithCustomer = async (req, res) => {
  try {
    const { message } = req.body;

    // 🔥 STEP 1: AI extraction
    const { intent, search, attribute } = await extractSearchData(message);

    let contextData = "";

    // =========================================================
    // 🛒 PRODUCT SERVICE
    // =========================================================
    if (intent === "PRODUCT" && search) {
      try {
        const response = await axios.get(process.env.PRODUCT_SERVICE_URL, {
          params: { search }
        });

        const products = response.data?.products || [];

        if (products.length > 0) {
          const topProducts = products.slice(0, 5);

          contextData = topProducts.map(p =>
            `Name: ${p.title}, Price: Rs ${p.price}, Category: ${p.category}, Rating: ${p.rating}`
          ).join(" ");
        }

        console.log("PRODUCT SEARCH:", search);
      } catch (err) {
        console.error("Product Service Error:", err.message);
      }
    }

    // =========================================================
    // ❤️ CART SERVICE
    // =========================================================
    if (intent === "CART") {
      try {
        const response = await axios.get(
          `${process.env.CART_SERVICE_URL}`,
          {
            headers: { Authorization: req.headers.authorization }
          }
        );
        console.log(response.data)
        const cart = response.data || {};

        contextData = `Cart has ${cart.items?.length || 0} items. ` +
          (cart.items?.map(i =>
            `${i.title} Rs ${i.price} Qty ${i.quantity}`
          ).join(" ") || "");

      } catch (err) {
        console.error("Cart Service Error:", err.message);
      }
    }

    // =========================================================
    // 📦 ORDER SERVICE
    // =========================================================
    if (intent === "ORDER") {
      try {
        const response = await axios.get(
          `${process.env.ORDER_SERVICE_URL}`,
          {
            headers: { Authorization: req.headers.authorization }
          }
        );

        const orders = response.data?.orders || [];

        if (orders.length > 0) {
          const latest = orders[0];

          contextData = `Latest Order ID ${latest._id}, Status ${latest.status}, Total Rs ${latest.totalAmount}`;
        } else {
          contextData = "No orders found";
        }

      } catch (err) {
        console.error("Order Service Error:", err.message);
      }
    }

    // =========================================================
    // 💳 PAYMENT SERVICE
    // =========================================================
    if (intent === "PAYMENT") {
      try {
        const response = await axios.get(
          `${process.env.PAYMENT_SERVICE_URL}/api/payments`,
          {
            headers: { Authorization: req.headers.authorization }
          }
        );

        const payments = response.data || [];

        if (payments.length > 0) {
          const latest = payments[0];

          contextData = `Last payment Rs ${latest.amount}, Status ${latest.status}`;
        } else {
          contextData = "No payments found";
        }

      } catch (err) {
        console.error("Payment Service Error:", err.message);
      }
    }

    // =========================================================
    // 🤖 FINAL AI RESPONSE
    // =========================================================
    const reply = await callAI(message, contextData, attribute);

    res.json({
      success: true,
      intent,
      reply
    });

  } catch (error) {
    console.error("Chat Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Chat service failed"
    });
  }
};

module.exports = { chatWithCustomer };