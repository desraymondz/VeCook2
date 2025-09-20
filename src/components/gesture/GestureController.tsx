'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GestureState, GestureType, GestureConfig } from '@/lib/types';
import { defaultGestureConfig } from '@/lib/defaults';
import { GESTURE_CONFIG } from '@/lib/constants';

interface GestureControllerProps {
  onGestureDetected: (gesture: GestureType) => void;
  isActive?: boolean;
  config?: Partial<GestureConfig>;
  showVideo?: boolean;
  className?: string;
}

export default function GestureController({
  onGestureDetected,
  isActive = true,
  config = {},
  showVideo = false,
  className = ''
}: GestureControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    currentGesture: null,
    confidence: 0,
    lastDetected: new Date()
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  // Merge config with defaults
  const gestureConfig: GestureConfig = { ...defaultGestureConfig, ...config };
  
  // ML5 model reference
  const handPoseRef = useRef<unknown>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera and ML5
  const initializeCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: GESTURE_CONFIG.CAMERA_WIDTH,
          height: GESTURE_CONFIG.CAMERA_HEIGHT,
          facingMode: 'user'
        }
      });

      streamRef.current = stream;
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve(void 0);
        }
      });

      // Initialize ML5 HandPose
      if (typeof window !== 'undefined' && window.ml5) {
        handPoseRef.current = window.ml5.handPose(videoRef.current, {
          flipHorizontal: true,
          maxNumHands: 2,
          scoreThreshold: gestureConfig.requiredConfidence,
          detectionConfidence: gestureConfig.requiredConfidence,
          trackingConfidence: gestureConfig.requiredConfidence
        }, () => {
          console.log('HandPose model loaded');
          setIsLoading(false);
          setGestureState(prev => ({ ...prev, isActive: true }));
        });

        // Start detection
        if (handPoseRef.current && videoRef.current) {
          (handPoseRef.current as { detectStart: (video: HTMLVideoElement, callback: (error: Error | null, results: unknown[]) => void) => void }).detectStart(videoRef.current, handleHandPoseResults);
        }
      } else {
        throw new Error('ML5.js not loaded');
      }

    } catch (err) {
      console.error('Camera initialization failed:', err);
      setCameraPermission('denied');
      setError(err instanceof Error ? err.message : 'Camera access failed');
      setIsLoading(false);
    }
  }, [gestureConfig.requiredConfidence]);

  // Handle hand pose detection results
  const handleHandPoseResults = useCallback((error: Error | null, results: unknown[]) => {
    if (error) {
      console.error('HandPose detection error:', error);
      return;
    }

    if (!isActive || !results || results.length === 0) {
      setGestureState(prev => ({ ...prev, currentGesture: null, confidence: 0 }));
      return;
    }

    const now = Date.now();
    if (now - lastGestureTimeRef.current < gestureConfig.cooldownMs) {
      return; // Still in cooldown period
    }

    // Analyze hand poses for gestures
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
        
        onGestureDetected(gesture);
        lastGestureTimeRef.current = now;
      }
    }
  }, [isActive, gestureConfig.cooldownMs, gestureConfig.requiredConfidence, onGestureDetected]);

  // Analyze hand poses to detect gestures
  const analyzeHandPoses = (results: unknown[]): { gesture: GestureType; confidence: number } | null => {
    if (!results || results.length === 0) return null;

    const hand = results[0] as { keypoints?: unknown[]; score?: number };
    if (!hand.keypoints || hand.keypoints.length === 0) return null;

    const keypoints = hand.keypoints as Array<{ x: number; y: number; name?: string }>;
    const confidence = hand.score || 0;

    // Get key landmarks
    const wrist = keypoints.find((kp) => kp.name === 'wrist');
    const indexTip = keypoints.find((kp) => kp.name === 'index_finger_tip');
    const indexMcp = keypoints.find((kp) => kp.name === 'index_finger_mcp');
    const middleTip = keypoints.find((kp) => kp.name === 'middle_finger_tip');
    const thumbTip = keypoints.find((kp) => kp.name === 'thumb_tip');

    if (!wrist || !indexTip || !indexMcp) return null;

    // Calculate pointing direction
    const pointingVector = {
      x: indexTip.x - indexMcp.x,
      y: indexTip.y - indexMcp.y
    };

    // Normalize the vector
    const magnitude = Math.sqrt(pointingVector.x ** 2 + pointingVector.y ** 2);
    if (magnitude === 0) return null;

    const normalizedVector = {
      x: pointingVector.x / magnitude,
      y: pointingVector.y / magnitude
    };

    // Check for pointing gestures
    const horizontalThreshold = 0.7; // Minimum horizontal component for pointing
    const verticalThreshold = 0.5;   // Maximum vertical component for horizontal pointing

    // Point right (positive x direction)
    if (normalizedVector.x > horizontalThreshold && Math.abs(normalizedVector.y) < verticalThreshold) {
      return { gesture: 'point_right', confidence };
    }

    // Point left (negative x direction)
    if (normalizedVector.x < -horizontalThreshold && Math.abs(normalizedVector.y) < verticalThreshold) {
      return { gesture: 'point_left', confidence };
    }

    // Check for hand raise (wrist above index finger)
    if (wrist.y < indexTip.y - 50) { // 50px threshold
      return { gesture: 'hand_raise', confidence };
    }

    // Check for thumbs up
    if (thumbTip && thumbTip.y < wrist.y - 30) {
      return { gesture: 'thumbs_up', confidence };
    }

    // Check for stop gesture (open palm facing camera)
    const middleMcp = keypoints.find((kp) => kp.name === 'middle_finger_mcp');
    const fingersExtended = [
      indexTip.y < indexMcp.y, // Index finger extended
      middleTip && middleMcp && middleTip.y < middleMcp.y
    ].filter(Boolean).length;

    if (fingersExtended >= 2) {
      return { gesture: 'stop', confidence };
    }

    return null;
  };

  // Load ML5.js dynamically
  useEffect(() => {
    const loadML5 = async () => {
      if (typeof window !== 'undefined' && !window.ml5) {
        try {
          // Load ML5.js from CDN
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/ml5@latest/dist/ml5.min.js';
          script.onload = () => {
            console.log('ML5.js loaded');
            if (isActive) {
              initializeCamera();
            }
          };
          script.onerror = () => {
            setError('Failed to load ML5.js');
            setIsLoading(false);
          };
          document.head.appendChild(script);
        } catch (err) {
          setError('Failed to load ML5.js');
          setIsLoading(false);
        }
      } else if (window.ml5 && isActive) {
        initializeCamera();
      }
    };

    loadML5();

    // Cleanup
    return () => {
      if (handPoseRef.current) {
        (handPoseRef.current as { detectStop: () => void }).detectStop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, initializeCamera, handleHandPoseResults]);

  // Handle component unmount
  useEffect(() => {
    return () => {
      if (handPoseRef.current) {
        (handPoseRef.current as { detectStop: () => void }).detectStop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div className={`gesture-controller ${className}`}>
      {/* Camera Feed */}
      <div className="relative">
        <video
          ref={videoRef}
          className={`${showVideo ? 'block' : 'hidden'} w-full max-w-sm rounded-lg border-2 border-gray-300`}
          autoPlay
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
          width={GESTURE_CONFIG.CAMERA_WIDTH}
          height={GESTURE_CONFIG.CAMERA_HEIGHT}
        />

        {/* Status Overlay */}
        {showVideo && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {isLoading ? 'Loading...' : gestureState.isActive ? 'Active' : 'Inactive'}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 text-sm">{error}</span>
          </div>
          {cameraPermission === 'denied' && (
            <p className="text-red-700 text-xs mt-1">
              Please enable camera access in your browser settings and refresh the page.
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">Initializing gesture recognition...</span>
        </div>
      )}

      {/* Gesture Status */}
      {gestureState.currentGesture && (
        <div className="gesture-feedback">
          Detected: {gestureState.currentGesture.replace('_', ' ')} 
          ({Math.round(gestureState.confidence * 100)}%)
        </div>
      )}
    </div>
  );
}