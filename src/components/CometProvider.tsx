
import * as React from 'react';
import { postMessage } from '../core/iframe';

interface CometContextValue {
  user: any;
  openModal: () => void;
  closeModal: () => void;
  setModalRequest: (request: CometModalRequest | null) => void;
  iframeLoaded: Boolean;
};

// default values in context
export const CometContext = React.createContext<CometContextValue>({
  user: null,
  openModal: () => {},
  closeModal: () => {},
  setModalRequest: () => {},
  iframeLoaded: false,
});

interface CometProviderConfig {
  // self explanatory, the base url of the iframe
  iframeBaseUrl?: string;

  // type of chain (solana or evm)
  chainType?: string;

  // the chain id of the chain
  chainId?: number;

  // should we show full wallet
  showFullWallet?: boolean;
}

export enum CometModalRequestType {
  SignMessage = 'signmessage',
  ECDH = 'ecdh',
  Mint = 'mint',
}

export interface CometModalRequest {
  // the type of request
  type: CometModalRequestType;

  // should i be able to close the modal?
  closeable?: boolean;

  // config of request
  config: any;
}

export default function CometProvider({
  config,
  children,
}: React.PropsWithChildren<{ config?: CometProviderConfig }>) {

  const {
    iframeBaseUrl = 'https://auth.withcomet.com',
    chainType = 'solana',
    chainId = 101,
    showFullWallet = true,
  } = config || {};

  const [modalOpen, setModalOpen] = React.useState<Boolean>(false);
  const [modalRequest, setModalRequest] = React.useState<CometModalRequest|null>(null);
  const [iframeLoaded, setIframeLoaded] = React.useState<Boolean>(false);

  const [user, setUser] = React.useState(null);

  // Attaching and detaching event listeners
  React.useEffect(() => {
    window.addEventListener('message', handleMessage, false);

    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, []);

  // Trigger modal open/close in iframe when modalOpen changes
  React.useEffect(() => {
    postMessage(
      'cometsdk_modalOpen',
      modalOpen,
    );

    if (iframeLoaded && !modalOpen) {
      setModalRequest(null);
    }
  }, [modalOpen]);

  React.useEffect(() => {
    if (modalOpen) {
      postMessage(
        'cometsdk_modalOpen',
        true,
      );
    }
    if (modalRequest) {
      postMessage(
        'cometsdk_modalRequest',
        modalRequest,
      );
    }
  }, [iframeLoaded]);

  const handleMessage = React.useCallback((event: any) => {
    const { data } = event;
    if (data.type === 'cometsdk_setUser') {
      setUser(data.value);
    } else if (data.type === 'cometsdk_modalOpen') {
      setModalOpen(data.value);
      // setModalRequest(null);
    } else if (data.type === 'cometsdk_closeModal') {
      setModalOpen(false);
    } else if (data.type === 'cometsdk_hello') {
      setIframeLoaded(true);
      postMessage(
        'cometsdk_hello',
        {
          chainType,
          chainId,
          path: showFullWallet ? 'loginfull' : 'loginbasic',
          query: {},
        },
      );
    }
  }, []);

  const value = React.useMemo(() => {
    return {
      user,
      openModal: () => {
        if (iframeLoaded) postMessage(
          'cometsdk_modalOpen',
          true,
        );
        setModalOpen(true);
      },
      closeModal: () => {
        if (iframeLoaded) postMessage(
          'cometsdk_modalOpen',
          false,
        );
        setModalRequest(null);
        setModalOpen(false);
      },
      setModalRequest: (request: CometModalRequest | null) => {
        setModalRequest(request);
      },
      iframeLoaded,
    };
  }, [
    user,
    iframeLoaded,
    modalOpen,
    modalRequest,
  ]);

  React.useEffect(() => {
    postMessage(
      'cometsdk_modalRequest',
      modalRequest,
    );
  }, [modalRequest]);

  return (
    <>
      <iframe
        id='cometsdk_iframe'
        className={modalOpen ? 'w-screen min-h-screen fixed' : 'w-0 h-0 absolute'}
        src={iframeBaseUrl}
      />

      <CometContext.Provider value={value}>
        {children}
      </CometContext.Provider>
    </>
  );
}
