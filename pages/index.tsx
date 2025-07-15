import Head from "next/head";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [input, setInput] = useState("");
  const [level, setLevel] = useState("Explain like I’m 5");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [output, setOutput] = useState("");
  const [modelUsed, setModelUsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSimplify = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput("");
    setModelUsed("");

    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, level, targetLanguage, model }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }

      setOutput(data.output || "Sorry, something went wrong.");
      setModelUsed(data.model || "Unknown");
    } catch (err) {
      console.error("Error:", err);
      const message =
        err instanceof Error && err.message.includes("GPT-4 usage limit")
          ? "⚠️ GPT-4 limit reached. Please try again later or switch to GPT-3.5."
          : "Error calling the API.";
      setOutput(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white py-10 px-4">
      <Head>
        <title>ExplainAnything.ai</title>
        <meta
          name="description"
          content="Understand anything. In your words. At your pace."
        />
      </Head>

      <div className="max-w-2xl mx-auto shadow-md rounded-xl p-8 space-y-6 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">
            🧠 ExplainAnything.ai
          </h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-sm underline text-blue-600 dark:text-blue-300"
          >
            {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
          Paste any complex text, and this tool will help you:
          <br />
          ✓ Understand it at a level you choose (ELI5, Executive Summary, Legal, etc.)
          <br />
          ✓ Translate and simplify into your preferred language
          <br />
          ✓ Learn with clarity — medical, legal, academic, or casual
          <br />
          Powered by OpenAI GPT-3.5 or GPT-4
        </p>

        <div className="text-center">
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            className="text-blue-600 dark:text-blue-300 underline text-sm mt-2"
          >
            {showFAQ ? "Hide FAQ" : "How it works / Examples"}
          </button>
          {showFAQ && (
            <div className="mt-2 text-sm text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-700 space-y-3">
              <div>
                <h3 className="font-semibold">🔍 What does this tool do?</h3>
                <p>
                  This tool simplifies and optionally translates any text you
                  paste. You can choose how you'd like it explained — whether
                  in very simple terms, legal summary, ADHD-friendly
                  formatting, or a study guide. It supports multiple languages
                  and GPT models.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">🧠 What do the explanation styles mean?</h3>
                <ul className="list-disc list-inside ml-4">
                  <li><strong>Explain like I’m 5 (ELI5):</strong> Very basic words and playful examples.</li>
                  <li><strong>Explain like I’m 10 (ELI10):</strong> More detail for middle schoolers.</li>
                  <li><strong>Plain English:</strong> Jargon-free summary for adults/ESL learners.</li>
                  <li><strong>Executive Summary:</strong> 3–5 key bullet points.</li>
                  <li><strong>Legal Summary:</strong> Translate formal/legal text into plain English.</li>
                  <li><strong>Medical Explanation:</strong> Make clinical language easy for patients to understand.</li>
                  <li><strong>ADHD-Friendly:</strong> Chunked, bolded keywords, short text blocks.</li>
                  <li><strong>Study Guide:</strong> Converts to bullet-style study notes or flashcards.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">🌍 What languages can it output?</h3>
                <p>
                  It currently supports 15+ languages. Less common ones may
                  perform better with GPT-4. Translation happens before
                  simplification.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">⚙️ Which GPT model should I use?</h3>
                <p>
                  GPT-3.5 is fast and free. GPT-4 is more accurate, especially
                  for rare languages or nuanced text.
                </p>
              </div>
            </div>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Paste text in any language..."
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-white dark:bg-gray-700 text-black dark:text-white"
        />

        <div>
          <label className="block mb-2 font-medium">Simplification Level:</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option>Explain like I’m 5</option>
            <option>Explain like I’m 10</option>
            <option>Plain English</option>
            <option>Executive summary</option>
            <option>Legal summary</option>
            <option>Medical explanation</option>
            <option>ADHD-friendly</option>
            <option>Study guide (student)</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Output Language:</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            {["English", "Spanish", "Korean", "French", "Chinese", "German", "Hindi", "Arabic", "Portuguese", "Japanese", "Russian", "Turkish", "Italian", "Vietnamese", "Tagalog", "Urdu"].map(lang => (
              <option key={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Model:</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="gpt-3.5-turbo">GPT-3.5</option>
            <option value="gpt-4-0613">GPT-4</option>
          </select>
        </div>

        <button
          onClick={handleSimplify}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold"
        >
          Simplify
        </button>

        {loading ? (
          <div className="flex justify-center items-center space-x-2 text-gray-500">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>Working on it...</span>
          </div>
        ) : output && (
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                {modelUsed === "gpt-4-0613" ? "GPT-4" : "GPT-3.5"}
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                >
                  📌 Copy
                </button>
                <button
                  onClick={handleSimplify}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                >
                  🔁 Regenerate
                </button>
              </div>
            </div>
            <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{output}</p>
          </div>
        )}

        <footer className="pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Built by <a href="https://www.linkedin.com/in/william-c-kim/" target="_blank" className="underline">William Kim</a> · Powered by OpenAI · Hosted on Vercel
        </footer>
      </div>
    </div>
  );
}
