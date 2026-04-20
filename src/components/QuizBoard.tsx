'use client';

import { useState } from 'react';
import { QuizItem } from '@/types';
import QuizCard from './QuizCard';

interface QuizBoardProps {
  quizzes: QuizItem[];
  onUpdateQuizzes: (quizzes: QuizItem[]) => void;
}

export default function QuizBoard({ quizzes, onUpdateQuizzes }: QuizBoardProps) {
  const [filter, setFilter] = useState<'all' | 'unchecked' | 'correct' | 'wrong'>('all');

  const handleCheck = (quizId: string, userAnswers: string[]) => {
    const updated = quizzes.map(q => {
      if (q.id !== quizId) return q;
      const isCorrect = userAnswers.every(
        (ans, i) => ans.trim().toLowerCase() === q.answers[i]?.trim().toLowerCase()
      );
      return { ...q, userAnswers, isChecked: true, isCorrect };
    });
    onUpdateQuizzes(updated);
  };

  const handleReset = (quizId: string) => {
    const updated = quizzes.map(q =>
      q.id === quizId ? { ...q, userAnswers: [], isChecked: false, isCorrect: null } : q
    );
    onUpdateQuizzes(updated);
  };

  const handleResetAll = () => {
    const updated = quizzes.map(q => ({
      ...q, userAnswers: [], isChecked: false, isCorrect: null
    }));
    onUpdateQuizzes(updated);
  };

  const checkedCount = quizzes.filter(q => q.isChecked).length;
  const correctCount = quizzes.filter(q => q.isCorrect).length;
  const wrongCount = quizzes.filter(q => q.isChecked && !q.isCorrect).length;

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'unchecked') return !q.isChecked;
    if (filter === 'correct') return q.isCorrect === true;
    if (filter === 'wrong') return q.isChecked && !q.isCorrect;
    return true;
  });

  return (
    <div>
      {/* 進捗バー */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 text-lg">進捗状況</h2>
          <button
            onClick={handleResetAll}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            全てリセット
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-700">{quizzes.length}</p>
            <p className="text-xs text-gray-500 mt-1">全問題</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-xs text-green-500 mt-1">正解</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-500">{wrongCount}</p>
            <p className="text-xs text-orange-400 mt-1">不正解</p>
          </div>
        </div>

        {checkedCount > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>回答済み: {checkedCount}/{quizzes.length}</span>
              <span>{Math.round((correctCount / quizzes.length) * 100)}% 正解</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(correctCount / quizzes.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: `全て (${quizzes.length})` },
          { key: 'unchecked', label: `未回答 (${quizzes.length - checkedCount})` },
          { key: 'correct', label: `正解 (${correctCount})` },
          { key: 'wrong', label: `不正解 (${wrongCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${filter === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* クイズカード一覧 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuizzes.map((quiz, i) => {
          const originalIndex = quizzes.findIndex(q => q.id === quiz.id);
          return (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              index={originalIndex}
              onCheck={handleCheck}
              onReset={handleReset}
            />
          );
        })}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>該当する問題がありません</p>
        </div>
      )}
    </div>
  );
}
