import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const emptyListing = {
    title: '', description: '', price_per_person: '', address: '', district: '',
    nearest_university: '', available_spots: '', phone_number: '', preferred_gender: 'any',
    smoking_allowed: false, alcohol_allowed: false, religion_preference: 'secular',
    has_wifi: true, is_furnished: true,
}

function ListingEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState(emptyListing)
    const [status, setStatus] = useState(id ? 'loading' : 'success')
    const [errorMessage, setErrorMessage] = useState('')
    const [saving, setSaving] = useState(false)

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

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)
        setErrorMessage('')
        try {
            const payload = {
                ...form,
                price_per_person: Number(form.price_per_person),
                available_spots: Number(form.available_spots),
            }
            if (id) await listingsAPI.update(id, payload)
            else await listingsAPI.create(payload)
            navigate('/rooms')
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Elanı yadda saxlamaq mümkün olmadı.')
            setStatus('error')
        } finally {
            setSaving(false)
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
        <div className="listing-actions"><Button type="button" variant="secondary" onClick={() => navigate('/rooms')}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save listing'}</Button></div>
    </form>
}

export default ListingEditor
