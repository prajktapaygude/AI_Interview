// import { useEffect, useState } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const PaymentSuccess = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [message, setMessage] = useState('Verifying payment...');
//   const [countdown, setCountdown] = useState(3);

//   useEffect(() => {
//     const txnid = searchParams.get('txnid');
//     const status = searchParams.get('status');

//     console.log('Payment success page loaded:', { txnid, status });

//     if (!txnid || status !== 'success') {
//       setMessage('Invalid payment response. Please contact support.');
//       return;
//     }

//     const verifyPayment = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.post('http://localhost:5000/api/payment/verify', {
//           txnid,
//           status: 'success'
//         }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         if (res.data.success) {
//           setMessage('✅ Payment successful! Redirecting to dashboard...');
          
//           // Countdown timer
//           const timer = setInterval(() => {
//             setCountdown(prev => {
//               if (prev <= 1) {
//                 clearInterval(timer);
//                 navigate('/dashboard');
//               }
//               return prev - 1;
//             });
//           }, 1000);
//         } else {
//           setMessage('Verification failed. Please contact support.');
//         }
//       } catch (err) {
//         console.error('Verification error:', err);
//         setMessage('Verification error. Please contact support.');
//       }
//     };

//     verifyPayment();
//   }, [searchParams, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
//       <div className="text-center p-8 rounded-lg shadow-lg max-w-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
//         <div className="text-6xl mb-4">✅</div>
//         <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
//           Payment Successful!
//         </h1>
//         <p className="text-gray-600 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
//           {message}
//         </p>
//         {countdown < 3 && countdown > 0 && (
//           <p className="text-sm text-gray-500">Redirecting in {countdown} seconds...</p>
//         )}
//         <button
//           onClick={() => navigate('/dashboard')}
//           className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
//         >
//           Go to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;


import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying payment...');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const txnid = searchParams.get('txnid');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');

    console.log('Payment success page loaded:', { txnid, status, plan });

    if (!txnid || status !== 'success') {
      setMessage('Invalid payment response. Please contact support.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Verify payment
        const res = await axios.post('http://localhost:5000/api/payment/verify', {
          txnid,
          status: 'success'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          // 🔥 Refresh user data to get updated membership
          const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Update localStorage with new user data
          const updatedUser = profileRes.data.user;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Also refresh subscription status
          const subscriptionRes = await axios.post('http://localhost:5000/api/payment/refresh-membership', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Membership updated to:', subscriptionRes.data.membership);
          setMessage(`✅ Payment successful! Your ${plan || 'Pro'} plan is now active. Redirecting...`);
          
          // Countdown timer
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/dashboard');
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setMessage('Verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setMessage('Verification error. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="text-center p-8 rounded-lg shadow-lg max-w-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </p>
        {countdown < 3 && countdown > 0 && (
          <p className="text-sm text-gray-500">Redirecting in {countdown} seconds...</p>
        )}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;