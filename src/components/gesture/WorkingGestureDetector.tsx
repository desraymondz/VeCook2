'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GestureType } from '@/lib/types';

interface WorkingGestureDetectorProps {
  onGestureDetected: (gesture: GestureType) => void;
  isActive?: boolean;
  showVideo?: boolean;
  className?: string;
}

export default function WorkingGestureDetector({
  onGestureDetected,
  isActive = true,
  showVideo = true,
  className = ''
}: WorkingGestureDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);
  
  // Gesture detection state (matching your original code)
  const handPoseRef = useRef<unknown>(null);
  const handRef = useRef<unknown>(null);
  const rightIndexFingerTimerRef = useRef(0);
  const leftIndexFingerTimerRef = useRef(0);
  const handTimerRef = useRef(0);
  const timeToExecute = 30; // Reduced from 90 for faster response
  const animationFrameRef = useRef<number | null>(null);

  // Initialize camera and ML5 (matching your original setup)
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

      // Initialize HandPose (try different approaches)
      console.log('Initializing HandPose...');
      
      // Try the promise-based approach first
      try {
        handPoseRef.current = await window.ml5.handPose();
        console.log('HandPose initialized via Promise');
      } catch {
        console.log('Promise approach failed, trying callback approach...');
        
        // Try callback approach
        handPoseRef.current = await new Promise((resolve, reject) => {
          const model = window.ml5.handPose(() => {
            console.log('HandPose model loaded via callback');
            resolve(model);
          });
          
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('HandPose initialization timeout')), 10000);
        });
      }

      console.log('HandPose model:', handPoseRef.current);
      
      // Start the detection and drawing loop
      startDetectionLoop();
      setIsLoading(false);

    } catch (err) {
      console.error('Failed to initialize gesture detection:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
      setIsLoading(false);
    }
  }, [isActive]);

  // Detection and drawing loop (matching your original draw function)
  const startDetectionLoop = useCallback(() => {
    if (!isActive || !handPoseRef.current || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const detectAndDraw = async () => {
      if (!isActive || !handPoseRef.current || !videoRef.current || !ctx) return;

      try {
        // Try different detection methods
        let results = null;
        const handPose = handPoseRef.current as Record<string, unknown>;
        
        if (typeof handPose.detect === 'function') {
          results = await (handPose.detect as (video: HTMLVideoElement) => Promise<unknown[]>)(videoRef.current);
        } else if (typeof handPose.detectStart === 'function') {
          // For detectStart, we need to handle it differently
          // This is more complex, so let's focus on the detect method for now
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Process results (matching your gotHands function)
        handRef.current = results && results.length > 0 ? results[0] : null;

        // Draw hand keypoints (matching your original drawing code)
        const hand = handRef.current as { keypoints?: Array<{ x: number; y: number; name: string }> } | null;
        if (hand && hand.keypoints) {
          
          // Draw keypoints as green circles
          for (let j = 0; j < hand.keypoints.length; j++) {
            const keypoint = hand.keypoints[j];
            const mirroredX = canvas.width - keypoint.x; // Mirror for selfie view
            
            ctx.fillStyle = '#00ff00'; // Green color
            ctx.beginPath();
            ctx.arc(mirroredX, keypoint.y, 5, 0, 2 * Math.PI);
            ctx.fill();
          }

          // Gesture detection logic (matching your original code)
          if (hand.keypoints) {
            detectGestures(hand as { keypoints: Array<{ x: number; y: number; name: string }> });
          }
        } else {
          // Reset timers when no hand detected
          rightIndexFingerTimerRef.current = 0;
          leftIndexFingerTimerRef.current = 0;
          handTimerRef.current = 0;
          setCurrentGesture(null);
        }

        // Draw progress bar (matching your original code)
        const total = rightIndexFingerTimerRef.current + leftIndexFingerTimerRef.current + handTimerRef.current;
        if (total > 0) {
          const progress = (total / timeToExecute) * canvas.width;
          ctx.fillStyle = '#ffa500'; // Orange color
          ctx.fillRect(0, canvas.height - 20, progress, 20);
        }

      } catch (error) {
        console.error('Detection error:', error);
      }

      // Continue the loop
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(detectAndDraw);
      }
    };

    detectAndDraw();
  }, [isActive]);

  // Gesture detection logic (adapted from your original code)
  const detectGestures = (hand: { keypoints: Array<{ x: number; y: number; name: string }> }) => {
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
  };

  // Helper functions (from your original code)
  const isFingerStretched = (hand: { keypoints: Array<{ x: number; y: number; name: string }> }, fingerName: string): boolean => {
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
  };

  const isFingerPointingLeftRight = (hand: { keypoints: Array<{ x: number; y: number; name: string }> }, fingerName: string): string => {
    const tip = hand.keypoints.find((k) => k.name === `${fingerName}_tip`);
    const mcp = hand.keypoints.find((k) => k.name === `${fingerName}_mcp`);

    if (!tip || !mcp) return "unknown";
    return tip.x > mcp.x ? "left" : "right";
  };

  const isFingerPointingUp = (hand: { keypoints: Array<{ x: number; y: number; name: string }> }, fingerName: string): boolean => {
    const tip = hand.keypoints.find((k) => k.name === `${fingerName}_tip`);
    const mcp = hand.keypoints.find((k) => k.name === `${fingerName}_mcp`);

    if (!tip || !mcp) return false;
    return tip.y < mcp.y;
  };

  const isHandOpen = (hand: { keypoints: Array<{ x: number; y: number; name: string }> }): boolean => {
    const fingers = ["index_finger", "middle_finger", "ring_finger"];
    return fingers.every(finger => isFingerStretched(hand, finger));
  };

  // Initialize on mount
  useEffect(() => {
    initializeDetection();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
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
      {/* Video and Canvas Container */}
      <div className="relative">
        <video
          ref={videoRef}
          className={`${showVideo ? 'block' : 'hidden'} w-full max-w-md rounded-lg border-2 border-gray-300`}
          autoPlay
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }} // Mirror the video
        />
        
        {/* Canvas overlay for drawing keypoints */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }} // Mirror the canvas too
        />

        {/* Status Overlay */}
        {showVideo && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {isLoading ? 'Loading...' : 'Active'}
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