import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './Signup.css'

const UNIVERSITIES = ['ADA University', 'BDU', 'ADNSU', 'ATU', 'Khazar University', 'Other']

export default function Signup() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const { showToast } = useToast()

    const [isStudent, setIsStudent] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        university: 'ADA University',
        profession: '',
    })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
    }

    const validate = () => {
        const next = {}

        if (!formData.email.trim()) {
            next.email = 'Email is required'
        } else if (isStudent && !formData.email.trim().toLowerCase().endsWith('edu.az')) {
            next.email = 'Students must register with a university email ending in edu.az'
        }

        if (!formData.password) {
            next.password = 'Password is required'
        } else if (formData.password.length < 6) {
            next.password = 'Password must be at least 6 characters'
        }

        if (!formData.full_name.trim()) {
            next.full_name = 'Full name is required'
        }

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setSubmitting(true)
        try {
            const payload = {
                email: formData.email.trim(),
                password: formData.password,
                full_name: formData.full_name.trim(),
                is_student: isStudent,
                university: isStudent ? formData.university : 'Other',
                profession: isStudent ? null : (formData.profession.trim() || null),
            }

            await register(payload)
            showToast('Account created! Welcome to CoLiving.', 'success')
            navigate('/onboarding')
        } catch (err) {
            if (err.status === 400) {
                setErrors({ email: 'An account with this email already exists.' })
            } else if (err.status === 422) {
                setErrors({ email: err.data?.detail || 'Please check your details and try again.' })
            } else {
                showToast(err.message || 'Something went wrong. Please try again.', 'error')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="signup-page">
            <div className="signup-card">
                <h1 className="signup-title">Create your account</h1>
                <p className="signup-subtitle">Find your compatible roommate in Baku</p>

                <div className="signup-toggle">
                    <button
                        type="button"
                        className={`toggle-option ${isStudent ? 'active' : ''}`}
                        onClick={() => setIsStudent(true)}
                    >
                        I'm a student
                    </button>
                    <button
                        type="button"
                        className={`toggle-option ${!isStudent ? 'active' : ''}`}
                        onClick={() => setIsStudent(false)}
                    >
                        I'm a host / landlord
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="full_name">Full name</label>
                        <input
                            id="full_name"
                            type="text"
                            value={formData.full_name}
                            onChange={handleChange('full_name')}
                            placeholder="Your full name"
                        />
                        {errors.full_name && <span className="field-error">{errors.full_name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            placeholder={isStudent ? 'you@university.edu.az' : 'you@example.com'}
                        />
                        {isStudent && (
                            <span className="field-hint">Must be a university email ending in edu.az</span>
                        )}
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            placeholder="At least 6 characters"
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>

                    {isStudent ? (
                        <div className="form-group">
                            <label htmlFor="university">University</label>
                            <select
                                id="university"
                                value={formData.university}
                                onChange={handleChange('university')}
                            >
                                {UNIVERSITIES.map((uni) => (
                                    <option key={uni} value={uni}>{uni}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="profession">Profession (optional)</label>
                            <input
                                id="profession"
                                type="text"
                                value={formData.profession}
                                onChange={handleChange('profession')}
                                placeholder="e.g. Property manager"
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-button" disabled={submitting}>
                        {submitting ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>

                <p className="signup-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    )
}