import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Upload, MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Input from '../components/Input/Input'
import Select from '../components/Select/Select'
import Textarea from '../components/Textarea/Textarea'
import Checkbox from '../components/Checkbox/Checkbox'
import Button from '../components/Button/Button'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import { DISTRICTS, UNIVERSITIES, GENDERS, RELIGIONS } from '../data/options'
import { resolveImageUrl } from '../utils/resolveImageUrl'
import { useToast } from '../context/ToastContext'
import { TILE_LAYER } from '../utils/mapTiles'
import './ListingEditor.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const BAKU_CENTER = [40.4093, 49.8671]

function LocationPicker({ position, onSelect }) {
    useMapEvents({
        click(event) {
            onSelect([event.latlng.lat, event.latlng.lng])
        },
    })
    return position ? <Marker position={position} /> : null
}

function MapFlyTo({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16)
        }
    }, [position, map])
    return null
}

/** Enables scroll-wheel zoom only after the user clicks/focuses the map,
 *  and disables it again on mouseout — prevents trapping page scrolling. */
function ScrollWheelController() {
    const map = useMap()
    useMapEvents({
        click() { map.scrollWheelZoom.enable() },
        mouseout() { map.scrollWheelZoom.disable() },
    })
    return null
}

const emptyListing = {
    title: '', description: '', price_per_person: '', address: '', district: '',
    nearest_university: '', available_spots: '', phone_number: '', preferred_gender: 'any',
    smoking_allowed: false, alcohol_allowed: false, religion_preference: 'secular',
    has_wifi: true, is_furnished: true, images: [], latitude: null, longitude: null,
}

// --- validation helpers ---
const PHONE_RE = /^(\+994|0)[\d\s-]{9,13}$/

function validate(form) {
    const e = {}
    if (!form.title.trim()) {
        e.title = 'Title is required.'
    } else if (form.title.trim().length < 3) {
        e.title = 'Title must be at least 3 characters.'
    }
    const price = Number(form.price_per_person)
    if (form.price_per_person === '' || isNaN(price) || price <= 0) {
        e.price_per_person = 'Price must be a number greater than 0.'
    }
    const spots = Number(form.available_spots)
    if (form.available_spots === '' || isNaN(spots) || spots <= 0 || !Number.isInteger(spots)) {
        e.available_spots = 'Available spots must be a whole number greater than 0.'
    }
    if (!form.address.trim()) e.address = 'Address is required.'
    if (!form.district) e.district = 'Please select a district.'
    if (!form.nearest_university) e.nearest_university = 'Please select a university.'
    if (form.phone_number.trim() && !PHONE_RE.test(form.phone_number.trim())) {
        e.phone_number = 'Enter a valid Azerbaijani number: +994XXXXXXXXX or 0XXXXXXXXX.'
    }
    return e
}

function formatApiError(detail) {
    if (Array.isArray(detail)) {
        return detail
            .map((d) => {
                const field = d.loc?.slice(1).join('.') || ''
                return field ? `${field}: ${d.msg}` : d.msg
            })
            .join(' · ')
    }
    return String(detail)
}

function ListingEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const fileInputRef = useRef(null)
    const firstErrorRef = useRef(null)
    const [form, setForm] = useState(emptyListing)
    const [status, setStatus] = useState(id ? 'loading' : 'success')
    const [loadError, setLoadError] = useState('')
    const [submitError, setSubmitError] = useState('')
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null) // null | { done, total }
    const [uploadError, setUploadError] = useState('')
    const [searchingLocation, setSearchingLocation] = useState(false)
    const [locationError, setLocationError] = useState('')
    const justCreated = location.state?.justCreated === true

    const loadListing = useCallback(async () => {
        if (!id) return
        setStatus('loading')
        try {
            const response = await listingsAPI.getById(id)
            if (!response) {
                setStatus('empty')
                return
            }
            setForm({ ...emptyListing, ...response })
            setStatus('success')
        } catch (error) {
            if (error.status === 404) {
                setStatus('empty')
                return
            }
            setLoadError(error.data?.detail || error.message || 'Could not load the listing.')
            setStatus('error')
        }
    }, [id])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadListing()
    }, [loadListing])

    const update = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }))
        if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
    }

    const handleFindOnMap = async () => {
        if (!form.address.trim()) {
            setLocationError('Type an address first.')
            return
        }
        setSearchingLocation(true)
        setLocationError('')
        try {
            const result = await listingsAPI.geocode(form.address, form.district)
            update('latitude', result.latitude)
            update('longitude', result.longitude)
        } catch (error) {
            setLocationError(error.data?.detail || 'Could not find that address on the map. Try adjusting it, or click directly on the map instead.')
        } finally {
            setSearchingLocation(false)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitError('')

        const fieldErrors = validate(form)
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
            // Focus the first invalid field after React re-renders
            setTimeout(() => {
                firstErrorRef.current?.focus()
                firstErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 0)
            return
        }

        setSaving(true)
        try {
            const payload = {
                ...form,
                price_per_person: Number(form.price_per_person),
                available_spots: Number(form.available_spots),
                latitude: form.latitude,
                longitude: form.longitude,
            }
            delete payload.images

            if (id) {
                await listingsAPI.update(id, payload)
                navigate(`/rooms/${id}`)
            } else {
                // New listing: go to its edit page so the user can add photos
                const created = await listingsAPI.create(payload)
                navigate(`/listings/${created.id}/edit`, { replace: true, state: { justCreated: true } })
            }
        } catch (error) {
            const detail = error.data?.detail
            setSubmitError(detail ? formatApiError(detail) : (error.message || 'Could not save the listing. Please try again.'))
        } finally {
            setSaving(false)
        }
    }

    const handleImageSelect = async (event) => {
        const files = Array.from(event.target.files || [])
        if (!files.length || !id) return

        const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
        const rejected = []
        const valid = []
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                rejected.push(`"${file.name}" is not an image.`)
            } else if (file.size > MAX_SIZE) {
                rejected.push(`"${file.name}" exceeds the 5 MB limit.`)
            } else {
                valid.push(file)
            }
        }
        if (rejected.length) {
            setUploadError(rejected.join(' '))
        } else {
            setUploadError('')
        }
        if (!valid.length) {
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setUploadProgress({ done: 0, total: valid.length })
        const errors = []
        for (let i = 0; i < valid.length; i++) {
            setUploadProgress({ done: i, total: valid.length })
            try {
                const uploadedImage = await listingsAPI.uploadImage(id, valid[i])
                setForm((current) => ({ ...current, images: [...(current.images || []), uploadedImage] }))
            } catch (err) {
                errors.push(`"${valid[i].name}": ${err.data?.detail || err.message || 'upload failed'}`)
            }
        }
        setUploadProgress(null)
        if (errors.length) {
            setUploadError((prev) => [prev, ...errors].filter(Boolean).join(' '))
        }
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    if (status === 'loading') return <Spinner />
    if (status === 'empty') return <EmptyState title="Listing not found" />
    if (status === 'error') return <ErrorState message={loadError} onRetry={loadListing} />

    // Ordered list of validated field keys — used to find the first error for focus
    const FIELD_ORDER = ['title', 'price_per_person', 'available_spots', 'address', 'phone_number', 'district', 'nearest_university']
    const firstErrorKey = FIELD_ORDER.find((k) => errors[k])

    return <form className="listing-editor" onSubmit={handleSubmit}>
        <h1>{id ? 'Edit listing' : 'Create a listing'}</h1>
        {justCreated && (
            <p className="listing-created-banner">
                ✓ Your listing was created. Add some photos to make it stand out, then press Save.
            </p>
        )}
        {submitError && <p className="listing-submit-error">{submitError}</p>}
        <Input
            label="Title"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            required
            error={errors.title}
            ref={firstErrorKey === 'title' ? firstErrorRef : undefined}
        />
        <Textarea label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} />
        <div className="listing-grid">
            {/* Row 1 */}
            <Input
                label="Price per person"
                type="number"
                min="1"
                step="1"
                value={form.price_per_person}
                onChange={(event) => update('price_per_person', event.target.value)}
                required
                error={errors.price_per_person}
                ref={firstErrorKey === 'price_per_person' ? firstErrorRef : undefined}
            />
            <Input
                label="Available spots"
                type="number"
                min="1"
                step="1"
                value={form.available_spots}
                onChange={(event) => update('available_spots', event.target.value)}
                required
                error={errors.available_spots}
                ref={firstErrorKey === 'available_spots' ? firstErrorRef : undefined}
            />

            {/* Row 2 (full width) */}
            <div className="listing-grid-full address-row">
                <Input
                    label="Address"
                    value={form.address}
                    onChange={(event) => update('address', event.target.value)}
                    required
                    error={errors.address}
                    ref={firstErrorKey === 'address' ? firstErrorRef : undefined}
                />
                <Button type="button" variant="secondary" onClick={handleFindOnMap} disabled={searchingLocation} className="find-map-btn">
                    <MapPin size={16} />
                    {searchingLocation ? 'Searching...' : 'Find on map'}
                </Button>
            </div>

            {/* Row 3 */}
            <Input
                label="Phone number"
                value={form.phone_number}
                onChange={(event) => update('phone_number', event.target.value)}
                error={errors.phone_number}
                ref={firstErrorKey === 'phone_number' ? firstErrorRef : undefined}
            />
            <Select
                label="District"
                value={form.district}
                onChange={(event) => update('district', event.target.value)}
                options={DISTRICTS}
                required
                error={errors.district}
                ref={firstErrorKey === 'district' ? firstErrorRef : undefined}
            />

            {/* Row 4 */}
            <Select
                label="Nearest university"
                value={form.nearest_university}
                onChange={(event) => update('nearest_university', event.target.value)}
                options={UNIVERSITIES}
                required
                error={errors.nearest_university}
                ref={firstErrorKey === 'nearest_university' ? firstErrorRef : undefined}
            />
            <Select label="Preferred gender" value={form.preferred_gender} onChange={(event) => update('preferred_gender', event.target.value)} options={GENDERS} />

            {/* Row 5 */}
            <Select label="Religion preference" value={form.religion_preference} onChange={(event) => update('religion_preference', event.target.value)} options={RELIGIONS} />
            <div className="listing-grid-empty"></div>
        </div>
        <div className="listing-options">
            <Checkbox label="Smoking allowed" checked={form.smoking_allowed} onChange={(event) => update('smoking_allowed', event.target.checked)} toggle />
            <Checkbox label="Alcohol allowed" checked={form.alcohol_allowed} onChange={(event) => update('alcohol_allowed', event.target.checked)} toggle />
            <Checkbox label="Has WiFi" checked={form.has_wifi} onChange={(event) => update('has_wifi', event.target.checked)} toggle />
            <Checkbox label="Furnished" checked={form.is_furnished} onChange={(event) => update('is_furnished', event.target.checked)} toggle />
        </div>

        <div className="listing-map-picker">
            <h2>Confirm the exact location</h2>
            <p className="listing-map-hint">Type your address above and click "Find on map", or click directly on the map to place the pin yourself.</p>
            {locationError && <p className="listing-images-error">{locationError}</p>}
            <MapContainer
                center={form.latitude && form.longitude ? [form.latitude, form.longitude] : BAKU_CENTER}
                zoom={form.latitude && form.longitude ? 15 : 11}
                scrollWheelZoom={false}
                className="listing-map-picker-container"
            >
                <TileLayer {...TILE_LAYER} />
                <ScrollWheelController />
                <LocationPicker
                    position={form.latitude && form.longitude ? [form.latitude, form.longitude] : null}
                    onSelect={([lat, lng]) => {
                        update('latitude', lat)
                        update('longitude', lng)
                    }}
                />
                <MapFlyTo position={form.latitude && form.longitude ? [form.latitude, form.longitude] : null} />
            </MapContainer>
            {form.latitude && form.longitude
                ? <p className="listing-map-selected">Pin placed — this exact spot will be shown to renters.</p>
                : <p className="listing-map-warning">No pin placed. Renters will not see this listing on the map.</p>
            }
        </div>

        {id ? (
            <div className="listing-images-section">
                <h2>Photos</h2>
                {uploadError && <p className="listing-images-error">{uploadError}</p>}
                <div className="listing-images-grid">
                    {(form.images || []).map((image) => (
                        <img
                            key={image.id}
                            src={resolveImageUrl(image.image_url)}
                            alt="Listing"
                            className="listing-image-thumb"
                        />
                    ))}
                    <label className="listing-image-upload" aria-disabled={uploadProgress !== null}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            disabled={uploadProgress !== null}
                            hidden
                        />
                        <Upload size={20} />
                        <span>
                            {uploadProgress
                                ? `Uploading ${uploadProgress.done + 1} of ${uploadProgress.total}…`
                                : 'Add photos'}
                        </span>
                    </label>
                </div>
            </div>
        ) : (
            <p className="listing-images-hint">You'll be able to add photos once the listing is created.</p>
        )}

        <div className="listing-actions"><Button type="button" variant="secondary" onClick={() => navigate('/rooms')}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save listing'}</Button></div>
    </form>
}

export default ListingEditor