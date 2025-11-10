import { useContext } from 'react';
import { Send, Shield } from 'lucide-react';
import { TransferContext } from '../context/transferContext.js';
import TransferList from '../components/transfer/TransferList.jsx';
import { deleteTransfer } from '../api/transfers.js';
import toast from 'react-hot-toast';

const SentFiles = () => {
  const { sentTransfers, loading, fetchSentTransfers } = useContext(TransferContext);

  const handleDelete = async (transferId) => {
    if (!window.confirm('Are you sure you want to delete this transfer?')) {
      return;
    }

    try {
      await deleteTransfer(transferId);
      toast.success('Transfer deleted successfully');
      fetchSentTransfers();
    } catch (err) {
        console.log(err)
      toast.error('Failed to delete transfer');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Send size={28} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sent Files</h1>
            <p className="text-gray-600">
              Files you've sent to others
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Shield className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                Your Files Are Secure
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✅ All files are encrypted with the recipient's public key</li>
                <li>✅ Only the recipient can decrypt with their private key</li>
                <li>✅ Files are automatically deleted after expiration</li>
                <li>✅ You can delete sent files anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer List */}
      <TransferList
        transfers={sentTransfers}
        type="sent"
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SentFiles;