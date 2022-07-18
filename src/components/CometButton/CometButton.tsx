
import React, { useEffect, useState } from 'react';
import Button from '../../../lib/button';
import CircleLoader from '../../../lib/circleLoader';
import Modal from '../../../lib/modal';

const UID_CHARS = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890';

const generateUID = (length: number, chars = UID_CHARS): String => {
  let str = '';
  for (let i = 0; i < length; i += 1) {
    const choice = Math.floor(Math.random() * chars.length);
    str = str + chars[choice];
  }
  return str;
};

export enum CometButtonAction {
  Login = 'login',
};

export enum CometChainType {
  EVM = 'evm',
  Solana = 'solana',
  Aptos = 'aptos',
};

export interface CometLoginResultAccount {
  address: String,
  chainType: CometChainType,
  chainId: number,
  signature: String,
}

export interface CometLoginResult {
  id: String,
  username: String,
  address: CometLoginResultAccount,
};

export interface CometButtonProps {
  action: CometButtonAction,

  onSuccess?(result: CometLoginResult): boolean,
  chainType?: CometChainType,
  chainId?: number,
  baseUrl?: String,
};

export default (props: CometButtonProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [iframeHeight, setIframeHeight] = useState<number>(0);
  const [nonce, setNonce] = useState<String|null>(null);

  // validate props
  let {
    action,
    chainType = CometChainType.Solana,
    chainId = 101,
    onSuccess,
  } = props;

  if (!Object.values(CometButtonAction).includes(action)) {
    throw new Error('Must supply a valid "action".');
  } else if (!Object.values(CometChainType).includes(chainType)) {
    throw new Error('Must supply a valid "chainType"');
  } else if (chainId === null || chainId === undefined || !Number.isInteger(chainId)) {
    throw new Error('Must supply a valid integer "chainId".');
  }

  const messageHandler = (e: any) => {
    const { type, value } = e.data || e.message;
    if (type === 'cometsdk_contentHeight') {
      setIframeHeight(value);
    } else if (type === 'cometsdk_confirmed') {
      if (onSuccess) (props.onSuccess || (() => {}))(value);
      onCloseModal();
    }
  };

  useEffect(() => {
    window.removeEventListener('message', messageHandler);
    window.addEventListener('message', messageHandler);
  }, []);

  const onCloseModal = () => {
    setTimeout(() => { setIframeHeight(0); }, 250);
    setModalOpen(false);
  }

  return (
    <React.Fragment>
      <Modal
        open={modalOpen}
        onClose={() => { setNonce(generateUID(10)); onCloseModal(); }}
        title="Login with Comet"
        closeable={true}
      >
        <div className='w-full relative' style={{ height: Math.max(100, iframeHeight) }}>
          <div className='w-full flex items-center justify-center' style={{ marginTop: 24, marginBottom: 24, position: 'absolute' }}>
            <CircleLoader size={60} />
          </div>
          <iframe
            className='w-full absolute'
            style={{ height: iframeHeight, position: 'absolute', backgroundColor: 'white' }}
            src={`${props.baseUrl || 'https://auth.withcomet.com'}/getwallet?chainId=${props.chainId}&chainType=${props.chainType}&nonce=${nonce}`}
          />
        </div>
      </Modal>

      <Button
        variant="primary"
        style={{ borderRadius: 900 }}
        onClick={() => { setModalOpen(true); setIframeHeight(0); }}
      >
        <img src="data:image/png;base64,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" className='w-7 -mt-0.5 -mb-0.5 -ml-1 mr-1.5' />
        Login with Comet
      </Button>
    </React.Fragment>
  );
};
