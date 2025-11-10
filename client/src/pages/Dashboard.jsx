import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Download,
  Send,
  TrendingUp,
  Clock,
  Shield,
  FileKey,
} from 'lucide-react';
import { TransferContext } from '../context/transferContext.js';
import { useCrypto } from '../hooks/useCrypto.js';
import Loader from '../components/common/Loader.jsx';
import Alert from '../components/common/Alert.jsx';
import { formatFileSize, timeAgo } from '../utils/constants.js';

const Dashboard = () => {
  const {
    receivedTransfers,
    sentTransfers,
    stats,
    loading,
    fetchAllData,
  } = useContext(TransferContext);
  const { hasPublicKey } = useCrypto();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const recentReceived = receivedTransfers.slice(0, 5);
  const recentSent = sentTransfers.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your secure file transfer dashboard
        </p>
      </div>

      {/* Security Info */}
      {!hasPublicKey && (
        <Alert
          type="warning"
          message="You need to generate encryption keys before you can send or receive files."
        />
      )}

      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileKey size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              🔐 How Secure File Transfer Works
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ <strong>Send:</strong> Files are encrypted with AES-256-GCM before upload</li>
              <li>✅ <strong>Receive:</strong> Import your private key to decrypt files</li>
              <li>✅ <strong>Security:</strong> Your private key is never stored - you keep it safe</li>
              <li>✅ <strong>Privacy:</strong> Server never sees your unencrypted files</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Download size={24} />
              </div>
              <TrendingUp size={20} className="opacity-70" />
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {stats.received.count}
            </h3>
            <p className="text-blue-100 text-sm">Files Received</p>
            <p className="text-xs text-blue-200 mt-2">
              {formatFileSize(stats.received.totalSize)} total
            </p>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Send size={24} />
              </div>
              <TrendingUp size={20} className="opacity-70" />
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {stats.sent.count}
            </h3>
            <p className="text-green-100 text-sm">Files Sent</p>
            <p className="text-xs text-green-200 mt-2">
              {formatFileSize(stats.sent.totalSize)} total
            </p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Shield size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {hasPublicKey ? 'Active' : 'Inactive'}
            </h3>
            <p className="text-purple-100 text-sm">Encryption Status</p>
            <p className="text-xs text-purple-200 mt-2">
              {hasPublicKey ? 'RSA-4096 + AES-256' : 'Setup required'}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {stats.received.count + stats.sent.count}
            </h3>
            <p className="text-orange-100 text-sm">Total Transfers</p>
            <p className="text-xs text-orange-200 mt-2">
              All time activity
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Received */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Received
            </h2>
            <Link
              to="/received"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>

          {recentReceived.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Download size={48} className="mx-auto mb-3 opacity-30" />
              <p>No received files yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReceived.map((transfer) => (
                <Link
                  key={transfer._id}
                  to="/received"
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {transfer.originalFilename}
                      </p>
                      <p className="text-sm text-gray-600">
                        From: {transfer.sender?.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {timeAgo(transfer.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(transfer.fileSize)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sent */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Sent
            </h2>
            <Link
              to="/sent"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>

          {recentSent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Send size={48} className="mx-auto mb-3 opacity-30" />
              <p>No sent files yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSent.map((transfer) => (
                <Link
                  key={transfer._id}
                  to="/sent"
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {transfer.originalFilename}
                      </p>
                      <p className="text-sm text-gray-600">
                        To: {transfer.recipient?.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {timeAgo(transfer.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(transfer.fileSize)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to send a file?</h3>
            <p className="text-primary-100">
              Encrypt and send files securely to anyone on the platform
            </p>
          </div>
          <Link to="/send">
            <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors">
              <Upload className="inline mr-2" size={20} />
              Send File
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;