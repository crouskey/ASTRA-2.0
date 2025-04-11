// client/components/PixelAvatar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PixelAvatarProps {
  emotion: string;
  size?: number;
  pulseIntensity?: number;
}

const PixelAvatar: React.FC<PixelAvatarProps> = ({
  emotion = 'neutral',
  size = 100,
  pulseIntensity = 1.2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<any>(null);
  const [isGlowing, setIsGlowing] = useState(false);

  // Fetch the configuration for the emotion
  useEffect(() => {
    // This would typically come from the emotion service
    // For now, we'll define it inline
    const emotionConfig = getPixelFaceConfig(emotion);
    setConfig(emotionConfig);
    
    // Reset the glow state when emotion changes
    setIsGlowing(false);
  }, [emotion]);

  // Draw the pixel face when the configuration changes
  useEffect(() => {
    if (!canvasRef.current || !config) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set the background color
    ctx.fillStyle = config.background.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the eyes
    drawEyes(ctx, canvas.width, canvas.height, config.eyes);

    // Draw the mouth
    drawMouth(ctx, canvas.width, canvas.height, config.mouth);

  }, [config]);

  // Setup the glow pulse animation
  useEffect(() => {
    if (!config?.background.glow) return;
    
    const pulseTimer = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, config.background.pulseRate || 2000);
    
    return () => clearInterval(pulseTimer);
  }, [config]);

  // Draw the eyes based on the configuration
  const drawEyes = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    eyesConfig: any
  ) => {
    ctx.fillStyle = eyesConfig.color;
    
    const eyeSize = eyesConfig.size;
    const spacing = width / 3;
    
    // Calculate positions
    const leftEyeX = width / 2 - spacing / 2;
    const rightEyeX = width / 2 + spacing / 2;
    const eyeY = height * 0.4;
    
    // Draw based on shape
    switch (eyesConfig.shape) {
      case 'arc':
        // Draw happy arced eyes
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI, true);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI, true);
        ctx.fill();
        break;
        
      case 'round':
        // Draw round eyes
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'narrow':
        // Draw narrow eyes (focused)
        ctx.fillRect(leftEyeX - eyeSize, eyeY - eyeSize / 3, eyeSize * 2, eyeSize / 1.5);
        ctx.fillRect(rightEyeX - eyeSize, eyeY - eyeSize / 3, eyeSize * 2, eyeSize / 1.5);
        break;
        
      case 'round-uneven':
        // Draw uneven eyes (confused)
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, eyeSize * 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY - eyeSize / 2, eyeSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'sparkle':
        // Draw sparkle eyes (excited)
        // Star shape for each eye
        drawStar(ctx, leftEyeX, eyeY, eyeSize, 8);
        drawStar(ctx, rightEyeX, eyeY, eyeSize, 8);
        break;
        
      default:
        // Default to round eyes
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  };

  // Draw a star shape (for sparkle eyes)
  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    points: number
  ) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? size : size / 2;
      const angle = (i * Math.PI) / points;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  };

  // Draw the mouth based on the configuration
  const drawMouth = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mouthConfig: any
  ) => {
    ctx.fillStyle = mouthConfig.color;
    ctx.strokeStyle = mouthConfig.color;
    ctx.lineWidth = mouthConfig.size / 3;
    
    const mouthWidth = mouthConfig.size * 1.5;
    const mouthY = height * 0.65;
    
    // Draw based on shape
    switch (mouthConfig.shape) {
      case 'smile':
        // Draw a smile
        ctx.beginPath();
        ctx.arc(width / 2, mouthY, mouthWidth, 0, Math.PI);
        ctx.stroke();
        break;
        
      case 'smile-small':
        // Draw a smaller smile
        ctx.beginPath();
        ctx.arc(width / 2, mouthY, mouthWidth * 0.7, 0, Math.PI);
        ctx.stroke();
        break;
        
      case 'line':
        // Draw a straight line
        ctx.beginPath();
        ctx.moveTo(width / 2 - mouthWidth, mouthY);
        ctx.lineTo(width / 2 + mouthWidth, mouthY);
        ctx.stroke();
        break;
        
      case 'line-slight-smile':
        // Draw a slight smile
        ctx.beginPath();
        ctx.moveTo(width / 2 - mouthWidth, mouthY);
        ctx.quadraticCurveTo(width / 2, mouthY + mouthWidth * 0.2, width / 2 + mouthWidth, mouthY);
        ctx.stroke();
        break;
        
      case 'line-slight-frown':
        // Draw a slight frown
        ctx.beginPath();
        ctx.moveTo(width / 2 - mouthWidth, mouthY);
        ctx.quadraticCurveTo(width / 2, mouthY - mouthWidth * 0.2, width / 2 + mouthWidth, mouthY);
        ctx.stroke();
        break;
        
      case 'frown':
        // Draw a frown
        ctx.beginPath();
        ctx.arc(width / 2, mouthY + mouthWidth, mouthWidth, Math.PI, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'frown-small':
        // Draw a smaller frown
        ctx.beginPath();
        ctx.arc(width / 2, mouthY + mouthWidth * 0.7, mouthWidth * 0.7, Math.PI, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'zigzag':
        // Draw a zigzag (confused)
        ctx.beginPath();
        ctx.moveTo(width / 2 - mouthWidth, mouthY);
        ctx.lineTo(width / 2 - mouthWidth / 2, mouthY + mouthWidth / 3);
        ctx.lineTo(width / 2, mouthY - mouthWidth / 3);
        ctx.lineTo(width / 2 + mouthWidth / 2, mouthY + mouthWidth / 3);
        ctx.lineTo(width / 2 + mouthWidth, mouthY);
        ctx.stroke();
        break;
        
      case 'smile-open':
        // Draw an open smile
        ctx.beginPath();
        ctx.arc(width / 2, mouthY, mouthWidth, 0, Math.PI);
        ctx.fill();
        break;
        
      default:
        // Default to a line
        ctx.beginPath();
        ctx.moveTo(width / 2 - mouthWidth, mouthY);
        ctx.lineTo(width / 2 + mouthWidth, mouthY);
        ctx.stroke();
        break;
    }
  };

  // Get the configuration for an emotion
  const getPixelFaceConfig = (emotion: string): any => {
    // This would typically come from the emotion service
    // For simplicity, we'll just return a basic configuration
    return {
      eyes: {
        shape: emotion === 'happy' ? 'arc' : 'round',
        color: '#3498db',
        size: 5,
      },
      mouth: {
        shape: emotion === 'happy' ? 'smile' : 'line',
        color: '#3498db',
        size: 6,
      },
      background: {
        color: '#f7f7f7',
        glow: emotion === 'happy',
        pulseRate: 2000,
      },
    };
  };

  return (
    <div className="pixel-avatar-container">
      <AnimatePresence>
        <motion.div
          key={emotion}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            scale: isGlowing && config?.background.glow ? pulseIntensity : 1 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 0.3 },
            scale: { duration: 0.5, ease: 'easeInOut' }
          }}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: isGlowing && config?.background.glow 
              ? `0 0 ${size / 4}px ${config.background.color}`
              : 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PixelAvatar;
