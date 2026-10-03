import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { 
    MapPin, MessageCircle, Users, UserCircle, Phone, 
    ImageOff, Check, X, Share2, 
    Edit, Trash2 
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import Button from '../components/Button/Button'
import Badge from '../components/Badge/Badge'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import Card from '../components/Card/Card'
import Modal from '../components/Modal/Modal'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { listingsAPI } from '../api/listings'
import { getImageUrl } from '../utils/imageUrl'

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
    const { user, isAuthenticated } = useAuth()
    const { showToast } = useToast()

    const [listing, setListing] = useState(null)
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')
    
    const [similarRooms, setSimilarRooms] = useState([])
    const [lightboxImage, setLightboxImage] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && lightboxImage !== null) {
                setLightboxImage(null)
            }
        }
        if (lightboxImage !== null) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [lightboxImage])

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
            
            // Load similar rooms
            if (response.district) {
                const similar = await listingsAPI.getAll({ district: response.district, limit: 5 })
                const items = Array.isArray(similar) ? similar : similar.items || []
                setSimilarRooms(items.filter(item => String(item.id) !== String(id)).slice(0, 4))
            }
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

    useEffect(() => {
        if (listing?.title) {
            document.title = `${listing.title} - CoLiving`
        } else {
            document.title = 'CoLiving'
        }
    }, [listing?.title])

    if (status === 'loading') return <Spinner />
    if (status === 'empty') return <EmptyState title="Listing not found" message="This listing does not exist or has been removed." />
    if (status === 'error') return <ErrorState message={errorMessage} onRetry={loadListing} />

    const isOwner = user && String(user.id) === String(listing.user_id)
    const images = listing.images || []
    
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            showToast('Link copied to clipboard!', 'success')
        } catch {
            showToast('Failed to copy link', 'error')
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await listingsAPI.delete(id)
            showToast('Listing deleted successfully.', 'success')
            navigate('/rooms')
        } catch (error) {
            showToast(error.message || 'Failed to delete listing.', 'error')
        } finally {
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
        }
    }

    return (
        <article className="room-detail-page">
            <div className="room-detail-top-nav">
                <Link to="/rooms" className="room-detail-back">← Back to rooms</Link>
                <button type="button" className="room-detail-share-btn" onClick={handleShare}>
                    <Share2 size={16} /> Share
                </button>
            </div>

            {/* Gallery */}
            {images.length === 0 ? (
                <div className="room-detail-no-images">
                    <ImageOff size={48} />
                    <p>No photos yet</p>
                </div>
            ) : images.length === 1 ? (
                <div className="room-detail-gallery-single">
                    <img 
                        src={getImageUrl(images[0].image_url)} 
                        alt={listing.title} 
                        onClick={() => setLightboxImage(0)}
                    />
                </div>
            ) : (
                <div className="room-detail-gallery-multi">
                    <div className="room-detail-gallery-main">
                        <img 
                            src={getImageUrl(images[0].image_url)} 
                            alt={listing.title} 
                            onClick={() => setLightboxImage(0)}
                        />
                    </div>
                    <div className="room-detail-gallery-grid">
                        {images.slice(1, 5).map((image, index) => (
                            <img 
                                key={image.id} 
                                src={getImageUrl(image.image_url)} 
                                alt={`${listing.title} ${index + 2}`} 
                                onClick={() => setLightboxImage(index + 1)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="room-detail-main">
                <div>
                    <div className="room-detail-header-row">
                        <h1>{listing.title}</h1>
                        <div className="room-detail-price-badge">
                            {listing.price_per_person} AZN / person
                        </div>
                    </div>
                    
                    <div className="room-detail-meta">
                        <span><MapPin size={18} />{listing.address}</span>
                        <span><Users size={18} />{listing.available_spots} spots available</span>
                    </div>

                    <div className="room-detail-tags">
                        <Badge variant="primary">{listing.district}</Badge>
                        <Badge variant="primary">{listing.nearest_university}</Badge>
                    </div>

                    <div className="room-detail-description">
                        <h2>About this room</h2>
                        <p>{listing.description}</p>
                    </div>

                    {/* Amenities */}
                    <div className="room-detail-amenities">
                        <h2>Amenities</h2>
                        <ul className="amenities-list">
                            <li>
                                {listing.has_wifi ? <Check size={18} className="icon-check" /> : <X size={18} className="icon-x" />}
                                <span>WiFi</span>
                            </li>
                            <li>
                                {listing.is_furnished ? <Check size={18} className="icon-check" /> : <X size={18} className="icon-x" />}
                                <span>Furnished</span>
                            </li>
                            <li>
                                {listing.smoking_allowed ? <Check size={18} className="icon-check" /> : <X size={18} className="icon-x" />}
                                <span>Smoking allowed</span>
                            </li>
                            <li>
                                {listing.alcohol_allowed ? <Check size={18} className="icon-check" /> : <X size={18} className="icon-x" />}
                                <span>Alcohol allowed</span>
                            </li>
                        </ul>
                    </div>

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
                
                <aside className="room-detail-aside">
                    <strong className="aside-price">{listing.price_per_person} AZN / person</strong>
                    
                    <dl>
                        {[
                            ['Preferred gender', listing.preferred_gender], 
                            ['Religion', listing.religion_preference]
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>

                    {/* Phone Number block */}
                    {listing.phone_number && (
                        <div className="room-detail-phone">
                            <dt>Phone number</dt>
                            {isAuthenticated ? (
                                <dd>
                                    <a href={`tel:${listing.phone_number}`} className="phone-link">
                                        <Phone size={16} /> {listing.phone_number}
                                    </a>
                                </dd>
                            ) : (
                                <dd>
                                    <Link to="/login" className="phone-login-link">Log in to see the phone number</Link>
                                </dd>
                            )}
                        </div>
                    )}

                    <div className="room-detail-actions">
                        {isOwner ? (
                            <>
                                <Button onClick={() => navigate(`/listings/${listing.id}/edit`)}>
                                    <Edit size={16} /> Edit listing
                                </Button>
                                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(true)} className="delete-btn">
                                    <Trash2 size={16} /> Delete listing
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => navigate(`/messages/${listing.user_id}`)}>
                                    <MessageCircle size={16} /> Contact owner
                                </Button>
                                <Button variant="secondary" onClick={() => navigate(`/profile/${listing.user_id}`)}>
                                    <UserCircle size={16} /> View profile & compatibility
                                </Button>
                            </>
                        )}
                    </div>
                </aside>
            </div>

            {/* Similar Rooms */}
            {similarRooms.length > 0 && (
                <div className="room-detail-similar">
                    <h2>Similar rooms</h2>
                    <div className="similar-rooms-grid">
                        {similarRooms.map(room => (
                            <Card
                                key={room.id}
                                onViewDetails={() => navigate(`/rooms/${room.id}`)}
                                title={room.title}
                                location={room.address}
                                roommates={room.available_spots}
                                description={room.description}
                                image={getImageUrl(room.images?.[0]?.image_url)} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxImage !== null && (
                <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxImage(null)}>&times;</button>
                        
                        {images.length > 1 && (
                            <button 
                                className="lightbox-prev" 
                                onClick={() => setLightboxImage(i => (i === 0 ? images.length - 1 : i - 1))}
                            >
                                &#10094;
                            </button>
                        )}
                        
                        <img 
                            src={getImageUrl(images[lightboxImage].image_url)} 
                            alt={`${listing.title} view`} 
                            className="lightbox-img" 
                        />
                        
                        {images.length > 1 && (
                            <button 
                                className="lightbox-next" 
                                onClick={() => setLightboxImage(i => (i === images.length - 1 ? 0 : i + 1))}
                            >
                                &#10095;
                            </button>
                        )}
                        <div className="lightbox-counter">
                            {lightboxImage + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <Modal 
                    title="Delete Listing" 
                    onClose={() => setIsDeleteModalOpen(false)}
                >
                    <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
                    <div className="delete-modal-actions">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            aria-busy={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </Modal>
            )}

        </article>
    )
}

export default RoomDetail