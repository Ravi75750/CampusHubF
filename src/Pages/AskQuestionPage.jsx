import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function AskQuestionPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const tags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
    try {
      const res = await api.post("/questions", { title, body, tags });
      navigate(`/questions/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post question");
    }
  }

  return (
    // Applied bg-white and text-slate-900 to the main container
    <div className="max-w-3xl bg-white mx-auto p-4 text-slate-900">
      <h1 className="text-xl font-semibold mb-4">Ask a Question</h1>
      {error && <div className="mb-3 text-sm text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm block mb-1">Title</label>
          <input
            // Input field is explicitly set to bg-white, and dark mode classes removed
            className="w-full border rounded px-3 py-2 text-sm bg-white border-slate-300 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Be specific and concise"
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Body</label>
          <textarea
            rows={6}
            // Input field is explicitly set to bg-white, and dark mode classes removed
            className="w-full border rounded px-3 py-2 text-sm bg-white border-slate-300 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Describe your question in detail..."
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1">
            Tags (comma-separated, e.g. placements, hostel)
          </label>
          <input
            // Input field is explicitly set to bg-white, and dark mode classes removed
            className="w-full border rounded px-3 py-2 text-sm bg-white border-slate-300 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
          Post Question
        </button>
      </form>
    </div>
  );
}