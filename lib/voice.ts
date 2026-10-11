"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Voice search (CLAUDE.md "Voice search"): browser Speech Recognition,
// progressive enhancement. Never blocks typing. In Chrome the audio is sent
// to Google's speech service (mentioned on the privacy page).

// "starting": recognition requested, waiting for the microphone (and the
// browser's permission prompt). "listening": the microphone is actually on.
export type VoiceStatus = "idle" | "starting" | "listening" | "unsupported" | "denied" | "noMatch";

// Minimal typing for the (still prefixed in Chrome) Web Speech API.
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onaudiostart: (() => void) | null;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * `onText` receives the recognised text live (interim results), then the final text.
 * Status "unsupported" is only reported after the reader presses the button.
 */
export function useVoiceSearch({ lang, onText }: { lang: string; onText: (text: string) => void }) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const heardSomething = useRef(false);
  const onTextRef = useRef(onText);
  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  const stop = useCallback(() => {
    recognition.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognition();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }
    recognition.current?.abort();
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    heardSomething.current = false;
    setTranscript("");

    r.onaudiostart = () => setStatus((s) => (s === "starting" ? "listening" : s));
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      text = text.trim();
      if (text) {
        heardSomething.current = true;
        setStatus((s) => (s === "starting" ? "listening" : s));
        setTranscript(text);
        onTextRef.current(text);
      }
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setStatus("denied");
      else if (e.error === "aborted") setStatus("idle");
      else setStatus("noMatch");
    };
    r.onend = () => {
      recognition.current = null;
      setStatus((s) => (s === "listening" || s === "starting" ? (heardSomething.current ? "idle" : "noMatch") : s));
    };

    recognition.current = r;
    setStatus("starting");
    try {
      r.start();
    } catch {
      setStatus("noMatch");
    }
  }, [lang]);

  // Stop listening when the component goes away.
  useEffect(() => () => recognition.current?.abort(), []);

  // Stop without keeping the "not understood" result (closing the window).
  const cancel = useCallback(() => {
    const r = recognition.current;
    recognition.current = null;
    if (r) {
      r.onend = null;
      r.onerror = null;
      r.abort();
    }
    setStatus("idle");
  }, []);

  return { status, transcript, start, stop, cancel, reset: () => setStatus("idle") };
}
