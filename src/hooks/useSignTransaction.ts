
import React from 'react';
import Deferred from '../core/deferred';
import { CometContext, CometModalRequestType } from '../components/CometProvider';
import web3 from '@solana/web3.js';
import useAccount from './useAccount';

const useSignTransaction = ({
  transaction,
}: {
  transaction: web3.Transaction,
}) => {
  const [txRequested, setTxRequested] = React.useState<boolean>(false);
  const [eventSource, setEventSource] = React.useState<Window | null>(null);

  const context = React.useContext(CometContext);
  const signatureDeferred = React.useRef<Deferred<web3.Transaction> | null>(null);

  const account = useAccount();

  if (context === undefined) {
    throw new Error('useSignTransaction must be used within a CometProvider');
  }

  React.useEffect(() => {
    // listen for cometsdk_requestSignMessage event
    window.addEventListener('message', messageHandler);

    return () => {
      // cleanup
      window.removeEventListener('message', messageHandler);
    }
  }, []);

  const messageHandler = React.useCallback((event: MessageEvent) => {
    if (event.data.type === 'cometsdk_requestSignTransaction') {
      const element = (event.source as Window);
      setEventSource(element);
      setTxRequested(true);
    } else if (event.data.type === 'cometsdk_finishSignTransaction') {
      const { success, transaction } = event.data.value;

      setEventSource(null);
      setTxRequested(false);

      if (signatureDeferred.current) {
        if (success) {
          const resolvedTransaction = web3.Transaction.from(Buffer.from(transaction, 'hex'));
          signatureDeferred.current.resolve(resolvedTransaction);
        } else {
          signatureDeferred.current.reject(new Error('User rejected signing transaction'));
        }
      }

      context.closeModal();
      context.setModalRequest(null);
    }
  }, [account]);

  React.useEffect(() => {
    (async () => {
      if (account && txRequested && eventSource) {
        // add recentBlockhash if not present
        if (!transaction.recentBlockhash) {
          // get connection to solana mainnet
          // const blockhash = await connection.getLatestBlockhash();
          const blockhashResult = await context.sendRpcRequest({
            jsonrpc: '2.0',
            id: 1,
            method: 'getLatestBlockhash',
            params: [],
          });

          transaction.recentBlockhash = blockhashResult.result.value.blockhash;
        }

        // add feePayer if not present
        if (!transaction.feePayer) {
          const pubKey = new web3.PublicKey(account.address);
          transaction.feePayer = pubKey;
        }

        eventSource.postMessage(
          {
            type: 'cometsdk_startSignTransaction',
            value: {
              transaction: transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('hex'),
              title: document.title,
            },
          },
          context.iframeOrigin,
        )
      }
    })();
  }, [account, txRequested, eventSource]);

  const signTransaction = () => {
    signatureDeferred.current = new Deferred<web3.Transaction>();

    context.setModalRequest({
      type: CometModalRequestType.SignTransaction,
      closeable: false,
      config: {
        appTitle: document.title,
      },
    });
    context.openModal();

    return signatureDeferred.current.promise;
  }

  return {
    signTransaction,
  };
}

export default useSignTransaction;
