import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory persistent cache for server lifecycle
let serverSessions: any[] = [];
let serverResponses: any[] = [];
let serverEmotions: any[] = [];

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ================= API ROUTES =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sessions API
app.get('/api/sessions', (req, res) => {
  res.json({ sessions: serverSessions });
});

app.post('/api/sessions', (req, res) => {
  serverSessions = req.body || [];
  res.json({ success: true, count: serverSessions.length });
});

// Responses API
app.get('/api/responses', (req, res) => {
  res.json({ responses: serverResponses });
});

app.post('/api/responses', (req, res) => {
  serverResponses = req.body || [];
  res.json({ success: true, count: serverResponses.length });
});

// Emotions Dictionary API
app.get('/api/emotions', (req, res) => {
  res.json({ emotions: serverEmotions });
});

app.post('/api/emotions', (req, res) => {
  serverEmotions = req.body || [];
  res.json({ success: true, count: serverEmotions.length });
});

// AI Report Generation (사후 교육 효과 및 감정 변화 1초 보고서)
app.post('/api/gemini/analyze-report', async (req, res) => {
  try {
    const { sessionTitle, instructorName, pairs, beforeList, afterList } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const ai = getAi();

    const prompt = `
당신은 대한민국 최고의 교육 효과 분석 및 감정 코칭 전문가입니다.
다음은 수업/연수 참여자들의 '수업 전(Before) 기분/기대평'과 '수업 후(After) 기분/소감' 데이터입니다.

[수업 기본 정보]
- 수업/연수명: ${sessionTitle || '연수 세션'}
- 강사/진행자: ${instructorName || '선생님'}
- 사전 응답 수: ${beforeList?.length || 0}명
- 사후 응답 수: ${afterList?.length || 0}명
- 1:1 매칭 완료 인원: ${pairs?.length || 0}명

[1:1 매칭 데이터 샘플]
${JSON.stringify(pairs || [], null, 2)}

[수업 전 주요 응답 샘플]
${JSON.stringify(beforeList || [], null, 2)}

[수업 후 주요 응답 샘플]
${JSON.stringify(afterList || [], null, 2)}

위 데이터를 정밀 분석하여 강사와 교육 관리자가 보고서 및 차기 수업 개선에 바로 활용할 수 있는 [마음 출석부 Before & After 교육 효과 분석 보고서]를 마크다운(Markdown)과 요약 지표 형식으로 작성해주세요.

다음 항목들을 명확하고 구체적인 수치(변화율 %), 실제 참여자 발언 인용과 함께 포함해야 합니다:
1. 🎯 총평 및 핵심 교육 성과 요약 (한눈에 보는 성과 3줄)
2. 📊 감정 변화 지형도 (수업 전 '피로/긴장/막막함'에서 수업 후 '긍정/자신감/뿌듯함'으로의 전환율 및 통계)
3. 💬 수업 전 기대감과 우려사항 분석 (참여자들의 사전 니즈)
4. 💡 수업 후 학습 만족도 및 핵심 깨달음 (가장 반응이 좋았던 지점)
5. 🚀 강사를 위한 향후 수업 설계 및 피드백 제언 (구체적 실천 팁 3가지)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          '당신은 교육학 및 심리학 전문가로서 신뢰할 수 있고 전문적이며 따뜻한 어조로 교육 효과 분석 보고서를 작성합니다. 실제 참여자들의 감정 단어와 멘트를 풍부하게 인용하고 데이터 기반의 인사이트를 제공하세요.',
        temperature: 0.7,
      },
    });

    const markdownReport = response.text || '보고서를 생성하지 못했습니다.';

    res.json({
      success: true,
      report: markdownReport,
      generatedAt: new Date().toLocaleString(),
    });
  } catch (error: any) {
    console.error('Error generating AI report:', error);
    res.status(500).json({
      error: error.message || 'AI 보고서 생성 중 오류가 발생했습니다.',
    });
  }
});

// ================= VITE / STATIC SERVING =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 마음 출석부 서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

startServer();
