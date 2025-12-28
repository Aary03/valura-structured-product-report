/**
 * Hook for managing AI conversation state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  initializeConversation,
  processUserMessage,
  type ConversationContext,
  type Message,
} from '../services/ai/aiReportAssistant';

interface UseAIConversationResult {
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
  context: ConversationContext;
  sendMessage: (message: string) => Promise<void>;
  reset: () => void;
  completeness: number;
}

export function useAIConversation(): UseAIConversationResult {
  const [context, setContext] = useState<ConversationContext>(() => initializeConversation());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    // Add user message immediately for better UX
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setContext(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));

    try {
      // Cancel any in-flight request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      const { aiResponse, updatedContext } = await processUserMessage(userMessage, context);

      setContext(updatedContext);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process message';
      setError(errorMessage);
      console.error('AI conversation error:', err);

      // Add error message to chat
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or rephrase your message.`,
        timestamp: new Date(),
      };

      setContext(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [context, isProcessing]);

  const reset = useCallback(() => {
    setContext(initializeConversation());
    setError(null);
    setIsProcessing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    messages: context.messages,
    isProcessing,
    error,
    context,
    sendMessage,
    reset,
    completeness: context.draft.completeness,
  };
}

