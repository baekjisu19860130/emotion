import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  Send,
  MessageSquare,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  Share2,
  Download,
} from 'lucide-react';
import {
  SessionData,
  EmotionWord,
  EmotionCategoryId,
  EmotionResponse,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  QUICK_REFLECTIONS,
} from '../data/defaultEmotions';

interface AfterStepProps {
  session: SessionData;
  studentName: string;
  emotionWords: EmotionWord[];
  beforeResponse?: EmotionResponse;
  existingAfterResponse?: EmotionResponse;
  onSubmit: (response: Omit<EmotionResponse, 'id' | 'timestamp' | 'date'>) => void;
  onBack: () => void;
}

export const AfterStep: React.FC<AfterStepProps> = ({
  session,
  studentName,
  emotionWords,
  beforeResponse,
  existingAfterResponse,
  onSubmit,
  onBack,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<
    'all' | EmotionCategoryId
  >('all');
  const [selectedWord, setSelectedWord] = useState<EmotionWord | null>(() => {
    if (existingAfterResponse) {
      return (
        emotionWords.find((w) => w.word === existingAfterResponse.emotionWord) || {
          id: 'custom-after-prev',
          categoryId:
            existingAfterResponse.categoryCode === 'A'
              ? 'positive'
              : existingAfterResponse.categoryCode === 'B'
              ? 'calm'
              : 'tense',
          word: existingAfterResponse.emotionWord,
          emoji: '🏆',
        }
      );
    }
    return null;
  });
  const [comment, setComment] = useState(existingAfterResponse?.comment || '');
  const [rating, setRating] = useState(existingAfterResponse?.rating || 5);
  const [customWordInput, setCustomWordInput] = useState('');
  const [isAddingCustomWord, setIsAddingCustomWord] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Bonus post-session feelings that can be seamlessly added
  const postSessionBonusWords: EmotionWord[] = [
    { id: 'post-bonus-1', categoryId: 'positive', word: '보람찬', emoji: '🌟' },
    { id: 'post-bonus-2', categoryId: 'positive', word: '이해된', emoji: '💡' },
    { id: 'post-bonus-3', categoryId: 'positive', word: '성장한', emoji: '🌱' },
    { id: 'post-bonus-4', categoryId: 'positive', word: '해소된', emoji: '🔓' },
    { id: 'post-bonus-5', categoryId: 'positive', word: '동기부여된', emoji: '🎯' },
  ];

  // Merge default emotion words with bonus words ensuring no duplicate
  const allAvailableWords = [
    ...postSessionBonusWords.filter(
      (bw) => !emotionWords.some((ew) => ew.word === bw.word)
    ),
    ...emotionWords,
  ];

  const filteredWords =
    selectedCategoryTab === 'all'
      ? allAvailableWords
      : allAvailableWords.filter((w) => w.categoryId === selectedCategoryTab);

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
        emoji: '✨',
      };
      setSelectedWord(newWord);
      setCustomWordInput('');
      setIsAddingCustomWord(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWord) {
      alert('수업 후 지금의 기분 단어를 하나 선택해주세요!');
      return;
    }

    const category = DEFAULT_CATEGORIES.find(
      (c) => c.id === selectedWord.categoryId
    );

    const payload = {
      sessionId: session.id,
      sessionName: session.title,
      studentName,
      type: 'after' as const,
      categoryCode: (category?.code || 'A') as 'A' | 'B' | 'C',
      categoryName: category?.name || '긍정과 에너지',
      emotionWord: selectedWord.word,
      comment: comment.trim() || '알찬 수업 감사드립니다!',
      rating,
    };

    onSubmit(payload);
    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    } catch (_) {}
  };

  if (isSubmitted) {
    const afterCategory = DEFAULT_CATEGORIES.find(
      (c) => c.id === selectedWord?.categoryId
    );
    const beforeCategory = beforeResponse
      ? DEFAULT_CATEGORIES.find((c) => c.code === beforeResponse.categoryCode)
      : null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-[#fcfcf9] rounded-3xl border border-[#e2e2d8] p-6 sm:p-10 shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#eaf0f2] text-[#3d5863] flex items-center justify-center mx-auto mb-4 border border-[#cadbe1]">
            <Award className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#eaf0f2] text-[#3d5863] border border-[#cadbe1]">
            Step 2 수업 후 소감 기록 완료
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#2d2d26]">
            {studentName}님의 마음 여정이 완성되었습니다!
          </h2>
          <p className="mt-2 text-[#6a6a5e] text-sm">
            수업 전과 후의 소중한 감정 변화가 기록되었습니다. 오늘 연수에 함께해주셔서 감사합니다!
          </p>

          {/* Before & After Journey Card */}
          <div className="mt-8 p-6 rounded-2xl bg-[#f8f8f4] border border-[#e2e2d8] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2d8] text-xs text-[#7a7a6e]">
              <span className="font-bold text-[#2d2d26]">{session.title}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>

            {/* Side-by-side comparison */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before snapshot */}
              <div className="p-4 rounded-xl bg-white border border-[#e2e2d8] shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7a5332] mb-1.5 flex items-center justify-between">
                  <span>수업 시작 전 (Before)</span>
                  <span className="text-[#8a8a7a] text-[10px]">사전 체크인</span>
                </div>
                {beforeResponse ? (
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {beforeResponse.categoryCode === 'A'
                          ? '✨'
                          : beforeResponse.categoryCode === 'B'
                          ? '🌿'
                          : '🥱'}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f5eee6] text-[#7a5332] border border-[#e8d5c4]">
                          {beforeResponse.categoryName}
                        </span>
                        <div className="text-base font-extrabold text-[#2d2d26]">
                          &ldquo;{beforeResponse.emotionWord}&rdquo;
                        </div>
                      </div>
                    </div>
                    {beforeResponse.comment && (
                      <p className="mt-2 text-xs text-[#5a5a4e] bg-[#f8f8f4] p-2 rounded-lg line-clamp-2">
                        💬 {beforeResponse.comment}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#8a8a7a] py-3">
                    수업 전 기록이 아직 없습니다.
                  </div>
                )}
              </div>

              {/* After snapshot */}
              <div className="p-4 rounded-xl bg-[#eef4f6] border border-[#cadbe1] shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#3d5863] mb-1.5 flex items-center justify-between">
                  <span>수업 마친 후 (After)</span>
                  <span className="text-[#3d5863] font-bold text-[10px]">최종 완료 ✨</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedWord?.emoji || '🏆'}</span>
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#eaf0f2] text-[#3d5863] border border-[#cadbe1]">
                        {afterCategory?.name}
                      </span>
                      <div className="text-base font-extrabold text-[#2d2d26]">
                        &ldquo;{selectedWord?.word}&rdquo;
                      </div>
                    </div>
                  </div>
                  {comment && (
                    <p className="mt-2 text-xs text-[#4a4a40] bg-white p-2 rounded-lg border border-[#cadbe1] line-clamp-2">
                      💡 {comment}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Satisfaction Star Bar */}
            <div className="mt-4 pt-3 border-t border-[#e2e2d8] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#4a4a40]">
                수업 만족도 평가:
              </span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= rating
                        ? 'text-[#c89240] fill-[#c89240]'
                        : 'text-[#d5d5c8]'
                    }`}
                  />
                ))}
                <span className="font-bold text-[#2d2d26] ml-1">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onBack}
              id="btn-after-back-home"
              className="px-6 py-3 rounded-xl bg-[#4a6572] hover:bg-[#3a525e] text-[#f5f5f0] font-semibold text-sm transition-colors shadow-xs"
            >
              메인 화면으로 이동
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-3 rounded-xl bg-[#eaeae2] hover:bg-[#dcdcd2] text-[#383830] font-semibold text-sm transition-colors"
            >
              소감 다시 수정하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          id="btn-back-from-after"
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-[#5a5a4e] hover:text-[#2d2d26] px-3 py-1.5 rounded-lg bg-[#fcfcf9] border border-[#e2e2d8] hover:bg-[#f0f0e8]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인으로</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-[#7a7a6e] block">{session.title}</span>
          <span className="text-xs sm:text-sm font-bold text-[#3d5863]">
            참여자: {studentName}님
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Banner */}
        <div className="bg-[#4a6572] rounded-2xl p-6 text-[#f5f5f0] shadow-xs">
          <div className="flex items-center space-x-2 text-[#cadbe1] text-xs font-semibold mb-1">
            <Award className="w-4 h-4" />
            <span>STEP 2 / 2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            수업을 마친 후 나의 기분은 어떻게 변했나요?
          </h2>
          <p className="text-[#f5f5f0]/80 text-xs sm:text-sm mt-1">
            오늘 수업을 통해 느낀 점과 변화된 마음 상태를 남겨주세요.
          </p>
        </div>

        {/* Previous Before Feeling Reflection Box (if student filled Before) */}
        {beforeResponse && (
          <div className="bg-[#f5eee6] border border-[#e8d5c4] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#ead9c9] text-[#7a5332] flex items-center justify-center font-bold text-lg shrink-0">
                💭
              </div>
              <div>
                <span className="text-xs font-bold text-[#7a5332] block">
                  수업 전 나의 마음 기억하기
                </span>
                <p className="text-xs sm:text-sm text-[#4a4a40] font-medium mt-0.5">
                  수업 전에는 &ldquo;<strong className="text-[#7a5332]">{beforeResponse.emotionWord}</strong>&rdquo; ({beforeResponse.categoryName}) 상태였어요.
                  {beforeResponse.comment && (
                    <span className="text-xs text-[#7a5332] block mt-0.5 italic">
                      &quot;{beforeResponse.comment}&quot;
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center space-x-1 text-xs font-bold text-[#7a5332] bg-[#f0e2d5] border border-[#e8d5c4] px-3 py-1.5 rounded-lg self-start sm:self-auto">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>변화 확인 중</span>
            </div>
          </div>
        )}

        {/* Section 1: Post-Session Emotion Selection */}
        <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <label className="text-sm sm:text-base font-bold text-[#2d2d26]">
                1. 변화된 감정 선택
              </label>
              <p className="text-xs text-[#7a7a6e] mt-0.5">
                수업 후 지금 느껴지는 기분을 선택해주세요. (보람찬, 이해된 등 추가)
              </p>
            </div>

            {selectedWord && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#eaf0f2] text-[#3d5863] border border-[#cadbe1] text-xs font-bold self-start">
                <span>{selectedWord.emoji || '🏆'}</span>
                <span>선택됨: &ldquo;{selectedWord.word}&rdquo;</span>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
            <button
              type="button"
              id="tab-after-emotion-all"
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                selectedCategoryTab === 'all'
                  ? 'bg-[#4a6572] text-[#f5f5f0] border-[#3a525e]'
                  : 'bg-[#f8f8f4] text-[#5a5a4e] border-[#e2e2d8] hover:bg-[#eaeae0]'
              }`}
            >
              전체 보기 ({allAvailableWords.length})
            </button>
            {DEFAULT_CATEGORIES.map((cat) => {
              const count = allAvailableWords.filter(
                (w) => w.categoryId === cat.id
              ).length;
              const isSelected = selectedCategoryTab === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`tab-after-emotion-${cat.id}`}
                  type="button"
                  onClick={() => setSelectedCategoryTab(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? `${cat.badgeBg} ring-2 ring-[#4a6572]/20`
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
                  id={`btn-after-emotion-${item.word}`}
                  type="button"
                  onClick={() => handleSelectWord(item)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#4a6572] text-[#f5f5f0] border-[#3a525e] shadow-xs scale-[1.02]'
                      : 'bg-white border-[#e2e2d8] text-[#383830] hover:border-[#cadbe1] hover:bg-[#f2f7f9]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base sm:text-lg">
                      {item.emoji || '🏆'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-[#3a525e] text-[#f5f5f0] border-[#2c3f48]'
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
                  placeholder="예: 큰 용기를 얻은, 감동받은"
                  className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-[#cadbe1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a6572] bg-white text-[#2d2d26]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustomWord}
                  className="px-3 py-1.5 bg-[#4a6572] text-[#f5f5f0] rounded-lg text-xs font-semibold hover:bg-[#3a525e]"
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
                <span>+ 나만의 수업 후 감정 단어 직접 입력하기</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Star Satisfaction Rating */}
        <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-sm sm:text-base font-bold text-[#2d2d26]">
                2. 오늘 수업 만족도
              </label>
              <p className="text-xs text-[#7a7a6e] mt-0.5">
                오늘 연수/수업의 유익함과 전반적 만족도를 별점으로 남겨주세요.
              </p>
            </div>
            <div className="flex items-center space-x-1 self-start sm:self-auto">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-[#c89240] fill-[#c89240]'
                        : 'text-[#d5d5c8] hover:text-[#e0b875]'
                    }`}
                  />
                </button>
              ))}
              <span className="font-bold text-sm text-[#2d2d26] ml-2">
                {rating}점 / 5점
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Reflection Comment */}
        <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label
                htmlFor="input-after-comment"
                className="text-sm sm:text-base font-bold text-[#2d2d26]"
              >
                3. 수업 소감 및 나에게 가장 남는 한 마디
              </label>
              <p className="text-xs text-[#7a7a6e] mt-0.5">
                오늘 수업을 통해 느낀 점이나 나에게 가장 남는 한 마디를 적어주세요. (주관식 한 줄)
              </p>
            </div>
            <MessageSquare className="w-4 h-4 text-[#4a6572] hidden sm:block" />
          </div>

          {/* Quick recommendation chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[11px] font-semibold text-[#8a8a7a] self-center">
              추천 소감:
            </span>
            {QUICK_REFLECTIONS.map((txt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setComment(txt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#f0f0e8] hover:bg-[#eaf0f2] hover:text-[#3d5863] text-[#4a4a40] border border-[#e2e2d8] transition-colors"
              >
                {txt}
              </button>
            ))}
          </div>

          <textarea
            id="input-after-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="예: 막막했던 부분이 시원하게 풀렸고, 내일 당장 교실에 적용할 수 있는 꿀팁을 얻었습니다!"
            className="w-full p-3 text-sm bg-[#f8f8f4] border border-[#e2e2d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a6572] focus:bg-white text-[#2d2d26] resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-submit-after"
            type="submit"
            disabled={!selectedWord}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-xs ${
              selectedWord
                ? 'bg-[#4a6572] hover:bg-[#3a525e] text-[#f5f5f0] cursor-pointer hover:scale-[1.01]'
                : 'bg-[#e2e2d8] text-[#8a8a7a] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>[수업 후] 소감 및 변화 기록 완료하기</span>
          </button>
        </div>
      </form>
    </div>
  );
};
