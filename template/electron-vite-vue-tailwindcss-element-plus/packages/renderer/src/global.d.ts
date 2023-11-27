
export { }

declare global {
  interface Window {
    removeLoading: () => void
  }
}

declare module '@kangc/v-md-editor';