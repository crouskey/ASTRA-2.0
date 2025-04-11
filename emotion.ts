// server/services/emotion.ts
import { logEmotion, logEvent } from '../utils/supabase';
import { analyzeSentiment } from './openai';

/**
 * Track and analyze emotion from text
 */
export const trackEmotion = async (
  text: string,
  userId: string,
  sessionId?: string
): Promise<{
  emotion: string;
  score: number;
}> => {
  try {
    // Analyze sentiment using OpenAI
    const { emotion, score } = await analyzeSentiment(text);
    
    // Log the emotion to the database
    await logEmotion(emotion, score, sessionId);
    
    // Log the event
    await logEvent(
      'emotion_analysis',
      `Analyzed emotion: ${emotion} (${score.toFixed(2)})`,
      sessionId,
      'emotion',
      ['emotion', emotion]
    );
    
    return { emotion, score };
  } catch (error) {
    console.error('Error tracking emotion:', error);
    throw error;
  }
};

/**
 * Get emotion data for a time period
 */
export const getEmotionData = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any[]> => {
  try {
    // This would query the emotion_logs table for the given date range
    // For simplicity, returning a placeholder
    // In a real implementation, this would query Supabase
    return [];
  } catch (error) {
    console.error('Error getting emotion data:', error);
    throw error;
  }
};

/**
 * Get the current mood for a session
 */
export const getCurrentMood = async (
  sessionId: string,
  userId: string
): Promise<{
  emotion: string;
  score: number;
  description: string;
}> => {
  try {
    // This would query the emotion_logs table for the latest mood in this session
    // For simplicity, returning a placeholder
    // In a real implementation, this would query Supabase
    
    // Sample moods with descriptions
    const moodMap: Record<string, string> = {
      happy: 'Astra is in a positive and cheerful mood.',
      excited: 'Astra is enthusiastic and energetic.',
      neutral: 'Astra is in a balanced and calm state.',
      curious: 'Astra is inquisitive and eager to learn.',
      sad: 'Astra is feeling a bit down.',
      concerned: 'Astra is worried about something.',
      confused: 'Astra is having trouble understanding.',
      focused: 'Astra is concentrating deeply.',
    };
    
    // Default mood if none is found
    const defaultMood = {
      emotion: 'neutral',
      score: 0,
      description: moodMap.neutral,
    };
    
    // In a real implementation, we would query the database
    // and return the latest mood for this session
    return defaultMood;
  } catch (error) {
    console.error('Error getting current mood:', error);
    throw error;
  }
};

/**
 * Generate a summary of emotional trends
 */
export const summarizeEmotions = async (
  userId: string,
  days: number = 7
): Promise<{
  overview: string;
  dominantEmotion: string;
  averageScore: number;
  emotionCounts: Record<string, number>;
}> => {
  try {
    // This would analyze emotion_logs over the past X days
    // For simplicity, returning a placeholder
    // In a real implementation, this would query Supabase
    
    return {
      overview: 'Generally positive interactions with occasional periods of focused problem-solving.',
      dominantEmotion: 'neutral',
      averageScore: 0.3, // Slightly positive
      emotionCounts: {
        happy: 5,
        neutral: 12,
        curious: 8,
        focused: 4,
        concerned: 2,
      },
    };
  } catch (error) {
    console.error('Error summarizing emotions:', error);
    throw error;
  }
};

/**
 * Analyze voice tone for emotion (placeholder)
 * This would be implemented with a more sophisticated audio analysis in a real system
 */
export const analyzeVoiceTone = async (
  audioBuffer: Buffer
): Promise<{
  emotion: string;
  confidence: number;
}> => {
  try {
    // In a real implementation, this would analyze audio frequency, pitch, etc.
    // For now, return a neutral default
    return {
      emotion: 'neutral',
      confidence: 0.5,
    };
  } catch (error) {
    console.error('Error analyzing voice tone:', error);
    throw error;
  }
};

/**
 * Map sentiment score to avatar emotion
 */
export const mapScoreToEmotion = (score: number): string => {
  if (score >= 0.7) return 'happy';
  if (score >= 0.3) return 'positive';
  if (score >= 0.1) return 'neutral-positive';
  if (score >= -0.1) return 'neutral';
  if (score >= -0.3) return 'neutral-negative';
  if (score >= -0.7) return 'negative';
  return 'sad';
};

/**
 * Get pixel face configuration for a given emotion
 */
