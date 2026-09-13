import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Spinner from '../components/Spinner/Spinner'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import './MapView.css'

// Leaflet's default marker icons don't load correctly with bundlers like Vite
// unless explicitly configured — this fixes broken/missing pin icons.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const BAKU_CENTER = [40.4093, 49.8671]

function MapView() {
    const navigate = useNavigate()
    const [listings, setListings] = useState([])
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadListings() {
            setStatus('loading')
            try {
                const response = await listingsAPI.getAll({ limit: 100 })
                const loaded = Array.isArray(response) ? response : response.items || []
                if (!cancelled) {
                    setListings(loaded)
                    setStatus('success')
                }
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(error.data?.detail || error.message || 'Xəritəni yükləmək mümkün olmadı.')
                    setStatus('error')
                }
            }
        }

        loadListings()
        return () => { cancelled = true }
    }, [])

    if (status === 'loading') return <Spinner />
    if (status === 'error') return <ErrorState message={errorMessage} onRetry={() => window.location.reload()} />

    const listingsWithCoordinates = listings.filter(
        (listing) => listing.latitude != null && listing.longitude != null
    )

    return (
        <div className="map-view-page">
            <div className="map-view-header">
                <h1>Rooms on the map</h1>
                <p>
                    {listingsWithCoordinates.length} of {listings.length} listings shown
                    {listingsWithCoordinates.length < listings.length && (
                        <span className="map-view-hint"> — some listings don't have a precise location yet.</span>
                    )}
                </p>
            </div>

            <MapContainer center={BAKU_CENTER} zoom={12} className="map-view-container">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {listingsWithCoordinates.map((listing) => (
                    <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
                        <Popup>
                            <div className="map-popup">
                                <strong>{listing.title}</strong>
                                <p>{listing.price_per_person} AZN / person</p>
                                <p>{listing.district}</p>
                                <button onClick={() => navigate(`/rooms/${listing.id}`)}>View details</button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}

export default MapView