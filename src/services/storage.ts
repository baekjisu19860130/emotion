import {
  SessionData,
  EmotionResponse,
  EmotionWord,
  BeforeAfterPair,
  GasConfig,
  AIAnalysisReport,
} from '../types';
import { INITIAL_SESSIONS, INITIAL_RESPONSES } from '../data/initialData';
import { INITIAL_EMOTION_WORDS } from '../data/defaultEmotions';

const SESSIONS_KEY = 'mind_attendance_sessions_v1';
const RESPONSES_KEY = 'mind_attendance_responses_v1';
const EMOTIONS_KEY = 'mind_attendance_emotions_v1';
const GAS_CONFIG_KEY = 'mind_attendance_gas_config_v1';

export class AttendanceStorage {
  // --- Sessions ---
  static getSessions(): SessionData[] {
    try {
      const saved = localStorage.getItem(SESSIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load sessions from localStorage', e);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }

  static saveSessions(sessions: SessionData[]) {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      // background sync to server
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessions),
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to save sessions', e);
    }
  }

  static addSession(newSession: Omit<SessionData, 'id' | 'createdAt'>): SessionData {
    const sessions = this.getSessions();
    const created: SessionData = {
      ...newSession,
      id: `session-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...sessions];
    this.saveSessions(updated);
    return created;
  }

  static updateSession(session: SessionData): SessionData[] {
    const sessions = this.getSessions();
    const updated = sessions.map((s) => (s.id === session.id ? session : s));
    this.saveSessions(updated);
    return updated;
  }

  static deleteSession(sessionId: string): SessionData[] {
    const sessions = this.getSessions();
    const updated = sessions.filter((s) => s.id !== sessionId);
    this.saveSessions(updated);
    return updated;
  }

  // --- Emotion Words Dictionary ---
  static getEmotionWords(): EmotionWord[] {
    try {
      const saved = localStorage.getItem(EMOTIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load emotions', e);
    }
    localStorage.setItem(EMOTIONS_KEY, JSON.stringify(INITIAL_EMOTION_WORDS));
    return INITIAL_EMOTION_WORDS;
  }

  static saveEmotionWords(words: EmotionWord[]) {
    try {
      localStorage.setItem(EMOTIONS_KEY, JSON.stringify(words));
      fetch('/api/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(words),
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to save emotions', e);
    }
  }

  static resetEmotionWords(): EmotionWord[] {
    this.saveEmotionWords(INITIAL_EMOTION_WORDS);
    return INITIAL_EMOTION_WORDS;
  }

  // --- Responses ---
  static getResponses(): EmotionResponse[] {
    try {
      const saved = localStorage.getItem(RESPONSES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load responses', e);
    }
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(INITIAL_RESPONSES));
    return INITIAL_RESPONSES;
  }

  static saveResponses(responses: EmotionResponse[]) {
    try {
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
      fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses),
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to save responses', e);
    }
  }

  static addResponse(response: Omit<EmotionResponse, 'id' | 'timestamp' | 'date'>): EmotionResponse {
    const responses = this.getResponses();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${dateStr} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newEntry: EmotionResponse = {
      ...response,
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timeStr,
      date: dateStr,
    };

    // If there's an existing response for the same session, student, and type, update it; otherwise append
    const existingIdx = responses.findIndex(
      (r) =>
        r.sessionId === newEntry.sessionId &&
        r.studentName === newEntry.studentName &&
        r.type === newEntry.type
    );

    let updated: EmotionResponse[];
    if (existingIdx >= 0) {
      updated = [...responses];
      updated[existingIdx] = newEntry;
    } else {
      updated = [newEntry, ...responses];
    }

    this.saveResponses(updated);

    // If Google Apps Script Webhook is configured, push to GAS
    this.syncToGasWebhook(newEntry);

    return newEntry;
  }

  static clearResponsesForSession(sessionId: string) {
    const responses = this.getResponses();
    const updated = responses.filter((r) => r.sessionId !== sessionId);
    this.saveResponses(updated);
    return updated;
  }

  // --- GAS Config ---
  static getGasConfig(): GasConfig {
    try {
      const saved = localStorage.getItem(GAS_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load gas config', e);
    }
    return {
      webhookUrl: '',
      autoSync: false,
    };
  }

  static saveGasConfig(config: GasConfig) {
    localStorage.setItem(GAS_CONFIG_KEY, JSON.stringify(config));
  }

  static async syncToGasWebhook(response: EmotionResponse): Promise<boolean> {
    const config = this.getGasConfig();
    if (!config.webhookUrl || !config.webhookUrl.startsWith('http')) {
      return false;
    }

    try {
      // Send as POST payload to Google Apps Script Web App
      await fetch(config.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script Web App redirect standard
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addResponse',
          data: {
            timestamp: response.timestamp,
            date: response.date,
            sessionName: response.sessionName,
            studentName: response.studentName,
            type: response.type === 'before' ? '수업 전' : '수업 후',
            categoryCode: response.categoryCode,
            categoryName: response.categoryName,
            emotionWord: response.emotionWord,
            comment: response.comment,
            rating: response.rating || '',
          },
        }),
      });

      config.lastSyncedAt = new Date().toLocaleString();
      this.saveGasConfig(config);
      return true;
    } catch (err) {
      console.error('GAS sync error:', err);
      return false;
    }
  }

  // --- Matching Before & After ---
  static getBeforeAfterPairs(sessionId?: string): BeforeAfterPair[] {
    const responses = this.getResponses();
    const filtered = sessionId ? responses.filter((r) => r.sessionId === sessionId) : responses;

    // Group by studentName + sessionId + date
    const pairMap = new Map<string, BeforeAfterPair>();

    filtered.forEach((r) => {
      const key = `${r.sessionId}_${r.studentName}_${r.date}`;
      if (!pairMap.has(key)) {
        pairMap.set(key, {
          studentName: r.studentName,
          sessionId: r.sessionId,
          sessionName: r.sessionName,
          date: r.date,
          hasBoth: false,
          status: 'before_only',
        });
      }

      const pair = pairMap.get(key)!;
      if (r.type === 'before') {
        pair.beforeResponse = r;
      } else if (r.type === 'after') {
        pair.afterResponse = r;
      }

      if (pair.beforeResponse && pair.afterResponse) {
        pair.hasBoth = true;
        pair.status = 'both';
      } else if (pair.beforeResponse && !pair.afterResponse) {
        pair.hasBoth = false;
        pair.status = 'before_only';
      } else if (!pair.beforeResponse && pair.afterResponse) {
        pair.hasBoth = false;
        pair.status = 'after_only';
      }
    });

    return Array.from(pairMap.values());
  }

  // --- Export Utilities ---
  static exportResponsesToCSV(sessionId?: string): string {
    const responses = this.getResponses();
    const filtered = sessionId ? responses.filter((r) => r.sessionId === sessionId) : responses;

    const headers = [
      '타임스탬프',
      '날짜',
      '수업명',
      '이름',
      '구분',
      '감정 카테고리',
      '상세 감정',
      '주관식 멘트(기대/소감)',
      '만족도(수업후)',
    ];

    const rows = filtered.map((r) => [
      `"${r.timestamp}"`,
      `"${r.date}"`,
      `"${r.sessionName.replace(/"/g, '""')}"`,
      `"${r.studentName}"`,
      `"${r.type === 'before' ? '수업 전' : '수업 후'}"`,
      `"${r.categoryName} (${r.categoryCode})"`,
      `"${r.emotionWord}"`,
      `"${r.comment.replace(/"/g, '""')}"`,
      `"${r.rating || ''}"`,
    ]);

    // Add UTF-8 BOM so Excel opens Korean text cleanly without mojibake
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return csvContent;
  }

  static downloadCSV(sessionId?: string, sessionTitle?: string) {
    const csv = this.exportResponsesToCSV(sessionId);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filename = `마음출석부_응답기록_${(sessionTitle || '전체').replace(/[\s/]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate Google Apps Script code for 1-click copy-paste into Google Sheets Script Editor
  static generateGoogleAppsScriptCode(): string {
    return `/**
 * =========================================================================
 * [마음 출석부 (Before & After)] Google Apps Script 자동화 코드
 * =========================================================================
 * 
 * 📌 설치 및 배포 방법 (1분 완료):
 * 1. 구글 드라이브에서 '새 Google 스프레드시트'를 만듭니다.
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 전체 코드를 붙여넣습니다.
 * 4. 상단 함수 선택에서 [setupSheets]를 선택 후 [실행] 버튼을 누릅니다 (권한 승인 완료).
 * 5. 우측 상단 파란색 [배포] -> [새 배포] 클릭
 *    - 유형 선택: [웹 앱]
 *    - 다음 사용자 권한으로 실행: [나]
 *    - 액세스 권한: [모든 사용자 (Anyone)]
 * 6. 생성된 '웹 앱 URL'을 마음 출석부 관리자 화면의 [GAS 웹앱 URL]에 등록하면 실시간 연동 완료!
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: 응답 기록 (Responses)
  var sheet1 = ss.getSheetByName("응답 기록") || ss.insertSheet("응답 기록", 0);
  sheet1.clear();
  var headers1 = [
    ["타임스탬프", "날짜", "수업명", "이름", "구분(전/후)", "카테고리 코드", "감정 카테고리", "상세 감정", "주관식 멘트(기대/소감)", "만족도"]
  ];
  sheet1.getRange(1, 1, 1, headers1[0].length).setValues(headers1)
    .setBackground("#10b981")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet1.setFrozenRows(1);
  sheet1.autoResizeColumns(1, headers1[0].length);

  // Sheet 2: 명단 관리 (Roster)
  var sheet2 = ss.getSheetByName("명단 관리") || ss.insertSheet("명단 관리", 1);
  sheet2.clear();
  var headers2 = [["수업명", "참여자 명단(쉼표 구분)", "등록일자"]];
  sheet2.getRange(1, 1, 1, headers2[0].length).setValues(headers2)
    .setBackground("#0284c7")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet2.setFrozenRows(1);

  // Sheet 3: 감정 사전 (Emotion Dictionary)
  var sheet3 = ss.getSheetByName("감정 사전") || ss.insertSheet("감정 사전", 2);
  sheet3.clear();
  var headers3 = [["카테고리 ID", "카테고리명", "감정 단어", "이모지"]];
  sheet3.getRange(1, 1, 1, headers3[0].length).setValues(headers3)
    .setBackground("#f59e0b")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet3.setFrozenRows(1);

  // 기본 감정 단어 채우기
  var defaultWords = [
    ["positive", "A. 긍정과 에너지", "설레는", "✨"],
    ["positive", "A. 긍정과 에너지", "기대되는", "🌟"],
    ["positive", "A. 긍정과 에너지", "의욕적인", "🔥"],
    ["positive", "A. 긍정과 에너지", "즐거운", "😊"],
    ["positive", "A. 긍정과 에너지", "활기찬", "⚡"],
    ["positive", "A. 긍정과 에너지", "궁금한", "🧐"],
    ["positive", "A. 긍정과 에너지", "자신감 있는", "💪"],
    ["positive", "A. 긍정과 에너지", "상쾌한", "🍃"],
    ["positive", "A. 긍정과 에너지", "행복한", "🥰"],
    ["positive", "A. 긍정과 에너지", "뿌듯한", "🏆"],
    ["positive", "A. 긍정과 에너지", "반가운", "🤝"],
    ["positive", "A. 긍정과 에너지", "열정적인", "🚀"],
    ["positive", "A. 긍정과 에너지", "감사한", "🙏"],
    ["positive", "A. 긍정과 에너지", "편안한", "🛋️"],
    ["positive", "A. 긍정과 에너지", "집중되는", "🎯"],

    ["calm", "B. 차분과 평온", "평온한", "🌿"],
    ["calm", "B. 차분과 평온", "담담한", "🧘"],
    ["calm", "B. 차분과 평온", "진지한", "📖"],
    ["calm", "B. 차분과 평온", "여유로운", "☕"],
    ["calm", "B. 차분과 평온", "무난한", "👌"],
    ["calm", "B. 차분과 평온", "조용한", "🤫"],
    ["calm", "B. 차분과 평온", "생각에 잠긴", "💭"],
    ["calm", "B. 차분과 평온", "차분한", "🍵"],
    ["calm", "B. 차분과 평온", "안정된", "⚓"],
    ["calm", "B. 차분과 평온", "그저 그런", "😐"],
    ["calm", "B. 차분과 평온", "수용적인", "👂"],
    ["calm", "B. 차분과 평온", "신중한", "⚖️"],
    ["calm", "B. 차분과 평온", "담백한", "🌾"],
    ["calm", "B. 차분과 평온", "평범한", "☁️"],
    ["calm", "B. 차분과 평온", "멍한", "😶"],

    ["tense", "C. 피로와 긴장", "피곤한", "🥱"],
    ["tense", "C. 피로와 긴장", "졸린", "💤"],
    ["tense", "C. 피로와 긴장", "긴장되는", "💓"],
    ["tense", "C. 피로와 긴장", "걱정되는", "😟"],
    ["tense", "C. 피로와 긴장", "막막한", "🌫️"],
    ["tense", "C. 피로와 긴장", "어색한", "😅"],
    ["tense", "C. 피로와 긴장", "부담스러운", "🧱"],
    ["tense", "C. 피로와 긴장", "지친", "🔋"],
    ["tense", "C. 피로와 긴장", "예민한", "⚡"],
    ["tense", "C. 피로와 긴장", "혼란스러운", "🌀"],
    ["tense", "C. 피로와 긴장", "서툰", "🌱"],
    ["tense", "C. 피로와 긴장", "쉬고 싶은", "🛌"],
    ["tense", "C. 피로와 긴장", "불안한", "😰"],
    ["tense", "C. 피로와 긴장", "힘든", "💦"],
    ["tense", "C. 피로와 긴장", "조심스러운", "🐾"]
  ];
  sheet3.getRange(2, 1, defaultWords.length, 4).setValues(defaultWords);
  sheet3.autoResizeColumns(1, 4);

  SpreadsheetApp.flush();
  Logger.log("✅ 마음 출석부 시트 3개 (응답 기록, 명단 관리, 감정 사전) 초기화 완료!");
}

/**
 * 웹앱 요청 핸들러 (doPost / doGet)
 */
function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : "{}";
    var payload = JSON.parse(rawData);
    var action = payload.action;
    var data = payload.data;

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "addResponse" && data) {
      var sheet = ss.getSheetByName("응답 기록") || ss.insertSheet("응답 기록");
      sheet.appendRow([
        data.timestamp || new Date().toLocaleString(),
        data.date || Utilities.formatDate(new Date(), "GMT+9", "yyyy-MM-dd"),
        data.sessionName || "",
        data.studentName || "",
        data.type || "",
        data.categoryCode || "",
        data.categoryName || "",
        data.emotionWord || "",
        data.comment || "",
        data.rating || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "기록되었습니다." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "마음 출석부 (Before & After) Google Sheets API",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
  }
}
