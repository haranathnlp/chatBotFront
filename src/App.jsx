import { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ This reads from frontend/.env
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Keep the input focused so the user can keep typing without clicking back in
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

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
          text: `Error: ${error.message}`,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    inputRef.current?.focus();
  }

  return (
    <div className="app">
      <div className="chat-card">

        <header>
          <div className="header-identity">
            <span className="mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="9" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 9V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="4.5" r="1.3" fill="currentColor" />
                <circle cx="9" cy="14" r="1.2" fill="currentColor" />
                <circle cx="15" cy="14" r="1.2" fill="currentColor" />
                <path d="M9.5 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M3 12.5h2M19 12.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>

            <div>
              <h1>Simple GenAI Chatbot</h1>
              <p>Ask a question and get an AI-generated answer.</p>
            </div>
          </div>

          <button
            type="button"
            className="clear-button"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h16M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6m2 0v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19V6h10Z"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Clear
          </button>
        </header>

        <main className="messages" ref={scrollRef}>

          {messages.length === 0 && (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="9" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 9V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="12" cy="4.5" r="1.3" fill="currentColor" />
                  <circle cx="9" cy="14" r="1.2" fill="currentColor" />
                  <circle cx="15" cy="14" r="1.2" fill="currentColor" />
                  <path d="M9.5 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M3 12.5h2M19 12.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <h2>How can I help?</h2>
              <p>Try asking: “What is JavaScript?”</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-row ${message.role}`}
            >
              <span className={`avatar ${message.role}`} aria-hidden="true">
                {message.role === "user" ? (
                  "U"
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="9" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 9V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="12" cy="4.5" r="1.3" fill="currentColor" />
                    <circle cx="9" cy="14" r="1.2" fill="currentColor" />
                    <circle cx="15" cy="14" r="1.2" fill="currentColor" />
                    <path d="M9.5 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M3 12.5h2M19 12.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )}
              </span>

              <div className={`message ${message.role} ${message.isError ? "is-error" : ""}`}>
                <span className="message-label">
                  {message.role === "user" ? "You" : "Assistant"}
                </span>
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <span className="avatar assistant" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="9" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 9V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="12" cy="4.5" r="1.3" fill="currentColor" />
                  <circle cx="9" cy="14" r="1.2" fill="currentColor" />
                  <circle cx="15" cy="14" r="1.2" fill="currentColor" />
                  <path d="M9.5 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M3 12.5h2M19 12.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <div className="message assistant">
                <span className="message-label">Assistant</span>
                <div className="typing" aria-label="Assistant is typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

        </main>

        <form
          onSubmit={sendMessage}
          className="input-area"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Type your question..."
            disabled={loading}
            aria-label="Message"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 12h15.5M13 5.5 20 12l-7 6.5"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

      </div>
    </div>
  );
}

export default App;
