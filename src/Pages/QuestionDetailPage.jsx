import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import TagBadge from "../components/TagBadge.jsx";

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [answerBody, setAnswerBody] = useState("");
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const { user } = useAuth();

  async function fetchQuestion() {
    const res = await api.get(`/questions/${id}`);
    setData(res.data);
  }

  async function fetchComments() {
    const res = await api.get("/comments", {
      params: { postId: id, postType: "Q" }
    });
    setComments(res.data);
  }

  useEffect(() => {
    api.post(`/questions/${id}/view`).catch(() => {});
    fetchQuestion();
    fetchComments();
  }, [id]);

  async function handleAnswerSubmit(e) {
    e.preventDefault();
    if (!answerBody.trim()) return;
    await api.post(`/answers/${id}`, { body: answerBody });
    setAnswerBody("");
    fetchQuestion();
  }

  async function handleVote(postId, postType, voteType) {
    await api.post("/votes", { postId, postType, voteType });
    fetchQuestion();
  }

  async function handleAccept(answerId) {
    await api.post(`/answers/${answerId}/accept`);
    fetchQuestion();
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    await api.post("/comments", {
      postId: id,
      postType: "Q",
      body: commentBody
    });
    setCommentBody("");
    fetchComments();
  }

  if (!data) return <div className="p-4">Loading...</div>;

  const { question, tags, answers } = data;

  const isOwner = user && user.id === question.user_id;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="border rounded-lg p-4 bg-white  dark:border-slate-700">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 text-sm">
            <button
              onClick={() => handleVote(question.id, "Q", "up")}
              className="px-2"
            >
              ⬆️
            </button>
            <div>{question.score}</div>
            <button
              onClick={() => handleVote(question.id, "Q", "down")}
              className="px-2"
            >
              ⬇️
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold mb-1">{question.title}</h1>
            <div className="text-xs text-slate-500 mb-2">
              Asked by {question.author_name} •{" "}
              {new Date(question.created_at).toLocaleString()} • Views:{" "}
              {question.views_count}
            </div>
            <div className="text-sm whitespace-pre-wrap mb-3">{question.body}</div>
            {tags && (
              <div className="flex gap-2 flex-wrap">
                {tags.map(t => (
                  <TagBadge key={t} name={t} />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Question comments */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">Comments</h3>
          <div className="space-y-1 text-xs">
            {comments.map(c => (
              <div key={c.id}>
                {c.body}{" "}
                <span className="text-slate-500">
                  — {c.author_name},{" "}
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {user && (
            <form className="flex gap-2 mt-2" onSubmit={handleCommentSubmit}>
              <input
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 dark:border-slate-600"
                placeholder="Add a comment..."
              />
              <button className="text-xs px-3 py-1 rounded bg-slate-800 text-white">
                Add
              </button>
            </form>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">
          {answers.length} Answers
        </h2>
        <div className="space-y-3">
          {answers.map(a => (
            <div
              key={a.id}
              className={`border rounded-lg p-3 bg-white dark:bg-slate-800 dark:border-slate-700 ${
                a.is_accepted ? "border-green-500" : ""
              }`}
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center text-sm">
                  <button
                    onClick={() => handleVote(a.id, "A", "up")}
                  >
                    ⬆️
                  </button>
                  <div>{a.score}</div>
                  <button
                    onClick={() => handleVote(a.id, "A", "down")}
                  >
                    ⬇️
                  </button>
                </div>
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap">
                    {a.body}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    Answered by {a.author_name} •{" "}
                    {new Date(a.created_at).toLocaleString()}
                    {a.is_accepted && (
                      <span className="text-green-500 font-semibold">
                        Accepted
                      </span>
                    )}
                    {isOwner && !a.is_accepted && (
                      <button
                        onClick={() => handleAccept(a.id)}
                        className="text-xs text-green-600 ml-2"
                      >
                        Mark as accepted
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {answers.length === 0 && <div>No answers yet.</div>}
        </div>
      </div>

      {user && (
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-800 dark:border-slate-700">
          <h3 className="font-semibold mb-2">Your Answer</h3>
          <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-2">
            <textarea
              rows={4}
              value={answerBody}
              onChange={e => setAnswerBody(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-600"
              placeholder="Write your answer here..."
            />
            <button className="self-start px-4 py-2 rounded bg-blue-600 text-white text-sm">
              Post Answer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
