'use client';

import { useEffect, useRef, useState } from 'react';
import { GESTURE_CONFIG } from '@/lib/constants';

interface CameraHandlerProps {
  onCameraReady?: (video: HTMLVideoElement) => void;
  onError?: (error: string) => void;
  showVideo?: boolean;
  className?: string;
}

export default function CameraHandler({
  onCameraReady,
  onError,
  showVideo = true,
  className = ''
}: CameraHandlerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if camera is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported in this browser');
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: GESTURE_CONFIG.CAMERA_WIDTH },
            height: { ideal: GESTURE_CONFIG.CAMERA_HEIGHT },
            facingMode: 'user'
          },
          audio: false
        });

        streamRef.current = stream;
        setPermission('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            setIsLoading(false);
            if (onCameraReady && videoRef.current) {
              onCameraReady(videoRef.current);
            }
          };

          videoRef.current.onerror = () => {
            const errorMsg = 'Video playback failed';
            setError(errorMsg);
            setIsLoading(false);
            if (onError) onError(errorMsg);
          };

          await videoRef.current.play();
        }

      } catch (err) {
        console.error('Camera initialization failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Camera access failed';
        
        if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
          setPermission('denied');
          setError('Camera permission denied. Please allow camera access and refresh the page.');
        } else if (errorMessage.includes('NotFoundError')) {
          setError('No camera found. Please connect a camera and try again.');
        } else {
          setError(errorMessage);
        }
        
        setIsLoading(false);
        if (onError) onError(errorMessage);
      }
    };

    initializeCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [onCameraReady, onError]);

  const retryCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setError(null);
    setPermission('prompt');
    // The useEffect will trigger re-initialization
  };

  return (
    <div className={`camera-handler ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`${showVideo ? 'block' : 'hidden'} w-full rounded-lg border-2 border-gray-300`}
        autoPlay
        playsInline
        muted
        style={{
          maxWidth: `${GESTURE_CONFIG.CAMERA_WIDTH}px`,
          maxHeight: `${GESTURE_CONFIG.CAMERA_HEIGHT}px`
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="animate-spin w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600 text-center">
            Initializing camera...
          </p>
          <p className="text-gray-500 text-sm text-center mt-2">
            Please allow camera access when prompted
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">📷</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-medium mb-1">Camera Error</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              
              {permission === 'denied' && (
                <div className="bg-red-100 rounded p-3 mb-3">
                  <p className="text-red-800 text-sm font-medium mb-2">To enable camera access:</p>
                  <ol className="text-red-700 text-xs space-y-1 ml-4">
                    <li>1. Click the camera icon in your browser&apos;s address bar</li>
                    <li>2. Select &quot;Allow&quot; for camera access</li>
                    <li>3. Refresh this page</li>
                  </ol>
                </div>
              )}
              
              <button
                onClick={retryCamera}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State Info */}
      {!isLoading && !error && permission === 'granted' && (
        <div className="text-center mt-2">
          <p className="text-green-600 text-sm">
            ✅ Camera ready for gesture recognition
          </p>
        </div>
      )}
    </div>
  );
}