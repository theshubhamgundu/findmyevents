/// <reference types="vite/client" />

declare global {
  interface Window {
    currentMediaStream?: MediaStream;
  }
}
