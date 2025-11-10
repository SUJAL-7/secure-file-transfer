import TransferCard from './TransferCard.jsx';
import Loader from '../common/Loader.jsx';

const TransferList = ({ transfers, type, loading, onDownload, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" text="Loading transfers..." />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No transfers yet</p>
        <p className="text-sm text-gray-400">
          {type === 'sent'
            ? 'Send your first encrypted file'
            : 'Files sent to you will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {transfers.map((transfer) => (
        <TransferCard
          key={transfer._id}
          transfer={transfer}
          type={type}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TransferList;