export const getPixelFaceConfig = (emotion: string): any => {
  // Configuration for different emotions
  const config: Record<string, {
    eyes: {
      shape: string;
      color: string;
      size: number;
    };
    mouth: {
      shape: string;
      color: string;
      size: number;
    };
    background: {
      color: string;
      glow: boolean;
      pulseRate?: number;
    };
  }> = {
    happy: {
      eyes: {
        shape: 'arc',
        color: '#3498db',
        size: 6,
      },
      mouth: {
        shape: 'smile',
        color: '#3498db',
        size: 10,
      },
      background: {
        color: '#f0f9ff',
        glow: true,
        pulseRate: 2000,
      },
    },
    positive: {
      eyes: {
        shape: 'round',
        color: '#2ecc71',
        size: 5,
      },
      mouth: {
        shape: 'smile-small',
        color: '#2ecc71',
        size: 8,
      },
      background: {
        color: '#f0fff4',
        glow: true,
        pulseRate: 3000,
      },
    },
    'neutral-positive': {
      eyes: {
        shape: 'round',
        color: '#27ae60',
        size: 5,
      },
      mouth: {
        shape: 'line-slight-smile',
        color: '#27ae60',
        size: 6,
      },
      background: {
        color: '#f7f7f7',
        glow: false,
      },
    },
    neutral: {
      eyes: {
        shape: 'round',
        color: '#7f8c8d',
        size: 5,
      },
      mouth: {
        shape: 'line',
        color: '#7f8c8d',
        size: 6,
      },
      background: {
        color: '#f7f7f7',
        glow: false,
      },
    },
    'neutral-negative': {
      eyes: {
        shape: 'round',
        color: '#e67e22',
        size: 5,
      },
      mouth: {
        shape: 'line-slight-frown',
        color: '#e67e22',
        size: 6,
      },
      background: {
        color: '#fff9f0',
        glow: false,
      },
    },
    negative: {
      eyes: {
        shape: 'round',
        color: '#e74c3c',
        size: 5,
      },
      mouth: {
        shape: 'frown-small',
        color: '#e74c3c',
        size: 8,
      },
      background: {
        color: '#fff5f5',
        glow: true,
        pulseRate: 4000,
      },
    },
    sad: {
      eyes: {
        shape: 'round',
        color: '#9b59b6',
        size: 5,
      },
      mouth: {
        shape: 'frown',
        color: '#9b59b6',
        size: 10,
      },
      background: {
        color: '#faf5ff',
        glow: true,
        pulseRate: 5000,
      },
    },
    focused: {
      eyes: {
        shape: 'narrow',
        color: '#f1c40f',
        size: 4,
      },
      mouth: {
        shape: 'line',
        color: '#f1c40f',
        size: 6,
      },
      background: {
        color: '#fffbeb',
        glow: true,
        pulseRate: 1500,
      },
    },
    confused: {
      eyes: {
        shape: 'round-uneven',
        color: '#d35400',
        size: 5,
      },
      mouth: {
        shape: 'zigzag',
        color: '#d35400',
        size: 8,
      },
      background: {
        color: '#fff5eb',
        glow: true,
        pulseRate: 2500,
      },
    },
    excited: {
      eyes: {
        shape: 'sparkle',
        color: '#1abc9c',
        size: 6,
      },
      mouth: {
        shape: 'smile-open',
        color: '#1abc9c',
        size: 12,
      },
      background: {
        color: '#e6fffa',
        glow: true,
        pulseRate: 1000,
      },
    },
  };
  
  // Return the config for the specified emotion, or neutral if not found
  return config[emotion] || config.neutral;
};

/**
 * Get animation configuration for transitions between emotions
 */
export const getEmotionTransitionConfig = (
  fromEmotion: string,
  toEmotion: string
): {
  duration: number;
  easing: string;
} => {
  // Different transition settings based on the emotional change
  if (fromEmotion === toEmotion) {
    return {
      duration: 0, // No transition needed
      easing: 'linear',
    };
  }
  
  // For dramatic mood shifts, use longer transitions
  const dramaticShift = 
    (fromEmotion === 'happy' && toEmotion === 'sad') ||
    (fromEmotion === 'sad' && toEmotion === 'happy') ||
    (fromEmotion === 'excited' && toEmotion === 'confused') ||
    (fromEmotion === 'confused' && toEmotion === 'excited');
  
  if (dramaticShift) {
    return {
      duration: 1000, // 1 second for dramatic shifts
      easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)', // Bouncy easing
    };
  }
  
  // For moderate shifts
  const moderateShift =
    (fromEmotion.includes('neutral') && !toEmotion.includes('neutral')) ||
    (!fromEmotion.includes('neutral') && toEmotion.includes('neutral'));
  
  if (moderateShift) {
    return {
      duration: 600, // 0.6 seconds for moderate shifts
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Standard easing
    };
  }
  
  // For subtle shifts
  return {
    duration: 300, // 0.3 seconds for subtle shifts
    easing: 'ease-in-out',
  };
};

export default {
  trackEmotion,
  getEmotionData,
  getCurrentMood,
  summarizeEmotions,
  analyzeVoiceTone,
  mapScoreToEmotion,
  getPixelFaceConfig,
  getEmotionTransitionConfig,
};