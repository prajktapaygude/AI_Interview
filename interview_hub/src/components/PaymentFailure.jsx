import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BASE_URL from '../config';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const txnid = searchParams.get('txnid');
  const error = searchParams.get('error');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto redirect to subscription page after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/subscription';
    }, 5000);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="text-center p-8 rounded-lg shadow-lg max-w-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Your payment could not be processed.
        </p>
        {txnid && (
          <p className="text-sm text-gray-500 mb-2">Transaction ID: {txnid}</p>
        )}
        {error && (
          <p className="text-sm text-red-500 mb-4">Reason: {decodeURIComponent(error)}</p>
        )}
        <p className="text-sm text-gray-500 mb-4">Redirecting to subscription page in {countdown} seconds...</p>
        <div className="space-y-3">
          <Link 
            to="/subscription" 
            className="inline-block w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition text-center"
          >
            Try Again
          </Link>
          <Link 
            to="/dashboard" 
            className="inline-block w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;