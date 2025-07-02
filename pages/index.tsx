// push trigger
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [level, setLevel] = useState("Explain like I’m 5");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [output, setOutput] = useState("");
  const [modelUsed, setModelUsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSimplify = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput("");
    setModelUsed("");
    setCopied(false);

    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, level, targetLanguage, model }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      setOutput(data.output || "Sorry, something went wrong.");
      setModelUsed(data.model || "Unknown");
    } catch (err) {
      console.error("Error:", err);
      setOutput("⚠️ Could not simplify. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 text-black">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-8 space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-blue-700">
          🧠 Explain Like I’m 5
        </h1>
        <p className="text-center text-gray-600 text-sm">
          Simplify complex text into easy language. Translate and explain content like you're 5.
        </p>

        {/* Text input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Paste text in any language..."
          className="w-full p-4 border border-gray-300 rounded-md resize-none bg-white"
        />

        {/* Level */}
        <div>
          <label className="block mb-1 font-medium">Simplification Level:</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option>Explain like I’m 5</option>
            <option>Explain like I’m 10</option>
            <option>Plain English</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block mb-1 font-medium">Output Language:</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {[
              "English", "Spanish", "Korean", "French", "Chinese", "German", "Hindi",
              "Arabic", "Portuguese", "Japanese", "Russian", "Turkish", "Italian",
              "Vietnamese", "Tagalog", "Urdu"
            ].map(lang => (
              <option key={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block mb-1 font-medium">Model:</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="gpt-3.5-turbo">GPT-3.5</option>
            <option value="gpt-4-0613">GPT-4</option>
          </select>
        </div>

        {/* Simplify button */}
        <button
          onClick={handleSimplify}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold disabled:opacity-50"
        >
          {loading ? "Simplifying..." : "Simplify"}
        </button>

        {/* Output section */}
        {output && (
          <div className="bg-gray-50 border border-gray-300 p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                {modelUsed === "gpt-4-0613" ? "GPT-4" : "GPT-3.5"}
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded"
                >
                  {copied ? "✅ Copied" : "📋 Copy"}
                </button>
                <button
                  onClick={handleSimplify}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded"
                >
                  🔁 Regenerate
                </button>
              </div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{output}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center space-x-2 text-gray-500">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Working on it...</span>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-6 text-center text-xs text-gray-500">
          Built by <a href="https://www.linkedin.com/in/william-c-kim/" target="_blank" className="underline">William Kim</a> · Powered by OpenAI · Hosted on Vercel
        </footer>
      </div>
    </main>
  );
}
