import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './theme.css'

// DEBUG: Show errors on screen
const errorDiv = document.createElement('div');
errorDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:40vh;overflow:auto;background:rgba(0,0,0,0.9);color:#ff4444;font:12px monospace;padding:8px;z-index:99999;white-space:pre-wrap;pointer-events:auto;';
errorDiv.id = 'error-overlay';
errorDiv.style.display = 'none';
document.body.appendChild(errorDiv);

function showError(msg: string) {
  errorDiv.style.display = 'block';
  errorDiv.textContent += msg + '\n\n';
}

window.addEventListener('error', (e) => {
  showError(`ERROR: ${e.message}\n  at ${e.filename}:${e.lineno}:${e.colno}`);
});
window.addEventListener('unhandledrejection', (e) => {
  showError(`UNHANDLED REJECTION: ${e.reason}`);
});
const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  showError('console.error: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
};
const origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  origWarn.apply(console, args);
  showError('console.warn: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
