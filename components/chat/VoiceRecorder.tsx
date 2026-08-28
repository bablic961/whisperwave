// components/chat/VoiceRecorder.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface VoiceRecorderProps {
  onRecordComplete: (audioUrl: string, duration: number, audioBlob: Blob) => void;
}

export function VoiceRecorder({ onRecordComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingPermission, setRecordingPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check for microphone permission on mount
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setRecordingPermission(permission.state);

        permission.onchange = () => {
          setRecordingPermission(permission.state);
        };
      } catch (error) {
        console.error('Permission check error:', error);
      }
    };

    checkPermission();
  }, []);

  const startRecording = async () => {
    try {
      // Request permission if not granted
      if (recordingPermission !== 'granted') {
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          console.error('Microphone access denied:', err);
          return;
        }
      }

      const stream = streamRef.current || await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onRecordComplete(audioUrl, duration, audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
      setRecordingPermission('denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? 'danger' : 'ghost'}
        className={`rounded-full p-3 transition-colors ${
          isRecording ? 'bg-red-500/20 hover:bg-red-500/30' : 'hover:bg-white/10'
        }`}
      >
        {isRecording ? (
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="font-mono text-sm">{duration.toString().padStart(2, '0')}</span>
          </div>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </Button>
    </div>
  );
}
