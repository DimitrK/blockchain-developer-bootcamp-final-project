import React, {Component} from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.props.logError(error, errorInfo)
  }

  render() {
    const {renderError} = this.props;
    const {error, hasError} = this.state;

    if (hasError) {
      return renderError(error);
    }

    return this.props.children;
  }
}

ErrorBoundary.defaultProps = {
  renderError: () => <h1>Oh no</h1>,
  logError: console.error
}

ErrorBoundary.propTypes = {
  renderError: PropTypes.func,
  logError: PropTypes.func
}

export default ErrorBoundary;