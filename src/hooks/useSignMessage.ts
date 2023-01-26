
import React from 'react';
import Deferred from '../core/deferred';
import { CometContext, CometModalRequestType } from '../components/CometProvider';
import { Buffer } from 'buffer';

const useSignMessage = ({
  message,
}: {
  message: string | Buffer | Uint8Array;
}) => {
  const context = React.useContext(CometContext);
  const signatureDeferred = React.useRef<Deferred<Uint8Array> | null>(null);

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
        let messageBuffer;

        if (typeof message === 'string') {
          messageBuffer = Buffer.from(message, 'utf8');
        } else if (message instanceof Buffer) {
          messageBuffer = message;
        } else if (message instanceof Uint8Array) {
          messageBuffer = Buffer.from(message);
        }

        element.postMessage({
          type: 'cometsdk_startSignMessage',
          value: {
            message: messageBuffer?.toString('hex'),
            title: document.title,
          },
        }, context.iframeOrigin);
      }
    } else if (event.data.type === 'cometsdk_finishSignMessage') {
      const { success, signature } = event.data.value;

      if (signatureDeferred.current) {
        if (success) {
          signatureDeferred.current.resolve(signature);
        } else {
          signatureDeferred.current.reject(new Error('User rejected signing message'));
        }
      }

      context.closeModal();
      context.setModalRequest(null);
    }
  };

  const signMessage = () => {
    signatureDeferred.current = new Deferred<Uint8Array>();

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
