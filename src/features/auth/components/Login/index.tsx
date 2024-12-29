import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const Login = () => {
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
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
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Password
          </label>
          <input
            type="password"
            className="input w-full"
            placeholder="Enter your password"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500" />
            <span className="ml-2 text-sm text-gray-400">Remember me</span>
          </label>
          <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="text-sm text-primary-400 hover:text-primary-300">
            Forgot Password?
          </Link>
        </div>
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>
      <p className="text-center text-gray-400 text-sm mt-4">
        Don't have an account?{' '}
        <Link to={ROUTES.AUTH.REGISTER} className="text-primary-400 hover:text-primary-300">
          Create one here
        </Link>
      </p>
    </div>
  );
};

export default Login;