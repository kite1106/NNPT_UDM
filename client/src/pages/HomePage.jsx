import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Button from "../components/Button.jsx";

const API_BASE = "http://localhost:5000";

function Card({ title, subtitle, children, actions }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle ? (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {actions}
          </div>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="w-full">
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Hoàn thành: {pct.toFixed(0)}%
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, logout, apiCall } = useAuth();

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [activeLessons, setActiveLessons] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [progressRes, topicsRes] = await Promise.all([
          apiCall(`${API_BASE}/api/user/progress`),
          apiCall(`${API_BASE}/api/user/topics`),
        ]);

        const progressJson = await progressRes
          .json()
          .catch(() => ({ progress: [] }));
        const topicsJson = await topicsRes.json().catch(() => ({ topics: [] }));

        if (cancelled) return;

        const p = Array.isArray(progressJson.progress)
          ? progressJson.progress
          : [];
        const t = Array.isArray(topicsJson.topics) ? topicsJson.topics : [];
        setProgressList(p);
        setTopics(t);

        const mostRecent = p[0];
        if (mostRecent?.topicId) {
          const lessonsRes = await apiCall(
            `${API_BASE}/api/user/topics/${mostRecent.topicId}/lessons`,
          );
          const lessonsJson = await lessonsRes
            .json()
            .catch(() => ({ lessons: [] }));
          if (cancelled) return;
          setActiveLessons(
            Array.isArray(lessonsJson.lessons) ? lessonsJson.lessons : [],
          );
        } else {
          setActiveLessons([]);
        }
      } catch {
        if (!cancelled) {
          setProgressList([]);
          setTopics([]);
          setActiveLessons([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [apiCall]);

  const displayName = user?.name || user?.email || "User";
  const initials = (displayName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const topicById = useMemo(() => {
    const m = new Map();
    for (const t of topics) m.set(String(t._id), t);
    return m;
  }, [topics]);

  const mostRecentProgress = progressList[0] || null;
  const activeTopic = mostRecentProgress?.topicId
    ? topicById.get(String(mostRecentProgress.topicId))
    : null;

  const streakDays = useMemo(() => {
    const values = progressList
      .map((p) => Number(p.streakDays || 0))
      .filter((n) => Number.isFinite(n));
    return values.length ? Math.max(...values) : 0;
  }, [progressList]);

  const totalStudyTime = useMemo(() => {
    return progressList
      .map((p) => Number(p.totalStudyTime || 0))
      .filter((n) => Number.isFinite(n))
      .reduce((a, b) => a + b, 0);
  }, [progressList]);

  const completedLessonsCount = useMemo(() => {
    const set = new Set();
    for (const p of progressList) {
      for (const id of p?.completedLessonIds || []) set.add(String(id));
    }
    return set.size;
  }, [progressList]);

  const activeCompletedCount = useMemo(() => {
    const ids = mostRecentProgress?.completedLessonIds || [];
    return Array.isArray(ids) ? ids.length : 0;
  }, [mostRecentProgress]);

  const activeTotalLessons = activeLessons.length;
  const activeCompletionPct =
    activeTotalLessons > 0
      ? (activeCompletedCount / activeTotalLessons) * 100
      : 0;

  const currentLevel = "Beginner";

  const recentSpeaking = useMemo(() => {
    const list = Array.isArray(activeLessons) ? activeLessons : [];
    return list
      .filter((l) => l?.type === "listening" || l?.type === "speaking")
      .slice(0, 3);
  }, [activeLessons]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="text-xl sm:text-2xl font-bold text-blue-600"
            >
              English Learning
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/home"
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-700 bg-blue-50"
              >
                Trang chủ
              </Link>
              <button
                type="button"
                disabled
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Học từ vựng
              </button>
              <button
                type="button"
                disabled
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Ngữ pháp
              </button>
              <button
                type="button"
                disabled
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Nghe – Nói
              </button>
              <button
                type="button"
                disabled
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Bài kiểm tra
              </button>
              <button
                type="button"
                disabled
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Tiến độ học tập
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {initials || "U"}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">
                  {displayName}
                </div>
                <div className="text-xs text-gray-600">
                  {user?.role || "user"}
                </div>
              </div>
            </div>

            {user?.role === "admin" ? (
              <Link to="/admin">
                <Button variant="secondary" className="px-4 py-2">
                  Admin
                </Button>
              </Link>
            ) : null}

            <Button variant="outline" className="px-4 py-2" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Chào {displayName}, chúc bạn học tốt hôm nay!
              </h2>
              <p className="mt-2 text-gray-600">
                {activeTopic
                  ? `Chủ đề gần nhất: ${activeTopic.title}`
                  : "Bạn chưa có chủ đề học gần nhất."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:max-w-2xl">
              <Stat label="Cấp độ hiện tại" value={currentLevel} />
              <Stat label="Học liên tiếp" value={`${streakDays} ngày`} />
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-col justify-between">
                <div className="mt-2">
                  <Button
                    disabled
                    className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Continue learning
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-900">
              Learning Dashboard
            </h3>
            <div className="text-sm text-gray-600">
              {loading ? "Đang tải dữ liệu..." : "Cập nhật theo tiến độ học"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card
              title="Học từ vựng"
              subtitle={
                activeTopic
                  ? `Chủ đề đang học: ${activeTopic.title}`
                  : "Chưa có dữ liệu chủ đề"
              }
              actions={
                <>
                  <Button
                    disabled
                    className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Học từ mới
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Ôn tập từ vựng
                  </Button>
                </>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Stat label="Số từ đã học" value={"—"} />
                <Stat label="Tổng số từ" value={"—"} />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Ghi chú: hiện chưa có dữ liệu theo dõi “từ đã học” trong model,
                sẽ bổ sung sau.
              </div>
            </Card>

            <Card
              title="Ngữ pháp"
              subtitle={
                activeTopic
                  ? `Theo chủ đề: ${activeTopic.title}`
                  : "Chưa có dữ liệu chủ đề"
              }
              actions={
                <>
                  <Button
                    disabled
                    className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Xem bài học
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Làm bài luyện tập
                  </Button>
                </>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Bài ngữ pháp đang học
                    </div>
                    <div className="text-sm text-gray-600">—</div>
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-200 text-gray-700">
                    Chưa học
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Sẽ hiển thị bài grammar gần nhất khi có tracking riêng.
                </div>
              </div>
            </Card>

            <Card
              title="Luyện nghe – nói"
              subtitle={
                activeTopic
                  ? `Theo chủ đề: ${activeTopic.title}`
                  : "Chưa có dữ liệu chủ đề"
              }
              actions={
                <>
                  <Button
                    disabled
                    className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Nghe lại
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Luyện nói
                  </Button>
                </>
              }
            >
              {recentSpeaking.length ? (
                <div className="space-y-3">
                  {recentSpeaking.map((l) => (
                    <div
                      key={String(l._id)}
                      className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-lg p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {l.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {l.type === "speaking" ? "🎤 Speaking" : "Listening"}{" "}
                          · {l.estimatedTime ?? "—"} phút
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Điểm phát âm: —
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Chưa có bài nghe/nói gần nhất.
                </div>
              )}
            </Card>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card
            title="Bài kiểm tra (Tests & Quizzes)"
            subtitle="Tổng hợp bài kiểm tra gần nhất và phân loại"
            actions={
              <>
                <Button
                  disabled
                  className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Làm bài kiểm tra mới
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Xem kết quả chi tiết
                </Button>
              </>
            }
          >
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Bài kiểm tra gần nhất
                  </div>
                  <div className="text-sm text-gray-600">—</div>
                </div>
                <div className="text-sm text-gray-500">Điểm: —</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Test từ vựng" value={"—"} />
                <Stat label="Test ngữ pháp" value={"—"} />
                <Stat label="Test tổng hợp" value={"—"} />
              </div>
              <div className="text-sm text-gray-600">
                Ghi chú: hiện chưa có API lấy lịch sử làm quiz (QuizAttempt), sẽ
                bổ sung sau.
              </div>
            </div>
          </Card>

          <Card
            title="Theo dõi tiến độ học tập"
            subtitle="Tổng quan hoàn thành & thống kê học tập"
          >
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-gray-900">
                    Tiến độ chủ đề gần nhất
                  </div>
                  <div className="text-sm text-gray-600">
                    {activeTotalLessons
                      ? `${activeCompletedCount}/${activeTotalLessons} bài`
                      : "—"}
                  </div>
                </div>
                <div className="mt-2">
                  <ProgressBar value={activeCompletionPct} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat
                  label="Tổng thời gian học"
                  value={`${totalStudyTime} phút`}
                />
                <Stat
                  label="Số bài đã hoàn thành"
                  value={String(completedLessonsCount)}
                />
                <Stat label="Kỹ năng mạnh / yếu" value={"—"} />
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-8">
          <Card
            title="Gợi ý & Nhắc nhở"
            subtitle="Đề xuất học tập dựa trên tiến độ hiện tại"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900">
                  Gợi ý bài học phù hợp
                </div>
                <div className="mt-1 text-sm text-gray-600">—</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900">
                  Nhắc nhở
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {streakDays === 0
                    ? "Bạn chưa học hôm nay"
                    : "Tiếp tục duy trì thói quen học nhé!"}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <footer className="mt-10 pb-10">
          <div className="bg-white/70 border border-gray-100 rounded-xl p-6 text-sm text-gray-600">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">
                  English Learning
                </div>
                <div className="mt-1">
                  Thông tin hệ thống · Liên hệ / hỗ trợ · Điều khoản sử dụng
                </div>
              </div>
              <div className="text-gray-500">
                {loading ? "Đang tải..." : "Sẵn sàng"}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
