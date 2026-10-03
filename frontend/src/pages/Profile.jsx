import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button'
import Input from '../components/Input/Input'
import Checkbox from '../components/Checkbox/Checkbox'
import Avatar from '../components/Avatar/Avatar'
import Compatibility from '../components/Compatibility/Compatibility'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import Card from '../components/Card/Card'
import Modal from '../components/Modal/Modal'
import { usersAPI } from '../api/users'
import { listingsAPI } from '../api/listings'
import { getImageUrl } from '../utils/imageUrl'
import { useToast } from '../context/ToastContext'
import { Edit, Trash2 } from 'lucide-react'
import './Profile.css'

const fields = ['sleep_schedule', 'cleanliness_level', 'religion', 'noise_tolerance', 'smoking_habit', 'drinks_alcohol', 'guest_frequency', 'work_or_study_schedule', 'personality_type']

// Enum options matching the backend exactly (see app/models.py)
const ENUM_OPTIONS = {
    sleep_schedule: ['early_bird', 'night_owl', 'flexible'],
    cleanliness_level: ['very_tidy', 'average', 'relaxed'],
    religion: ['muslim', 'christian', 'secular', 'other'],
    noise_tolerance: ['quiet', 'moderate', 'loud_ok'],
    guest_frequency: ['rarely', 'sometimes', 'often'],
    work_or_study_schedule: ['mostly_home', 'mostly_out', 'mixed'],
    personality_type: ['introvert', 'extrovert', 'ambivert'],
}

const BOOLEAN_FIELDS = ['smoking_habit', 'drinks_alcohol']

