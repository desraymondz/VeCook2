// TypeScript declarations for ML5.js

declare module 'ml5' {
  export interface HandPose {
    keypoints: Array<{
      x: number;
      y: number;
      z?: number;
      name?: string;
    }>;
    handedness: string;
    score: number;
  }

  export interface HandPoseOptions {
    flipHorizontal?: boolean;
    maxNumHands?: number;
    scoreThreshold?: number;
    detectionConfidence?: number;
    trackingConfidence?: number;
  }

  export interface HandPoseModel {
    detect(
      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
      callback?: (error: Error | null, results: HandPose[]) => void
    ): Promise<HandPose[]>;
    
    detectStart(
      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
      callback: (error: Error | null, results: HandPose[]) => void
    ): void;
    
    detectStop(): void;
  }

  export interface PoseNetPose {
    pose: {
      keypoints: Array<{
        position: { x: number; y: number };
        part: string;
        score: number;
      }>;
      leftAngle?: number;
      rightAngle?: number;
    };
    skeleton: Array<[{ position: { x: number; y: number } }, { position: { x: number; y: number } }]>;
  }

  export interface PoseNetOptions {
    architecture?: 'MobileNetV1' | 'ResNet50';
    imageScaleFactor?: number;
    outputStride?: number;
    flipHorizontal?: boolean;
    minConfidence?: number;
    maxPoseDetections?: number;
    scoreThreshold?: number;
    nmsRadius?: number;
    detectionType?: 'single' | 'multiple';
    inputResolution?: number;
    multiplier?: number;
    quantBytes?: number;
  }

  export interface PoseNetModel {
    singlePose(
      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ): Promise<PoseNetPose>;
    
    multiPose(
      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ): Promise<PoseNetPose[]>;
    
    on(event: 'pose', callback: (results: PoseNetPose[]) => void): void;
  }

  // Main ML5 functions
  export function handPose(
    video?: HTMLVideoElement,
    options?: HandPoseOptions,
    callback?: () => void
  ): HandPoseModel;

  export function poseNet(
    video?: HTMLVideoElement,
    options?: PoseNetOptions,
    callback?: () => void
  ): PoseNetModel;

  // Utility functions
  export function preload(): void;
}

// Global ML5 and P5 objects
declare global {
  interface Window {
    ml5: typeof import('ml5');
    p5: unknown;
  }
}

export default ml5;