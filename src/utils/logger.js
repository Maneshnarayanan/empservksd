function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  let logStr = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    // Redact sensitive keys if present
    const cleanMeta = { ...meta };
    for (const key of ['password', 'passwordHash', 'token', 'secret', 'session', 'cookie']) {
      if (cleanMeta[key]) cleanMeta[key] = '[REDACTED]';
    }
    logStr += ` ${JSON.stringify(cleanMeta)}`;
  }
  return logStr;
}

const logger = {
  info: (msg, meta) => console.log(formatMessage('info', msg, meta)),
  warn: (msg, meta) => console.warn(formatMessage('warn', msg, meta)),
  error: (msg, meta) => console.error(formatMessage('error', msg, meta)),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', msg, meta));
    }
  },
};

module.exports = logger;
