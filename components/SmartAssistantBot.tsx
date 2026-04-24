/**
 * SmartAssistantBot - legacy shim.
 * The new floating AI assistant lives in components/floating-assistant/.
 * This file re-exports FloatingAssistant so any existing imports don't break.
 */
export { FloatingAssistant as default } from './floating-assistant'