function formatLabel(value) {
    return value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function toBreakdownArray(breakdownObject) {
    if (!breakdownObject) return []
    return Object.entries(breakdownObject).map(([key, value]) => ({
        label: formatLabel(key),
        score: value,
    }))
}

function Profile() {
    const { userId = 'me' } = useParams()
    const navigate = useNavigate()
    const { showToast } = useToast()
    
    const [profile, setProfile] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')
    
    const [compatibility, setCompatibility] = useState(null)
    const [compatibilityLoading, setCompatibilityLoading] = useState(false)
    
    const [listings, setListings] = useState([])
    const [listingsStatus, setListingsStatus] = useState('loading')
    const [listingsError, setListingsError] = useState('')
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [listingToDelete, setListingToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    
    const targetUserId = userId === 'me' ? JSON.parse(localStorage.getItem('user') || '{}').id : userId
    const isOwnProfile = userId === 'me'

    useEffect(() => { document.title = 'Profile - CoLiving' }, [])

    const loadProfile = useCallback(async () => {
        if (!targetUserId) {
            setErrorMessage('Profile information was not found.')
            setStatus('error')
            return
        }
        setStatus('loading')
        try {
            const response = await usersAPI.getProfile(targetUserId)
            if (!response) {
                setStatus('empty')
                return
            }
            setProfile(response)
            setStatus('success')
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Could not load the profile.')
            setStatus('error')
        }
    }, [targetUserId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProfile()
    }, [loadProfile])

    const loadListings = useCallback(async () => {
        if (!targetUserId) return
        setListingsStatus('loading')
        try {
            const response = await usersAPI.getUserListings(targetUserId)
            const loaded = Array.isArray(response) ? response : response.items || []
            setListings(loaded)
            setListingsStatus(loaded.length ? 'success' : 'empty')
        } catch (error) {
            setListingsError(error.data?.detail || error.message || 'Could not load listings.')
            setListingsStatus('error')
        }
    }, [targetUserId])

    useEffect(() => {
        if (status === 'success') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadListings()
        }
    }, [loadListings, status])

    // Fetch the real compatibility score when viewing someone else's profile
    useEffect(() => {
        if (isOwnProfile || !targetUserId || status !== 'success') return

        let cancelled = false
        setCompatibilityLoading(true)
        usersAPI.getCompatibility(targetUserId)
            .then((result) => { if (!cancelled) setCompatibility(result) })
            .catch(() => { if (!cancelled) setCompatibility(null) })
            .finally(() => { if (!cancelled) setCompatibilityLoading(false) })

        return () => { cancelled = true }
    }, [isOwnProfile, targetUserId, status])

    const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }))

    if (status === 'loading') return <Spinner />
    if (status === 'empty') return <EmptyState title="Profile not found" />
    if (status === 'error') return <ErrorState message={errorMessage} onRetry={loadProfile} />

    const saveProfile = async (event) => {
        event.preventDefault()
        try {
            const updatedProfile = await usersAPI.updateProfile(profile)
            setProfile(updatedProfile || profile)
            setIsEditing(false)
            showToast('Profile updated', 'success')
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Could not update the profile.')
            setStatus('error')
        }
    }

    const handleDeleteListing = async () => {
        if (!listingToDelete) return
        setIsDeleting(true)
        try {
            await listingsAPI.delete(listingToDelete.id)
            setListings((current) => current.filter((l) => l.id !== listingToDelete.id))
            showToast('Listing deleted', 'success')
            setDeleteModalOpen(false)
            if (listings.length === 1) {
                setListingsStatus('empty')
            }
        } catch (error) {
            showToast(error.message || 'Could not delete listing', 'error')
        } finally {
            setIsDeleting(false)
            setListingToDelete(null)
        }
    }

    return (
        <section className="profile-page">
            <div className="profile-heading">
                <Avatar name={profile.full_name} size="lg" />
                <div><h1>{profile.full_name}</h1><p>{profile.email}</p></div>
                {isOwnProfile && <Button variant="secondary" onClick={() => setIsEditing((current) => !current)}>{isEditing ? 'Cancel' : 'Edit profile'}</Button>}
            </div>

            {isEditing && isOwnProfile ? (
                <form className="profile-form" onSubmit={saveProfile}>
                    <Input label="Full name" value={profile.full_name || ''} onChange={(event) => update('full_name', event.target.value)} />
                    <Input label="Budget (AZN)" type="number" value={profile.budget || ''} onChange={(event) => update('budget', event.target.value)} />

                    {Object.entries(ENUM_OPTIONS).map(([field, options]) => (
                        <label key={field} className="profile-select-field">
                            <span>{formatLabel(field)}</span>
                            <select
                                value={profile[field] || ''}
                                onChange={(event) => update(field, event.target.value || null)}
                            >
                                <option value="">Not specified</option>
                                {options.map((opt) => (
                                    <option key={opt} value={opt}>{formatLabel(opt)}</option>
                                ))}
                            </select>
                        </label>
                    ))}

                    {BOOLEAN_FIELDS.map((field) => (
                        <Checkbox
                            key={field}
                            label={formatLabel(field)}
                            checked={Boolean(profile[field])}
                            onChange={(event) => update(field, event.target.checked)}
                        />
                    ))}

                    <Checkbox label="Pet friendly" checked={Boolean(profile.pet_friendly)} onChange={(event) => update('pet_friendly', event.target.checked)} />

                    <Button type="submit">Save changes</Button>
                </form>
            ) : (
                <div className="profile-content">
                    <section className="profile-card">
                        <h2>Lifestyle profile</h2>
                        <dl className="profile-details">
                            {fields.map((field) => <div key={field}><dt>{field.replaceAll('_', ' ')}</dt><dd>{profile[field] ?? 'Not specified'}</dd></div>)}
                            <div><dt>budget</dt><dd>{profile.budget ?? 'Not specified'}{profile.budget ? ' AZN' : ''}</dd></div>
                            <div><dt>pet friendly</dt><dd>{profile.pet_friendly ? 'Yes' : 'No'}</dd></div>
                        </dl>
                    </section>
                    {!isOwnProfile && !compatibilityLoading && compatibility && (
                        <Compatibility
                            score={compatibility.compatibility_score}
                            breakdown={toBreakdownArray(compatibility.breakdown)}
                        />
                    )}
                </div>
            )}

            {!isEditing && (
                <div className="profile-listings-section">
                    <h2>{isOwnProfile ? 'My listings' : `Listings by ${profile.full_name?.split(' ')[0]}`}</h2>
                    
                    {listingsStatus === 'loading' && <Spinner />}
                    {listingsStatus === 'error' && <ErrorState message={listingsError} onRetry={loadListings} />}
                    
                    {listingsStatus === 'empty' && (
                        <EmptyState 
                            title={isOwnProfile ? "You have no listings yet" : "No listings yet"}
                            action={isOwnProfile ? <Button onClick={() => navigate('/listings/new')}>List a room</Button> : null}
                        />
                    )}

                    {listingsStatus === 'success' && listings.length > 0 && (
                        <div className="profile-listings-grid">
                            {listings.map((listing) => (
                                <div key={listing.id} className="profile-listing-item">
                                    <Card
                                        title={listing.title}
                                        location={listing.address}
                                        roommates={listing.available_spots}
                                        description={listing.description}
                                        image={getImageUrl(listing.images?.[0]?.image_url)}
                                        onViewDetails={() => navigate(`/rooms/${listing.id}`)}
                                    />
                                    {isOwnProfile && (
                                        <div className="profile-listing-actions">
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => navigate(`/listings/${listing.id}/edit`)}
                                                aria-label="Edit listing"
                                            >
                                                <Edit size={16} /> Edit
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => {
                                                    setListingToDelete(listing)
                                                    setDeleteModalOpen(true)
                                                }}
                                                className="delete-action-btn"
                                                aria-label="Delete listing"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {deleteModalOpen && (
                <Modal title="Delete Listing" onClose={() => !isDeleting && setDeleteModalOpen(false)}>
                    <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>Cancel</Button>
                        <Button onClick={handleDeleteListing} disabled={isDeleting} loading={isDeleting} className="delete-action-btn-primary">Delete</Button>
                    </div>
                </Modal>
            )}
        </section>
    )
}

export default Profile