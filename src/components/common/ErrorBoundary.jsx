import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
// No Link import needed
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <FiAlertTriangle />
            </div>

            <h1 className="error-boundary-title">Something went wrong</h1>

            <p className="error-boundary-message">
              We encountered an unexpected error. Please try again or navigate back to home.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="error-details">
                <h4>Error Details:</h4>
                <pre className="error-stack">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="error-component-stack">
                    <summary>Component Stack</summary>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            )}

            <div className="error-actions">
              <button
                className="error-btn primary"
                onClick={this.handleRetry}
              >
                <FiRefreshCw />
                Try Again
              </button>

              <button
                className="error-btn secondary"
                onClick={this.handleReload}
              >
                <FiRefreshCw />
                Reload Page
              </button>

              {/* Plain anchor, not Link */}
              <a href="/" className="error-btn outline">
                <FiHome />
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;