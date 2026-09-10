import { useState, useRef, useEffect, useCallback } from 'react';
import { TalkMode, TalkState } from '../types/hologram';

export function useAudioAnalyzer() {
  const [talkMode, setTalkMode] = useState<TalkMode>('none');
  const [hudAmp, setHudAmp] = useState<number>(0);
  const [hudBands, setHudBands] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  const talkRef = useRef<TalkState>({
    amplitude: 0,
    smoothAmp: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    active: false,
    mode: 'none',
    simPhase: 0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopMic = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;

    talkRef.current.mode = 'none';
    talkRef.current.active = false;
    talkRef.current.amplitude = 0;
    talkRef.current.smoothAmp = 0;
    talkRef.current.bass = 0;
    talkRef.current.mid = 0;
    talkRef.current.treble = 0;
    setTalkMode('none');
    setHudAmp(0);
    setHudBands([0, 0, 0, 0, 0, 0, 0, 0]);
  }, []);

  const startMic = useCallback(async () => {
    try {
      if (talkRef.current.mode === 'sim') {
        talkRef.current.mode = 'none';
        talkRef.current.active = false;
      }

      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85; // High smoothing for fluid organic curves
      source.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      talkRef.current.mode = 'mic';
      talkRef.current.active = true;
      setTalkMode('mic');
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      stopMic();
    }
  }, [stopMic]);

  const toggleSim = useCallback(() => {
    if (talkRef.current.mode === 'mic') {
      stopMic();
    }

    if (talkRef.current.mode === 'sim') {
      talkRef.current.mode = 'none';
      talkRef.current.active = false;
      talkRef.current.amplitude = 0;
      talkRef.current.smoothAmp = 0;
      talkRef.current.bass = 0;
      talkRef.current.mid = 0;
      talkRef.current.treble = 0;
      setTalkMode('none');
      setHudAmp(0);
      setHudBands([0, 0, 0, 0, 0, 0, 0, 0]);
    } else {
      talkRef.current.mode = 'sim';
      talkRef.current.active = true;
      talkRef.current.simPhase = Math.random() * 50;
      setTalkMode('sim');
    }
  }, [stopMic]);

  const toggleMic = useCallback(() => {
    if (talkRef.current.mode === 'mic') {
      stopMic();
    } else {
      startMic();
    }
  }, [startMic, stopMic]);

  // Frame tick audio calculation with asymmetric attack / decay
  const updateAmplitude = useCallback(() => {
    const T = talkRef.current;

    if (T.mode === 'mic' && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(
        dataArrayRef.current as unknown as Uint8Array<ArrayBuffer>
      );
      const data = dataArrayRef.current;

      // Extract frequency bands
      // Bass: bins 0 to 8 (~0 - 350 Hz)
      let sumBass = 0;
      for (let i = 0; i < 8; i++) sumBass += data[i];
      const rawBass = Math.min(1, (sumBass / 8 / 180));

      // Mid (Voice Core): bins 8 to 45 (~350 - 2000 Hz)
      let sumMid = 0;
      for (let i = 8; i < 45; i++) sumMid += data[i];
      const rawMid = Math.min(1, (sumMid / 37 / 140));

      // Treble (consonants/sibilance): bins 45 to 130 (~2000 - 6000 Hz)
      let sumTreble = 0;
      for (let i = 45; i < 130; i++) sumTreble += data[i];
      const rawTreble = Math.min(1, (sumTreble / 85 / 100));

      // Overall voice target
      const targetAmp = Math.min(1, rawMid * 0.6 + rawBass * 0.25 + rawTreble * 0.15);

      // Organic asymmetric smoothing (quick attack, smooth decay, never jumping)
      const attack = 0.28;
      const decay = 0.08;
      const rate = targetAmp > T.smoothAmp ? attack : decay;
      T.smoothAmp += (targetAmp - T.smoothAmp) * rate;

      const bassRate = rawBass > T.bass ? 0.25 : 0.08;
      T.bass += (rawBass - T.bass) * bassRate;

      const midRate = rawMid > T.mid ? 0.28 : 0.08;
      T.mid += (rawMid - T.mid) * midRate;

      const trebleRate = rawTreble > T.treble ? 0.35 : 0.10;
      T.treble += (rawTreble - T.treble) * trebleRate;

      T.amplitude = targetAmp;
    } else if (T.mode === 'sim') {
      // Fluid vocal envelope simulation (smooth, natural cadence without hard cut jumps)
      T.simPhase += 0.016;
      const p = T.simPhase;

      // Sentence / breath wave (period ~6s)
      const breath = Math.sin(p * 1.05) * 0.5 + 0.5;
      // Phrase wave (period ~2s)
      const phrase = Math.sin(p * 3.1) * 0.5 + 0.5;
      // Syllables wave (period ~0.4s)
      const syllable = Math.sin(p * 8.4) * 0.5 + 0.5;
      // Micro inflections
      const micro = Math.sin(p * 14.2) * 0.5 + 0.5;

      // Organic vocal envelope: smooth multiplication avoids binary cuts
      const envelope = breath * (phrase * 0.65 + 0.35) * (syllable * 0.55 + micro * 0.25 + 0.2);
      const targetAmp = Math.min(1, Math.max(0, envelope * 1.1));

      // Asymmetric fluid smoothing
      const rate = targetAmp > T.smoothAmp ? 0.22 : 0.07;
      T.smoothAmp += (targetAmp - T.smoothAmp) * rate;

      T.bass = T.smoothAmp * (Math.sin(p * 4.2) * 0.3 + 0.7);
      T.mid = T.smoothAmp * 1.05;
      T.treble = T.smoothAmp * (Math.sin(p * 12.1) * 0.4 + 0.6);
      T.amplitude = targetAmp;
    } else {
      // Idle smooth decay
      T.smoothAmp *= 0.92;
      T.bass *= 0.92;
      T.mid *= 0.92;
      T.treble *= 0.92;
      T.amplitude *= 0.90;
    }

    return T.smoothAmp;
  }, []);

  // Update HUD bands & amplitude for visualizer
  useEffect(() => {
    const interval = setInterval(() => {
      const T = talkRef.current;
      if (T.active || T.smoothAmp > 0.005) {
        setHudAmp(T.smoothAmp);

        if (T.mode === 'mic' && analyserRef.current && dataArrayRef.current) {
          const data = dataArrayRef.current;
          const bands: number[] = [];
          const step = Math.floor(64 / 8);
          for (let b = 0; b < 8; b++) {
            let sum = 0;
            for (let i = b * step; i < (b + 1) * step; i++) {
              sum += data[i];
            }
            bands.push(Math.min(1, sum / step / 170));
          }
          setHudBands(bands);
        } else if (T.mode === 'sim') {
          const p = T.simPhase;
          const bands = Array.from({ length: 8 }).map((_, i) => {
            const val = T.smoothAmp * (Math.sin(p * 5 + i * 0.8) * 0.4 + 0.6);
            return Math.min(1, Math.max(0, val));
          });
          setHudBands(bands);
        }
      } else {
        setHudAmp(0);
        setHudBands([0, 0, 0, 0, 0, 0, 0, 0]);
      }
    }, 33);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts ('m' for mic, 't' for sim)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        toggleSim();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMic, toggleSim]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  return {
    talkMode,
    hudAmp,
    hudBands,
    talkRef,
    toggleMic,
    toggleSim,
    updateAmplitude,
  };
}
