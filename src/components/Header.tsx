import React from 'react';
import { Sparkles, Shield, User, QrCode, BookOpen, Layers } from 'lucide-react';
import { SessionData } from '../types';

interface HeaderProps {
  currentView: 'participant' | 'admin';
  onViewChange: (view: 'participant' | 'admin') => void;
  sessions: SessionData[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  onOpenQR: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  sessions,
  selectedSessionId,
  onSelectSession,
  onOpenQR,
}) => {
  const currentSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <header className="sticky top-0 z-40 bg-[#fcfcf9]/95 backdrop-blur-md border-b border-[#e2e2d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onViewChange('participant')}
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#5a5a40] flex items-center justify-center text-[#f5f5f0] shadow-2xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#d4c5a9]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-[#2d2d26] text-base sm:text-lg tracking-tight">
                    마음 출석부
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6]">
                    Before & After
                  </span>
                </div>
                <p className="text-xs text-[#7a7a6e] hidden sm:block">
                  수업 전 기대감 & 수업 후 감정 변화 측정 시스템
                </p>
              </div>
            </button>
          </div>

          {/* Session Selector & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Session dropdown */}
            {sessions.length > 0 && (
              <div className="relative hidden md:flex items-center">
                <div className="flex items-center space-x-2 bg-[#f0f0e8] hover:bg-[#eaeae0] border border-[#e2e2d8] rounded-xl px-3 py-1.5 transition-colors">
                  <BookOpen className="w-4 h-4 text-[#7a7a6e]" />
                  <select
                    id="session-dropdown-select"
                    value={selectedSessionId}
                    onChange={(e) => onSelectSession(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm font-medium text-[#2d2d26] focus:outline-none cursor-pointer pr-2 max-w-[200px] truncate"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* QR Projection View for Teacher */}
            <button
              id="btn-open-qr-modal"
              onClick={onOpenQR}
              title="수업 화면에 QR코드 띄우기"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#4a4a40] bg-[#fcfcf9] hover:bg-[#f0f0e8] border border-[#e2e2d8] rounded-xl transition-colors shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-[#5a5a40]" />
              <span className="hidden sm:inline">화면 QR 띄우기</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#eaeae2] p-1 rounded-xl border border-[#e2e2d8]">
              <button
                id="btn-view-participant"
                onClick={() => onViewChange('participant')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  currentView === 'participant'
                    ? 'bg-[#fcfcf9] text-[#2d2d26] shadow-2xs font-bold'
                    : 'text-[#6a6a5e] hover:text-[#2d2d26]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#5a5a40]" />
                <span>참여자 모드</span>
              </button>
              <button
                id="btn-view-admin"
                onClick={() => onViewChange('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  currentView === 'admin'
                    ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-2xs font-bold'
                    : 'text-[#6a6a5e] hover:text-[#2d2d26]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>관리자/강사</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
