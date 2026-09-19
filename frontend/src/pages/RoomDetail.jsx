import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin, MessageCircle, Users, UserCircle } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Button from '../components/Button/Button'
import Badge from '../components/Badge/Badge'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import './RoomDetail.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

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
            <div className="room-detail-gallery">{(listing.images || []).map((image) => <img key={image.id} src={image.image_url} alt={listing.title} />)}</div>
            <div className="room-detail-main">
                <div>
                    <h1>{listing.title}</h1>
                    <div className="room-detail-meta"><span><MapPin size={18} />{listing.address}</span><span><Users size={18} />{listing.available_spots} spots available</span></div>
                    <p>{listing.description}</p>
                    <div className="room-detail-tags"><Badge variant="primary">{listing.district}</Badge><Badge variant="primary">{listing.nearest_university}</Badge>{listing.is_furnished && <Badge variant="success">Furnished</Badge>}{listing.has_wifi && <Badge variant="success">WiFi</Badge>}</div>

                    {listing.latitude != null && listing.longitude != null ? (
                        <div className="room-detail-map">
                            <h2>Location</h2>
                            <MapContainer
                                center={[listing.latitude, listing.longitude]}
                                zoom={15}
                                scrollWheelZoom={false}
                                className="room-detail-map-container"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                                    tileSize={512}
                                    zoomOffset={-1}
                                />
                                <Marker position={[listing.latitude, listing.longitude]}>
                                    <Popup>{listing.title}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    ) : (
                        <p className="room-detail-map-unavailable">Exact location isn't available on the map for this listing yet.</p>
                    )}
                </div>
                <aside className="room-detail-aside"><strong>{listing.price_per_person} AZN / person</strong><dl>{[['Preferred gender', listing.preferred_gender], ['Smoking', listing.smoking_allowed ? 'Allowed' : 'No'], ['Alcohol', listing.alcohol_allowed ? 'Allowed' : 'No'], ['Religion', listing.religion_preference]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Button onClick={() => navigate(`/messages/${listing.user_id}`)}><MessageCircle size={16} /> Contact owner</Button><Button variant="secondary" onClick={() => navigate(`/profile/${listing.user_id}`)}><UserCircle size={16} /> View profile & compatibility</Button></aside>
            </div>
        </article>
    )
}

export default RoomDetail