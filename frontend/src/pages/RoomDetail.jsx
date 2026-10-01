import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Users, MessageCircle, UserCircle, Wifi, Sofa, Cigarette, Wine, GraduationCap } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Button from '../components/Button/Button'
import Badge from '../components/Badge/Badge'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import Card from '../components/Card/Card'
import { listingsAPI } from '../api/listings'
import { resolveImageUrl } from '../utils/resolveImageUrl'
import { TILE_LAYER } from '../utils/mapTiles'
import './RoomDetail.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/** Enables scroll-wheel zoom only after click; disables on mouseout. */
function ScrollWheelController() {
    const map = useMap()
    useMapEvents({
        click() { map.scrollWheelZoom.enable() },
        mouseout() { map.scrollWheelZoom.disable() },
    })
    return null
}

/** Airbnb-style mosaic gallery: 1 big + up to 4 thumbnails */
function MosaicGallery({ images, title }) {
    const [lightbox, setLightbox] = useState(null)

    if (!images || images.length === 0) return null

    const main  = images[0]
    const thumbs = images.slice(1, 5)         // max 4 thumbnails
    const hasGrid = thumbs.length > 0

    return (
        <>
            <div className={`room-gallery${hasGrid ? ' room-gallery--mosaic' : ''}`}>
                {/* Main large image */}
                <button
                    className="room-gallery-main"
                    onClick={() => setLightbox(main)}
                    aria-label="View full image"
                >
                    <img src={main} alt={title} />
                </button>

                {/* Thumbnail grid */}
                {hasGrid && (
                    <div className="room-gallery-thumbs">
                        {thumbs.map((src, i) => (
                            <button
                                key={i}
                                className="room-gallery-thumb"
                                onClick={() => setLightbox(src)}
                                aria-label={`View image ${i + 2}`}
                            >
                                <img src={src} alt={`${title} ${i + 2}`} />
                                {/* "Show all" overlay on last visible thumb */}
                                {i === 3 && images.length > 5 && (
                                    <span className="room-gallery-more">+{images.length - 5} more</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="room-lightbox"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setLightbox(null)}
                >
                    <img src={lightbox} alt={title} onClick={(e) => e.stopPropagation()} />
                    <button
                        className="room-lightbox-close"
                        onClick={() => setLightbox(null)}
                        aria-label="Close lightbox"
                    >✕</button>
                </div>
            )}
        </>
    )
}

function SimilarRooms({ currentListing }) {
    const navigate = useNavigate()
    const [similar, setSimilar] = useState([])
    const [status, setStatus] = useState('loading')

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                setStatus('loading')
                const params = { limit: 4 }
                if (currentListing.district) {
                    params.district = currentListing.district
                }
                const res = await listingsAPI.getAll(params)
                const items = Array.isArray(res) ? res : res.items || []
                
                // Filter out current, take top 3
                const filtered = items.filter(l => String(l.id) !== String(currentListing.id)).slice(0, 3)
                setSimilar(filtered)
                setStatus('success')
            } catch {
                setStatus('error')
            }
        }
        fetchSimilar()
    }, [currentListing])

    if (status === 'loading') {
        return (
            <div className="similar-rooms-section">
                <h2 className="room-detail-section-title">Similar rooms nearby</h2>
                <div className="similar-rooms-loading">Loading similar rooms...</div>
            </div>
        )
    }

    if (status === 'error' || similar.length === 0) {
        return null
    }

    return (
        <div className="similar-rooms-section">
            <h2 className="room-detail-section-title">Similar rooms nearby</h2>
            <div className="similar-rooms-scroll">
                {similar.map(listing => (
                    <div key={listing.id} className="similar-rooms-card-wrapper">
                        <Card
                            id={listing.id}
                            title={listing.title}
                            location={listing.address}
                            roommates={listing.available_spots}
                            description={listing.description}
                            image={resolveImageUrl(listing.images?.[0]?.image_url)}
                            images={listing.images?.map((img) => resolveImageUrl(img.image_url)).filter(Boolean)}
                            price={listing.price_per_person}
                            rating={listing.rating ?? null}
                            reviewCount={listing.review_count ?? null}
                            onViewDetails={() => navigate(`/rooms/${listing.id}`)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

function RoomDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [listing,      setListing]      = useState(null)
    const [status,       setStatus]       = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')

    const loadListing = useCallback(async () => {
        setStatus('loading')
        try {
            const response = await listingsAPI.getById(id)
            if (!response) { setStatus('empty'); return }
            setListing(response)
            setStatus('success')
        } catch (error) {
            if (error.status === 404) { setStatus('empty'); return }
            setErrorMessage(error.data?.detail || error.message || 'Elanı yükləmək mümkün olmadı.')
            setStatus('error')
        }
    }, [id])

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadListing() }, [loadListing])

    if (status === 'loading') return <Spinner />
    if (status === 'empty')   return <EmptyState title="Bu elan tapılmadı" message="Elan mövcud deyil və ya silinib." />
    if (status === 'error')   return <ErrorState message={errorMessage} onRetry={loadListing} />

    const resolvedImages = (listing.images || [])
        .map((img) => resolveImageUrl(img.image_url))
        .filter(Boolean)

    const amenities = [
        listing.has_wifi        && { icon: <Wifi       size={16} />, label: 'WiFi' },
        listing.is_furnished    && { icon: <Sofa       size={16} />, label: 'Furnished' },
        listing.smoking_allowed && { icon: <Cigarette  size={16} />, label: 'Smoking OK' },
        listing.alcohol_allowed && { icon: <Wine       size={16} />, label: 'Alcohol OK' },
    ].filter(Boolean)

    return (
        <article className="room-detail-page">

            {/* ── Back button ──────────────────────── */}
            <Link to="/rooms" className="room-detail-back">
                <ArrowLeft size={16} strokeWidth={2.5} />
                Back to rooms
            </Link>

            {/* ── Mosaic gallery ───────────────────── */}
            <MosaicGallery images={resolvedImages} title={listing.title} />

            {/* ── Main content + sticky aside ──────── */}
            <div className="room-detail-main">

                {/* Left column */}
                <div className="room-detail-content">

                    {/* Title & meta */}
                    <h1>{listing.title}</h1>

                    <div className="room-detail-meta">
                        <span><MapPin size={16} strokeWidth={2} />{listing.address}</span>
                        <span><Users  size={16} strokeWidth={2} />{listing.available_spots} spots available</span>
                        {listing.nearest_university && (
                            <span><GraduationCap size={16} strokeWidth={2} />{listing.nearest_university}</span>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="room-detail-tags">
                        {listing.district         && <Badge variant="primary">{listing.district}</Badge>}
                        {listing.preferred_gender && <Badge variant="secondary">{listing.preferred_gender}</Badge>}
                        {listing.religion_preference && <Badge variant="secondary">{listing.religion_preference}</Badge>}
                    </div>

                    {/* Description */}
                    <div className="room-detail-section">
                        <h2 className="room-detail-section-title">About this room</h2>
                        <p className="room-detail-description">{listing.description}</p>
                    </div>

                    {/* Amenities */}
                    {amenities.length > 0 && (
                        <div className="room-detail-section">
                            <h2 className="room-detail-section-title">What this place offers</h2>
                            <ul className="room-detail-amenities">
                                {amenities.map(({ icon, label }) => (
                                    <li key={label} className="room-detail-amenity">
                                        {icon}
                                        <span>{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Map */}
                    {listing.latitude != null && listing.longitude != null ? (
                        <div className="room-detail-section room-detail-map-section">
                            <h2 className="room-detail-section-title">Location</h2>
                            <MapContainer
                                center={[listing.latitude, listing.longitude]}
                                zoom={15}
                                scrollWheelZoom={false}
                                className="room-detail-map-container"
                            >
                                <TileLayer {...TILE_LAYER} />
                                <ScrollWheelController />
                                <Marker position={[listing.latitude, listing.longitude]}>
                                    <Popup>{listing.title}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    ) : (
                        <p className="room-detail-map-unavailable">
                            Exact location isn't available on the map for this listing yet.
                        </p>
                    )}

                </div>

                {/* Right sticky aside */}
                <aside className="room-detail-aside">

                    <div className="room-detail-aside-price">
                        <span className="room-aside-amount">{listing.price_per_person} AZN</span>
                        <span className="room-aside-period"> / nəfər / ay</span>
                    </div>

                    <dl className="room-detail-aside-dl">
                        {[
                            ['Preferred gender', listing.preferred_gender || '—'],
                            ['Smoking',          listing.smoking_allowed  ? 'Allowed' : 'No'],
                            ['Alcohol',          listing.alcohol_allowed  ? 'Allowed' : 'No'],
                            ['Religion',         listing.religion_preference || '—'],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="room-detail-aside-actions">
                        <Button onClick={() => navigate(`/messages/${listing.user_id}`)}>
                            <MessageCircle size={16} /> Contact owner
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(`/profile/${listing.user_id}`)}>
                            <UserCircle size={16} /> View profile &amp; compatibility
                        </Button>
                    </div>

                </aside>

            </div>

            <SimilarRooms currentListing={listing} />

        </article>
    )
}

export default RoomDetail