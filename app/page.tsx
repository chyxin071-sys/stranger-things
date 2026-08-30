'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import QRCode from 'qrcode';

type Letter = {
  char: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  colorName: string;
};

type Bulb = {
  id: string;
  x: number;
  y: number;
  color: string;
  size?: number;
  letter?: string;
};

const targetSize = 5.6;
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const palette = {
  green: '#58ff8b',
  blue: '#65d8ff',
  pink: '#ff8fe9',
  amber: '#ffc04b',
  white: '#d8fff5',
  red: '#ff6b57',
};

const initialLetters: Letter[] = [
  { char: 'A', x: 33.6, y: 24.8, w: 5.3, h: 9.4, color: palette.red, colorName: '红色' },
  { char: 'B', x: 38.4, y: 23.4, w: 4.9, h: 8.8, color: palette.blue, colorName: '蓝/青' },
  { char: 'C', x: 43.0, y: 23.5, w: 4.7, h: 8.6, color: palette.amber, colorName: '黄/橙' },
  { char: 'D', x: 48.0, y: 25.0, w: 5.0, h: 8.4, color: palette.green, colorName: '绿色' },
  { char: 'E', x: 53.2, y: 25.2, w: 4.9, h: 8.4, color: palette.blue, colorName: '蓝/青' },
  { char: 'F', x: 58.3, y: 25.0, w: 4.6, h: 8.2, color: palette.amber, colorName: '黄/橙' },
  { char: 'G', x: 62.7, y: 24.7, w: 5.3, h: 8.6, color: palette.white, colorName: '冷白' },
  { char: 'H', x: 67.6, y: 23.5, w: 5.6, h: 8.7, color: palette.green, colorName: '绿色' },
  { char: 'I', x: 24.7, y: 39.2, w: 4.2, h: 10.8, color: palette.green, colorName: '绿色' },
  { char: 'J', x: 33.0, y: 39.6, w: 5.1, h: 9.3, color: palette.pink, colorName: '粉/紫' },
  { char: 'K', x: 38.0, y: 42.1, w: 4.5, h: 8.9, color: palette.blue, colorName: '蓝/青' },
  { char: 'L', x: 43.3, y: 43.6, w: 4.4, h: 8.2, color: palette.green, colorName: '绿色' },
  { char: 'M', x: 48.1, y: 43.1, w: 4.6, h: 8.9, color: palette.amber, colorName: '黄/橙' },
  { char: 'N', x: 52.6, y: 42.0, w: 4.9, h: 9.0, color: palette.red, colorName: '红/橙' },
  { char: 'O', x: 57.3, y: 39.0, w: 5.2, h: 10.0, color: palette.pink, colorName: '粉/紫' },
  { char: 'P', x: 62.0, y: 39.0, w: 4.9, h: 9.2, color: palette.blue, colorName: '蓝/青' },
  { char: 'Q', x: 70.4, y: 42.5, w: 5.6, h: 9.0, color: palette.white, colorName: '冷白' },
  { char: 'R', x: 31.0, y: 57.4, w: 5.0, h: 8.4, color: palette.green, colorName: '绿色' },
  { char: 'S', x: 35.8, y: 58.7, w: 4.3, h: 7.6, color: palette.red, colorName: '红色' },
  { char: 'T', x: 39.8, y: 60.0, w: 4.4, h: 7.5, color: palette.blue, colorName: '蓝/青' },
  { char: 'U', x: 46.0, y: 59.7, w: 4.8, h: 7.8, color: palette.blue, colorName: '蓝/青' },
  { char: 'V', x: 51.0, y: 57.9, w: 4.7, h: 8.1, color: palette.pink, colorName: '粉/紫' },
  { char: 'W', x: 55.2, y: 58.4, w: 5.4, h: 7.8, color: palette.blue, colorName: '蓝/青' },
  { char: 'X', x: 60.0, y: 57.1, w: 5.1, h: 8.6, color: palette.amber, colorName: '黄/橙' },
  { char: 'Y', x: 64.2, y: 56.5, w: 5.5, h: 9.8, color: palette.pink, colorName: '粉/紫' },
  { char: 'Z', x: 69.8, y: 58.2, w: 5.3, h: 7.9, color: palette.amber, colorName: '黄/橙' },
];

