import React, { useState } from 'react';
import {
  Edit3,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Smile,
  Save,
  HelpCircle,
} from 'lucide-react';
import { EmotionWord, EmotionCategoryId } from '../../types';
import { DEFAULT_CATEGORIES } from '../../data/defaultEmotions';

interface AdminEmotionTabProps {
  emotionWords: EmotionWord[];
  onUpdateEmotionWords: (words: EmotionWord[]) => void;
  onResetEmotionWords: () => void;
}

export const AdminEmotionTab: React.FC<AdminEmotionTabProps> = ({
  emotionWords,
  onUpdateEmotionWords,
  onResetEmotionWords,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWordText, setEditingWordText] = useState('');
  const [newWordCategory, setNewWordCategory] = useState<EmotionCategoryId>('positive');
  const [newWordText, setNewWordText] = useState('');
  const [newWordEmoji, setNewWordEmoji] = useState('✨');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleStartEdit = (word: EmotionWord) => {
    setEditingId(word.id);
    setEditingWordText(word.word);
  };

  const handleSaveEdit = (wordId: string) => {
    if (!editingWordText.trim()) return;
    const updated = emotionWords.map((w) =>
      w.id === wordId ? { ...w, word: editingWordText.trim() } : w
    );
    onUpdateEmotionWords(updated);
    setEditingId(null);
  };

  const handleDeleteWord = (wordId: string) => {
    const updated = emotionWords.filter((w) => w.id !== wordId);
    onUpdateEmotionWords(updated);
  };

  const handleAddNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordText.trim()) return;
    const newEntry: EmotionWord = {
      id: `word-${Date.now()}`,
      categoryId: newWordCategory,
      word: newWordText.trim(),
      emoji: newWordEmoji || '✨',
    };
    onUpdateEmotionWords([...emotionWords, newEntry]);
    setNewWordText('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#fcfcf9] p-5 sm:p-6 rounded-2xl border border-[#e2e2d8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-[#2d2d26] text-base flex items-center space-x-2">
            <span>📖 실시간 감정 사전 커스텀 (총 {emotionWords.length}개 단어)</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#7a7a6e] mt-1">
            단어를 클릭하여 원하는 표현으로 즉시 수정하거나 새로운 감정 단어를 추가할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>새 단어 추가</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('모든 감정 단어를 기본 45개 리스트로 초기화하시겠습니까?')) {
                onResetEmotionWords();
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#eaeae2] hover:bg-[#deded4] text-[#4a4a40] rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값(45개) 복원</span>
          </button>
        </div>
      </div>

      {/* Add New Word Form Drawer */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewWord}
          className="bg-[#ebf0ea]/70 border border-[#c8d9c6] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[#2d2d26]">
              새 감정 단어 추가하기
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-[#7a7a6e] hover:text-[#2d2d26]"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#4a4a40] mb-1">
                카테고리 선택
              </label>
              <select
                value={newWordCategory}
                onChange={(e) =>
                  setNewWordCategory(e.target.value as EmotionCategoryId)
                }
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}. {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4a4a40] mb-1">
                감정 단어 (예: 벅찬, 뭉클한)
              </label>
              <input
                type="text"
                value={newWordText}
                onChange={(e) => setNewWordText(e.target.value)}
                placeholder="단어 입력..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4a4a40] mb-1">
                이모지 (선택)
              </label>
              <input
                type="text"
                value={newWordEmoji}
                onChange={(e) => setNewWordEmoji(e.target.value)}
                placeholder="예: 💖, 🚀, 🌿"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2 bg-[#5a5a40] text-[#f5f5f0] rounded-xl text-xs font-bold hover:bg-[#484833]"
            >
              추가 완료
            </button>
          </div>
        </form>
      )}

      {/* 3 Categories Word Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DEFAULT_CATEGORIES.map((cat) => {
          const words = emotionWords.filter((w) => w.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#eaeae0] mb-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${cat.badgeBg}`}
                    >
                      {cat.code}
                    </span>
                    <h4 className="font-extrabold text-[#2d2d26] text-sm">
                      {cat.name}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-[#8a8a7a]">
                    {words.length}개 단어
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {words.map((item) => {
                    const isEditing = editingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isEditing
                            ? 'bg-[#ebf0ea]/80 border-[#a6c4a3] ring-2 ring-[#5a5a40]/20'
                            : 'bg-[#f8f8f4] border-[#e2e2d8] hover:bg-white hover:border-[#cfcfc4]'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="text"
                              value={editingWordText}
                              onChange={(e) => setEditingWordText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(item.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="flex-1 px-2.5 py-1 text-xs sm:text-sm bg-white border border-[#5a5a40] rounded-lg focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 bg-[#5a5a40] text-[#f5f5f0] rounded-lg text-xs"
                              title="저장"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              onClick={() => handleStartEdit(item)}
                              className="flex items-center space-x-2 cursor-pointer flex-1"
                              title="클릭하여 단어 직접 수정"
                            >
                              <span className="text-base">{item.emoji || '✨'}</span>
                              <span className="text-xs sm:text-sm font-bold text-[#2d2d26]">
                                {item.word}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item)}
                                className="p-1 text-[#8a8a7a] hover:text-[#2d2d26] hover:bg-[#eaeae0] rounded"
                                title="수정"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWord(item.id)}
                                className="p-1 text-[#8a8a7a] hover:text-[#a83232] hover:bg-[#faeceb] rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
