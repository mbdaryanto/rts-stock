import { Component, ReactNode, ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // static getDerivedStateFromError(error: Error, errorInfo: ErrorInfo) {
  //   // Update state so the next render will show the fallback UI.
  //   return {
  //     hasError: true,
  //     error,
  //   }
  // }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.log('Error', error, errorInfo)
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong.</h1>
          <div>Error: {JSON.stringify(this.state.error!, null, 2)}</div>
          <div style={{ whiteSpace: 'pre' }}>{this.state.errorInfo!.componentStack}</div>
        </div>
      )
    }

    return this.props.children;
  }
}

export default ErrorBoundary
