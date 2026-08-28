import { CircleAlert } from 'lucide-react'
import Button from '../Button/Button'
import './ErrorState.css'

function ErrorState({ message = 'Məlumatları yükləmək mümkün olmadı.', onRetry }) {
    return <div className="error-state" role="alert"><CircleAlert size={42} /><h2>Xəta baş verdi</h2><p>{message}</p>{onRetry && <Button onClick={onRetry}>Yenidən cəhd et</Button>}</div>
}

export default ErrorState
