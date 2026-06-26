import React from 'react';

// To enable Sentry: npm install @sentry/react, then set VITE_SENTRY_DSN in .env
// and uncomment the init block below.
// import * as Sentry from '@sentry/react';
// if (import.meta.env.VITE_SENTRY_DSN) {
//   Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: import.meta.env.MODE, tracesSampleRate: 0.1 });
// }

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Replace with Sentry.captureException(error) once @sentry/react is installed
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-md px-6">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-500 text-sm mb-6">
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-700"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
