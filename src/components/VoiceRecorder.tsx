import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  isListening,
  onStartListening,
  onStopListening,
}) => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-IN'; // Indian English for better Hindi name recognition
        
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onTranscription(transcript);
          onStopListening();
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          onStopListening();
        };

        recognitionInstance.onend = () => {
          onStopListening();
        };

        setRecognition(recognitionInstance);
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }
    }
  }, [onTranscription, onStopListening]);

  const handleMicClick = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      onStopListening();
    } else {
      recognition.start();
      onStartListening();
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-muted">
        <p className="text-sm text-muted-foreground text-center">
          Voice recording not supported in this browser. Please use Chrome or Safari.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleMicClick}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className={cn(
          "w-20 h-20 rounded-full transition-all duration-300",
          isListening && "animate-pulse scale-110"
        )}
      >
        {isListening ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </Button>
      
      <div className="text-center">
        <p className="font-medium">
          {isListening ? "🎤 Listening..." : "🎤 Voice Assistant"}
        </p>
        <p className="text-sm text-muted-foreground">
          "Customer name liters" or "Customer paid amount"
        </p>
        <p className="text-xs text-muted-foreground">
          Examples: "Ravi 3" or "Ravi paid 240"
        </p>
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-accent">
          <Volume2 className="w-4 h-4" />
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-accent rounded animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-4 bg-accent rounded animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-4 bg-accent rounded animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;