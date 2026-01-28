import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const LESSON_TYPES = [
  { value: 'vocab', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'listening', label: 'Listening' },
  { value: 'speaking', label: 'Speaking' },
];

export function LessonsManagement({ accessToken }) {
  const [topics, setTopics] = useState([]);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'vocab',
    content: '',
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

  const fetchLessons = async (topicId) => {
    if (lessons[topicId]) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/topics/${topicId}/lessons`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setLessons((prev) => ({ ...prev, [topicId]: data.lessons || [] }));
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    }
  };

  const handleExpandTopic = (topicId) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
      fetchLessons(topicId);
    }
  };

  const handleOpenModal = (topic, lesson = null) => {
    setSelectedTopic(topic);
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        type: lesson.type,
        content: lesson.content || '',
      });
    } else {
      setEditingLesson(null);
      setFormData({ title: '', type: 'vocab', content: '' });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      const method = editingLesson ? 'PUT' : 'POST';
      const url = editingLesson
        ? `${API_BASE}/api/admin/lessons/${editingLesson._id}`
        : `${API_BASE}/api/admin/topics/${selectedTopic._id}/lessons`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchLessons(selectedTopic._id);
        setShowLessonModal(false);
        setFormData({ title: '', type: 'vocab', content: '' });
      }
    } catch (err) {
      console.error('Failed to save lesson:', err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await fetch(`${API_BASE}/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchLessons(selectedTopic._id);
    } catch (err) {
      console.error('Failed to delete lesson:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Lessons Management</h1>
        <p className="text-slate-600 mt-2">Manage lessons across all topics.</p>
      </div>

      {/* Topics and Lessons */}
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

            {/* Lessons List */}
            {expandedTopic === topic._id && (
              <div className="border-t border-slate-200 bg-slate-50">
                <div className="p-4 border-b border-slate-200">
                  <button
                    onClick={() => handleOpenModal(topic)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Lesson
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : lessons[topic._id]?.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">No lessons yet</div>
                ) : (
                  <div className="space-y-2 p-4">
                    {lessons[topic._id]?.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="bg-white p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{lesson.title}</h4>
                          <p className="text-sm text-slate-600">
                            Type:{' '}
                            <span className="inline-block px-2 py-1 bg-slate-200 rounded text-xs font-medium mt-1">
                              {LESSON_TYPES.find((t) => t.value === lesson.type)?.label || lesson.type}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(topic, lesson)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id)}
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

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
              </h2>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Lesson Title
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
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LESSON_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingLesson ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
