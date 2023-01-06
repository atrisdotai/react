
// TODO: add better security to this
export const postMessage = (type: string, value: any, origin = '*') => {
  // get comet iframe
  const iframe = document.querySelector('#cometsdk_iframe') as HTMLIFrameElement;
  if (iframe) {
    const topWindow = iframe.contentWindow;
    if (topWindow) {
      topWindow.postMessage({ type, value }, origin);
    }
  }
}
