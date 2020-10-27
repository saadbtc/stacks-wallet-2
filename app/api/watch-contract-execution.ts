import { safeAwait } from '@utils/safe-await';
import { Api } from '@api/api';

interface WatchContractExecutionArgs {
  nodeUrl: string;
  txId: string;
}
export function watchContractExecution(args: WatchContractExecutionArgs) {
  const { nodeUrl, txId } = args;
  const pollingInterval = 1000;
  return new Promise((resolve, reject) => {
    const fetchTx = async (timeoutInterval: number) => {
      const [error, txResponse] = await safeAwait(new Api(nodeUrl).getTxDetails(txId));

      if (!txResponse || txResponse.data.tx_status === 'pending') return;
      const tx = txResponse.data;
      if (
        error ||
        tx.tx_status === 'abort_by_response' ||
        tx.tx_status === 'abort_by_post_condition'
      ) {
        return reject(error);
      }

      if (tx.tx_status === 'success') {
        clearInterval(timeoutInterval);
        return resolve(true);
      }
    };
    const interval: number = setInterval(() => void fetchTx(interval), pollingInterval);
  });
}