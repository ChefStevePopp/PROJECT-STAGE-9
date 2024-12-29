import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const ForgotPassword = () => {
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>
      <p className="text-gray-400 mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            className="input w-full"
            placeholder="Enter your email"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Send Reset Instructions
        </button>
      </form>
      <p className="text-center text-gray-400 text-sm mt-4">
        Remember your password?{' '}
        <Link to={ROUTES.AUTH.LOGIN} className="text-primary-400 hover:text-primary-300">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;