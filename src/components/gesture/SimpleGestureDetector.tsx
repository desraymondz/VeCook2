'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GestureType } from '@/lib/types';

interface SimpleGestureDetectorProps {
  onGestureDetected: (gesture: GestureType) => void;
  isActive?: boolean;
  showVideo?: boolean;
  className?: string;
}

export default function SimpleGestureDetector({
  onGestureDetected,
  isActive = true,
  showVideo = true,
  className = ''
}: SimpleGestureDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);

  // Gesture detection state
  const handPoseRef = useRef<unknown>(null);
  const handRef = useRef<unknown>(null);
  const rightIndexFingerTimerRef = useRef(0);
  const leftIndexFingerTimerRef = useRef(0);
  const handTimerRef = useRef(0);
  const timeToExecute = 30; // Reduced from 90 for faster response

  // Initialize camera and ML5
  const initializeDetection = useCallback(async () => {
    if (!isActive) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Load ML5.js if not loaded
      if (!window.ml5) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/ml5@latest/dist/ml5.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load ML5.js'));
          document.head.appendChild(script);
        });
      }

      // The issue is that ml5.handPose() returns a Promise!
      console.log('Creating handPose model...');

      // Await the Promise to get the actual handPose object
      const handPoseModel = await window.ml5.handPose();
      handPoseRef.current = handPoseModel;

      console.log('HandPose created:', handPoseRef.current);
      console.log('Available methods:', Object.getOwnPropertyNames(handPoseRef.current));
      console.log('Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(handPoseRef.current || {})));

      // Now try to start detection with the actual model
      if (handPoseRef.current && videoRef.current) {
        console.log('Checking for detectStart method...');
        const handPose = handPoseRef.current as Record<string, unknown>;

        // Check all available methods
        console.log('All methods on handPose:');
        for (const prop in handPose) {
          if (typeof handPose[prop] === 'function') {
            console.log(`- ${prop}: function`);
          }
        }

        if (handPose.detectStart) {
          console.log('detectStart found! Starting detection...');
          try {
            (handPose.detectStart as (video: HTMLVideoElement, callback: (results: unknown[]) => void) => void)(videoRef.current, gotHands);
            setIsLoading(false);
            console.log('Detection started successfully');
          } catch (error) {
            console.error('detectStart failed:', error);
            setError('Failed to start detection');
            setIsLoading(false);
          }
        } else {
          console.log('detectStart not found, trying alternative methods...');
          startDetectionWithAvailableMethod();
        }
      }

    } catch (err) {
      console.error('Failed to initialize gesture detection:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
      setIsLoading(false);
    }
  }, [isActive]);

  // Handle hand detection results (based on your gotHands function)
  const gotHands = useCallback((results: unknown[]) => {
    handRef.current = results.length > 0 ? results[0] : null;
  }, []);

  // Try different detection methods based on what's available
  const startDetectionWithAvailableMethod = useCallback(() => {
    if (!videoRef.current || !handPoseRef.current || !isActive) return;

    const handPose = handPoseRef.current as Record<string, unknown>;

    // Method 1: Try detectStart (your original working method)
    if (typeof handPose.detectStart === 'function') {
      console.log('Using detectStart method');
      try {
        (handPose.detectStart as (video: HTMLVideoElement, callback: (results: unknown[]) => void) => void)(videoRef.current, gotHands);
        return;
      } catch (error) {
        console.error('detectStart failed:', error);
      }
    }

    // Method 2: Try detect method
    if (typeof handPose.detect === 'function') {
      console.log('Using detect method');
      const detectLoop = async () => {
        if (!videoRef.current || !handPoseRef.current || !isActive) return;

        try {
          const results = await (handPose.detect as (video: HTMLVideoElement) => Promise<unknown[]>)(videoRef.current);
          gotHands(results);
          if (isActive) {
            requestAnimationFrame(detectLoop);
          }
        } catch (error) {
          console.error('detect failed:', error);
          if (isActive) {
            setTimeout(detectLoop, 100);
          }
        }
      };
      detectLoop();
      return;
    }

    // Method 3: Try on method (event-based)
    if (typeof handPose.on === 'function') {
      console.log('Using on method');
      try {
        (handPose.on as (event: string, callback: (results: unknown[]) => void) => void)('predict', gotHands);
        return;
      } catch (error) {
        console.error('on method failed:', error);
      }
    }

    console.error('No suitable detection method found');
    setError('Gesture detection method not available');
  }, [isActive, gotHands]);

  // Helper functions (adapted from your code)
  const isFingerStretched = useCallback((hand: { keypoints: Array<{ x: number; y: number; name: string }> }, fingerName: string): boolean => {
    const tip = hand.keypoints.find((k) => k.name === `${fingerName}_tip`);
    const dip = hand.keypoints.find((k) => k.name === `${fingerName}_dip`);
    const pip = hand.keypoints.find((k) => k.name === `${fingerName}_pip`);
    const mcp = hand.keypoints.find((k) => k.name === `${fingerName}_mcp`);
    const wrist = hand.keypoints.find((k) => k.name === "wrist");

    if (!tip || !dip || !pip || !mcp || !wrist) return false;

    const handLength = Math.sqrt((wrist.x - mcp.x) ** 2 + (wrist.y - mcp.y) ** 2);
    const stretchDistance = Math.sqrt((tip.x - mcp.x) ** 2 + (tip.y - mcp.y) ** 2);
    const isFarEnough = stretchDistance > handLength * 0.2;

    return isFarEnough && tip.y < dip.y && dip.y < pip.y && pip.y < mcp.y;
  }, []);

  const isFingerPointingLeftRight = useCallback((hand: { keypoints: Array<{ x: number; y: number; name: string }> }, fingerName: string): string => {
    const tip = hand.keypoints.find((k) => k.name === `${fingerName}_tip`);
    const mcp = hand.keypoints.find((k) => k.name === `${fingerName}_mcp`);

    if (!tip || !mcp) return "unknown";
    return tip.x > mcp.x ? "left" : "right";
  }, []);

  const isFingerPointingUp = useCallback((hand: { keypoints: Array<{ x: number; y: number; name: string }> }, fingerName: string): boolean => {
    const tip = hand.keypoints.find((k) => k.name === `${fingerName}_tip`);
    const mcp = hand.keypoints.find((k) => k.name === `${fingerName}_mcp`);

    if (!tip || !mcp) return false;
    return tip.y < mcp.y;
  }, []);

  const isHandOpen = useCallback((hand: { keypoints: Array<{ x: number; y: number; name: string }> }): boolean => {
    const fingers = ["index_finger", "middle_finger", "ring_finger"];
    return fingers.every(finger => isFingerStretched(hand, finger));
  }, [isFingerStretched]);

  // Main gesture detection loop (based on your draw function logic)
  const detectGestures = useCallback(() => {
    if (!isActive || !handRef.current) {
      // Reset timers when no hand detected
      rightIndexFingerTimerRef.current = 0;
      leftIndexFingerTimerRef.current = 0;
      handTimerRef.current = 0;
      setCurrentGesture(null);
      return;
    }

    const hand = handRef.current as { keypoints: Array<{ x: number; y: number; name: string }> };

    // Check if hand is open (index, middle, ring fingers stretched)
    if (isHandOpen(hand)) {
      const fingers = ["index_finger", "middle_finger", "ring_finger"];
      let handIsUp = false;

      for (const finger of fingers) {
        if (isFingerPointingUp(hand, finger)) {
          handIsUp = true;
          break;
        }
      }

      if (handIsUp) {
        handTimerRef.current++;
        setCurrentGesture('hand_raise');

        if (handTimerRef.current >= timeToExecute) {
          console.log('Hand raise detected!');
          onGestureDetected('hand_raise');
          handTimerRef.current = 0;
        }
      } else {
        handTimerRef.current = 0;
      }
    }
    // Check for index finger pointing
    else if (isFingerStretched(hand, "index_finger")) {
      const direction = isFingerPointingLeftRight(hand, "index_finger");

      if (direction === "right") {
        leftIndexFingerTimerRef.current = 0;
        rightIndexFingerTimerRef.current++;
        setCurrentGesture('point_right');

        if (rightIndexFingerTimerRef.current >= timeToExecute) {
          console.log('Point right detected!');
          onGestureDetected('point_right');
          rightIndexFingerTimerRef.current = 0;
        }
      } else if (direction === "left") {
        rightIndexFingerTimerRef.current = 0;
        leftIndexFingerTimerRef.current++;
        setCurrentGesture('point_left');

        if (leftIndexFingerTimerRef.current >= timeToExecute) {
          console.log('Point left detected!');
          onGestureDetected('point_left');
          leftIndexFingerTimerRef.current = 0;
        }
      }
    } else {
      // Reset all timers
      rightIndexFingerTimerRef.current = 0;
      leftIndexFingerTimerRef.current = 0;
      handTimerRef.current = 0;
      setCurrentGesture(null);
    }
  }, [isActive, onGestureDetected, timeToExecute, isHandOpen, isFingerStretched, isFingerPointingUp, isFingerPointingLeftRight]);

  // Update the initialization to use the new detection method
  useEffect(() => {
    if (isActive && handPoseRef.current && !isLoading) {
      startDetectionWithAvailableMethod();
    }
  }, [isActive, isLoading, startDetectionWithAvailableMethod]);

  // Start detection loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(detectGestures, 100); // 10 FPS detection
    return () => clearInterval(interval);
  }, [isActive, detectGestures]);

  // Initialize on mount
  useEffect(() => {
    initializeDetection();

    return () => {
      // Cleanup
      if (handPoseRef.current) {
        try {
          (handPoseRef.current as { detectStop?: () => void }).detectStop?.();
        } catch (e) {
          console.warn('Error stopping detection:', e);
        }
      }

      // Store video reference for cleanup
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeDetection]);

  const getProgress = () => {
    const total = rightIndexFingerTimerRef.current + leftIndexFingerTimerRef.current + handTimerRef.current;
    return (total / timeToExecute) * 100;
  };

  return (
    <div className={`gesture-detector ${className}`}>
      {/* Video Feed */}
      <div className="relative">
        <video
          ref={videoRef}
          className={`${showVideo ? 'block' : 'hidden'} w-full max-w-md rounded-lg border-2 border-gray-300 transform scale-x-[-1]`}
          autoPlay
          playsInline
          muted
        />

        {/* Status Overlay */}
        {showVideo && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {isLoading ? 'Loading...' : 'Active'}
          </div>
        )}

        {/* Progress Bar */}
        {showVideo && currentGesture && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black bg-opacity-50 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Gesture Display */}
      {currentGesture && (
        <div className="mt-2 text-center">
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            Detecting: {currentGesture.replace('_', ' ')} ({Math.round(getProgress())}%)
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-600 mt-2">
          <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">Initializing gesture detection...</span>
        </div>
      )}
    </div>
  );
}