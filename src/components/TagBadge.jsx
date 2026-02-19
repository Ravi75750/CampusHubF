import { useNavigate } from "react-router-dom";

export default function TagBadge({ name }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/questions?tag=${name}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1 text-xs border border-slate-300 text-slate-900 bg-slate-200 rounded hover:bg-slate-300"
    >
      #{name}
    </button>
  );
}
