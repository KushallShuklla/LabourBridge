export const sanitizeForLog = (input: any): string => {
  if (typeof input !== 'string') {
    input = String(input);
  }
  return input.replace(/[\r\n\t]/g, ' ').substring(0, 200);
};

export const safeLog = {
  error: (message: string, data?: any) => {
    console.error(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  },
  info: (message: string, data?: any) => {
    console.info(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  }
};