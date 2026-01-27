import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, HelpCircle, TrendingUp } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export function Dashboard({ accessToken }) {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [lessonStats, setLessonStats] = useState(null);
  const [scoreStats, setScoreStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats/dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_BASE}/api/admin/stats/users?period=month`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_BASE}/api/admin/stats/lessons`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_BASE}/api/admin/stats/scores`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const [dashData, userData, lessonData, scoreData] = await Promise.all(
        responses.map((r) => r.json())
      );

      setStats(dashData);
      setUserStats(userData);
      setLessonStats(lessonData);
      setScoreStats(scoreData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to the admin panel. Here's an overview of your system.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.users.total || 0}</p>
              <p className="text-xs text-green-600 mt-1">+{stats?.users.newToday || 0} today</p>
            </div>
            <Users size={40} className="text-blue-500 opacity-20" />
          </div>
        </div>

        {/* Total Lessons */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Lessons</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.content.lessons || 0}</p>
              <p className="text-xs text-slate-500 mt-1">+{stats?.content.quizzes || 0} quizzes</p>
            </div>
            <BookOpen size={40} className="text-green-500 opacity-20" />
          </div>
        </div>

        {/* Total Vocabularies */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Vocabularies</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.content.vocabularies || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Learning materials</p>
            </div>
            <HelpCircle size={40} className="text-purple-500 opacity-20" />
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Average Score</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.scores.averageScore || 0}%</p>
              <p className="text-xs text-slate-500 mt-1">{stats?.scores.totalAttempts || 0} attempts</p>
            </div>
            <TrendingUp size={40} className="text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Growth Chart */}
        {userStats?.data && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Users Growth (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userStats.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score Distribution */}
        {scoreStats?.scoreDistribution && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreStats.scoreDistribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Statistics Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Lessons Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Total Lessons</span>
              <span className="font-bold text-slate-900">{lessonStats?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Completed</span>
              <span className="font-bold text-slate-900">{lessonStats?.totalCompleted || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Completion Rate</span>
              <span className="font-bold text-slate-900">
                {lessonStats?.total > 0
                  ? ((lessonStats.totalCompleted / (lessonStats.total * stats?.users.total || 1)) * 100).toFixed(2)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Score Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Score Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Average Score</span>
              <span className="font-bold text-slate-900">
                {scoreStats?.statistics.averageScore?.toFixed(2) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Highest Score</span>
              <span className="font-bold text-slate-900">
                {scoreStats?.statistics.maxScore?.toFixed(2) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Lowest Score</span>
              <span className="font-bold text-slate-900">
                {scoreStats?.statistics.minScore?.toFixed(2) || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
