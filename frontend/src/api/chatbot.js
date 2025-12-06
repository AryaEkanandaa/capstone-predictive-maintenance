export async function askChatbot(message) {
  const res = await fetch("http://localhost:5000/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  return await res.json();
}
