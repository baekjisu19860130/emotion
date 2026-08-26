import React, { useState } from 'react';
import {
  LayoutDashboard,
  GitCompare,
  Sparkles,
  Users,
  BookOpen,
  FileSpreadsheet,
  Download,
  QrCode,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  SessionData,
  EmotionResponse,
  EmotionWord,
  BeforeAfterPair,
  GasConfig,
} from '../../types';
import { AdminSummaryTab } from './AdminSummaryTab';
import { AdminMatchingTab } from './AdminMatchingTab';
import { AdminAIReportTab } from './AdminAIReportTab';
import { AdminSessionTab } from './AdminSessionTab';
import { AdminEmotionTab } from './AdminEmotionTab';
import { AdminGasTab } from './AdminGasTab';

interface AdminDashboardProps {
  sessions: SessionData[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  responses: EmotionResponse[];
  pairs: BeforeAfterPair[];
  emotionWords: EmotionWord[];
  gasConfig: GasConfig;
  onUpdateGasConfig: (config: GasConfig) => void;
  onUpdateEmotionWords: (words: EmotionWord[]) => void;
  onResetEmotionWords: () => void;
  onAddSession: (session: Omit<SessionData, 'id' | 'createdAt'>) => void;
  onUpdateSession: (session: SessionData) => void;
  onDeleteSession: (sessionId: string) => void;
  onDownloadCSV: () => void;
  onOpenQR: () => void;
  onBackToParticipant: () => void;
}

type AdminTab =
  | 'summary'
  | 'matching'
  | 'ai_report'
  | 'sessions'
  | 'emotions'
  | 'gas';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  responses,
  pairs,
  emotionWords,
  gasConfig,
  onUpdateGasConfig,
  onUpdateEmotionWords,
  onResetEmotionWords,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onDownloadCSV,
  onOpenQR,
  onBackToParticipant,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');

  const currentSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Banner with Session Info & Actions */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-6 mb-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#5a5a40] text-[#f5f5f0] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6]">
                  강사 / 관리자 전용 대시보드
                </span>
                <span className="text-xs text-[#7a7a6e]">
                  {currentSession?.date}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2d2d26] mt-1">
                {currentSession?.title}
              </h1>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenQR}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#ebf0ea] hover:bg-[#d8e4d6] text-[#3d5a3c] text-xs sm:text-sm font-bold rounded-xl transition-colors border border-[#c8d9c6]"
            >
              <QrCode className="w-4 h-4" />
              <span>교실 QR 띄우기</span>
            </button>
            <button
              onClick={onDownloadCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#eaeae2] hover:bg-[#dcdcd2] text-[#383830] text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>CSV 내보내기</span>
            </button>
            <button
              onClick={onBackToParticipant}
              className="inline-flex items-center space-x-1 px-3.5 py-2 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-2xs"
            >
              <span>참여자 화면 가기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="mt-6 pt-4 border-t border-[#e2e2d8] flex overflow-x-auto gap-1 sm:gap-2 pb-1">
          <button
            id="tab-admin-summary"
            onClick={() => setActiveTab('summary')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'summary'
                ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26] hover:bg-[#eaeae0]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>실시간 데이터 요약</span>
          </button>

          <button
            id="tab-admin-matching"
            onClick={() => setActiveTab('matching')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'matching'
                ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26] hover:bg-[#eaeae0]'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>1:1 비포&애프터 매칭</span>
          </button>

          <button
            id="tab-admin-ai-report"
            onClick={() => setActiveTab('ai_report')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'ai_report'
                ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26] hover:bg-[#eaeae0]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#d4c5a9]" />
            <span>AI 사후 교육효과 보고서</span>
          </button>

          <button
            id="tab-admin-sessions"
            onClick={() => setActiveTab('sessions')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'sessions'
                ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26] hover:bg-[#eaeae0]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>세션 및 명단 관리</span>
          </button>

          <button
            id="tab-admin-emotions"
            onClick={() => setActiveTab('emotions')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'emotions'
                ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26] hover:bg-[#eaeae0]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>감정 사전 커스텀</span>
          </button>

          <button
            id="tab-admin-gas"
            onClick={() => setActiveTab('gas')}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'gas'
                ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26] hover:bg-[#eaeae0]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>구글 시트 & GAS 연동</span>
          </button>
        </div>
      </div>

      {/* Active Tab Component Rendering */}
      {activeTab === 'summary' && currentSession && (
        <AdminSummaryTab
          session={currentSession}
          responses={responses}
          pairs={pairs}
          onDownloadCSV={onDownloadCSV}
        />
      )}

      {activeTab === 'matching' && currentSession && (
        <AdminMatchingTab session={currentSession} pairs={pairs} />
      )}

      {activeTab === 'ai_report' && currentSession && (
        <AdminAIReportTab
          session={currentSession}
          responses={responses}
          pairs={pairs}
        />
      )}

      {activeTab === 'sessions' && (
        <AdminSessionTab
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={onSelectSession}
          onAddSession={onAddSession}
          onUpdateSession={onUpdateSession}
          onDeleteSession={onDeleteSession}
        />
      )}

      {activeTab === 'emotions' && (
        <AdminEmotionTab
          emotionWords={emotionWords}
          onUpdateEmotionWords={onUpdateEmotionWords}
          onResetEmotionWords={onResetEmotionWords}
        />
      )}

      {activeTab === 'gas' && currentSession && (
        <AdminGasTab
          session={currentSession}
          gasConfig={gasConfig}
          onUpdateGasConfig={onUpdateGasConfig}
          onDownloadCSV={onDownloadCSV}
        />
      )}
    </div>
  );
};
