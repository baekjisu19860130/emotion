import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Send,
  MessageSquare,
  HelpCircle,
  Plus,
  Smile,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  SessionData,
  EmotionWord,
  EmotionCategoryId,
  EmotionResponse,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  QUICK_EXPECTATIONS,
} from '../data/defaultEmotions';

interface BeforeStepProps {
  session: SessionData;
  studentName: string;
  emotionWords: EmotionWord[];
  existingResponse?: EmotionResponse;
  onSubmit: (response: Omit<EmotionResponse, 'id' | 'timestamp' | 'date'>) => void;
  onBack: () => void;
}

export const BeforeStep: React.FC<BeforeStepProps> = ({
  session,
  studentName,
  emotionWords,
  existingResponse,
  onSubmit,
  onBack,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<
    'all' | EmotionCategoryId
  >('all');
  const [selectedWord, setSelectedWord] = useState<EmotionWord | null>(() => {
    if (existingResponse) {
      return (
        emotionWords.find((w) => w.word === existingResponse.emotionWord) || {
          id: 'custom-prev',
          categoryId:
            existingResponse.categoryCode === 'A'
              ? 'positive'
              : existingResponse.categoryCode === 'B'
              ? 'calm'
              : 'tense',
          word: existingResponse.emotionWord,
          emoji: '✨',
        }
      );
    }
    return null;
  });
  const [comment, setComment] = useState(existingResponse?.comment || '');
  const [customWordInput, setCustomWordInput] = useState('');
  const [isAddingCustomWord, setIsAddingCustomWord] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter words by category
  const filteredWords =
    selectedCategoryTab === 'all'
      ? emotionWords
      : emotionWords.filter((w) => w.categoryId === selectedCategoryTab);

  const handleSelectWord = (word: EmotionWord) => {
    setSelectedWord(word);
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWordInput.trim()) {
      const newWord: EmotionWord = {
        id: `custom-${Date.now()}`,
        categoryId:
          selectedCategoryTab === 'all' ? 'positive' : selectedCategoryTab,
        word: customWordInput.trim(),
        emoji: '💭',
      };
      setSelectedWord(newWord);
      setCustomWordInput('');
      setIsAddingCustomWord(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWord) {
      alert('지금 느끼는 감정 단어를 하나 선택해주세요!');
      return;
    }

    const category = DEFAULT_CATEGORIES.find(
      (c) => c.id === selectedWord.categoryId
    );

    const payload = {
      sessionId: session.id,
      sessionName: session.title,
      studentName,
      type: 'before' as const,
      categoryCode: (category?.code || 'A') as 'A' | 'B' | 'C',
      categoryName: category?.name || '긍정과 에너지',
      emotionWord: selectedWord.word,
      comment: comment.trim() || '오늘 연수 잘 부탁드립니다!',
    };

    onSubmit(payload);
    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch (_) {}
  };

  if (isSubmitted) {
    const category = DEFAULT_CATEGORIES.find(
      (c) => c.id === selectedWord?.categoryId
    );
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#fcfcf9] rounded-3xl border border-[#e2e2d8] p-8 sm:p-10 shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#ebf0ea] text-[#3d5a3c] flex items-center justify-center mx-auto mb-4 border border-[#c8d9c6]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6]">
            Step 1 수업 전 체크인 완료
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#2d2d26]">
            {studentName}님의 마음이 기록되었습니다!
          </h2>
          <p className="mt-2 text-[#6a6a5e] text-sm">
            수업이 종료된 후, <strong className="text-[#2d2d26]">[Step 2 수업 후 소감 남기기]</strong>를 통해 변화된 마음을 기록해주세요.
          </p>

          {/* Ticket Preview Card */}
          <div className="mt-6 p-6 rounded-2xl bg-[#f8f8f4] border border-[#e2e2d8] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2d8] text-xs text-[#7a7a6e]">
              <span>수업명: {session.title}</span>
              <span className="font-semibold text-[#4a4a40]">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-3xl">{selectedWord?.emoji || '✨'}</span>
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6]">
                  {category?.name} ({category?.code})
                </span>
                <div className="text-xl font-bold text-[#2d2d26] mt-0.5">
                  &ldquo;{selectedWord?.word}&rdquo;
                </div>
              </div>
            </div>
            {comment && (
              <div className="mt-4 p-3 bg-white rounded-xl border border-[#e2e2d8] text-xs sm:text-sm text-[#4a4a40]">
                <span className="font-semibold text-[#2d2d26] block mb-1">
                  💡 나의 기대 멘트:
                </span>
                {comment}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onBack}
              id="btn-back-to-home"
              className="px-6 py-3 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] font-semibold text-sm transition-colors shadow-xs"
            >
              메인 화면으로 돌아가기
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-3 rounded-xl bg-[#eaeae2] hover:bg-[#dcdcd2] text-[#383830] font-semibold text-sm transition-colors"
            >
              수정하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          id="btn-back-from-before"
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-[#5a5a4e] hover:text-[#2d2d26] px-3 py-1.5 rounded-lg bg-[#fcfcf9] border border-[#e2e2d8] hover:bg-[#f0f0e8]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인으로</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-[#7a7a6e] block">{session.title}</span>
          <span className="text-xs sm:text-sm font-bold text-[#3d5a3c]">
            참여자: {studentName}님
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Banner */}
        <div className="bg-[#5a5a40] rounded-2xl p-6 text-[#f5f5f0] shadow-xs">
          <div className="flex items-center space-x-2 text-[#d4c5a9] text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>STEP 1 / 2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            수업 시작 전 나의 기분은 어떤가요?
          </h2>
          <p className="text-[#f5f5f0]/80 text-xs sm:text-sm mt-1">
            오늘 연수를 시작하는 솔직한 마음 상태를 아래 감정 단어 중에서 골라주세요.
          </p>
        </div>

        {/* Section 1: Emotion Selection */}
        <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <label className="text-sm sm:text-base font-bold text-[#2d2d26]">
                1. 현재 기분 선택 (45개 감정 단어)
              </label>
              <p className="text-xs text-[#7a7a6e] mt-0.5">
                카테고리를 클릭하여 필터링하거나 나만의 감정 단어를 직접 입력할 수 있습니다.
              </p>
            </div>

            {selectedWord && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6] text-xs font-bold self-start">
                <span>{selectedWord.emoji || '✨'}</span>
                <span>선택됨: &ldquo;{selectedWord.word}&rdquo;</span>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
            <button
              type="button"
              id="tab-emotion-all"
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                selectedCategoryTab === 'all'
                  ? 'bg-[#5a5a40] text-[#f5f5f0] border-[#484833]'
                  : 'bg-[#f8f8f4] text-[#5a5a4e] border-[#e2e2d8] hover:bg-[#eaeae0]'
              }`}
            >
              전체 보기 ({emotionWords.length})
            </button>
            {DEFAULT_CATEGORIES.map((cat) => {
              const count = emotionWords.filter(
                (w) => w.categoryId === cat.id
              ).length;
              const isSelected = selectedCategoryTab === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`tab-emotion-${cat.id}`}
                  type="button"
                  onClick={() => setSelectedCategoryTab(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? `${cat.badgeBg} ring-2 ring-[#5a5a40]/20`
                      : 'bg-[#f8f8f4] text-[#5a5a4e] border-[#e2e2d8] hover:bg-[#eaeae0]'
                  }`}
                >
                  <span>
                    {cat.code}. {cat.name} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Emotion Words Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredWords.map((item) => {
              const isSelected = selectedWord?.word === item.word;
              const category = DEFAULT_CATEGORIES.find(
                (c) => c.id === item.categoryId
              );

              return (
                <button
                  key={item.id}
                  id={`btn-emotion-word-${item.word}`}
                  type="button"
                  onClick={() => handleSelectWord(item)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#5a5a40] text-[#f5f5f0] border-[#484833] shadow-xs scale-[1.02]'
                      : 'bg-white border-[#e2e2d8] text-[#383830] hover:border-[#d5d5c8] hover:bg-[#f5f5ee]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base sm:text-lg">
                      {item.emoji || '✨'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-[#484833] text-[#f5f5f0] border-[#383824]'
                          : category?.badgeBg || 'bg-[#eaeae2] text-[#4a4a40] border-[#e2e2d8]'
                      }`}
                    >
                      {category?.code}
                    </span>
                  </div>
                  <span className="mt-1 font-bold text-xs sm:text-sm">
                    {item.word}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add custom emotion word */}
          <div className="mt-4 pt-3 border-t border-[#e8e8e0] flex items-center justify-between">
            {isAddingCustomWord ? (
              <div className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={customWordInput}
                  onChange={(e) => setCustomWordInput(e.target.value)}
                  placeholder="예: 두근거리는, 살짝 긴장한"
                  className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-[#c8d9c6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5a5a40] bg-white text-[#2d2d26]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustomWord}
                  className="px-3 py-1.5 bg-[#5a5a40] text-[#f5f5f0] rounded-lg text-xs font-semibold hover:bg-[#484833]"
                >
                  단어 추가
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomWord(false)}
                  className="px-2 py-1.5 text-[#7a7a6e] hover:text-[#2d2d26] text-xs"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingCustomWord(true)}
                className="inline-flex items-center space-x-1 text-xs text-[#6a6a5e] hover:text-[#2d2d26]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>목록에 없는 나만의 감정 단어 직접 입력하기</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Expectation Comment */}
        <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label
                htmlFor="input-before-comment"
                className="text-sm sm:text-base font-bold text-[#2d2d26]"
              >
                2. 기대 멘트 및 궁금한 점
              </label>
              <p className="text-xs text-[#7a7a6e] mt-0.5">
                오늘 연수에서 기대하는 점이나 궁금한 점을 적어주세요. (주관식 한 줄)
              </p>
            </div>
            <MessageSquare className="w-4 h-4 text-[#5a5a40] hidden sm:block" />
          </div>

          {/* Quick recommendation chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[11px] font-semibold text-[#8a8a7a] self-center">
              추천 멘트:
            </span>
            {QUICK_EXPECTATIONS.map((txt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setComment(txt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#f0f0e8] hover:bg-[#ebf0ea] hover:text-[#3d5a3c] text-[#4a4a40] border border-[#e2e2d8] transition-colors"
              >
                {txt}
              </button>
            ))}
          </div>

          <textarea
            id="input-before-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="예: 실제 수업과 업무에서 바로 써먹을 수 있는 팁을 얻어가고 싶습니다!"
            className="w-full p-3 text-sm bg-[#f8f8f4] border border-[#e2e2d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] focus:bg-white text-[#2d2d26] resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-submit-before"
            type="submit"
            disabled={!selectedWord}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-xs ${
              selectedWord
                ? 'bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] cursor-pointer hover:scale-[1.01]'
                : 'bg-[#e2e2d8] text-[#8a8a7a] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>[수업 전] 마음 기록 완료하기</span>
          </button>
        </div>
      </form>
    </div>
  );
};
