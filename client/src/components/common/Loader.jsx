import clsx from 'clsx';

const Loader = ({ size = 'md', text, fullScreen = false }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={clsx(
          'animate-spin rounded-full border-4 border-gray-200 border-t-primary-600',
          sizes[size]
        )}
      />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;