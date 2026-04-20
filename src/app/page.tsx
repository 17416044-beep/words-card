'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import QuizBoard from '@/components/QuizBoard';
import { SentenceItem, QuizItem } from '@/types';

function createQuizzesFromSentences(sentences: SentenceItem[]): QuizItem[] {
  return sentences
    .filter(s => s.redWords && s.redWords.length > 0 && s.englishFull && s.japaneseTranslation)
    .map(s => {
      // 英文の赤文字部分を___に置換
      let englishWithBlanks = s.englishFull;
      for (const word of s.redWords) {
        // 大文字小文字を区別せず置換
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        // 最初のマッチのみ___に置換（繰り返し同じ単語が出ても1つずつ処理）
        englishWithBlanks = englishWithBlanks.replace(regex, '___');
      }
      return {
        id: s.id,
        sentenceId: s.id,
        japaneseTranslation: s.japaneseTranslation,
        englishWithBlanks,
        answers: s.redWords,
        userAnswers: [],
        isChecked: false,
        isCorrect: null,
      };
    });
}

export default function Home() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddUploader, setShowAddUploader] = useState(false);

  const handleUpload = async (files: File[], isAdd = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '解析に失敗しました');
      }

      const data = await response.json() as { sentences: SentenceItem[] };
      const newQuizzes = createQuizzesFromSentences(data.sentences);

      if (newQuizzes.length === 0) {
        setError('赤文字が見つかりませんでした。赤文字を含む画像をアップロードしてください。');
        return;
      }

      if (isAdd) {
        setQuizzes(prev => [...prev, ...newQuizzes]);
        setShowAddUploader(false);
      } else {
        setQuizzes(newQuizzes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const hasQuizzes = quizzes.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">英単語クイズメーカー</h1>
              <p className="text-xs text-gray-500">画像から和英問題を自動作成</p>
            </div>
          </div>
          {hasQuizzes && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {quizzes.length}問
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!hasQuizzes ? (
          /* 初期アップロード画面 */
          <div className="flex flex-col items-center">
            {/* ヒーローセクション */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI搭載 自動問題生成
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                画像をアップロードして<br />
                <span className="text-blue-600">英語問題を作成</span>
              </h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                英文と和訳が書かれた画像をアップロードすると、
                赤文字部分を答えとした<strong className="text-gray-700">和英穴埋め問題</strong>を自動生成します
              </p>
            </div>

            {/* 使い方 */}
            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              {[
                { step: '1', icon: '📸', title: '画像をアップロード', desc: '赤文字入りの英文画像' },
                { step: '2', icon: '🤖', title: 'AIが自動解析', desc: '赤文字・英文・和訳を認識' },
                { step: '3', icon: '✏️', title: '問題を解く', desc: '和英穴埋めで練習' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-xs font-bold text-blue-600 mb-1">STEP {step}</p>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>

            {/* アップローダー */}
            <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <ImageUploader onUpload={(files) => handleUpload(files, false)} isLoading={isLoading} mode="initial" />
            </div>

            {error && (
              <div className="mt-4 w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
        ) : (
          /* クイズ表示画面 */
          <div>
            {/* クイズボード */}
            <QuizBoard quizzes={quizzes} onUpdateQuizzes={setQuizzes} />

            {/* 追加アップロード */}
            <div className="mt-8">
              {!showAddUploader ? (
                <button
                  onClick={() => setShowAddUploader(true)}
                  className="w-full py-4 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  画像を追加して問題を増やす
                </button>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">問題を追加</h3>
                    <button
                      onClick={() => setShowAddUploader(false)}
                      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <ImageUploader
                    onUpload={(files) => handleUpload(files, true)}
                    isLoading={isLoading}
                    mode="add"
                  />
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 最初からやり直す */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setQuizzes([]);
                  setError(null);
                  setShowAddUploader(false);
                }}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
              >
                最初からやり直す（問題をリセット）
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4 mx-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800 text-lg">AIが画像を解析中...</p>
              <p className="text-gray-500 text-sm mt-1">赤文字と英文・和訳を読み取っています</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
