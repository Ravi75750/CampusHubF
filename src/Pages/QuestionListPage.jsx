import { useEffect, useState } from "react";
import { api } from "../api.js";
import QuestionCard from "../components/QuestionCard.jsx";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function QuestionListPage() {
  const [questions, setQuestions] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const tag = searchParams.get("tag") || "";
  const { user } = useAuth();

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await api.get("/questions", {
        params: {
          sort,
          search,
          tag
        }
      });
      setQuestions(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [sort, tag]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (search) p.set("search", search);
      else p.delete("search");
      return p;
    });
    fetchQuestions();
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">All Questions</h1>
        {user && (
          <Link
            to="/ask"
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          >
            Ask Question
          </Link>
        )}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex gap-2 mb-4 items-center"
      >
        <input
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-600"
        />
        <select
          value={sort}
          onChange={e => {
            setSort(e.target.value);
            setSearchParams(prev => {
              const p = new URLSearchParams(prev);
              p.set("sort", e.target.value);
              return p;
            });
          }}
          className="border rounded px-2 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-600"
        >
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
        </select>
        <button className="px-3 py-2 text-sm bg-slate-800 text-white rounded">
          Search
        </button>
      </form>

      {tag && (
        <div className="text-xs mb-3">
          Filtered by tag: <span className="font-semibold">#{tag}</span>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : questions.length === 0 ? (
        <div>No questions found.</div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <QuestionCard key={q.id} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}
