'use client';

import { useState } from 'react';
import { QuizItem } from '@/types';

interface QuizCardProps {
  quiz: QuizItem;
  index: number;
  onCheck: (quizId: string, answers: string[]) => void;
  onReset: (quizId: string) => void;
}

export default function QuizCard({ quiz, index, onCheck, onReset }: QuizCardProps) {
  const [inputs, setInputs] = useState<string[]>(
    quiz.answers.map(() => '')
  );

  const handleInputChange = (answerIndex: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[answerIndex] = value;
    setInputs(newInputs);
  };

  const handleCheck = () => {
    onCheck(quiz.id, inputs);
  };

  const handleReset = () => {
    setInputs(quiz.answers.map(() => ''));
    onReset(quiz.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, answerIndex: number) => {
    if (e.key === 'Enter') {
      if (answerIndex < inputs.length - 1) {
        const nextInput = document.getElementById(`input-${quiz.id}-${answerIndex + 1}`);
        nextInput?.focus();
      } else {
        handleCheck();
      }
    }
  };

  // 英文の___を入力フィールドに置換
  const renderEnglishWithInputs = () => {
    const parts = quiz.englishWithBlanks.split('___');
    return (
      <span className="text-lg leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < parts.length - 1 && (
              <span className="inline-flex items-center mx-1">
                {quiz.isChecked ? (
                  <span className={`
                    font-bold px-1 border-b-2 min-w-[60px] inline-block text-center
                    ${quiz.userAnswers[i]?.toLowerCase().trim() === quiz.answers[i]?.toLowerCase().trim()
                      ? 'text-green-600 border-green-500'
                      : 'text-red-500 border-red-400'
                    }
                  `}>
                    {quiz.userAnswers[i] || '___'}
                  </span>
                ) : (
                  <input
                    id={`input-${quiz.id}-${i}`}
                    type="text"
                    value={inputs[i] || ''}
                    onChange={(e) => handleInputChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="border-b-2 border-blue-400 focus:border-blue-600 outline-none text-blue-700 font-semibold text-center bg-transparent min-w-[80px] max-w-[160px] px-1"
                    style={{ width: `${Math.max(80, (quiz.answers[i]?.length || 4) * 12)}px` }}
                    placeholder="　　"
                  />
                )}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 overflow-hidden
      ${quiz.isChecked
        ? quiz.isCorrect
          ? 'border-green-300 shadow-green-100'
          : 'border-orange-300 shadow-orange-100'
        : 'border-gray-100 hover:border-blue-200'
      }
    `}>
      {/* ヘッダー */}
      <div className={`
        px-5 py-3 flex items-center justify-between
        ${quiz.isChecked
          ? quiz.isCorrect ? 'bg-green-50' : 'bg-orange-50'
          : 'bg-gray-50'
        }
      `}>
        <span className="text-sm font-medium text-gray-500">問題 {index + 1}</span>
        {quiz.isChecked && (
          <span className={`
            text-sm font-bold px-3 py-1 rounded-full
            ${quiz.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
          `}>
            {quiz.isCorrect ? '✓ 正解！' : '✗ 不正解'}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* 日本語訳（問題） */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-xs text-yellow-700 font-medium mb-1">日本語</p>
          <p className="text-gray-800 text-base leading-relaxed">{quiz.japaneseTranslation}</p>
        </div>

        {/* 英文（穴あき） */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-600 font-medium mb-2">英語（赤文字部分を入力）</p>
          <div className="text-gray-800">
            {renderEnglishWithInputs()}
          </div>
        </div>

        {/* 解答後の正解表示 */}
        {quiz.isChecked && !quiz.isCorrect && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-xs text-green-700 font-medium mb-1">正解</p>
            <p className="text-green-800 font-semibold">{quiz.answers.join(' / ')}</p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-3">
          {!quiz.isChecked ? (
            <button
              onClick={handleCheck}
              disabled={inputs.every(v => !v.trim())}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200"
            >
              答え合わせ
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              やり直す
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
