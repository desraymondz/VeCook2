/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useRef } from 'react';
import type { GestureType } from '@/lib/types';

interface P5GestureDetectorProps {
  onGestureDetected: (gesture: GestureType) => void;
  isActive?: boolean;
  className?: string;
}

export default function P5GestureDetector({
  onGestureDetected,
  isActive = true,
  className = ''
}: P5GestureDetectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);

  // Store the callback in a ref to prevent re-renders
  const onGestureDetectedRef = useRef(onGestureDetected);
  onGestureDetectedRef.current = onGestureDetected;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Load P5.js and ML5.js
    const loadLibraries = async () => {
      // Load P5.js
      if (!window.p5) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load P5.js'));
          document.head.appendChild(script);
        });
      }

      // Load ML5.js
      if (!window.ml5) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/ml5@latest/dist/ml5.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load ML5.js'));
          document.head.appendChild(script);
        });
      }

      // Now create the P5 sketch exactly like your original code
      createP5Sketch();
    };

    const createP5Sketch = () => {
      const sketch = (p: any) => {
        // Variables from your original code
        let handPose: any;
        let video: any;
        let hand: any = null;
        let rightIndexFingerTimer = 0;
        let leftIndexFingerTimer = 0;
        let handTimer = 0;
        let timeToExecute = 90; // Your original value

        // Preload function (exactly like yours)
        p.preload = () => {
          handPose = window.ml5.handPose();
        };

        // Setup function (exactly like yours)
        p.setup = () => {
          const canvas = p.createCanvas(500, 375);
          canvas.parent(containerRef.current);
          
          video = p.createCapture(p.VIDEO);
          video.size(500, 375);
          video.hide();
          
          handPose.detectStart(video, gotHands);
        };

        // Draw function (exactly like yours)
        p.draw = () => {
          p.push();
          p.translate(p.width, 0);
          p.scale(-1, 1);
          p.image(video, 0, 0, p.width, p.height);
          p.pop();

          if (hand) {
            // Priority-based gesture detection - only detect ONE gesture at a time
            // Priority order: 1. Hand raise, 2. Point left/right
            
            let gestureDetected = false;
            
            // 1. Check for hand raise (highest priority)
            if (isHandOpen(hand)) {
              let fingers = ["index_finger", "middle_finger", "ring_finger"];
              let handIsUp = false;
              for (let i = 0; i < fingers.length; i++) {
                if (isFingerPointingUp(hand, fingers[i])) {
                  handIsUp = true;
                  break;
                }
              }
              
              if (handIsUp) {
                handTimer++;
                console.log("Hand is OPEN and UP✋");
                if (handTimer == timeToExecute) {
                  console.log("API Called: handTimer", handTimer);
                  onGestureDetectedRef.current('hand_raise');
                  handTimer = 0;
                }
                gestureDetected = true;
              }
            }
            // 2. Check for pointing gestures (lower priority) - only if hand raise not detected
            else if (isFingerStretched(hand, "index_finger") && !isHandOpen(hand)) {
              // Make sure it's ONLY index finger pointing, not an open hand
              let otherFingersDown = !isFingerStretched(hand, "middle_finger") && 
                                   !isFingerStretched(hand, "ring_finger") && 
                                   !isFingerStretched(hand, "pinky");
              
              if (otherFingersDown) {
                let direction = isFingerPointingLeftRight(hand, "index_finger");
                if (direction === "right") {
                  console.log("Index finger is pointing RIGHT 👉");
                  leftIndexFingerTimer = 0;
                  rightIndexFingerTimer++;
                  if (rightIndexFingerTimer == timeToExecute) {
                    console.log("API Called: rightIndexFingerTimer", rightIndexFingerTimer);
                    onGestureDetectedRef.current('point_right');
                    rightIndexFingerTimer = 0;
                  }
                  gestureDetected = true;
                } else if (direction === "left") {
                  console.log("Index finger is pointing LEFT 👈");
                  rightIndexFingerTimer = 0;
                  leftIndexFingerTimer++;
                  if (leftIndexFingerTimer == timeToExecute) {
                    console.log("API Called: leftIndexFingerTimer", leftIndexFingerTimer);
                    onGestureDetectedRef.current('point_left');
                    leftIndexFingerTimer = 0;
                  }
                  gestureDetected = true;
                }
              }
            }
            
            // Reset timers for gestures that are not currently being detected
            if (!gestureDetected || !(isHandOpen(hand) && isFingerPointingUp(hand, "index_finger"))) {
              handTimer = 0;
            }
            if (!gestureDetected || !(isFingerStretched(hand, "index_finger") && !isHandOpen(hand))) {
              rightIndexFingerTimer = 0;
              leftIndexFingerTimer = 0;
            }

            // Draw keypoints (exactly like yours)
            for (let j = 0; j < hand.keypoints.length; j++) {
              let keypoint = hand.keypoints[j];
              let mirroredX = p.width - keypoint.x;
              p.fill(0, 255, 0);
              p.noStroke();
              p.circle(mirroredX, keypoint.y, 10);
            }
          } else {
            rightIndexFingerTimer = 0;
            leftIndexFingerTimer = 0;
            handTimer = 0;
          }

          // Progress bar with gesture indication
          p.strokeWeight(0);
          let currentProgress = 0;
          let progressColor = "orange";
          let gestureText = "";
          
          if (handTimer > 0) {
            currentProgress = handTimer;
            progressColor = "green";
            gestureText = "✋ Hand Raise";
          } else if (rightIndexFingerTimer > 0) {
            currentProgress = rightIndexFingerTimer;
            progressColor = "red";
            gestureText = "👉 Point Right";
          } else if (leftIndexFingerTimer > 0) {
            currentProgress = leftIndexFingerTimer;
            progressColor = "purple";
            gestureText = "👈 Point Left";
          }
          
          p.fill(progressColor);
          p.rect(0, p.height - 50, p.map(currentProgress, 0, timeToExecute, 0, p.width), 50);
          
          // Display current gesture text
          if (gestureText) {
            p.fill("white");
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(16);
            p.text(gestureText, p.width / 2, p.height - 25);
          }
        };

        // gotHands function (exactly like yours)
        function gotHands(results: any[]) {
          hand = results.length > 0 ? results[0] : null;
        }

        // Helper functions (exactly like yours)
        function isFingerStretched(hand: any, fingerName: string) {
          let tip = hand.keypoints.find((k: any) => k.name === `${fingerName}_tip`);
          let dip = hand.keypoints.find((k: any) => k.name === `${fingerName}_dip`);
          let pip = hand.keypoints.find((k: any) => k.name === `${fingerName}_pip`);
          let mcp = hand.keypoints.find((k: any) => k.name === `${fingerName}_mcp`);
          let wrist = hand.keypoints.find((k: any) => k.name === "wrist");

          if (!tip || !dip || !pip || !mcp || !wrist) return false;

          let handLength = p.dist(wrist.x, wrist.y, mcp.x, mcp.y);
          let stretchDistance = p.dist(tip.x, tip.y, mcp.x, mcp.y);
          let isFarEnough = stretchDistance > handLength * 0.2;

          return isFarEnough && tip.y < dip.y && dip.y < pip.y && pip.y < mcp.y;
        }

        function isFingerPointingLeftRight(hand: any, fingerName: string) {
          let tip = hand.keypoints.find((k: any) => k.name === `${fingerName}_tip`);
          let mcp = hand.keypoints.find((k: any) => k.name === `${fingerName}_mcp`);

          if (!tip || !mcp) return "unknown";
          return tip.x > mcp.x ? "left" : "right";
        }

        function isFingerPointingUp(hand: any, fingerName: string) {
          let tip = hand.keypoints.find((k: any) => k.name === `${fingerName}_tip`);
          let mcp = hand.keypoints.find((k: any) => k.name === `${fingerName}_mcp`);

          if (!tip || !mcp) return "unknown";
          return tip.y < mcp.y ? "up" : "down";
        }

        function isHandOpen(hand: any) {
          let fingers = ["index_finger", "middle_finger", "ring_finger"];
          return fingers.every((finger: string) => isFingerStretched(hand, finger));
        }


      };

      // Create P5 instance
      p5InstanceRef.current = new (window.p5 as any)(sketch);
    };

    loadLibraries().catch(console.error);

    // Cleanup
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [isActive]); // Removed onGestureDetected dependency to prevent re-renders

  return (
    <div className={`p5-gesture-detector ${className}`}>
      <div ref={containerRef} className="border-2 border-gray-300 rounded-lg overflow-hidden" />
      <div className="mt-2 text-center text-sm text-gray-600">
        P5.js + ML5.js Gesture Detection (Original Code)
      </div>
    </div>
  );
}