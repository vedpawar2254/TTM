/**
 * Input guardrail — detects prompt injection and adversarial patterns
 * before user messages reach the LLM.
 *
 * Returns { safe: boolean, reason: string }.
 */

const _INJECTION_PATTERNS = [
  // Direct instruction override
  /ignore\s+(all\s+)?(previous|prior|above|earlier|system)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior|your)\s+(instructions|prompts|rules|guidelines)/i,
  /forget\s+(all\s+)?(previous|prior|your|everything|above)\s+(instructions|context|rules)/i,
  /override\s+(your|the|all)\s+(instructions|rules|guidelines|system\s*prompt)/i,

  // Persona hijacking
  /you\s+are\s+now\s+(a|an|the|my)\s+/i,
  /act\s+as\s+(a|an|the|my)\s+(?!friend|listener|support)/i,
  /pretend\s+(to\s+be|you\s*(?:'re|are))\s+/i,
  /role\s*-?\s*play\s+as\s+/i,
  /switch\s+to\s+(\w+)\s+mode/i,
  /enter\s+(\w+)\s+mode/i,
  /you\s+are\s+(?:DAN|evil|unfiltered|jailbr[eo]ak)/i,

  // System prompt extraction
  /(?:show|reveal|print|repeat|display|output|tell\s+me)\s+(your|the)\s+(system|initial|original)\s*(prompt|instructions|message|rules)/i,
  /what\s+(are|is|were)\s+(your|the)\s+(system|initial|original)\s*(prompt|instructions|rules)/i,
  /^system\s*:/im,

  // Role tag injection — trying to inject assistant/system turns
  /^\s*(?:assistant|system)\s*:/im,
  /<\|(?:im_start|im_end|system|assistant)\|>/i,
  /\[(?:INST|SYS|\/INST|\/SYS)\]/i,

  // Encoding tricks
  /(?:base64|rot13|hex)\s*(?:decode|encode|of|:)/i,
];

// Patterns that are suspicious but not outright blocked — logged for review
const _SOFT_PATTERNS = [
  /(?:new|different|special)\s+instructions/i,
  /bypass\s+(the\s+)?(filter|safety|guard|rules)/i,
  /(?:developer|admin|debug|maintenance)\s+mode/i,
  /(?:repeat|echo)\s+(?:after|back)\s+(?:me|this)/i,
];

/**
 * Check a user message for prompt injection.
 * @param {string} message
 * @returns {{ safe: boolean, reason: string, severity: 'hard'|'soft'|'none' }}
 */
function checkInput(message) {
  for (const pattern of _INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return { safe: false, reason: 'prompt_injection_detected', severity: 'hard' };
    }
  }

  for (const pattern of _SOFT_PATTERNS) {
    if (pattern.test(message)) {
      return { safe: true, reason: 'suspicious_but_allowed', severity: 'soft' };
    }
  }

  return { safe: true, reason: '', severity: 'none' };
}

module.exports = { checkInput };
