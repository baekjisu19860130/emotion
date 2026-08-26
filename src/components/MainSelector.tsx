import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Sun,
  Award,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { SessionData, EmotionResponse } from '../types';

interface MainSelectorProps {
  sessions: SessionData[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  selectedStudentName: string;
  onSelectStudentName: (name: string) => void;
  onNavigateStep: (step: 'before' | 'after') => void;
  responses: EmotionResponse[];
}

export const MainSelector: React.FC<MainSelectorProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  selectedStudentName,
  onSelectStudentName,
  onNavigateStep,
  responses,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomNameInput, setIsCustomNameInput] = useState(false);
  const [customName, setCustomName] = useState('');

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  // Filter student roster
  const roster = currentSession?.roster || [];
  const filteredRoster = roster.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Check student completion status for this session
  const studentBefore = responses.find(
    (r) =>
      r.sessionId === currentSession?.id &&
      r.studentName === selectedStudentName &&
      r.type === 'before'
  );
  const studentAfter = responses.find(
    (r) =>
      r.sessionId === currentSession?.id &&
      r.studentName === selectedStudentName &&
      r.type === 'after'
  );

  const handleSelectName = (name: string) => {
    onSelectStudentName(name);
    setIsCustomNameInput(false);
  };

  const handleCustomNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onSelectStudentName(customName.trim());
      setIsCustomNameInput(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Intro Hero Badge */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#ebf0ea] border border-[#c8d9c6] text-[#3d5a3c] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#5a5a40]" />
          <span>감정 기반 참여형 교육 체크인</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2d2d26] tracking-tight leading-tight">
          오늘 나의 마음 상태는 어떠신가요?
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#6a6a5e] max-w-xl mx-auto">
          수업 시작 전 기대감과 수업 후 변화된 마음을 솔직하게 기록해주세요.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] shadow-2xs overflow-hidden divide-y divide-[#e8e8e0]">
        {/* Step 1: Session Selector */}
        <div className="p-5 sm:p-6 bg-[#f8f8f4]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#5a5a40] text-[#f5f5f0] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <label className="text-sm font-bold text-[#2d2d26]">
                수업 및 연수 선택
              </label>
            </div>
            {currentSession && (
              <div className="flex items-center space-x-3 text-xs text-[#7a7a6e]">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8a8a7a]" />
                  <span>{currentSession.date}</span>
                </span>
                {currentSession.instructorName && (
                  <span>강사: {currentSession.instructorName}</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              return (
                <button
                  key={session.id}
                  id={`btn-select-session-${session.id}`}
                  onClick={() => onSelectSession(session.id)}
                  type="button"
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#f0f5ee] border-[#5a5a40] ring-2 ring-[#5a5a40]/20'
                      : 'bg-white border-[#e2e2d8] hover:border-[#d5d5c8] hover:bg-[#f7f7f2]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-[#5a5a40] text-[#f5f5f0]'
                          : 'bg-[#eaeae2] text-[#4a4a40]'
                      }`}
                    >
                      {session.date}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#5a5a40]" />
                    )}
                  </div>
                  <span className="mt-1.5 font-bold text-[#2d2d26] text-sm">
                    {session.title}
                  </span>
                  {session.description && (
                    <span className="text-xs text-[#7a7a6e] line-clamp-1 mt-0.5">
                      {session.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Student Name Selector */}
        <div className="p-5 sm:p-6 bg-[#fcfcf9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#5a5a40] text-[#f5f5f0] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <label className="text-sm font-bold text-[#2d2d26]">
                참여자 이름 선택
              </label>
            </div>
            {selectedStudentName && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ebf0ea] text-[#3d5a3c] text-xs font-semibold border border-[#c8d9c6]">
                <UserCheck className="w-3.5 h-3.5 text-[#3d5a3c]" />
                <span>선택됨: {selectedStudentName}님</span>
              </div>
            )}
          </div>

          {/* Search bar & Direct input toggle */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8a8a7a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-student-name"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="명단에서 내 이름 검색..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8f8f4] border border-[#e2e2d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] focus:bg-white text-[#2d2d26]"
              />
            </div>
            <button
              id="btn-toggle-custom-name"
              type="button"
              onClick={() => setIsCustomNameInput(!isCustomNameInput)}
              className="text-xs font-medium text-[#4a4a40] hover:text-[#2d2d26] px-3 py-2 border border-[#e2e2d8] rounded-xl bg-[#f8f8f4] hover:bg-[#f0f0e8] whitespace-nowrap"
            >
              {isCustomNameInput ? '명단에서 고르기' : '직접 이름 입력'}
            </button>
          </div>

          {/* Custom Name input form */}
          {isCustomNameInput ? (
            <form onSubmit={handleCustomNameSubmit} className="flex gap-2 mb-3">
              <input
                id="input-direct-student-name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="이름을 직접 입력해주세요 (예: 홍길동)"
                className="flex-1 px-3 py-2 text-sm border border-[#c8d9c6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] bg-white text-[#2d2d26]"
                autoFocus
              />
              <button
                type="submit"
                id="btn-confirm-custom-name"
                className="px-4 py-2 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-sm font-medium rounded-xl transition-colors shadow-2xs"
              >
                선택 완료
              </button>
            </form>
          ) : (
            /* Roster Grid */
            <div className="max-h-44 overflow-y-auto pr-1">
              {filteredRoster.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredRoster.map((name) => {
                    const isSelected = selectedStudentName === name;
                    const hasBefore = responses.some(
                      (r) =>
                        r.sessionId === currentSession?.id &&
                        r.studentName === name &&
                        r.type === 'before'
                    );
                    const hasAfter = responses.some(
                      (r) =>
                        r.sessionId === currentSession?.id &&
                        r.studentName === name &&
                        r.type === 'after'
                    );

                    return (
                      <button
                        key={name}
                        id={`btn-student-name-${name}`}
                        type="button"
                        onClick={() => handleSelectName(name)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                          isSelected
                            ? 'bg-[#5a5a40] text-[#f5f5f0] border-[#484833] shadow-xs'
                            : 'bg-white text-[#4a4a40] border-[#e2e2d8] hover:bg-[#f0f0e8] hover:border-[#d5d5c8]'
                        }`}
                      >
                        <span>{name}</span>
                        {hasBefore && hasAfter ? (
                          <span className="w-2 h-2 rounded-full bg-[#5a8a58]" title="전/후 모두 기록됨" />
                        ) : hasBefore ? (
                          <span className="w-2 h-2 rounded-full bg-[#c89240]" title="수업 전 기록됨" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-[#7a7a6e]">
                  검색 결과가 없습니다.{' '}
                  <button
                    onClick={() => setIsCustomNameInput(true)}
                    className="text-[#3d5a3c] font-semibold underline ml-1"
                  >
                    직접 이름 입력하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Two Big Action Cards (Before & After) */}
        <div className="p-5 sm:p-8 bg-[#f8f8f4]">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-[#5a5a40] text-[#f5f5f0] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <label className="text-sm font-bold text-[#2d2d26]">
              진입 단계 선택 (Before & After)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Step 1 Card: Before Check-in */}
            <div
              id="card-step-before"
              onClick={() => {
                if (!selectedStudentName) {
                  alert('먼저 2단계에서 본인의 이름을 선택해주세요!');
                  return;
                }
                onNavigateStep('before');
              }}
              className={`relative group rounded-2xl p-6 border transition-all cursor-pointer ${
                studentBefore
                  ? 'bg-gradient-to-br from-[#f8f5ee] to-[#f0ebe0] border-[#dcd2be] hover:border-[#cfc3ab]'
                  : 'bg-gradient-to-br from-[#f3f7f1] to-[#eaf2e8] border-[#c8d9c6] hover:border-[#abc6a7] hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#5a5a40] text-[#f5f5f0] flex items-center justify-center shadow-2xs">
                  <Sun className="w-6 h-6 text-[#d4c5a9]" />
                </div>
                {studentBefore ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6] text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3d5a3c]" />
                    <span>기록 완료 ({studentBefore.emotionWord})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#f5eee6] text-[#7a5332] border border-[#e8d5c4] text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#7a5332]" />
                    <span>수업 시작 전</span>
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#2d2d26] group-hover:text-[#3d5a3c] transition-colors">
                  [Step 1] 수업 시작 전 기분 기록하기
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#6a6a5e] leading-relaxed">
                  오늘 연수/수업을 시작하며 지금 나의 감정과 기대하는 점을
                  남겨주세요.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#e2e2d8]">
                <span className="text-xs font-medium text-[#3d5a3c]">
                  {studentBefore ? '다시 수정하기' : '감정 15+ 카테고리 선택'}
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#5a5a40] shadow-2xs border border-[#e2e2d8] group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Step 2 Card: After Reflection */}
            <div
              id="card-step-after"
              onClick={() => {
                if (!selectedStudentName) {
                  alert('먼저 2단계에서 본인의 이름을 선택해주세요!');
                  return;
                }
                onNavigateStep('after');
              }}
              className={`relative group rounded-2xl p-6 border transition-all cursor-pointer ${
                studentAfter
                  ? 'bg-gradient-to-br from-[#eef4f6] to-[#e4eef1] border-[#cadbe1] hover:border-[#b4cad1]'
                  : 'bg-gradient-to-br from-[#f0f4f7] to-[#e6edf2] border-[#cadbe1] hover:border-[#abc6d0] hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#4a6572] text-[#f5f5f0] flex items-center justify-center shadow-2xs">
                  <Award className="w-6 h-6 text-[#d4e4ec]" />
                </div>
                {studentAfter ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#eaf0f2] text-[#3d5863] border border-[#cadbe1] text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3d5863]" />
                    <span>소감 완료 ({studentAfter.emotionWord})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#eaf0f2] text-[#3d5863] border border-[#cadbe1] text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-[#3d5863]" />
                    <span>수업 종료 후</span>
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#2d2d26] group-hover:text-[#3d5863] transition-colors">
                  [Step 2] 수업 마치고 소감 남기기
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#6a6a5e] leading-relaxed">
                  수업을 마친 후 변화된 나의 기분과 가장 기억에 남는 배움을
                  남겨주세요.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#e2e2d8]">
                <span className="text-xs font-medium text-[#3d5863]">
                  {studentAfter ? '소감 다시 확인하기' : '비포&애프터 변화 확인'}
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#4a6572] shadow-2xs border border-[#e2e2d8] group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
