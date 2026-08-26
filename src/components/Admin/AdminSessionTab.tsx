import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Users,
  Calendar,
  CheckCircle2,
  Layers,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { SessionData } from '../../types';

interface AdminSessionTabProps {
  sessions: SessionData[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  onAddSession: (session: Omit<SessionData, 'id' | 'createdAt'>) => void;
  onUpdateSession: (session: SessionData) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const AdminSessionTab: React.FC<AdminSessionTabProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rosterRawText, setRosterRawText] = useState('');

  const parseRoster = (raw: string): string[] => {
    return raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleStartCreate = () => {
    setTitle('');
    setInstructorName('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setRosterRawText('');
    setIsCreating(true);
    setEditingSessionId(null);
  };

  const handleStartEdit = (s: SessionData) => {
    setTitle(s.title);
    setInstructorName(s.instructorName || '');
    setDescription(s.description || '');
    setDate(s.date);
    setRosterRawText((s.roster || []).join('\n'));
    setEditingSessionId(s.id);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('수업/연수명을 입력해주세요.');
      return;
    }

    const roster = parseRoster(rosterRawText);

    if (editingSessionId) {
      const existing = sessions.find((s) => s.id === editingSessionId);
      if (existing) {
        onUpdateSession({
          ...existing,
          title: title.trim(),
          instructorName: instructorName.trim(),
          description: description.trim(),
          date,
          roster: roster.length > 0 ? roster : ['홍길동', '김철수', '이영희'],
        });
      }
      setEditingSessionId(null);
    } else {
      onAddSession({
        title: title.trim(),
        instructorName: instructorName.trim(),
        description: description.trim(),
        date,
        roster: roster.length > 0 ? roster : ['홍길동', '김철수', '이영희'],
        isActive: true,
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fcfcf9] p-5 rounded-2xl border border-[#e2e2d8] shadow-2xs">
        <div>
          <h3 className="font-extrabold text-[#2d2d26] text-base">
            📋 수업 및 참여자 명단 관리
          </h3>
          <p className="text-xs text-[#7a7a6e] mt-0.5">
            새로운 수업을 등록하고 학생/연수생 명단을 쉼표나 줄바꿈으로 일괄 붙여넣을 수 있습니다.
          </p>
        </div>

        {!isCreating && !editingSessionId && (
          <button
            id="btn-add-new-session"
            onClick={handleStartCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>새 수업/연수 개설하기</span>
          </button>
        )}
      </div>

      {/* Create / Edit Form Drawer */}
      {(isCreating || editingSessionId) && (
        <form
          onSubmit={handleSave}
          className="bg-[#fcfcf9] rounded-2xl border-2 border-[#5a5a40] p-5 sm:p-7 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e2d8]">
            <h4 className="font-extrabold text-[#2d2d26] text-sm sm:text-base">
              {editingSessionId ? '수업 정보 및 명단 수정' : '새 수업/연수 등록'}
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingSessionId(null);
              }}
              className="text-[#8a8a7a] hover:text-[#2d2d26]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#4a4a40] mb-1">
                수업 및 연수명 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2026 AI 에듀테크 역량 강화 연수"
                className="w-full px-3 py-2 text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4a4a40] mb-1">
                강사/진행자 이름
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="예: 백교수"
                className="w-full px-3 py-2 text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4a4a40] mb-1">
                진행 일자
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#4a4a40] mb-1">
                수업 설명/목표 (선택)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 생성형 AI 도구를 활용한 맞춤형 수업 설계 및 실습"
                className="w-full px-3 py-2 text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
              />
            </div>
          </div>

          {/* Roster Bulk Paste Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#4a4a40]">
                참여자 명단 일괄 붙여넣기 (쉼표 또는 줄바꿈으로 구분)
              </label>
              <span className="text-xs text-[#8a8a7a] font-medium">
                인식된 인원: {parseRoster(rosterRawText).length}명
              </span>
            </div>
            <textarea
              rows={4}
              value={rosterRawText}
              onChange={(e) => setRosterRawText(e.target.value)}
              placeholder="엑셀이나 명단에서 이름을 복사해서 붙여넣으세요:&#10;김철수, 이영희, 박민수, 정우진, 최유나, 강동원, 윤하은"
              className="w-full p-3 text-xs sm:text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] font-mono"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingSessionId(null);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#5a5a4e] hover:bg-[#eaeae0] rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-6 py-2 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] rounded-xl text-xs sm:text-sm font-bold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>저장 완료</span>
            </button>
          </div>
        </form>
      )}

      {/* Session Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => {
          const isSelected = session.id === selectedSessionId;
          const count = session.roster?.length || 0;

          return (
            <div
              key={session.id}
              className={`bg-[#fcfcf9] rounded-2xl border p-5 shadow-2xs transition-all ${
                isSelected
                  ? 'border-[#5a5a40] ring-2 ring-[#5a5a40]/20'
                  : 'border-[#e2e2d8] hover:border-[#cfcfc4]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eaeae2] text-[#4a4a40]">
                      {session.date}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6]">
                        현재 활성 세션
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-base font-extrabold text-[#2d2d26]">
                    {session.title}
                  </h4>
                  {session.instructorName && (
                    <p className="text-xs text-[#7a7a6e] mt-0.5">
                      강사: {session.instructorName}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(session)}
                    className="p-1.5 text-[#8a8a7a] hover:text-[#2d2d26] hover:bg-[#eaeae0] rounded-lg transition-colors"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `'${session.title}' 수업을 정말 삭제하시겠습니까?`
                          )
                        ) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-1.5 text-[#8a8a7a] hover:text-[#a83232] hover:bg-[#faeceb] rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {session.description && (
                <p className="mt-2 text-xs text-[#5a5a4e] line-clamp-2">
                  {session.description}
                </p>
              )}

              {/* Roster preview */}
              <div className="mt-4 pt-3 border-t border-[#eaeae0]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#5a5a4e] mb-2">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>등록 명단 ({count}명)</span>
                  </span>
                  {!isSelected && (
                    <button
                      type="button"
                      onClick={() => onSelectSession(session.id)}
                      className="text-[#3d5a3c] hover:underline font-bold"
                    >
                      이 수업 선택하기 ➡️
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {session.roster.map((name) => (
                    <span
                      key={name}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#eaeae2] text-[#4a4a40]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
