import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Sparkles,
  Users,
  Sun,
  Award,
  Maximize2,
  Copy,
  Check,
} from 'lucide-react';
import { SessionData, EmotionResponse } from '../types';

interface PresentationModalProps {
  session: SessionData;
  responses: EmotionResponse[];
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  session,
  responses,
  onClose,
}) => {
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const beforeCount = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'before'
  ).length;
  const afterCount = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'after'
  ).length;
  const rosterCount = session.roster?.length || 0;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2d2d26]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#fcfcf9] rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-[#e2e2d8] relative text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#7a7a6e] hover:text-[#2d2d26] hover:bg-[#eaeae0] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6] text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#5a5a40]" />
          <span>수업 화면 프로젝터 모드</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-[#2d2d26] tracking-tight">
          {session.title}
        </h2>
        <p className="text-[#6a6a5e] text-xs sm:text-base mt-1">
          스마트폰 카메라로 QR 코드를 스캔하여 마음 출석부에 접속해주세요.
        </p>

        {/* QR Code Container */}
        <div className="mt-8 p-6 sm:p-8 bg-[#f8f8f4] rounded-3xl inline-block border border-[#e2e2d8] shadow-inner">
          <div className="p-4 bg-white rounded-2xl shadow-xs border border-[#e2e2d8]">
            <QRCodeSVG
              value={currentUrl}
              size={220}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/vite.svg',
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-center space-x-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="text-xs text-[#4a4a40] bg-white px-3 py-1.5 rounded-lg border border-[#e2e2d8] w-64 truncate text-center"
            />
            <button
              onClick={handleCopyUrl}
              className="p-1.5 bg-[#eaeae2] hover:bg-[#dcdcd2] text-[#383830] rounded-lg text-xs font-semibold"
              title="URL 복사"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-[#3d5a3c]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Attendance Counters */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="p-4 rounded-2xl bg-[#ebf0ea] border border-[#c8d9c6] text-left">
            <div className="flex items-center justify-between text-[#3d5a3c] text-xs font-bold">
              <span>수업 전 체크인 현황</span>
              <Sun className="w-4 h-4 text-[#5a5a40]" />
            </div>
            <div className="mt-1 text-2xl font-black text-[#2d2d26]">
              {beforeCount}{' '}
              <span className="text-xs font-normal text-[#5a5a4e]">
                / {rosterCount}명 완료
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#eaf0f2] border border-[#cadbe1] text-left">
            <div className="flex items-center justify-between text-[#3d5863] text-xs font-bold">
              <span>수업 후 소감 현황</span>
              <Award className="w-4 h-4 text-[#4a6572]" />
            </div>
            <div className="mt-1 text-2xl font-black text-[#2d2d26]">
              {afterCount}{' '}
              <span className="text-xs font-normal text-[#5a5a4e]">
                / {rosterCount}명 완료
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#e2e2d8] flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

