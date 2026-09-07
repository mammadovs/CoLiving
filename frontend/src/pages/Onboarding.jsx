import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button'
import Input from '../components/Input/Input'
import Checkbox from '../components/Checkbox/Checkbox'
import { usersAPI } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './Onboarding.css'

const ENUM_OPTIONS = {
    sleep_schedule: ['early_bird', 'night_owl', 'flexible'],
    cleanliness_level: ['very_tidy', 'average', 'relaxed'],
    religion: ['muslim', 'christian', 'secular', 'other'],
    noise_tolerance: ['quiet', 'moderate', 'loud_ok'],
    guest_frequency: ['rarely', 'sometimes', 'often'],
    work_or_study_schedule: ['mostly_home', 'mostly_out', 'mixed'],
    personality_type: ['introvert', 'extrovert', 'ambivert'],
}

const BOOLEAN_FIELDS = ['smoking_habit', 'drinks_alcohol', 'pet_friendly']

function formatLabel(value) {
    return value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Onboarding() {
    const navigate = useNavigate()
    const { updateUser } = useAuth()
    const { showToast } = useToast()

    const [formData, setFormData] = useState({
        budget: '',
        sleep_schedule: '',
        cleanliness_level: '',
        religion: '',
        noise_tolerance: '',
        smoking_habit: false,
        drinks_alcohol: false,
        pet_friendly: false,
        guest_frequency: '',
        work_or_study_schedule: '',
        personality_type: '',
    })
    const [submitting, setSubmitting] = useState(false)

    const update = (key, value) => setFormData((current) => ({ ...current, [key]: value }))

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        try {
            // Only send fields the user actually filled in / toggled
            const payload = {}
            Object.entries(formData).forEach(([key, value]) => {
                if (BOOLEAN_FIELDS.includes(key)) {
                    payload[key] = value
                } else if (value !== '') {
                    payload[key] = key === 'budget' ? Number(value) : value
                }
            })

            const updatedUser = await usersAPI.updateProfile(payload)
            updateUser(updatedUser)
            showToast('Profile completed!', 'success')
            navigate('/rooms')
        } catch (error) {
            showToast(error.data?.detail || error.message || 'Could not save your profile.', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSkip = () => {
        navigate('/rooms')
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                <h1 className="onboarding-title">Complete your profile</h1>
                <p className="onboarding-subtitle">
                    Help us find you a compatible roommate. You can always fill this in later from your profile.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    <Input
                        label="Budget (AZN)"
                        type="number"
                        value={formData.budget}
                        onChange={(event) => update('budget', event.target.value)}
                        placeholder="e.g. 300"
                    />

                    {Object.entries(ENUM_OPTIONS).map(([field, options]) => (
                        <label key={field} className="onboarding-select-field">
                            <span>{formatLabel(field)}</span>
                            <select
                                value={formData[field]}
                                onChange={(event) => update(field, event.target.value)}
                            >
                                <option value="">Prefer not to say</option>
                                {options.map((opt) => (
                                    <option key={opt} value={opt}>{formatLabel(opt)}</option>
                                ))}
                            </select>
                        </label>
                    ))}

                    <div className="onboarding-checkboxes">
                        {BOOLEAN_FIELDS.map((field) => (
                            <Checkbox
                                key={field}
                                label={formatLabel(field)}
                                checked={formData[field]}
                                onChange={(event) => update(field, event.target.checked)}
                            />
                        ))}
                    </div>

                    <div className="onboarding-actions">
                        <Button type="button" variant="secondary" onClick={handleSkip} disabled={submitting}>
                            Skip for now
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save and continue'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}