const letterMeta = new Map(initialLetters.map((letter) => [letter.char, letter]));

const initialBulbs: Bulb[] = [
  { id: 'top-a', x: 32.71874579263093, y: 17.792221966215152, color: palette.red, letter: 'A' },
  { id: 'top-b', x: 37.984501922300176, y: 17.248948013048278, color: palette.blue, letter: 'B', size: 1.1 },
  { id: 'top-c', x: 42.580070908193335, y: 17.326558577786404, color: palette.amber, letter: 'C' },
  { id: 'top-d', x: 48.420273161099225, y: 18.41310648412015, color: palette.green, letter: 'D' },
  { id: 'top-e', x: 53.015842146992384, y: 19.422043825715775, color: palette.blue, letter: 'E' },
  { id: 'top-f', x: 59.71771358475324, y: 20.353370602573275, color: palette.amber, letter: 'F', size: 0.7 },
  { id: 'top-g', x: 63.59522491660059, y: 18.180274789905777, color: palette.white, letter: 'G', size: 1.15 },
  { id: 'top-h', x: 69.24394512842761, y: 17.792221966215152, color: palette.green, letter: 'H' },
  { id: 'mid-i', x: 26.49557945756728, y: 30.520354583267643, color: palette.green, letter: 'I' },
  { id: 'mid-j', x: 33.72402650829506, y: 32.460618701720776, color: palette.pink, letter: 'J' },
  { id: 'mid-k', x: 38.12811345310934, y: 34.4008828201739, color: palette.blue, letter: 'K', size: 1.1 },
  { id: 'mid-l', x: 43.393869582778585, y: 34.86654620860264, color: palette.green, letter: 'L' },
  { id: 'mid-m', x: 49.42555387676336, y: 34.86654620860264, color: palette.amber, letter: 'M' },
  { id: 'mid-n', x: 53.92538184211707, y: 30.597965148005773, color: palette.red, letter: 'N', size: 0.65 },
  { id: 'mid-o', x: 59.909195625832126, y: 29.977080630100772, color: palette.pink, letter: 'O' },
  { id: 'mid-p', x: 63.45161338579144, y: 30.209912324315148, color: palette.blue, letter: 'P', size: 1.05 },
  { id: 'mid-q', x: 73.36080901162356, y: 32.15017644276828, color: palette.white, letter: 'Q' },
  { id: 'low-r', x: 29.846515176447706, y: 46.27529922510702, color: palette.green, letter: 'R' },
  { id: 'low-s', x: 36.883480186096605, y: 47.982731649345766, color: palette.red, letter: 'S' },
  { id: 'low-t', x: 40.090804374167874, y: 50.07821689727514, color: palette.blue, letter: 'T' },
  { id: 'low-u', x: 46.50545275031041, y: 48.68122673198889, color: palette.blue, letter: 'U' },
  { id: 'low-v', x: 51.29250377728245, y: 49.069279555679515, color: palette.pink, letter: 'V' },
  { id: 'low-w', x: 54.59556898589316, y: 47.36184713144077, color: palette.blue, letter: 'W' },
  { id: 'low-x', x: 59.8613251155624, y: 47.982731649345766, color: palette.amber, letter: 'X' },
  { id: 'low-y', x: 63.88244797821891, y: 46.12007809563077, color: palette.pink, letter: 'Y' },
  { id: 'low-z', x: 73.64803207324188, y: 46.74096261353577, color: palette.amber, letter: 'Z' },
];

const calibrationStorageKey = 'letter-wall-calibration-v2';
const localShareOrigin = 'http://192.168.2.105:3000';
const handModelUrl = '/mediapipe/hand_landmarker.task';
const visionWasmUrl = '/mediapipe/wasm';
const targetRadius = 4.2;
const holdDuration = 750;
const fingers = [
  { name: 'thumb', tip: 4, joint: 3, base: 2 },
  { name: 'index', tip: 8, joint: 6, base: 5 },
  { name: 'middle', tip: 12, joint: 10, base: 9 },
  { name: 'ring', tip: 16, joint: 14, base: 13 },
  { name: 'pinky', tip: 20, joint: 18, base: 17 },
];
const wirePaths = [
  'M 23 30 C 22 21, 25 18, 33 18 S 44 19, 49 19 S 62 18, 69 18 S 75 27, 81 25',
  'M 27 37 C 31 33, 35 40, 39 41 S 47 39, 54 36 S 62 34, 68 37 S 74 39, 78 36',
  'M 30 55 C 34 61, 38 54, 43 56 S 51 55, 56 54 S 64 57, 70 54 S 74 58, 76 54',
];

