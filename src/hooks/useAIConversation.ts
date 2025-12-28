/**
 * Hook for managing AI conversation state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ConversationMode } from '../types/conversationMode';
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
  mode: ConversationMode;
  sendMessage: (message: string) => Promise<void>;
  setMode: (mode: ConversationMode) => void;
  reset: () => void;
  completeness: number;
}

export function useAIConversation(initialMode: ConversationMode = 'professional'): UseAIConversationResult {
  const [context, setContext] = useState<ConversationContext>(() => initializeConversation(initialMode));
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Cancel any in-flight request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      // Process message (this adds both user and AI messages)
      const { updatedContext } = await processUserMessage(userMessage, context);

      setContext(updatedContext);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process message';
      setError(errorMessage);
      console.error('AI conversation error:', err);

      // Add user message and error message to chat
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };

      const errorMsg: Message = {
        id: `error-${Date.now() + 1}`,
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or rephrase your message.`,
        timestamp: new Date(),
      };

      setContext(prev => ({
        ...prev,
        messages: [...prev.messages, userMsg, errorMsg],
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [context, isProcessing]);

  const setMode = useCallback((newMode: ConversationMode) => {
    setContext(initializeConversation(newMode));
    setError(null);
    setIsProcessing(false);
  }, []);

  const reset = useCallback(() => {
    setContext(prev => initializeConversation(prev.mode));
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
    mode: context.mode,
    sendMessage,
    setMode,
    reset,
    completeness: context.draft.completeness,
  };
}

