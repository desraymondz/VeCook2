'use client';

import { useState } from 'react';
import P5GestureDetector from '@/components/gesture/P5GestureDetector';
import type { GestureType } from '@/lib/types';
import Button from '@/components/ui/Button';

export default function GestureTestPage() {
  const [detectedGestures, setDetectedGestures] = useState<Array<{
    gesture: GestureType;
    timestamp: Date;
  }>>([]);
  const [isDetectionActive, setIsDetectionActive] = useState(false);

  const handleGestureDetected = (gesture: GestureType) => {
    setDetectedGestures(prev => [
      {
        gesture,
        timestamp: new Date(),
      },
      ...prev.slice(0, 9) // Keep last 10 gestures
    ]);
  };

  const handleStartDetection = () => {
    setIsDetectionActive(true);
  };

  const handleStopDetection = () => {
    setIsDetectionActive(false);
  };

  const clearHistory = () => {
    setDetectedGestures([]);
  };

  const gestureEmojis: Record<GestureType, string> = {
    point_right: '👉',
    point_left: '👈',
    hand_raise: '✋',
    thumbs_up: '👍',
    stop: '🛑'
  };

  const gestureDescriptions: Record<GestureType, string> = {
    point_right: 'Point Right - Navigate to next step',
    point_left: 'Point Left - Go to previous step',
    hand_raise: 'Hand Raise - Ask for AI help',
    thumbs_up: 'Thumbs Up - Confirm action',
    stop: 'Stop - Pause cooking'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Gesture Recognition Test
        </h1>
        <p className="text-gray-600">
          Test the ML5.js hand gesture recognition system for VeCook
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Camera and Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Gesture Detection</h2>
            
            <P5GestureDetector
              onGestureDetected={handleGestureDetected}
              isActive={isDetectionActive}
              className="mb-4"
            />

            <div className="flex gap-3">
              {!isDetectionActive ? (
                <Button onClick={handleStartDetection}>
                  Start Detection
                </Button>
              ) : (
                <Button onClick={handleStopDetection} variant="secondary">
                  Stop Detection
                </Button>
              )}
              <Button onClick={clearHistory} variant="outline">
                Clear History
              </Button>
            </div>

            {/* Status */}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    isDetectionActive ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isDetectionActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gesture Guide */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Supported Gestures</h3>
            <div className="space-y-3">
              {Object.entries(gestureDescriptions).map(([gesture, description]) => (
                <div key={gesture} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className="text-2xl">{gestureEmojis[gesture as GestureType]}</span>
                  <span className="text-sm text-gray-700">{description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detection History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Detection History</h2>
          
          {detectedGestures.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👋</div>
              <p>No gestures detected yet</p>
              <p className="text-sm mt-1">Start detection and try the gestures above</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detectedGestures.map((detection, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{gestureEmojis[detection.gesture]}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {detection.gesture.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {detection.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Detected
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-blue-900 font-semibold mb-2">Testing Instructions</h3>
        <ol className="text-blue-800 text-sm space-y-1 ml-4">
          <li>1. Allow camera access when prompted</li>
          <li>2. Click &quot;Start Detection&quot; to begin gesture recognition</li>
          <li>3. Position your hand clearly in front of the camera</li>
          <li>4. Try the different gestures listed above</li>
          <li>5. Check the detection history to see results</li>
        </ol>
        <p className="text-blue-700 text-sm mt-3">
          <strong>Note:</strong> Gesture detection works best with good lighting and a clear background.
        </p>
      </div>
    </div>
  );
}