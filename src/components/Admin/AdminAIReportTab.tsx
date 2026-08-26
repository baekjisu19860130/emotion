import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Printer,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Award,
  Lightbulb,
} from 'lucide-react';
import { SessionData, EmotionResponse, BeforeAfterPair } from '../../types';

interface AdminAIReportTabProps {
  session: SessionData;
  responses: EmotionResponse[];
  pairs: BeforeAfterPair[];
}

export const AdminAIReportTab: React.FC<AdminAIReportTabProps> = ({
  session,
  responses,
  pairs,
}) => {
  const [loading, setLoading] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sessionPairs = pairs.filter((p) => p.sessionId === session.id);
  const beforeList = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'before'
  );
  const afterList = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'after'
  );

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionTitle: session.title,
          instructorName: session.instructorName || '선생님',
          pairs: sessionPairs.map((p) => ({
            name: p.studentName,
            beforeEmotion: p.beforeResponse?.emotionWord,
            beforeCategory: p.beforeResponse?.categoryName,
            beforeComment: p.beforeResponse?.comment,
            afterEmotion: p.afterResponse?.emotionWord,
            afterCategory: p.afterResponse?.categoryName,
            afterComment: p.afterResponse?.comment,
            rating: p.afterResponse?.rating,
          })),
          beforeList: beforeList.map((b) => ({
            name: b.studentName,
            emotion: b.emotionWord,
            category: b.categoryName,
            comment: b.comment,
          })),
          afterList: afterList.map((a) => ({
            name: a.studentName,
            emotion: a.emotionWord,
            category: a.categoryName,
            comment: a.comment,
            rating: a.rating,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '보고서 생성 요청에 실패했습니다.');
      }

      setReportMarkdown(data.report);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || '보고서 생성 중 문제가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Promo Banner */}
      <div className="bg-[#5a5a40] rounded-3xl p-6 sm:p-8 text-[#f5f5f0] shadow-xs">
        <div className="flex items-center space-x-2 text-[#d4c5a9] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Gemini 3.7 Flash AI 사후 보고서 1초 생성</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black tracking-tight">
          수업 전/후 감정 데이터 기반 맞춤형 교육 효과 보고서
        </h2>
        <p className="mt-2 text-[#e2e2d8] text-xs sm:text-sm max-w-2xl leading-relaxed">
          참여자들이 남긴 사전 기대평과 사후 소감, 감정 변화 지표를 종합 분석하여 공문, 교육 결과 보고서, 학교/기업 제출용 분석 보고서를 1초 만에 자동 작성합니다.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            id="btn-generate-ai-report"
            onClick={handleGenerateReport}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#fcfcf9] text-[#2d2d26] font-extrabold text-sm hover:bg-[#eaeae2] transition-all shadow-sm hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#5a5a40]" />
                <span>AI가 참여자 응답을 정밀 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#5a5a40]" />
                <span>[1초 보고서 생성하기] ({sessionPairs.length}명 데이터 기준)</span>
              </>
            )}
          </button>

          {reportMarkdown && (
            <>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-xl bg-[#484833] hover:bg-[#383827] text-[#f5f5f0] text-xs sm:text-sm font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#c8d9c6]" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>마크다운 전체 복사</span>
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-xl bg-[#484833] hover:bg-[#383827] text-[#f5f5f0] text-xs sm:text-sm font-semibold transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>인쇄 / PDF 저장</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-[#faeceb] border border-[#e8c2bf] text-[#7a2c26] text-xs sm:text-sm flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">오류: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Report Container */}
      {reportMarkdown ? (
        <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-6 sm:p-10 shadow-xs print:p-0 print:border-none print:shadow-none">
          <div className="flex items-center justify-between pb-4 border-b border-[#e2e2d8] mb-6">
            <div>
              <span className="text-xs font-bold text-[#3d5a3c] uppercase tracking-wider block">
                교육 결과 분석 보고서
              </span>
              <h3 className="text-xl font-bold text-[#2d2d26] mt-1">
                {session.title} (강사: {session.instructorName || '선생님'})
              </h3>
            </div>
            <span className="text-xs text-[#8a8a7a]">
              생성 일시: {new Date().toLocaleString()}
            </span>
          </div>

          <div className="prose prose-stone max-w-none text-[#2d2d26] text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {reportMarkdown}
          </div>
        </div>
      ) : !loading ? (
        <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-8 sm:p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#eaeae2] text-[#7a7a6e] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-[#2d2d26]">
            아직 생성된 AI 보고서가 없습니다.
          </h4>
          <p className="text-xs sm:text-sm text-[#7a7a6e] max-w-md mx-auto mt-1">
            상단의 <strong>[1초 보고서 생성하기]</strong> 버튼을 누르면 참여자들의 감정 변화율, 주요 소감, 강사 피드백 제언이 포함된 전문 보고서가 생성됩니다.
          </p>
        </div>
      ) : null}
    </div>
  );
};
