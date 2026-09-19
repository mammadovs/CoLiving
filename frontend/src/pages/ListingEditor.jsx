import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload } from 'lucide-react'
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

const emptyListing = {
    title: '', description: '', price_per_person: '', address: '', district: '',
    nearest_university: '', available_spots: '', phone_number: '', preferred_gender: 'any',
    smoking_allowed: false, alcohol_allowed: false, religion_preference: 'secular',
    has_wifi: true, is_furnished: true, images: [], latitude: null, longitude: null,
}

function ListingEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [form, setForm] = useState(emptyListing)
    const [status, setStatus] = useState(id ? 'loading' : 'success')
    const [errorMessage, setErrorMessage] = useState('')
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [searchingLocation, setSearchingLocation] = useState(false)
    const [locationError, setLocationError] = useState('')

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
            setErrorMessage(error.data?.detail || error.message || 'Elanı yükləmək mümkün olmadı.')
            setStatus('error')
        }
    }, [id])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadListing()
    }, [loadListing])

    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

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
        setSaving(true)
        setErrorMessage('')
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
                navigate('/rooms')
            } else {
                // New listing: go to its edit page next, since photo upload needs a real listing_id
                const created = await listingsAPI.create(payload)
                navigate(`/listings/${created.id}/edit`, { replace: true })
            }
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Elanı yadda saxlamaq mümkün olmadı.')
            setStatus('error')
        } finally {
            setSaving(false)
        }
    }

    const handleImageSelect = async (event) => {
        const file = event.target.files?.[0]
        if (!file || !id) return

        setUploading(true)
        setUploadError('')
        try {
            const uploadedImage = await listingsAPI.uploadImage(id, file)
            setForm((current) => ({ ...current, images: [...(current.images || []), uploadedImage] }))
        } catch (error) {
            setUploadError(error.data?.detail || error.message || 'Şəkli yükləmək mümkün olmadı.')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    if (status === 'loading') return <Spinner />
    if (status === 'empty') return <EmptyState title="Bu elan tapılmadı" />
    if (status === 'error' && id && !form.title) return <ErrorState message={errorMessage} onRetry={loadListing} />

    return <form className="listing-editor" onSubmit={handleSubmit}>
        <h1>{id ? 'Edit listing' : 'Create a listing'}</h1>
        {status === 'error' && <ErrorState message={errorMessage} onRetry={id ? loadListing : () => setStatus('success')} />}
        <Input label="Title" value={form.title} onChange={(event) => update('title', event.target.value)} />
        <Textarea label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} />
        <div className="listing-grid">
            <Input label="Price per person" type="number" value={form.price_per_person} onChange={(event) => update('price_per_person', event.target.value)} />
            <Input label="Available spots" type="number" value={form.available_spots} onChange={(event) => update('available_spots', event.target.value)} />
            <Input label="Address" value={form.address} onChange={(event) => update('address', event.target.value)} />
            <Button type="button" variant="secondary" onClick={handleFindOnMap} disabled={searchingLocation}>
                {searchingLocation ? 'Searching...' : 'Find on map'}
            </Button>
            <Input label="Phone number" value={form.phone_number} onChange={(event) => update('phone_number', event.target.value)} />
            <Select label="District" value={form.district} onChange={(event) => update('district', event.target.value)} options={['Nasimi', 'Yasamal', 'Sabail', 'Narimanov', 'Other']} />
            <Select label="Nearest university" value={form.nearest_university} onChange={(event) => update('nearest_university', event.target.value)} options={['ADA University', 'BDU', 'ADNSU', 'ATU', 'Other']} />
            <Select label="Preferred gender" value={form.preferred_gender} onChange={(event) => update('preferred_gender', event.target.value)} options={['any', 'male', 'female']} />
            <Select label="Religion preference" value={form.religion_preference} onChange={(event) => update('religion_preference', event.target.value)} options={['secular', 'muslim', 'christian', 'other']} />
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
                <TileLayer
                    attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                    tileSize={512}
                    zoomOffset={-1}
                />
                <LocationPicker
                    position={form.latitude && form.longitude ? [form.latitude, form.longitude] : null}
                    onSelect={([lat, lng]) => {
                        update('latitude', lat)
                        update('longitude', lng)
                    }}
                />
                <MapFlyTo position={form.latitude && form.longitude ? [form.latitude, form.longitude] : null} />
            </MapContainer>
            {form.latitude && form.longitude && (
                <p className="listing-map-selected">Pin placed — this exact spot will be shown to renters.</p>
            )}
        </div>

        {id ? (
            <div className="listing-images-section">
                <h2>Photos</h2>
                {uploadError && <p className="listing-images-error">{uploadError}</p>}
                <div className="listing-images-grid">
                    {(form.images || []).map((image) => (
                        <img key={image.id} src={image.image_url} alt="Listing" className="listing-image-thumb" />
                    ))}
                    <label className="listing-image-upload">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            disabled={uploading}
                            hidden
                        />
                        <Upload size={20} />
                        <span>{uploading ? 'Uploading...' : 'Add photo'}</span>
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