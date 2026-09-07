import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin, MessageCircle, Users } from 'lucide-react'
import Button from '../components/Button/Button'
import Badge from '../components/Badge/Badge'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import './RoomDetail.css'

function RoomDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [listing, setListing] = useState(null)
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')

    const loadListing = useCallback(async () => {
        setStatus('loading')
        try {
            const response = await listingsAPI.getById(id)
            if (!response) {
                setStatus('empty')
                return
            }
            setListing(response)
            setStatus('success')
        } catch (error) {
            if (error.status === 404) {
                setStatus('empty')
                return
            }
            setErrorMessage(error.data?.detail || error.message || 'Elanı yükləmək mümkün olmadı.')
            setStatus('error')
        }
    }, [id])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadListing()
    }, [loadListing])

    if (status === 'loading') return <Spinner />
    if (status === 'empty') return <EmptyState title="Bu elan tapılmadı" message="Elan mövcud deyil və ya silinib." />
    if (status === 'error') return <ErrorState message={errorMessage} onRetry={loadListing} />

    return (
        <article className="room-detail-page">
            <Link to="/rooms" className="room-detail-back">Back to rooms</Link>
            <div className="room-detail-gallery">{(listing.images || []).map((image) => <img key={image} src={image} alt={listing.title} />)}</div>
            <div className="room-detail-main">
                <div>
                    <h1>{listing.title}</h1>
                    <div className="room-detail-meta"><span><MapPin size={18} />{listing.address}</span><span><Users size={18} />{listing.available_spots} spots available</span></div>
                    <p>{listing.description}</p>
                    <div className="room-detail-tags"><Badge variant="primary">{listing.district}</Badge><Badge variant="primary">{listing.nearest_university}</Badge>{listing.is_furnished && <Badge variant="success">Furnished</Badge>}{listing.has_wifi && <Badge variant="success">WiFi</Badge>}</div>
                </div>
                <aside className="room-detail-aside"><strong>{listing.price_per_person} AZN / person</strong><dl>{[['Preferred gender', listing.preferred_gender], ['Smoking', listing.smoking_allowed ? 'Allowed' : 'No'], ['Alcohol', listing.alcohol_allowed ? 'Allowed' : 'No'], ['Religion', listing.religion_preference]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Button onClick={() => navigate(`/messages/${listing.owner_id}`)}><MessageCircle size={16} /> Contact owner</Button></aside>
            </div>
        </article>
    )
}

export default RoomDetail
