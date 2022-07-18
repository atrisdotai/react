
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

  useEffect(() => {
    window.addEventListener('message', (e: any) => {
      const { type, value } = e.data || e.message;
      if (type === 'cometsdk_contentHeight') {
        setIframeHeight(value);
      } else if (type === 'cometsdk_confirmed') {
        if (onSuccess) (props.onSuccess || (() => {}))(value);
        onCloseModal();
      }
    });
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
        <div className='w-full relative -m-1' style={{ height: Math.max(100, iframeHeight) }}>
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
        <img src="/comet.png" className='w-7 -mt-0.5 -mb-0.5 -ml-1 mr-1.5' />
        Login with Comet
      </Button>
    </React.Fragment>
  );
};
