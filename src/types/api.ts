/**
 * API Types for AI services and responses
 */

// AI Message structure for LLM API
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI LLM API request payload
export interface AIRequestPayload {
  messages: AIMessage[];
  stream: boolean;
}

// AI LLM API response structure
export interface AIResponse {
  completion: string;
  // Add other fields that might be in the response
} 