export default function Home() {
  const wallRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const handHoldRef = useRef<{ char: string; startedAt: number; picked: boolean } | null>(null);
  const lastSignalAtRef = useRef(0);
  const doubleOpenStartedAtRef = useRef<number | null>(null);
  const dragPanelRef = useRef<{ x: number; y: number } | null>(null);
  const [bulbs, setBulbs] = useState<Bulb[]>(initialBulbs);
  const [message, setMessage] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [sequenceLit, setSequenceLit] = useState<string[]>([]);
  const [sequencePlaying, setSequencePlaying] = useState(false);
  const [panic, setPanic] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [hold, setHold] = useState<string | null>(null);
  const [handPoint, setHandPoint] = useState<{ x: number; y: number; char?: string } | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'off' | 'loading' | 'on' | 'error'>('off');
  const [cameraPreviewVisible, setCameraPreviewVisible] = useState(true);
  const [cameraFrame, setCameraFrame] = useState({ x: 83.5, y: 70.5, width: 13.6 });
  const [isReceiver, setIsReceiver] = useState(false);
  const [receiverRoom, setReceiverRoom] = useState('');
  const [receiverMessage, setReceiverMessage] = useState<{ id: number; text: string } | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [receiverUrl, setReceiverUrl] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [connectOpen, setConnectOpen] = useState(false);
  const [sendText, setSendText] = useState('');
  const [calibrating, setCalibrating] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelPosition, setPanelPosition] = useState({ x: 2.2, y: 61 });
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (params.get('view') === 'receiver' && room) {
      setIsReceiver(true);
      setReceiverRoom(room.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (!isReceiver || !receiverRoom) return;
    let stopped = false;
    let lastMessageId = 0;

    async function pollRoom() {
      try {
        const response = await fetch(`/api/rooms/${receiverRoom}`, { cache: 'no-store' });
        const data = await response.json();
        if (!stopped && data.message && data.message.id !== lastMessageId) {
          lastMessageId = data.message.id;
          setReceiverMessage({ id: data.message.id, text: data.message.text });
        }
      } catch {
        // The receiver keeps polling quietly; temporary network misses are normal.
      }
    }

    void pollRoom();
    const interval = window.setInterval(pollRoom, 650);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [isReceiver, receiverRoom]);

  useEffect(() => {
    const saved = window.localStorage.getItem(calibrationStorageKey);
    if (!saved) return;
    try {
      const calibration = JSON.parse(saved) as { bulbs?: Bulb[] };
      if (calibration.bulbs?.length) setBulbs(calibration.bulbs);
    } catch {
      window.localStorage.removeItem(calibrationStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      calibrationStorageKey,
      JSON.stringify({ bulbs }),
    );
  }, [bulbs]);

  useEffect(() => {
    if (!panic) return;
    const timeout = window.setTimeout(() => setPanic(false), 3600);
    return () => window.clearTimeout(timeout);
  }, [panic]);

  function wait(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function playSignalSequence() {
    if (sequencePlaying) return;
    setSequencePlaying(true);
    setPanic(false);
    setBlackout(false);
    updateHandHold();

    const accumulated: string[] = [];
    for (const char of alphabet) {
      accumulated.push(char);
      setSequenceLit([...accumulated]);
      await wait(78);
    }
    await wait(180);

    const signalLetters = bulbs.filter((bulb) => bulb.letter).map((bulb) => bulb.letter!);
    for (let wave = 0; wave < 9; wave += 1) {
      const shuffled = [...signalLetters].sort(() => Math.random() - 0.5);
      setSequenceLit(shuffled.slice(0, 7 + (wave % 2)));
      await wait(135);
      setSequenceLit([]);
      await wait(42);
    }

    for (let i = 0; i < 2; i += 1) {
      for (const char of ['R', 'U', 'N']) {
        setSequenceLit([char]);
        await wait(260);
        setSequenceLit([]);
        await wait(95);
      }
      await wait(120);
    }

    for (let i = 0; i < 2; i += 1) {
      setSequenceLit(signalLetters);
      await wait(260);
      setSequenceLit([]);
      await wait(210);
    }

    setSequencePlaying(false);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function pickLetter(char: string) {
    if (calibrating) return;
    setActive(char);
    setMessage((current) => current + char);
    window.setTimeout(() => setActive(null), 900);
  }

  function beginHold(char?: string) {
    if (!char) return;
    if (calibrating) return;
    setHold(char);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      pickLetter(char);
      setHold(null);
    }, holdDuration);
  }

  function cancelHold() {
    setHold(null);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function findNearestLetter(x: number, y: number) {
    let nearest: { char: string; distance: number } | null = null;
    for (const bulb of bulbs) {
      if (!bulb.letter) continue;
      const dx = bulb.x - x;
      const dy = bulb.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance <= targetRadius && (!nearest || distance < nearest.distance)) {
        nearest = { char: bulb.letter, distance };
      }
    }
    return nearest?.char;
  }

  function getExtendedFingers(landmarks: { x: number; y: number }[]) {
    const wrist = landmarks[0];
    if (!wrist) return [];

    return fingers.filter((finger) => {
      const tip = landmarks[finger.tip];
      const joint = landmarks[finger.joint];
      const base = landmarks[finger.base];
      if (!tip || !joint || !base) return false;

      const wristToTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const wristToJoint = Math.hypot(joint.x - wrist.x, joint.y - wrist.y);
      const baseToTip = Math.hypot(tip.x - base.x, tip.y - base.y);
      const baseToJoint = Math.hypot(joint.x - base.x, joint.y - base.y);

      return wristToTip > wristToJoint * 1.13 && baseToTip > baseToJoint * 1.1;
    });
  }

  function getPointingFinger(extendedFingers: typeof fingers) {
    if (extendedFingers.length === 1) return extendedFingers[0];
    if (extendedFingers.length === 2) {
      const withoutThumb = extendedFingers.filter((finger) => finger.name !== 'thumb');
      if (withoutThumb.length === 1) return withoutThumb[0];
    }
    return null;
  }

  function isFist(landmarks: { x: number; y: number }[]) {
    return getExtendedFingers(landmarks).length === 0;
  }

  function updateHandHold(char?: string) {
    if (!char) {
      handHoldRef.current = null;
      setHold(null);
      return;
    }
    const now = performance.now();
    if (handHoldRef.current?.char !== char) {
      handHoldRef.current = { char, startedAt: now, picked: false };
      setHold(char);
      return;
    }
    if (!handHoldRef.current.picked && now - handHoldRef.current.startedAt > 2000) {
      handHoldRef.current.picked = true;
      pickLetter(char);
    }
  }

  function drawHandPointer(point?: { x: number; y: number }) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const width = canvas.clientWidth || 240;
    const height = canvas.clientHeight || 135;
    const pixelRatio = window.devicePixelRatio || 1;

    if (canvas.width !== Math.round(width * pixelRatio) || canvas.height !== Math.round(height * pixelRatio)) {
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    if (!point) return;

    const x = (point.x / 100) * width;
    const y = (point.y / 100) * height;
    context.fillStyle = 'rgba(255, 247, 220, 0.98)';
    context.strokeStyle = 'rgba(105, 221, 255, 0.82)';
    context.shadowColor = 'rgba(105, 221, 255, 0.9)';
    context.shadowBlur = 6;
    context.beginPath();
    context.arc(x, y, 3.2, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, 5.8, 0, Math.PI * 2);
    context.stroke();
  }

  function detectFrame() {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      frameRef.current = window.requestAnimationFrame(detectFrame);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const result = landmarker.detectForVideo(video, performance.now());
      const hands = result.landmarks ?? [];

      if (!hands.length) {
        drawHandPointer();
        setHandPoint(null);
        updateHandHold();
        setBlackout(false);
      } else {
        const now = performance.now();
        const openHands = hands.filter((hand) => getExtendedFingers(hand).length >= 4);

        if (openHands.length >= 2) {
          doubleOpenStartedAtRef.current ??= now;
          if (now - doubleOpenStartedAtRef.current > 800 && now - lastSignalAtRef.current > 7000) {
            lastSignalAtRef.current = now;
            doubleOpenStartedAtRef.current = null;
            setBlackout(false);
            setHandPoint(null);
            updateHandHold();
            drawHandPointer();
            void playSignalSequence();
            frameRef.current = window.requestAnimationFrame(detectFrame);
            return;
          }
        } else {
          doubleOpenStartedAtRef.current = null;
        }

        const landmarks = hands[0];
        const extendedFingers = getExtendedFingers(landmarks);
        const pointingFinger = getPointingFinger(extendedFingers);
        const tip = pointingFinger ? landmarks[pointingFinger.tip] : landmarks[8];
        const point = {
          x: Math.max(0, Math.min(100, (1 - tip.x) * 100)),
          y: Math.max(0, Math.min(100, tip.y * 100)),
        };

        drawHandPointer(pointingFinger ? point : undefined);

        if (isFist(landmarks)) {
          setBlackout(true);
          updateHandHold();
          setHandPoint(point);
        } else if (pointingFinger) {
          setBlackout(false);
          const char = findNearestLetter(point.x, point.y);
          setHandPoint({ ...point, char });
          updateHandHold(char);
        } else {
          setBlackout(false);
          setHandPoint(point);
          updateHandHold();
        }
      }
    }

    frameRef.current = window.requestAnimationFrame(detectFrame);
  }

  async function startCamera() {
    if (cameraStatus === 'on' || cameraStatus === 'loading') return;
    try {
      setCameraStatus('loading');
      const [{ FilesetResolver, HandLandmarker: MediaPipeHandLandmarker }, stream] = await Promise.all([
        import('@mediapipe/tasks-vision'),
        navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: false,
        }),
      ]);
      const vision = await FilesetResolver.forVisionTasks(visionWasmUrl);
      const landmarker = await MediaPipeHandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: handModelUrl,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      streamRef.current = stream;
      landmarkerRef.current = landmarker;
      setCameraPreviewVisible(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus('on');
      frameRef.current = window.requestAnimationFrame(detectFrame);
    } catch (error) {
      console.error(error);
      stopCamera('error');
    }
  }

  function stopCamera(nextStatus: 'off' | 'error' = 'off') {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    lastVideoTimeRef.current = -1;
    handHoldRef.current = null;
    doubleOpenStartedAtRef.current = null;
    setHandPoint(null);
    setHold(null);
    setBlackout(false);
    drawHandPointer();
    setCameraStatus(nextStatus);
  }

  function getRelativePosition(event: PointerEvent) {
    const bounds = wallRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100)),
    };
  }

  function dragBulb(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (!calibrating) return;
    event.preventDefault();
    setSelectedLightId(id);
    event.currentTarget.setPointerCapture(event.pointerId);
    const update = (moveEvent: globalThis.PointerEvent) => {
      const bounds = wallRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const x = Math.max(0, Math.min(100, ((moveEvent.clientX - bounds.left) / bounds.width) * 100));
      const y = Math.max(0, Math.min(100, ((moveEvent.clientY - bounds.top) / bounds.height) * 100));
      setBulbs((current) => current.map((bulb) => (bulb.id === id ? { ...bulb, x, y } : bulb)));
    };
    const stop = () => {
      window.removeEventListener('pointermove', update);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', update);
    window.addEventListener('pointerup', stop);
  }

  function dragPanel(event: PointerEvent<HTMLDivElement>) {
    if (!calibrating) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPanelRef.current = panelPosition;
    const start = getRelativePosition(event);
    if (!start) return;
    const update = (moveEvent: globalThis.PointerEvent) => {
      const bounds = wallRef.current?.getBoundingClientRect();
      const original = dragPanelRef.current;
      if (!bounds || !original) return;
      const next = {
        x: Math.max(0, Math.min(100, ((moveEvent.clientX - bounds.left) / bounds.width) * 100)),
        y: Math.max(0, Math.min(100, ((moveEvent.clientY - bounds.top) / bounds.height) * 100)),
      };
      setPanelPosition({
        x: Math.max(0.8, Math.min(84, original.x + next.x - start.x)),
        y: Math.max(4, Math.min(86, original.y + next.y - start.y)),
      });
    };
    const stop = () => {
      dragPanelRef.current = null;
      window.removeEventListener('pointermove', update);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', update);
    window.addEventListener('pointerup', stop);
  }

  function resizeCamera(event: PointerEvent<HTMLSpanElement>, corner: 'nw' | 'ne' | 'sw' | 'se') {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = wallRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const original = cameraFrame;
    const originalWidthPx = (original.width / 100) * bounds.width;
    const aspect = 4 / 3;
    const originalHeightPx = originalWidthPx / aspect;
    const minWidthPx = 120;
    const maxWidthPx = bounds.width * 0.34;
    const originalXPx = (original.x / 100) * bounds.width;
    const originalYPx = (original.y / 100) * bounds.height;
    const oppositeX = corner.includes('w') ? originalXPx + originalWidthPx : originalXPx;
    const oppositeY = corner.includes('n') ? originalYPx + originalHeightPx : originalYPx;

    const update = (moveEvent: globalThis.PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const widthFromX = corner.includes('w') ? originalWidthPx - dx : originalWidthPx + dx;
      const heightFromY = corner.includes('n') ? originalHeightPx - dy : originalHeightPx + dy;
      const nextWidthPx = Math.max(
        minWidthPx,
        Math.min(maxWidthPx, Math.max(widthFromX, heightFromY * aspect)),
      );
      const nextHeightPx = nextWidthPx / aspect;
      const nextWidth = (nextWidthPx / bounds.width) * 100;
      const nextHeight = (nextHeightPx / bounds.height) * 100;
      const nextX = corner.includes('w')
        ? ((oppositeX - nextWidthPx) / bounds.width) * 100
        : (oppositeX / bounds.width) * 100;
      const nextY = corner.includes('n')
        ? ((oppositeY - nextHeightPx) / bounds.height) * 100
        : (oppositeY / bounds.height) * 100;

      setCameraFrame({
        ...original,
        width: nextWidth,
        x: Math.max(0, Math.min(100 - nextWidth, nextX)),
        y: Math.max(0, Math.min(100 - nextHeight, nextY)),
      });
    };
    const stop = () => {
      window.removeEventListener('pointermove', update);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', update);
    window.addEventListener('pointerup', stop);
  }

  function dragCamera(event: PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.cameraResizeHandle')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = wallRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const original = cameraFrame;
    const height = original.width * 0.75;

    const update = (moveEvent: globalThis.PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / bounds.width) * 100;
      const dy = ((moveEvent.clientY - startY) / bounds.height) * 100;
      setCameraFrame({
        ...original,
        x: Math.max(0, Math.min(100 - original.width, original.x + dx)),
        y: Math.max(0, Math.min(100 - height, original.y + dy)),
      });
    };
    const stop = () => {
      window.removeEventListener('pointermove', update);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', update);
    window.addEventListener('pointerup', stop);
  }

  function addLight() {
    const used = new Set(bulbs.map((bulb) => bulb.letter).filter(Boolean));
    const nextLetter = alphabet.find((letter) => !used.has(letter));
    const meta = nextLetter ? letterMeta.get(nextLetter) : null;
    const newBulb: Bulb = {
      id: `light-${Date.now()}`,
      x: 50,
      y: 50,
      color: meta?.color ?? palette.blue,
      letter: nextLetter,
    };
    setBulbs((current) => [...current, newBulb]);
    setSelectedLightId(newBulb.id);
  }

  function deleteSelected() {
    if (selectedLightId) {
      setBulbs((current) => current.filter((bulb) => bulb.id !== selectedLightId));
      setSelectedLightId(null);
    }
  }

  function resetCalibration() {
    setBulbs(initialBulbs);
    setSelectedLightId(null);
    window.localStorage.removeItem(calibrationStorageKey);
  }

  async function copyCalibration() {
    await navigator.clipboard.writeText(JSON.stringify({ bulbs }, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function openConnection() {
    const code = roomCode || Math.random().toString(36).slice(2, 7).toUpperCase();
    const url = `${localShareOrigin}/?view=receiver&room=${code}`;
    setRoomCode(code);
    setReceiverUrl(url);
    setQrImage(await QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#1b120b', light: '#fff4d6' } }));
    setConnectOpen(true);
  }

  async function sendToReceiver() {
    const text = (sendText || message).trim();
    if (!roomCode || !text) return;
    await fetch(`/api/rooms/${roomCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setSendText('');
  }

  if (isReceiver) {
    const receiverText = receiverMessage?.text ?? '';
    const receiverFontVw = Math.max(8, Math.min(24, 150 / Math.max(receiverText.length, 1)));

    return (
      <main className="receiverScreen">
        <div className="receiverNoise" />
        <div className="receiverStage">
          {receiverMessage ? (
            <div
              key={receiverMessage.id}
              className="receiverWord"
              style={{ fontSize: `clamp(46px, ${receiverFontVw}vmax, 260px)` }}
              aria-live="polite"
            >
              {receiverMessage.text.split('').map((char, index) => (
                <span key={`${receiverMessage.id}-${index}`} style={{ ['--i' as string]: index }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          ) : (
            <p className="receiverWaiting">ROOM {receiverRoom}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={`scene ${panic ? 'panic' : ''} ${blackout ? 'blackout' : ''} ${cameraStatus === 'on' ? 'cameraRunning' : ''} ${calibrating ? 'isCalibrating calibratingLights' : ''}`}>
      <section ref={wallRef} className="wall" aria-label="Strange letter wall interactive prototype">
        <div className="photoLayer" />
        <div className="dimLayer" />
        <svg className="wireLayer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {wirePaths.map((path) => (
            <path key={path} d={path} />
          ))}
        </svg>
        <div className="bulbLayer" aria-hidden={calibrating ? 'false' : 'true'}>
          {bulbs.map((bulb, index) => {
            const lit = active === bulb.letter || hold === bulb.letter || panic || Boolean(bulb.letter && sequenceLit.includes(bulb.letter));
            const sequenceOff = sequencePlaying && !lit;
            return (
              <button
                type="button"
                key={bulb.id}
                className={`bulb ${lit ? 'lit' : ''} ${sequenceOff ? 'sequenceOff' : ''} ${active === bulb.letter ? 'selected' : ''} ${selectedLightId === bulb.id ? 'selectedControl' : ''} ${calibrating ? 'draggable' : ''}`}
                style={{
                  left: `${bulb.x}%`,
                  top: `${bulb.y}%`,
                  ['--bulb' as string]: bulb.color,
                  ['--delay' as string]: `${index * -0.43}s`,
                  ['--scale' as string]: `${bulb.size ?? 1}`,
                }}
                onPointerDown={(event) => dragBulb(event, bulb.id)}
                aria-label={bulb.letter ? `Move light for ${bulb.letter}` : 'Move extra light'}
              >
                {calibrating ? <span>{bulb.letter ?? '•'}</span> : null}
              </button>
            );
          })}
        </div>
        <div className="hitLayer">
          {bulbs.filter((bulb) => bulb.letter).map((bulb) => (
            <button
              key={`target-${bulb.id}`}
              className={`letterHit ${active === bulb.letter ? 'active' : ''} ${hold === bulb.letter ? 'holding' : ''}`}
              style={{
                left: `${bulb.x}%`,
                top: `${bulb.y}%`,
                width: `${targetSize}%`,
                ['--letter-color' as string]: bulb.color,
              }}
              onClick={() => pickLetter(bulb.letter!)}
              onPointerEnter={() => beginHold(bulb.letter)}
              onPointerLeave={cancelHold}
              onPointerDown={() => beginHold(bulb.letter)}
              onPointerUp={cancelHold}
              aria-label={`Select ${bulb.letter}`}
              data-label={bulb.letter}
            >
              <span>{bulb.letter}</span>
            </button>
          ))}
        </div>
        {handPoint ? (
          <span
            className={`handCursor ${handPoint.char ? 'overLetter' : ''}`}
            style={{
              left: `${handPoint.x}%`,
              top: `${handPoint.y}%`,
            }}
            aria-hidden="true"
          >
            {handPoint.char ?? ''}
          </span>
        ) : null}
        <aside className="console" aria-label="Message console">
          <div>
            <p className="eyebrow">Message</p>
            <p className="message">{message || '...'}</p>
          </div>
          <div className="actions">
            <button
              type="button"
              onClick={cameraStatus === 'on' ? stopCamera : startCamera}
              disabled={cameraStatus === 'loading'}
            >
              {cameraStatus === 'loading' ? 'Loading' : cameraStatus === 'on' ? 'Stop' : 'Camera'}
            </button>
            <button type="button" onClick={playSignalSequence} disabled={sequencePlaying}>
              {sequencePlaying ? 'Running' : 'Signal'}
            </button>
            <button type="button" onClick={openConnection}>Connect</button>
            <button type="button" onClick={sendToReceiver} disabled={!roomCode || !(sendText || message).trim()}>
              Send
            </button>
            <button type="button" onClick={() => setMessage('')}>Clear</button>
          </div>
        </aside>
        {connectOpen ? (
          <aside className="connectPanel" aria-label="Phone connection">
            <button type="button" className="connectClose" onClick={() => setConnectOpen(false)} aria-label="Close connection panel">
              x
            </button>
            <p className="eyebrow">Phone Room</p>
            <h2>{roomCode}</h2>
            {qrImage ? <img src={qrImage} alt="QR code for phone receiver" /> : null}
            <input
              value={sendText}
              onChange={(event) => setSendText(event.target.value.toUpperCase())}
              placeholder={message || 'RUN'}
              aria-label="Text to send to phone"
            />
            <button type="button" onClick={sendToReceiver} disabled={!roomCode || !(sendText || message).trim()}>
              Send to phone
            </button>
            <p className="receiverUrl">{receiverUrl}</p>
          </aside>
        ) : null}
        <aside
          className={`cameraPanel ${cameraPreviewVisible && (cameraStatus === 'on' || cameraStatus === 'error') ? 'visible' : ''}`}
          style={{
            left: `${cameraFrame.x}%`,
            top: `${cameraFrame.y}%`,
            width: `${cameraFrame.width}%`,
          }}
          onPointerDown={dragCamera}
          aria-label="Camera preview"
        >
          <video ref={videoRef} muted playsInline />
          <canvas ref={canvasRef} aria-hidden="true" />
          <button type="button" onClick={() => setCameraPreviewVisible(false)} aria-label="Hide camera preview">
            Hide
          </button>
          {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
            <span
              key={corner}
              className={`cameraResizeHandle ${corner}`}
              onPointerDown={(event) => resizeCamera(event, corner)}
              aria-hidden="true"
            />
          ))}
        </aside>
        {cameraStatus === 'on' && !cameraPreviewVisible ? (
          <button type="button" className="cameraRestore" onClick={() => setCameraPreviewVisible(true)}>
            Camera
          </button>
        ) : null}
        {calibrating ? (
          <aside
            className={`calibrationPanel ${panelOpen ? '' : 'collapsed'}`}
            style={{ left: `${panelPosition.x}%`, top: `${panelPosition.y}%` }}
            aria-label="Calibration tools"
          >
            <button
              type="button"
              className="panelToggle"
              onClick={() => setPanelOpen((current) => !current)}
              aria-label={panelOpen ? 'Collapse tuning panel' : 'Open tuning panel'}
            >
              {panelOpen ? 'Hide' : 'Tune'}
            </button>
            {panelOpen ? (
              <>
                <div className="panelHandle" onPointerDown={dragPanel}>
                  <p className="eyebrow">Tune</p>
                  <span>drag panel</span>
                </div>
                <div>
                  <p className="calibrationText">
                    Drag light points into place. Each letter light is also its target.
                  </p>
                </div>
                <div className="miniActions">
                  <button type="button" onClick={copyCalibration}>{copied ? 'Copied' : 'Copy setup'}</button>
                  <button type="button" onClick={resetCalibration}>Reset</button>
                </div>
                <div className="miniActions">
                  <button type="button" onClick={addLight}>Add light</button>
                  <button type="button" onClick={deleteSelected} disabled={!selectedLightId}>
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </aside>
        ) : null}
      </section>
    </main>
  );
}
