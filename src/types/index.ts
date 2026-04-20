export interface SentenceItem {
  id: string;
  englishFull: string;       // 英文全体
  redWords: string[];        // 赤文字の単語・フレーズ（答え）
  japaneseTranslation: string; // 和訳
}

export interface QuizItem {
  id: string;
  sentenceId: string;
  japaneseTranslation: string;
  englishWithBlanks: string;  // 赤文字を___に置換した英文
  answers: string[];          // 赤文字の答え
  userAnswers: string[];      // ユーザーの入力
  isChecked: boolean;
  isCorrect: boolean | null;
}

export interface AnalyzeResult {
  sentences: SentenceItem[];
}
