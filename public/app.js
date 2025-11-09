const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const messagesList = document.getElementById("messages");

function addMessage({ text, sender }) {
  const li = document.createElement("li");
  li.classList.add(sender === "user" ? "user" : "bot");
  li.innerHTML = text;
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
}

function formatSources(sources = []) {
  if (!sources.length) return "";
  const labels = sources.map((source) => source.title).join(", ");
  return `<br /><small><strong>Sources:</strong> ${labels}</small>`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) {
    return;
  }

  addMessage({ sender: "user", text: message });
  input.value = "";
  input.disabled = true;

  const loadingId = crypto.randomUUID();
  addMessage({ sender: "bot", text: `<em id="${loadingId}">Thinking...</em>` });

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const sources = formatSources(data.sources);
    const botText = `${data.reply}${sources}`;

    const placeholder = document.getElementById(loadingId);
    if (placeholder) {
      placeholder.parentElement.innerHTML = botText;
    } else {
      addMessage({ sender: "bot", text: botText });
    }
  } catch (error) {
    console.error(error);
    const placeholder = document.getElementById(loadingId);
    const fallback =
      "I ran into a connection problem. Please try again or email support@femalefoundry.com.";
    if (placeholder) {
      placeholder.parentElement.innerHTML = fallback;
    } else {
      addMessage({ sender: "bot", text: fallback });
    }
  } finally {
    input.disabled = false;
    input.focus();
  }
});

addMessage({
  sender: "bot",
  text: "Hi! I'm the demo chatbot for Female Foundry. Ask me about the Index, privacy, or how to join the community.",
});

