import { Link } from "react-router-dom";
import TagBadge from "./TagBadge.jsx";

export default function QuestionCard({ q }) {
  return (
    <div className="border border-slate-300 bg-white p-4 rounded-lg hover:shadow-md transition">
      <Link to={`/questions/${q._id}`}>
        <h2 className="text-lg font-semibold text-slate-900 hover:text-blue-600">
          {q.title}
        </h2>
      </Link>

      <p className="text-sm text-slate-700 mt-1 line-clamp-2">
        {q.body}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {q.tags?.map((tag) => (
          <TagBadge key={tag} name={tag} />
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Asked by {q.user?.name || "Anonymous"}
      </p>
    </div>
  );
}
