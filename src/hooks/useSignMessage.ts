
import React from 'react';
import Deferred from '../core/deferred';
import { CometContext, CometModalRequestType } from '../components/CometProvider';

const useSignMessage = (message: Buffer) => {
  const context = React.useContext(CometContext);
  const signatureDeferred = React.useRef<Deferred<Uint8Array>>(new Deferred());

  if (context === undefined) {
    throw new Error('useSignMessage must be used within a CometProvider');
  }

  React.useEffect(() => {
    // listen for cometsdk_requestSignMessage event
    window.addEventListener('message', messageHandler);

    return () => {
      // cleanup
      window.removeEventListener('message', messageHandler);
    }
  }, []);

  const messageHandler = (event: MessageEvent) => {
    if (event.data.type === 'cometsdk_requestSignMessage') {
      const element = (event.source as Window);

      if (element) {
        element.postMessage({
          type: 'cometsdk_startSignMessage',
          value: {
            message: message,
            title: document.title,
          },
        }, '*');
      }
    } else if (event.data.type === 'cometsdk_finishSignMessage') {
      const { success, signature } = event.data.value;

      if (success) {
        signatureDeferred.current.resolve(signature);
      } else {
        signatureDeferred.current.reject(new Error('User rejected signing message'));
      }

      context.closeModal();
      context.setModalRequest(null);
    }
  };

  const signMessage = () => {
    context.setModalRequest({
      type: CometModalRequestType.SignMessage,
      closeable: false,
      config: {
        appTitle: document.title,
      },
    });
    context.openModal();

    return signatureDeferred.current.promise;
  }

  return {
    signMessage,
  };
}

export default useSignMessage;
