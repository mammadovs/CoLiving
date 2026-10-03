import { CircleAlert } from 'lucide-react'
import Button from '../Button/Button'
import './ErrorState.css'

function ErrorState({ message = 'Could not load the data.', onRetry }) {
    return <div className="error-state" role="alert"><CircleAlert size={42} /><h2>Something went wrong</h2><p>{message}</p>{onRetry && <Button onClick={onRetry}>Try again</Button>}</div>
}

export default ErrorState
