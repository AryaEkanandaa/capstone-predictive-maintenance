import { processChatMessage } from "../services/chatAiService.js"

/**
 * Helper AI → dipanggil oleh sendMessage()
 * BUKAN route Express lagi ❗
 */
export const chatToN8N = async (message, userId) => {
  try {
    const reply = await processChatMessage(message, userId);

    // Normalisasi output
    if (typeof reply === "object") {
      return (
        reply.jawaban ||
        reply.answer ||
        reply.text ||
        JSON.stringify(reply, null, 2)
      );
    }

    return String(reply);

  } catch (err) {
    console.error("Chatbot AI Error:", err.message);
    return "AI tidak merespons atau API Limit.";
  }
};
