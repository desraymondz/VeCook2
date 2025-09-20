'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GestureType, GestureState, GestureConfig } from '@/lib/types';
import { defaultGestureConfig } from '@/lib/defaults';

interface UseGestureDetectionOptions {
  isActive?: boolean;
  config?: Partial<GestureConfig>;
  onGestureDetected?: (gesture: GestureType) => void;
}

interface UseGestureDetectionReturn {
  gestureState: GestureState;
  startDetection: (video: HTMLVideoElement) => Promise<void>;
  stopDetection: () => void;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
}

export function useGestureDetection({
  isActive = true,
  config = {},
  onGestureDetected
}: UseGestureDetectionOptions = {}): UseGestureDetectionReturn {
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    currentGesture: null,
    confidence: 0,
    lastDetected: new Date()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const handPoseRef = useRef<unknown>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const gestureConfig: GestureConfig = { ...defaultGestureConfig, ...config };

  // Check if gesture detection is supported
  useEffect(() => {
    const checkSupport = () => {
      const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasWebGL = !!document.createElement('canvas').getContext('webgl');
      setIsSupported(hasCamera && hasWebGL);
    };

    checkSupport();
  }, []);

  // Analyze hand poses for gestures
  const analyzeHandPoses = useCallback((results: unknown[]): { gesture: GestureType; confidence: number } | null => {
    if (!results || results.length === 0) return null;

    const hand = results[0] as { keypoints?: Array<{ x: number; y: number }>; score?: number };
    if (!hand.keypoints || hand.keypoints.length === 0) return null;

    const keypoints = hand.keypoints;
    const confidence = hand.score || 0;

    // Get key landmarks (using indices since ML5 might not have names)
    const wrist = keypoints[0]; // Wrist is typically index 0
    const indexTip = keypoints[8]; // Index finger tip
    const indexMcp = keypoints[5]; // Index finger MCP
    const thumbTip = keypoints[4]; // Thumb tip

    if (!wrist || !indexTip || !indexMcp) return null;

    // Calculate pointing direction
    const pointingVector = {
      x: indexTip.x - indexMcp.x,
      y: indexTip.y - indexMcp.y
    };

    const magnitude = Math.sqrt(pointingVector.x ** 2 + pointingVector.y ** 2);
    if (magnitude === 0) return null;

    const normalizedVector = {
      x: pointingVector.x / magnitude,
      y: pointingVector.y / magnitude
    };

    // Gesture detection thresholds
    const horizontalThreshold = 0.7;
    const verticalThreshold = 0.5;

    // Point right
    if (normalizedVector.x > horizontalThreshold && Math.abs(normalizedVector.y) < verticalThreshold) {
      return { gesture: 'point_right', confidence };
    }

    // Point left
    if (normalizedVector.x < -horizontalThreshold && Math.abs(normalizedVector.y) < verticalThreshold) {
      return { gesture: 'point_left', confidence };
    }

    // Hand raise (wrist above index finger)
    if (wrist.y < indexTip.y - 50) {
      return { gesture: 'hand_raise', confidence };
    }

    // Thumbs up
    if (thumbTip && thumbTip.y < wrist.y - 30) {
      return { gesture: 'thumbs_up', confidence };
    }

    // Stop gesture (multiple fingers extended)
    const fingersUp = keypoints.filter((kp, index: number) => {
      // Check if fingertip is above corresponding MCP joint
      const tipIndices = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
      const mcpIndices = [3, 5, 9, 13, 17]; // Corresponding MCP joints
      
      const tipIndex = tipIndices.indexOf(index);
      if (tipIndex === -1) return false;
      
      const mcpJoint = keypoints[mcpIndices[tipIndex]];
      return mcpJoint && kp.y < mcpJoint.y;
    }).length;

    if (fingersUp >= 3) {
      return { gesture: 'stop', confidence };
    }

    return null;
  }, []);

  // Handle detection results
  const handleDetectionResults = useCallback((error: Error | null, results: unknown[]) => {
    if (error) {
      console.error('Gesture detection error:', error);
      setError(error.message);
      return;
    }

    if (!isActive || !results || results.length === 0) {
      setGestureState(prev => ({ ...prev, currentGesture: null, confidence: 0 }));
      return;
    }

    const now = Date.now();
    if (now - lastGestureTimeRef.current < gestureConfig.cooldownMs) {
      return;
    }

    const detectedGesture = analyzeHandPoses(results);
    
    if (detectedGesture) {
      const { gesture, confidence } = detectedGesture;
      
      if (confidence >= gestureConfig.requiredConfidence) {
        setGestureState({
          isActive: true,
          currentGesture: gesture,
          confidence,
          lastDetected: new Date()
        });
        
        if (onGestureDetected) {
          onGestureDetected(gesture);
        }
        
        lastGestureTimeRef.current = now;
      }
    }
  }, [isActive, gestureConfig.cooldownMs, gestureConfig.requiredConfidence, onGestureDetected, analyzeHandPoses]);

  // Start gesture detection
  const startDetection = useCallback(async (video: HTMLVideoElement) => {
    if (!isSupported) {
      setError('Gesture detection not supported in this browser');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load ML5.js if not already loaded
      if (typeof window !== 'undefined' && !window.ml5) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/ml5@latest/dist/ml5.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load ML5.js'));
          document.head.appendChild(script);
        });
      }

      // Initialize HandPose model
      handPoseRef.current = window.ml5.handPose(video, {
        flipHorizontal: true,
        maxNumHands: 1,
        scoreThreshold: gestureConfig.requiredConfidence,
        detectionConfidence: gestureConfig.requiredConfidence,
        trackingConfidence: gestureConfig.requiredConfidence
      }, () => {
        console.log('HandPose model loaded');
        setIsLoading(false);
        setGestureState(prev => ({ ...prev, isActive: true }));
      });

      // Start detection
      if (handPoseRef.current) {
        (handPoseRef.current as { detectStart: (video: HTMLVideoElement, callback: (error: Error | null, results: unknown[]) => void) => void }).detectStart(video, handleDetectionResults);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start gesture detection';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Gesture detection initialization failed:', err);
    }
  }, [isSupported, gestureConfig.requiredConfidence, handleDetectionResults]);

  // Stop gesture detection
  const stopDetection = useCallback(() => {
    if (handPoseRef.current) {
      (handPoseRef.current as { detectStop: () => void }).detectStop();
      handPoseRef.current = null;
    }
    
    setGestureState({
      isActive: false,
      currentGesture: null,
      confidence: 0,
      lastDetected: new Date()
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    gestureState,
    startDetection,
    stopDetection,
    isLoading,
    error,
    isSupported
  };
}