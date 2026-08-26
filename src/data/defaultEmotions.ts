import { EmotionCategory, EmotionWord } from '../types';

export const DEFAULT_CATEGORIES: EmotionCategory[] = [
  {
    id: 'positive',
    code: 'A',
    name: '긍정과 에너지',
    subTitle: '기대감, 활력, 자신감, 즐거움',
    color: 'emerald',
    badgeBg: 'bg-[#ebf0ea] text-[#3d5a3c] border-[#c8d9c6]',
    badgeText: 'text-[#3d5a3c]',
    borderColor: 'border-[#c8d9c6]',
    gradient: 'from-[#4d634b] to-[#3d523c]',
    iconName: 'Sparkles',
  },
  {
    id: 'calm',
    code: 'B',
    name: '차분과 평온',
    subTitle: '안정감, 여유, 진지함, 담담함',
    color: 'sky',
    badgeBg: 'bg-[#eaf0f2] text-[#3d5863] border-[#cadbe1]',
    badgeText: 'text-[#3d5863]',
    borderColor: 'border-[#cadbe1]',
    gradient: 'from-[#4a6572] to-[#3a525e]',
    iconName: 'Waves',
  },
  {
    id: 'tense',
    code: 'C',
    name: '피로와 긴장',
    subTitle: '피로감, 걱정, 부담감, 막막함',
    color: 'amber',
    badgeBg: 'bg-[#f5eee6] text-[#7a5332] border-[#e8d5c4]',
    badgeText: 'text-[#7a5332]',
    borderColor: 'border-[#e8d5c4]',
    gradient: 'from-[#7a5332] to-[#634226]',
    iconName: 'Coffee',
  },
];

export const INITIAL_EMOTION_WORDS: EmotionWord[] = [
  // A. 긍정과 에너지 (15개)
  { id: 'pos-1', categoryId: 'positive', word: '설레는', emoji: '✨' },
  { id: 'pos-2', categoryId: 'positive', word: '기대되는', emoji: '🌟' },
  { id: 'pos-3', categoryId: 'positive', word: '의욕적인', emoji: '🔥' },
  { id: 'pos-4', categoryId: 'positive', word: '즐거운', emoji: '😊' },
  { id: 'pos-5', categoryId: 'positive', word: '활기찬', emoji: '⚡' },
  { id: 'pos-6', categoryId: 'positive', word: '궁금한', emoji: '🧐' },
  { id: 'pos-7', categoryId: 'positive', word: '자신감 있는', emoji: '💪' },
  { id: 'pos-8', categoryId: 'positive', word: '상쾌한', emoji: '🍃' },
  { id: 'pos-9', categoryId: 'positive', word: '행복한', emoji: '🥰' },
  { id: 'pos-10', categoryId: 'positive', word: '뿌듯한', emoji: '🏆' },
  { id: 'pos-11', categoryId: 'positive', word: '반가운', emoji: '🤝' },
  { id: 'pos-12', categoryId: 'positive', word: '열정적인', emoji: '🚀' },
  { id: 'pos-13', categoryId: 'positive', word: '감사한', emoji: '🙏' },
  { id: 'pos-14', categoryId: 'positive', word: '편안한', emoji: '🛋️' },
  { id: 'pos-15', categoryId: 'positive', word: '집중되는', emoji: '🎯' },

  // B. 차분과 평온 (15개)
  { id: 'calm-1', categoryId: 'calm', word: '평온한', emoji: '🌿' },
  { id: 'calm-2', categoryId: 'calm', word: '담담한', emoji: '🧘' },
  { id: 'calm-3', categoryId: 'calm', word: '진지한', emoji: '📖' },
  { id: 'calm-4', categoryId: 'calm', word: '여유로운', emoji: '☕' },
  { id: 'calm-5', categoryId: 'calm', word: '무난한', emoji: '👌' },
  { id: 'calm-6', categoryId: 'calm', word: '조용한', emoji: '🤫' },
  { id: 'calm-7', categoryId: 'calm', word: '생각에 잠긴', emoji: '💭' },
  { id: 'calm-8', categoryId: 'calm', word: '차분한', emoji: '🍵' },
  { id: 'calm-9', categoryId: 'calm', word: '안정된', emoji: '⚓' },
  { id: 'calm-10', categoryId: 'calm', word: '그저 그런', emoji: '😐' },
  { id: 'calm-11', categoryId: 'calm', word: '수용적인', emoji: '👂' },
  { id: 'calm-12', categoryId: 'calm', word: '신중한', emoji: '⚖️' },
  { id: 'calm-13', categoryId: 'calm', word: '담백한', emoji: '🌾' },
  { id: 'calm-14', categoryId: 'calm', word: '평범한', emoji: '☁️' },
  { id: 'calm-15', categoryId: 'calm', word: '멍한', emoji: '😶' },

  // C. 피로와 긴장 (15개)
  { id: 'tense-1', categoryId: 'tense', word: '피곤한', emoji: '🥱' },
  { id: 'tense-2', categoryId: 'tense', word: '졸린', emoji: '💤' },
  { id: 'tense-3', categoryId: 'tense', word: '긴장되는', emoji: '💓' },
  { id: 'tense-4', categoryId: 'tense', word: '걱정되는', emoji: '😟' },
  { id: 'tense-5', categoryId: 'tense', word: '막막한', emoji: '🌫️' },
  { id: 'tense-6', categoryId: 'tense', word: '어색한', emoji: '😅' },
  { id: 'tense-7', categoryId: 'tense', word: '부담스러운', emoji: '🧱' },
  { id: 'tense-8', categoryId: 'tense', word: '지친', emoji: '🔋' },
  { id: 'tense-9', categoryId: 'tense', word: '예민한', emoji: '⚡' },
  { id: 'tense-10', categoryId: 'tense', word: '혼란스러운', emoji: '🌀' },
  { id: 'tense-11', categoryId: 'tense', word: '서툰', emoji: '🌱' },
  { id: 'tense-12', categoryId: 'tense', word: '쉬고 싶은', emoji: '🛌' },
  { id: 'tense-13', categoryId: 'tense', word: '불안한', emoji: '😰' },
  { id: 'tense-14', categoryId: 'tense', word: '힘든', emoji: '💦' },
  { id: 'tense-15', categoryId: 'tense', word: '조심스러운', emoji: '🐾' },
];

export const QUICK_EXPECTATIONS = [
  '새로운 교수법과 실습 꿀팁을 배우고 싶어요!',
  '실제 수업과 현장에서 바로 써먹을 수 있는 아이디어를 얻어가고 싶습니다.',
  '다른 선생님들과 다양한 경험과 고민을 나누고 싶어요.',
  '기초부터 차근차근 이해하고 따라갈 수 있으면 좋겠습니다.',
  '재미있고 힐링되는 시간이었으면 좋겠어요.',
];

export const QUICK_REFLECTIONS = [
  '현장에서 바로 적용할 수 있는 유익하고 실질적인 배움이었습니다!',
  '막막했던 부분이 명쾌하게 풀려서 큰 자신감이 생겼습니다.',
  '선생님의 열정적인 강의와 따뜻한 피드백 덕분에 큰 용기를 얻었습니다.',
  '동료 참여자분들의 열정과 사례를 보며 깊은 자극과 배움을 얻었습니다.',
  '알차고 알기 쉬운 설명 덕분에 시간이 순식간에 지나갔어요.',
];
