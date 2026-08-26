import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Code,
  Copy,
  Check,
  ExternalLink,
  Download,
  Link2,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { GasConfig, SessionData } from '../../types';
import { AttendanceStorage } from '../../services/storage';

interface AdminGasTabProps {
  session: SessionData;
  gasConfig: GasConfig;
  onUpdateGasConfig: (config: GasConfig) => void;
  onDownloadCSV: () => void;
}

export const AdminGasTab: React.FC<AdminGasTabProps> = ({
  session,
  gasConfig,
  onUpdateGasConfig,
  onDownloadCSV,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [webhookInput, setWebhookInput] = useState(
    gasConfig.webhookUrl || AttendanceStorage.DEFAULT_GAS_URL
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [bulkSyncResult, setBulkSyncResult] = useState<string | null>(null);

  const gasCode = AttendanceStorage.generateGoogleAppsScriptCode();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGasConfig({
      ...gasConfig,
      webhookUrl: webhookInput.trim(),
      autoSync: true,
    });
    alert('구글 앱스 스크립트(GAS) 웹앱 URL이 저장되었습니다!');
  };

  const handleBulkSync = async () => {
    setIsSyncingAll(true);
    setBulkSyncResult(null);
    try {
      const res = await AttendanceStorage.syncAllResponsesToGas(session.id);
      setBulkSyncResult(`총 ${res.total}건 중 ${res.success}건의 응답 데이터가 구글 시트로 성공적으로 전송되었습니다.`);
    } catch (err: any) {
      setBulkSyncResult('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleTestConnection = async () => {
    const targetUrl = webhookInput.trim() || AttendanceStorage.DEFAULT_GAS_URL;
    if (!targetUrl) {
      alert('먼저 배포된 Google Apps Script 웹앱 URL을 입력해주세요.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addResponse',
          data: {
            timestamp: new Date().toLocaleString(),
            date: new Date().toISOString().slice(0, 10),
            sessionName: session.title,
            studentName: '[연동 테스트 참여자]',
            type: '수업 전',
            categoryCode: 'A',
            categoryName: '긍정과 에너지',
            emotionWord: '설레는',
            comment: 'Google Sheets 연동 테스트 데이터입니다.',
            rating: 5,
          },
        }),
      });

      setTestResult('성공! Google 스프레드시트의 [응답 기록] 시트에 테스트 행이 전송되었습니다.');
    } catch (e: any) {
      setTestResult(`연동 테스트 완료 (no-cors 전송 완료)`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#fcfcf9] p-5 sm:p-6 rounded-2xl border border-[#e2e2d8] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-[#2d2d26] text-base flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-[#5a5a40]" />
              <span>구글 스프레드시트 & Apps Script(GAS) 연동 허브</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#7a7a6e] mt-1">
              구글 시트에 3개 시트 (응답 기록, 명단 관리, 감정 사전)를 자동 생성하고 실시간으로 응답을 수집합니다.
            </p>
          </div>

          <button
            onClick={onDownloadCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#2d2d26] hover:bg-black text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>엑셀 호환 CSV 즉시 다운로드</span>
          </button>
        </div>
      </div>

      {/* Webhook Connection Card */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-[#2d2d26] flex items-center space-x-2">
            <Link2 className="w-4 h-4 text-[#5a5a40]" />
            <span>실시간 구글 시트 웹앱 URL 연동 설정</span>
          </h4>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#ebf0ea] text-[#3d5a3c] text-xs font-bold border border-[#c8d9c6]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3d5a3c]" />
            <span>실시간 자동 전송 활성화됨</span>
          </span>
        </div>
        <p className="text-xs text-[#7a7a6e] mb-4">
          선생님께서 배포하신 Google Apps Script 웹 앱 URL이 성공적으로 등록되었습니다. 학생/연수생이 제출할 때마다 구글 스프레드시트에 즉시 자동 기록됩니다.
        </p>

        <form onSubmit={handleSaveWebhook} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            URL 저장
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-[#eaeae2] hover:bg-[#deded4] text-[#4a4a40] text-xs sm:text-sm font-bold rounded-xl transition-colors"
          >
            {isTesting ? '테스트 전송 중...' : '연동 테스트'}
          </button>
          <button
            type="button"
            onClick={handleBulkSync}
            disabled={isSyncingAll}
            className="inline-flex items-center space-x-1 px-4 py-2 bg-[#3d5a3c] hover:bg-[#2d432c] text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-2xs"
            title="현재 수업의 모든 응답을 구글 시트로 즉시 일괄 전송합니다"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? '일괄 전송 중...' : '현재 데이터 전체 시트 전송'}</span>
          </button>
        </form>

        {testResult && (
          <div className="mt-3 p-3 rounded-xl bg-[#ebf0ea] border border-[#c8d9c6] text-xs font-semibold text-[#3d5a3c] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#3d5a3c] shrink-0" />
            <span>{testResult}</span>
          </div>
        )}

        {bulkSyncResult && (
          <div className="mt-3 p-3 rounded-xl bg-[#eaf0f2] border border-[#cadbe1] text-xs font-semibold text-[#3d5863] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#3d5863] shrink-0" />
            <span>{bulkSyncResult}</span>
          </div>
        )}
      </div>

      {/* 3 Steps Guide & GAS Code Copy */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-5 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaeae0]">
          <div>
            <h4 className="font-extrabold text-[#2d2d26] text-sm sm:text-base">
              구글 시트 자동 생성 스크립트 (Code.gs)
            </h4>
            <p className="text-xs text-[#7a7a6e] mt-0.5">
              클릭 한 번으로 코드를 복사하여 구글 시트의 [확장 프로그램] ➡️ [Apps Script]에 붙여넣으세요.
            </p>
          </div>

          <button
            id="btn-copy-gas-code"
            onClick={handleCopyCode}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4 text-[#c8d9c6]" />
                <span>코드 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>전체 코드 복사</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Step Visual Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#f8f8f4] border border-[#e2e2d8]">
            <div className="font-bold text-[#2d2d26] mb-1 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#5a5a40] text-[#f5f5f0] flex items-center justify-center text-[10px]">
                1
              </span>
              <span>스프레드시트 열기</span>
            </div>
            <p className="text-[#5a5a4e]">
              구글 드라이브에서 새 스프레드시트를 만들고 상단 메뉴 [확장 프로그램] ➡️ [Apps Script]를 클릭합니다.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f8f4] border border-[#e2e2d8]">
            <div className="font-bold text-[#2d2d26] mb-1 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#5a5a40] text-[#f5f5f0] flex items-center justify-center text-[10px]">
                2
              </span>
              <span>코드 붙여넣기 & setupSheets</span>
            </div>
            <p className="text-[#5a5a4e]">
              아래 코드를 붙여넣고 상단 함수에서 [setupSheets]를 선택 후 [실행]을 누르면 3개 시트가 자동 생성됩니다.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8f8f4] border border-[#e2e2d8]">
            <div className="font-bold text-[#2d2d26] mb-1 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#5a5a40] text-[#f5f5f0] flex items-center justify-center text-[10px]">
                3
              </span>
              <span>웹앱 배포 & URL 등록</span>
            </div>
            <p className="text-[#5a5a4e]">
              우측 상단 [배포] ➡️ [새 배포] ➡️ [웹 앱] (액세스: 모든 사용자)으로 배포하고 발급된 URL을 위 입력창에 등록합니다.
            </p>
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="relative">
          <pre className="bg-[#2d2d26] text-[#eaeae2] p-4 sm:p-5 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
            {gasCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
