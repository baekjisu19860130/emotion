import React, { useState } from 'react';
import {
  Database,
  Link2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  Shield,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SupabaseConfig, SessionData, EmotionResponse } from '../../types';
import { SupabaseService } from '../../services/supabase';

interface AdminSupabaseTabProps {
  supabaseConfig: SupabaseConfig;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
  sessions: SessionData[];
  responses: EmotionResponse[];
  onRefreshData: () => Promise<void>;
}

export const AdminSupabaseTab: React.FC<AdminSupabaseTabProps> = ({
  supabaseConfig,
  onUpdateSupabaseConfig,
  sessions,
  responses,
  onRefreshData,
}) => {
  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [anonKeyInput, setAnonKeyInput] = useState(supabaseConfig.anonKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingUpload, setIsSyncingUpload] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);

  const sqlSchema = SupabaseService.getTablesSchemaSQL();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleTest = async () => {
    if (!urlInput.trim() || !anonKeyInput.trim()) {
      alert('Project URL과 anon Key를 모두 입력해주세요.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await SupabaseService.testConnection(urlInput.trim(), anonKeyInput.trim());
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `연결 테스트 중 오류 발생: ${e?.message || '알 수 없는 오류'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = urlInput.trim();
    const trimmedKey = anonKeyInput.trim();

    if (!trimmedUrl || !trimmedKey) {
      alert('Project URL과 anon Key를 모두 입력해주세요.');
      return;
    }

    const updated: SupabaseConfig = {
      url: trimmedUrl,
      anonKey: trimmedKey,
      autoSync: true,
      isConnected: true,
      lastSyncedAt: new Date().toISOString(),
    };

    onUpdateSupabaseConfig(updated);
    alert('Supabase 연동 정보가 저장되었습니다! 이제 모든 기기에서 실시간 동기화가 진행됩니다.');
  };

  const handleUploadAllToCloud = async () => {
    if (!urlInput.trim() || !anonKeyInput.trim()) {
      alert('먼저 Supabase URL과 anon Key를 입력하고 저장해주세요.');
      return;
    }

    setIsSyncingUpload(true);
    setSyncResult(null);
    try {
      const res = await SupabaseService.syncAllLocalToSupabase(sessions, responses);
      if (res.success) {
        setSyncResult(`클라우드 업로드 성공: 세션 ${res.sessionsCount}개, 응답 ${res.responsesCount}개가 Supabase에 완벽히 동기화되었습니다.`);
      } else {
        setSyncResult('업로드 실패: Supabase 테이블이 생성되어 있는지 확인해주세요.');
      }
    } catch (err: any) {
      setSyncResult(`업로드 중 오류 발생: ${err?.message}`);
    } finally {
      setIsSyncingUpload(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsPulling(true);
    setSyncResult(null);
    try {
      await onRefreshData();
      setSyncResult('Supabase 클라우드에서 최신 데이터를 성공적으로 불러왔습니다!');
    } catch (err: any) {
      setSyncResult(`데이터 불러오기 실패: ${err?.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const isConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#3d5a3c] text-[#f5f5f0] flex items-center justify-center font-bold shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-[#2d2d26]">
                  Supabase 클라우드 실시간 데이터베이스 연동
                </h3>
                {isConfigured ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#ebf0ea] text-[#3d5a3c] text-xs font-bold border border-[#c8d9c6]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>실시간 동기화 활성</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#f0f0e8] text-[#7a7a6e] text-xs font-bold">
                    <span>설정 필요</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6a6a5e] mt-0.5">
                스마트폰, 태블릿, PC 등 어떤 기기에서 학생/연수생이 접속하더라도 데이터가 중앙 클라우드와 1초 만에 실시간 동기화됩니다.
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e2e2d8] hover:bg-[#eaeae0] text-[#2d2d26] text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <span>Supabase 대시보드 바로가기</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#7a7a6e]" />
          </a>
        </div>
      </div>

      {/* Connection Config Form */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-6 shadow-2xs">
        <h4 className="text-sm font-bold text-[#2d2d26] mb-1 flex items-center space-x-2">
          <Link2 className="w-4 h-4 text-[#5a5a40]" />
          <span>Project URL 및 Anon Public Key 설정</span>
        </h4>
        <p className="text-xs text-[#7a7a6e] mb-4">
          Supabase 프로젝트의 <b>Settings &gt; API</b> 메뉴에서 <b>Project URL</b>과 <b>anon public key</b>를 복사하여 아래에 붙여넣어 주세요.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Project URL */}
          <div>
            <label className="block text-xs font-bold text-[#4a4a40] mb-1">
              Supabase Project URL <span className="text-[#a84242]">*</span>
            </label>
            <input
              id="input-supabase-url"
              type="text"
              placeholder="예: https://abcdefghijklm.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e2d8] rounded-xl text-xs sm:text-sm font-mono text-[#2d2d26] focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
            />
          </div>

          {/* Anon Public Key */}
          <div>
            <label className="block text-xs font-bold text-[#4a4a40] mb-1">
              Supabase anon public Key <span className="text-[#a84242]">*</span>
            </label>
            <div className="relative">
              <input
                id="input-supabase-key"
                type={showKey ? 'text' : 'password'}
                placeholder="예: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKeyInput}
                onChange={(e) => setAnonKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#e2e2d8] rounded-xl text-xs sm:text-sm font-mono text-[#2d2d26] focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a6e] hover:text-[#2d2d26]"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              id="btn-supabase-test"
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#eaeae2] hover:bg-[#dcdcd2] text-[#2d2d26] text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? '연결 확인 중...' : '연결 테스트'}</span>
            </button>

            <button
              id="btn-supabase-save"
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#d4c5a9]" />
              <span>설정 저장 및 실시간 동기화 시작</span>
            </button>

            <button
              id="btn-supabase-upload-all"
              type="button"
              onClick={handleUploadAllToCloud}
              disabled={isSyncingUpload}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#3d5a3c] hover:bg-[#2d432c] text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-2xs"
              title="현재 브라우저에 있는 모든 세션과 응답을 Supabase로 일괄 업로드합니다"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isSyncingUpload ? 'animate-spin' : ''}`} />
              <span>{isSyncingUpload ? '업로드 중...' : '로컬 데이터 ➡️ Supabase 전체 업로드'}</span>
            </button>

            <button
              id="btn-supabase-pull"
              type="button"
              onClick={handlePullFromCloud}
              disabled={isPulling}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-[#e2e2d8] hover:bg-[#eaeae0] text-[#2d2d26] text-xs sm:text-sm font-bold rounded-xl transition-colors"
              title="Supabase 클라우드에 있는 최신 데이터를 다시 불러옵니다"
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
              <span>{isPulling ? '불러오는 중...' : '클라우드 최신 새로고침'}</span>
            </button>
          </div>
        </form>

        {/* Test Result Message Banner */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-start space-x-2 ${
              testResult.success
                ? 'bg-[#ebf0ea] border-[#c8d9c6] text-[#2d4d2c]'
                : 'bg-[#fcedeb] border-[#f0c2bd] text-[#a84242]'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#3d5a3c]" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#a84242]" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Sync Result Banner */}
        {syncResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#eaf0f2] border border-[#cadbe1] text-xs sm:text-sm font-semibold text-[#3d5863] flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#3d5863] shrink-0" />
            <span>{syncResult}</span>
          </div>
        )}
      </div>

      {/* Step by Step Guide & SQL Setup Script */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-[#2d2d26] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#5a5a40]" />
              <span>1초 Supabase SQL 테이블 생성 스크립트</span>
            </h4>
            <p className="text-xs text-[#7a7a6e] mt-0.5">
              아래 스크립트를 복사하여 Supabase의 <b>SQL Editor</b>에 붙여넣고 <b>[RUN]</b>을 실행하면 세션과 응답 테이블이 즉시 자동 생성됩니다.
            </p>
          </div>

          <button
            id="btn-copy-supabase-sql"
            onClick={handleCopySQL}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-xs font-bold transition-colors shadow-2xs shrink-0"
          >
            {copiedSQL ? (
              <>
                <Check className="w-4 h-4 text-[#d4c5a9]" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>SQL 스크립트 복사</span>
              </>
            )}
          </button>
        </div>

        {/* SQL Code Box */}
        <div className="bg-[#24241e] text-[#f0f0ea] p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-72 border border-[#3e3e34]">
          <pre>{sqlSchema}</pre>
        </div>

        {/* Setup Steps Timeline */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-[#e2e2d8]">
            <div className="text-xs font-black text-[#5a5a40] mb-1">1단계 • 프로젝트 생성</div>
            <p className="text-xs text-[#6a6a5e]">
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#3d5a3c] underline font-semibold"
              >
                supabase.com
              </a>
              에서 무료 가입 후 New Project를 생성합니다.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e2e2d8]">
            <div className="text-xs font-black text-[#5a5a40] mb-1">2단계 • SQL 실행</div>
            <p className="text-xs text-[#6a6a5e]">
              좌측 <b>SQL Editor</b> 메뉴에 위 스크립트를 붙여넣고 <b>[Run]</b> 버튼을 누릅니다.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e2e2d8]">
            <div className="text-xs font-black text-[#5a5a40] mb-1">3단계 • API 키 입력 & 저장</div>
            <p className="text-xs text-[#6a6a5e]">
              <b>Project Settings &gt; API</b>에서 URL과 anon key를 복사하여 위 입력창에 저장합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
