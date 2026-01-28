import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const QUIZ_TYPES = [
  { value: 'practice', label: 'Practice' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'final', label: 'Final Exam' },
];

export function QuizzesManagement({ accessToken }) {
  const [topics, setTopics] = useState([]);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'practice',
    timeLimit: '',
    passingScore: 70,
    questionIds: [],
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/topics`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (topicId) => {
    if (quizzes[topicId]) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/topics/${topicId}/quizzes`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setQuizzes((prev) => ({ ...prev, [topicId]: data.quizzes || [] }));
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    }
  };

  const handleExpandTopic = (topicId) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
      fetchQuizzes(topicId);
    }
  };

  const handleOpenModal = (topic, quiz = null) => {
    setSelectedTopic(topic);
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        type: quiz.type,
        timeLimit: quiz.timeLimit ? quiz.timeLimit.toString() : '',
        passingScore: quiz.passingScore,
        questionIds: quiz.questionIds || [],
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: '',
        description: '',
        type: 'practice',
        timeLimit: '',
        passingScore: 70,
        questionIds: [],
      });
    }
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      const method = editingQuiz ? 'PUT' : 'POST';
      const url = editingQuiz
        ? `${API_BASE}/api/admin/quizzes/${editingQuiz._id}`
        : `${API_BASE}/api/admin/topics/${selectedTopic._id}/quizzes`;

      const body = {
        ...formData,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        passingScore: parseInt(formData.passingScore),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchQuizzes(selectedTopic._id);
        setShowQuizModal(false);
        setFormData({
          title: '',
          description: '',
          type: 'practice',
          timeLimit: '',
          passingScore: 70,
          questionIds: [],
        });
      }
    } catch (err) {
      console.error('Failed to save quiz:', err);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await fetch(`${API_BASE}/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchQuizzes(selectedTopic._id);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quizzes Management</h1>
        <p className="text-slate-600 mt-2">Create and manage quizzes for your topics.</p>
      </div>

      {/* Topics and Quizzes */}
      <div className="space-y-3">
        {topics.map((topic) => (
          <div key={topic._id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Topic Header */}
            <button
              onClick={() => handleExpandTopic(topic._id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition-transform ${
                    expandedTopic === topic._id ? 'rotate-180' : ''
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{topic.title}</h3>
                  <p className="text-sm text-slate-600">{topic.description || 'No description'}</p>
                </div>
              </div>
            </button>

            {/* Quizzes List */}
            {expandedTopic === topic._id && (
              <div className="border-t border-slate-200 bg-slate-50">
                <div className="p-4 border-b border-slate-200">
                  <button
                    onClick={() => handleOpenModal(topic)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Quiz
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : quizzes[topic._id]?.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">No quizzes yet</div>
                ) : (
                  <div className="space-y-2 p-4">
                    {quizzes[topic._id]?.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="bg-white p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{quiz.title}</h4>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="inline-block px-2 py-1 bg-slate-200 rounded text-xs font-medium">
                              {QUIZ_TYPES.find((t) => t.value === quiz.type)?.label || quiz.type}
                            </span>
                            <span className="inline-block px-2 py-1 bg-slate-200 rounded text-xs font-medium">
                              Pass: {quiz.passingScore}%
                            </span>
                            {quiz.timeLimit && (
                              <span className="inline-block px-2 py-1 bg-slate-200 rounded text-xs font-medium">
                                Time: {quiz.timeLimit}m
                              </span>
                            )}
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                quiz.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {quiz.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(topic, quiz)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 my-8">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                {editingQuiz ? 'Edit Quiz' : 'Add Quiz'}
              </h2>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="p-6 space-y-4 max-h-80 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {QUIZ_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Time Limit (min)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingQuiz ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
