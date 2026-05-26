'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOTAL_QUESTIONS } from '@/lib/constants';
import {
  useGetNextQuestionMutation,
  useSubmitAnswerMutation,
  useFinishInterviewMutation,
} from '@/store/api/interviewApi';
import type { StoredSessionInfo, NextQuestionResponse } from '@/lib/types';

const CIRCUMFERENCE = 2 * Math.PI * 52; // 326.7

type Screen = 'loading' | 'interview' | 'done';
type Phase = 'idle' | 'think' | 'speak';

interface QuestionState {
  id: number;
  number: number;
  text: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  thinkTime: number;
  answerTime: number;
  totalQuestions: number;
}

export default function InterviewRoom({ sessionId }: { sessionId: number }) {
  const router = useRouter();

  // RTK Query mutations for the interview flow
  const [getNextQuestion] = useGetNextQuestionMutation();
  const [submitAnswerMutation] = useSubmitAnswerMutation();
  const [finishInterviewMutation] = useFinishInterviewMutation();

  // Session info from localStorage – initialised lazily to avoid setState-in-effect
  const [sessionInfo] = useState<StoredSessionInfo | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(`session_${sessionId}`);
    return raw ? (JSON.parse(raw) as StoredSessionInfo) : null;
  });

  // UI state
  const [screen, setScreen] = useState<Screen>('loading');
  const [phase, setPhase] = useState<Phase>('idle');
  const [question, setQuestion] = useState<QuestionState | null>(null);
  const [transcript, setTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Waiting for question…');
  const [voiceStatusClass, setVoiceStatusClass] = useState('');
  const [timerDisplay, setTimerDisplay] = useState('--');
  const [timerOffset, setTimerOffset] = useState(0);
  const [timerColor, setTimerColor] = useState('var(--accent)');
  const [timerDisplayColor, setTimerDisplayColor] = useState('var(--text)');
  const [isRecording, setIsRecording] = useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [skipBtnDisabled, setSkipBtnDisabled] = useState(true);
  const [micBtnDisabled, setMicBtnDisabled] = useState(true);
  const [nextBtnLabel, setNextBtnLabel] = useState('Submit & Next Question');
  const [evalStatus, setEvalStatus] = useState('Running technical evaluation…');
  const [completedDots, setCompletedDots] = useState<number[]>([]);
  const [currentDot, setCurrentDot] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [waveBars, setWaveBars] = useState<number[]>(Array(14).fill(4));

  // Refs for mutable values that shouldn't cause re-renders
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveAnimRef = useRef<number | null>(null);
  const transcriptFinalRef = useRef('');
  const answerSubmittedRef = useRef(false);
  const currentQuestionRef = useRef<QuestionState | null>(null);
  const totalQRef = useRef(TOTAL_QUESTIONS);
  // Prevents React Strict Mode double-invocation from creating duplicate questions
  const initializedRef = useRef(false);
  // Pre-granted mic stream reused across all questions
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setupSpeechRecognition();
    requestMicThenStart();
    return () => {
      clearTimerInterval();
      if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
      if (speechRecRef.current) { try { speechRecRef.current.stop(); } catch { /* noop */ } }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Request mic permission upfront (dialog appears on the loading screen, not mid-question)
  async function requestMicThenStart() {
    try {
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Permission denied — user will see error when they try to record
    }
    await loadNextQuestion();
  }

  // ── Speech Recognition ────────────────────────────────────────
  function setupSpeechRecognition() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRec = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceStatus('Speech API not supported. Type your answer.');
      setVoiceStatusClass('error');
      return;
    }
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      transcriptFinalRef.current += final;
      setTranscript(transcriptFinalRef.current + interim);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === 'no-speech') return;
      setVoiceStatus(`Mic error: ${e.error}. Please type.`);
      setVoiceStatusClass('error');
    };
    speechRecRef.current = rec;
  }


  // ── Timer ─────────────────────────────────────────────────────
  function clearTimerInterval() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function startCountdown(seconds: number, color: string, onComplete: () => void) {
    let remaining = seconds;
    setTimerColor(color);
    updateTimerDisplay(remaining, seconds, color);
    timerRef.current = setInterval(() => {
      remaining--;
      updateTimerDisplay(remaining, seconds, color);
      if (remaining <= 0) { clearTimerInterval(); onComplete(); }
    }, 1000);
  }

  function updateTimerDisplay(remaining: number, total: number, baseColor: string) {
    setTimerDisplay(String(remaining));
    setTimerOffset(CIRCUMFERENCE * (1 - remaining / total));
    if (remaining <= 5) {
      setTimerColor('var(--danger)');
      setTimerDisplayColor('var(--danger)');
    } else {
      setTimerColor(baseColor);
      setTimerDisplayColor('var(--text)');
    }
  }

  function resetTimer() {
    clearTimerInterval();
    setTimerDisplay('--');
    setTimerOffset(0);
  }

  // ── Question flow ─────────────────────────────────────────────
  async function loadNextQuestion() {
    window.speechSynthesis?.cancel();
    setScreen('loading');
    resetTimer();

    const data: NextQuestionResponse | { done: true } = await getNextQuestion(sessionId).unwrap();
    if ('done' in data && data.done) {
      await finishInterview();
      return;
    }

    const q = data as NextQuestionResponse;
    totalQRef.current = q.total_questions;
    const qState: QuestionState = {
      id: q.question_id,
      number: q.question_number,
      text: q.question_text,
      topic: q.topic,
      difficulty: q.difficulty,
      thinkTime: q.think_time,
      answerTime: q.answer_time,
      totalQuestions: q.total_questions,
    };
    currentQuestionRef.current = qState;
    setQuestion(qState);
    answerSubmittedRef.current = false;

    setTranscript('');
    transcriptFinalRef.current = '';
    setNextBtnDisabled(true);
    setSkipBtnDisabled(true);
    setMicBtnDisabled(true);
    setNextBtnLabel('Submit & Next Question');

    updateProgress(q.question_number - 1, q.question_number, q.total_questions);
    setScreen('interview');
    speakText(q.question_text);
    startThinkTimer(qState);
  }

  function startThinkTimer(q: QuestionState) {
    setPhase('think');
    setVoiceStatus('Read the question carefully…');
    setVoiceStatusClass('');
    setSkipBtnDisabled(false);
    startCountdown(q.thinkTime, '#FFD700', () => startAnswerTimer(q));
  }

  async function startAnswerTimer(q: QuestionState) {
    setPhase('speak');
    setMicBtnDisabled(false);
    setNextBtnDisabled(false);
    setVoiceStatus('Recording active – speak your answer');
    setVoiceStatusClass('active');
    // Await recording so the countdown starts only after the mic is live
    // (stream is pre-granted so this resolves immediately — no permission dialog)
    await startRecording();
    startCountdown(q.answerTime, '#00d4aa', () => {
      stopRecording();
      setPhase('idle');
      setVoiceStatus('Time up – submit when ready');
      setVoiceStatusClass('');
    });
  }

  // ── Recording ─────────────────────────────────────────────────
  async function startRecording() {
    if (speechRecRef.current) {
      try { speechRecRef.current.start(); } catch { /* already started */ }
    }

    // Reuse the pre-granted stream; only re-request if it was closed or denied
    let stream = micStreamRef.current;
    const isLive = stream?.getTracks().some(t => t.readyState === 'live');
    if (!stream || !isLive) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      } catch {
        setVoiceStatus('Microphone denied. Please type your answer.');
        setVoiceStatusClass('error');
        return;
      }
    }

    const mr = new MediaRecorder(stream);
    audioChunksRef.current = [];
    mr.ondataavailable = e => audioChunksRef.current.push(e.data);
    mr.start(100);
    mediaRecorderRef.current = mr;
    setIsRecording(true);
    startWaveform(stream);
  }

  function stopRecording() {
    if (speechRecRef.current) { try { speechRecRef.current.stop(); } catch { /* noop */ } }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      stopWaveform();
    }
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
      setVoiceStatus('Recording stopped. Submit when ready.');
      setVoiceStatusClass('');
    } else {
      startRecording();
      setVoiceStatus('Recording…');
      setVoiceStatusClass('active');
    }
  }

  // ── Waveform ──────────────────────────────────────────────────
  function startWaveform(stream: MediaStream) {
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      animateWaveform();
    } catch { /* noop */ }
  }

  function animateWaveform() {
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser ? analyser.frequencyBinCount : 0);
    function frame() {
      waveAnimRef.current = requestAnimationFrame(frame);
      if (analyser) analyser.getByteFrequencyData(data);
      setWaveBars(Array.from({ length: 14 }, (_, i) => {
        const val = data[i % data.length] ?? 0;
        return Math.max(4, (val / 255) * 40);
      }));
    }
    frame();
  }

  function stopWaveform() {
    if (waveAnimRef.current) { cancelAnimationFrame(waveAnimRef.current); waveAnimRef.current = null; }
    setWaveBars(Array(14).fill(4));
  }

  // ── Submit & Next ─────────────────────────────────────────────
  async function submitAndNext() {
    if (answerSubmittedRef.current) return;
    answerSubmittedRef.current = true;
    stopRecording();
    clearTimerInterval();
    setNextBtnDisabled(true);
    setNextBtnLabel('Saving…');

    let audioBase64 = '';
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioBase64 = await blobToBase64(blob);
    }

    await submitAnswerMutation({
      sessionId,
      question_id: currentQuestionRef.current!.id,
      answer_text: transcript.trim(),
      audio_base64: audioBase64,
    }).unwrap();

    const q = currentQuestionRef.current!;
    updateProgress(q.number, q.number, q.totalQuestions);

    if (q.number >= totalQRef.current) {
      await finishInterview();
    } else {
      setNextBtnLabel('Submit & Next Question');
      await loadNextQuestion();
    }
  }

  async function skipQuestion() {
    clearTimerInterval();
    if (!transcript.trim()) setTranscript('(skipped)');
    await submitAndNext();
  }

  // ── Finish ────────────────────────────────────────────────────
  async function finishInterview() {
    setScreen('done');
    await finishInterviewMutation(sessionId).unwrap();
    setEvalStatus('Evaluation complete! Redirecting…');
    setTimeout(() => {
      router.push(`/results/${sessionId}`);
    }, 1500);
  }

  // ── Progress dots ─────────────────────────────────────────────
  function updateProgress(done: number, current: number, total: number) {
    setDoneCount(done);
    setCurrentDot(current);
    setCompletedDots(Array.from({ length: done }, (_, i) => i + 1));
    totalQRef.current = total;
  }

  // ── Helpers ───────────────────────────────────────────────────
  function speakText(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.lang = 'en-IN';
    window.speechSynthesis.speak(utt);
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }

  const totalQ = question?.totalQuestions ?? TOTAL_QUESTIONS;
  const progressPct = (doneCount / totalQ) * 100;

  const phaseStyle: Record<Phase, React.CSSProperties> = {
    think: { borderColor: 'var(--warn)', color: 'var(--warn)' },
    speak: { borderColor: 'var(--accent2)', color: 'var(--accent2)' },
    idle: { color: 'var(--text-muted)' },
  };

  const phaseLabel: Record<Phase, string> = {
    think: '🤔 Think Time',
    speak: '🎙️ Answer Now',
    idle: 'Ready',
  };

  const difficultyColors = { easy: 'var(--accent2)', medium: 'var(--warn)', hard: 'var(--danger)' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 60px)' }}>

      {/* Sidebar */}
      <aside style={{
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
            {sessionInfo?.candidate_name ?? 'Candidate'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {sessionInfo?.domain?.toUpperCase() ?? '—'} Interview
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {sessionInfo?.candidate_email ?? ''}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.8rem' }}>
            Progress
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.8rem' }}>
            {Array.from({ length: totalQ }, (_, i) => i + 1).map(n => (
              <div key={n} style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `2px solid ${completedDots.includes(n) ? 'var(--accent2)' : n === currentDot ? 'var(--accent)' : 'var(--border)'}`,
                background: completedDots.includes(n) ? 'var(--accent2)' : n === currentDot ? 'rgba(59,130,246,0.1)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontFamily: 'var(--mono)',
                color: completedDots.includes(n) ? '#000' : n === currentDot ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: completedDots.includes(n) ? 700 : 'normal',
              }}>
                {completedDots.includes(n) ? '✓' : n}
              </div>
            ))}
          </div>
          <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, transition: 'width 0.5s', background: 'linear-gradient(90deg, var(--accent), var(--accent2))', width: `${progressPct}%` }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {doneCount} of {totalQ} questions
          </div>
        </div>

        {sessionInfo?.topics && sessionInfo.topics.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.6rem' }}>
              Topics
            </h4>
            <div>
              {sessionInfo.topics.map(t => (
                <span key={t} style={{
                  display: 'inline-block', padding: '0.25rem 0.6rem', margin: 2,
                  borderRadius: 4, fontSize: '0.75rem', fontFamily: 'var(--mono)',
                  background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session ID</div>
          <div style={{ fontSize: '0.78rem', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>#{sessionId}</div>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ display: 'flex', flexDirection: 'column', padding: '2rem 2.5rem', gap: '1.5rem' }}>

        {/* Loading screen */}
        {screen === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1.5rem', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem' }}>⚙️</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Preparing your interview…</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>Setting up AI interviewer and loading knowledge base.</p>
            <div style={{ width: 200, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div className="animate-pulse-custom" style={{ height: '100%', borderRadius: 3, width: '60%', background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
            </div>
          </div>
        )}

        {/* Interview screen */}
        {screen === 'interview' && question && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

            {/* Phase + Timer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '0.8rem', fontFamily: 'var(--mono)',
                padding: '0.3rem 0.8rem', borderRadius: 20,
                background: 'var(--surface)', border: `1px solid ${phaseStyle[phase].borderColor ?? 'var(--border)'}`,
                color: phaseStyle[phase].color,
                animation: phase === 'speak' ? 'pulse 1.5s infinite' : 'none',
              }}>
                {phaseLabel[phase]}
              </span>

              {/* Timer ring */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle style={{ fill: 'none', stroke: 'var(--surface2)', strokeWidth: 8 }} cx="60" cy="60" r="52" />
                    <circle
                      style={{
                        fill: 'none', strokeWidth: 8, strokeLinecap: 'round',
                        stroke: timerColor,
                        strokeDasharray: CIRCUMFERENCE,
                        strokeDashoffset: timerOffset,
                        transition: 'stroke-dashoffset 1s linear, stroke 0.3s',
                      }}
                      cx="60" cy="60" r="52"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: timerDisplayColor }}>{timerDisplay}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SEC</span>
                  </div>
                </div>
              </div>

              <div style={{ width: 80 }} />
            </div>

            {/* Question card */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem',
              position: 'relative', overflow: 'hidden', flex: 1,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Q{question.number} / {question.totalQuestions}
                </span>
                <span style={{
                  fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 4,
                  background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', fontFamily: 'var(--mono)',
                }}>
                  {question.topic}
                </span>
                <span style={{
                  display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--mono)',
                  background: question.difficulty === 'easy' ? 'rgba(34,197,94,0.15)' : question.difficulty === 'medium' ? 'rgba(249,115,22,0.15)' : 'rgba(239,68,68,0.15)',
                  color: difficultyColors[question.difficulty],
                }}>
                  {question.difficulty}
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5, letterSpacing: '-0.3px', minHeight: 60 }}>
                {question.text}
              </div>
            </div>

            {/* Answer area */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>
                🎤 Your Answer
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={toggleRecording}
                  disabled={micBtnDisabled}
                  style={{
                    width: 56, height: 56, borderRadius: '50%', border: `2px solid ${isRecording ? 'var(--danger)' : 'var(--border)'}`,
                    background: isRecording ? 'rgba(239,68,68,0.2)' : 'var(--surface2)',
                    fontSize: '1.5rem', cursor: micBtnDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: micBtnDisabled ? 0.3 : 1,
                    animation: isRecording ? 'pulse 1s infinite' : 'none',
                  }}
                >
                  {isRecording ? '⏹️' : '🎙️'}
                </button>
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="Your spoken answer will appear here. You can also type directly."
                  rows={3}
                  style={{
                    flex: 1, minHeight: 80, padding: '0.8rem 1rem',
                    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10,
                    fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)',
                    resize: 'none', fontFamily: 'var(--font)', outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.8rem', fontFamily: 'var(--mono)',
                  color: voiceStatusClass === 'active' ? 'var(--accent2)' : voiceStatusClass === 'error' ? 'var(--danger)' : 'var(--text-muted)',
                }}>
                  {voiceStatus}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 40 }}>
                  {waveBars.map((h, i) => (
                    <div key={i} style={{
                      width: 4, background: 'var(--accent2)', borderRadius: 2,
                      height: h, transition: 'height 0.1s',
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <button
                  onClick={skipQuestion}
                  disabled={skipBtnDisabled}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.4rem', borderRadius: 8,
                    fontFamily: 'var(--font)', fontSize: '0.9rem', fontWeight: 600,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: skipBtnDisabled ? 'not-allowed' : 'pointer',
                    opacity: skipBtnDisabled ? 0.3 : 1,
                  }}
                >
                  Skip →
                </button>
              </div>
              <button
                onClick={submitAndNext}
                disabled={nextBtnDisabled}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.4rem', borderRadius: 8,
                  fontFamily: 'var(--font)', fontSize: '0.9rem', fontWeight: 600,
                  border: 'none', background: 'var(--accent)', color: '#fff',
                  cursor: nextBtnDisabled ? 'not-allowed' : 'pointer',
                  opacity: nextBtnDisabled ? 0.3 : 1,
                }}
              >
                {nextBtnLabel}
              </button>
            </div>
          </div>
        )}

        {/* Completion screen */}
        {screen === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1.5rem', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem' }}>✅</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Interview Complete!</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>
              All {totalQ} questions answered. Submitting for AI evaluation — this may take 30–60 seconds.
            </p>
            <div style={{ width: 200, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div className="animate-pulse-custom" style={{ height: '100%', borderRadius: 3, width: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', color: 'var(--accent2)' }}>
              {evalStatus}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
