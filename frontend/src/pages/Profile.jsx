import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/Button/Button'
import Input from '../components/Input/Input'
import Checkbox from '../components/Checkbox/Checkbox'
import Avatar from '../components/Avatar/Avatar'
import Compatibility from '../components/Compatibility/Compatibility'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { usersAPI } from '../api/users'
import './Profile.css'

const fields = ['sleep_schedule', 'cleanliness_level', 'religion', 'noise_tolerance', 'smoking_habit', 'drinks_alcohol', 'guest_frequency', 'work_or_study_schedule', 'personality_type']

function Profile() {
    const { userId = 'me' } = useParams()
    const [profile, setProfile] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')
    const targetUserId = userId === 'me' ? JSON.parse(localStorage.getItem('user') || '{}').id : userId
    const isOwnProfile = userId === 'me'

    const loadProfile = useCallback(async () => {
        if (!targetUserId) {
            setErrorMessage('Profil məlumatı tapılmadı.')
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
            setErrorMessage(error.data?.detail || error.message || 'Profili yükləmək mümkün olmadı.')
            setStatus('error')
        }
    }, [targetUserId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProfile()
    }, [loadProfile])

    const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }))

    if (status === 'loading') return <Spinner />
    if (status === 'empty') return <EmptyState title="Profil tapılmadı" />
    if (status === 'error') return <ErrorState message={errorMessage} onRetry={loadProfile} />

    const saveProfile = async (event) => {
        event.preventDefault()
        try {
            const updatedProfile = await usersAPI.updateProfile(profile)
            setProfile(updatedProfile || profile)
            setIsEditing(false)
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Profili yeniləmək mümkün olmadı.')
            setStatus('error')
        }
    }

    return (
        <section className="profile-page">
            <div className="profile-heading"><Avatar name={profile.full_name} size="lg" /><div><h1>{profile.full_name}</h1><p>{profile.email}</p></div>{isOwnProfile && <Button variant="secondary" onClick={() => setIsEditing((current) => !current)}>{isEditing ? 'Cancel' : 'Edit profile'}</Button>}</div>
            {isEditing && isOwnProfile ? <form className="profile-form" onSubmit={saveProfile}><Input label="Full name" value={profile.full_name || ''} onChange={(event) => update('full_name', event.target.value)} /><Input label="Budget (AZN)" type="number" value={profile.budget || ''} onChange={(event) => update('budget', event.target.value)} /><Checkbox label="Pet friendly" checked={Boolean(profile.pet_friendly)} onChange={(event) => update('pet_friendly', event.target.checked)} /><Button type="submit">Save changes</Button></form> : <div className="profile-content"><section className="profile-card"><h2>Lifestyle profile</h2><dl className="profile-details">{fields.map((field) => <div key={field}><dt>{field.replaceAll('_', ' ')}</dt><dd>{profile[field] ?? 'Not specified'}</dd></div>)}<div><dt>budget</dt><dd>{profile.budget ?? 'Not specified'}{profile.budget ? ' AZN' : ''}</dd></div><div><dt>pet friendly</dt><dd>{profile.pet_friendly ? 'Yes' : 'No'}</dd></div></dl></section>{!isOwnProfile && <Compatibility breakdown={[]} />}</div>}
        </section>
    )
}

export default Profile
