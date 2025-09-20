# VeCook Gesture Recognition Testing

## Quick Test Guide

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the gesture test page**:
   - Go to `http://localhost:3000/gesture-test`
   - Or click "Gesture Test" in the navigation

3. **Allow camera access** when prompted

4. **Click "Start Detection"** to begin gesture recognition

## Supported Gestures

### 👉 Point Right
- **Action**: Navigate to next recipe step
- **How to**: Point your index finger to the right
- **Hold for**: ~3 seconds

### 👈 Point Left  
- **Action**: Go to previous recipe step
- **How to**: Point your index finger to the left
- **Hold for**: ~3 seconds

### ✋ Hand Raise
- **Action**: Ask for AI help
- **How to**: Raise your hand with index, middle, and ring fingers extended upward
- **Hold for**: ~3 seconds

## Tips for Best Results

- **Good lighting**: Ensure your hand is well-lit
- **Clear background**: Avoid cluttered backgrounds behind your hand
- **Steady hand**: Hold gestures steady for the required time
- **Camera distance**: Keep your hand 1-2 feet from the camera
- **Single hand**: Use one hand at a time for best detection

## Troubleshooting

### Camera Issues
- Check browser permissions for camera access
- Try refreshing the page
- Ensure no other applications are using the camera

### Gesture Not Detected
- Make sure your hand is clearly visible
- Hold the gesture steady for the full duration
- Check the progress bar at the bottom of the video feed
- Try adjusting lighting or camera angle

### Performance Issues
- Close other browser tabs to free up resources
- Ensure good internet connection for ML5.js loading
- Try restarting the detection

## Technical Details

- **ML5.js**: Uses MediaPipe HandPose model for hand tracking
- **Detection Rate**: 10 FPS (every 100ms)
- **Confidence Threshold**: Optimized for accuracy
- **Timer System**: Prevents accidental triggers with 3-second hold requirement

## Integration with Recipes

Once gesture recognition is working in the test page, you can use it in actual recipes:

1. Go to `/recipes` and select any recipe
2. Click "Start Cooking" to enter cooking mode
3. Gesture navigation will be available during cooking

The same gestures work in cooking mode to navigate recipe steps hands-free!