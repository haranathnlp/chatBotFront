import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ This reads from frontend/.env
  const API_URL = import.meta.env.VITE_API_URL;

  async function sendMessage(event) {
    event.preventDefault();

    const question = input.trim();

    if (!question || loading) {
      return;
    }

    // Add user's message to the chat
    const userMessage = {
      role: "user",
      text: question
    };

    setMessages((current) => [...current, userMessage]);

    setInput("");
    setLoading(true);

    try {
      // ✅ FIXED: Using API_URL instead of localhost
      const response = await fetch(
        `${API_URL}/chat`,  // ← CHANGED THIS LINE
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: question,
            session_id: "default"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Add AI response
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.response
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `Error: ${error.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <div className="app">
      <div className="chat-card">

        <header>
          <div>
            <h1>Simple GenAI Chatbot</h1>

            <p>
              Ask a question and get an AI-generated answer.
            </p>
          </div>

          <button
            className="clear-button"
            onClick={clearChat}
          >
            Clear
          </button>
        </header>

        <main className="messages">

          {messages.length === 0 && (
            <div className="empty-state">
              <h2>How can I help?</h2>

              <p>
                Try asking: "What is JavaScript?"
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role}`}
            >
              <strong>
                {message.role === "user"
                  ? "You"
                  : "AI"}
              </strong>

              <p>{message.text}</p>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <strong>AI</strong>

              <p>Thinking...</p>
            </div>
          )}

        </main>

        <form
          onSubmit={sendMessage}
          className="input-area"
        >
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Type your question..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
}

export default App;