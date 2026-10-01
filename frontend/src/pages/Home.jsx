import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import {
  ShieldCheck,
  Users,
  Home as HomeIcon,
  Search,
  MapPin,
  GraduationCap,
  UserPlus,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Heart
} from 'lucide-react'

import Card from '../components/Card/Card'
import ErrorState from '../components/ErrorState/ErrorState'
import EmptyState from '../components/EmptyState/EmptyState'
import { listingsAPI } from '../api/listings'
import { resolveImageUrl } from '../utils/resolveImageUrl'

import './Home.css'
import { UNIVERSITIES } from '../data/options'

function CardSkeleton() {
  return (
    <div className="card-skeleton" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--meta" />
        <div className="skeleton-line skeleton-line--meta" />
        <div className="skeleton-line skeleton-line--desc" />
        <div className="skeleton-line skeleton-line--desc" />
        <div className="skeleton-line skeleton-line--btn" />
      </div>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const [heroDistrict, setHeroDistrict] = useState('')
  const [heroUniversity, setHeroUniversity] = useState('')
  const [heroGuests, setHeroGuests] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (heroDistrict) params.append('district', heroDistrict)
    if (heroUniversity) params.append('nearest_university', heroUniversity)
    if (heroGuests) params.append('min_available_spots', heroGuests)
    
    navigate(`/rooms?${params.toString()}`)
  }

  const loadListings = async () => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const response = await listingsAPI.getAll({ limit: 4 })
      const loaded = Array.isArray(response) ? response : response.items || []
      setListings(loaded.slice(0, 4))
      setStatus(loaded.length ? 'success' : 'empty')
    } catch (error) {
      let msg = error.data?.detail || error.message || 'Elanları yükləmək mümkün olmadı.'
      if (msg === 'Failed to fetch' || !error.status) {
        msg = 'We could not reach the server. Please check your connection and try again.'
      }
      setErrorMessage(msg)
      setStatus('error')
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  return (
    <div className="home-page">

      {/* HERO */}

      <section className="home-hero">

        {/* Decorative CSS orbs — pure CSS, no images */}
        <div className="hero-orb hero-orb--1" aria-hidden="true" />
        <div className="hero-orb hero-orb--2" aria-hidden="true" />
        <div className="hero-orb hero-orb--3" aria-hidden="true" />
        <svg className="hero-ring" aria-hidden="true" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="195" stroke="currentColor" strokeWidth="1" strokeDasharray="6 10" />
        </svg>

        <div className="home-hero-content">

          <span className="home-badge">
            Student Housing Made Simple
          </span>

          <h1>
            Find a place you'll love to{' '}
            <span>call home.</span>
          </h1>

          <p>
            Discover comfortable student homes and
            connect with roommates who match your lifestyle.
          </p>

          {/* Airbnb-style segmented search bar */}
          <div className="hero-search-bar">

            <label className="hero-search-segment" htmlFor="hero-location">
              <span className="hero-segment-label">
                <MapPin size={13} strokeWidth={2.5} /> Location
              </span>
              <input
                id="hero-location"
                type="text"
                placeholder="Baku, Nasimi..."
                className="hero-segment-input"
                value={heroDistrict}
                onChange={(e) => setHeroDistrict(e.target.value)}
              />
            </label>

            <div className="hero-search-divider" aria-hidden="true" />

            <label className="hero-search-segment" htmlFor="hero-university">
              <span className="hero-segment-label">
                <GraduationCap size={13} strokeWidth={2.5} /> University
              </span>
              <select id="hero-university" className="hero-segment-input" value={heroUniversity} onChange={(e) => setHeroUniversity(e.target.value)}>
                <option value="">Any university</option>
                {UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </label>

            <div className="hero-search-divider" aria-hidden="true" />

            <label className="hero-search-segment" htmlFor="hero-guests">
              <span className="hero-segment-label">
                <UserPlus size={13} strokeWidth={2.5} /> Guests
              </span>
              <select id="hero-guests" className="hero-segment-input" value={heroGuests} onChange={(e) => setHeroGuests(e.target.value)}>
                <option value="">Any</option>
                <option value="1">1 person</option>
                <option value="2">2 people</option>
                <option value="3">3+ people</option>
              </select>
            </label>

            <button type="button" className="hero-search-button" aria-label="Search rooms" onClick={handleSearch}>
              <Search size={18} strokeWidth={2.5} />
              <span>Search</span>
            </button>

          </div>

        </div>

        <div className="home-hero-photos">
          <img src="/src/assets/room1.jpg" alt="Room 1" className="hero-photo photo-1" />
          <img src="/src/assets/room3.jpg" alt="Room 2" className="hero-photo photo-2" />
        </div>

      </section>


      {/* FEATURED ROOMS */}

      <section className="home-card-section">

        <div className="section-heading">

          <div>

            <h2>
              Featured Rooms
            </h2>

            <p>
              Explore places students love.
            </p>

          </div>

        </div>


        {status === 'loading' && (
          <div className="home-room-grid">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {status === 'error' && (
          <ErrorState message={errorMessage} onRetry={loadListings} />
        )}

        {status === 'empty' && (
          <EmptyState title="No rooms found" message="There are no rooms available at the moment." />
        )}

        {status === 'success' && listings.length > 0 && (
          <div className="home-room-grid">

            {listings.map((listing) => (
              <Card
                key={listing.id}
                id={listing.id}
                onViewDetails={() => navigate(`/rooms/${listing.id}`)}
                title={listing.title}
                location={listing.address}
                roommates={listing.available_spots}
                description={listing.description}
                image={resolveImageUrl(listing.images?.[0]?.image_url)}
                images={listing.images?.map((img) => resolveImageUrl(img.image_url)).filter(Boolean)}
                price={listing.price_per_person}
                rating={listing.rating ?? null}
                reviewCount={listing.review_count ?? null}
              />
            ))}

          </div>
        )}

      </section>


      {/* FEATURES */}

      <section className="home-features">

        <div className="features-heading">

          <span>
            WHY COLIVING
          </span>

          <h2>
            Everything you need to find
            the right place.
          </h2>

        </div>


        <div className="features-grid">

          <div className="feature-item">

            <div className="feature-icon">
              <HomeIcon size={24} />
            </div>

            <h3>
              Find a Home
            </h3>

            <p>
              Discover student-friendly homes
              that fit your needs and budget.
            </p>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              <Users size={24} />
            </div>

            <h3>
              Find Roommates
            </h3>

            <p>
              Connect with students and find
              roommates who match your lifestyle.
            </p>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              <ShieldCheck size={24} />
            </div>

            <h3>
              Safe & Simple
            </h3>

            <p>
              A simple platform designed to make
              student housing easier and safer.
            </p>

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="home-footer">

        <div className="footer-brand">

          <h3>
            CoLiving
          </h3>

          <p>
            Find your place. Find your people.
          </p>

          <p className="footer-tagline">
            Made for students in Baku <Heart size={14} fill="currentColor" color="var(--color-primary)" />
          </p>

        </div>


        <div className="footer-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/rooms">
            Find a Room
          </Link>

          <Link to="/about">
            About
          </Link>

        </div>


        <div className="footer-right">
          <p className="footer-copy">
            © 2026 CoLiving. All rights reserved.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Website" target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>
            <a href="#" aria-label="Email" target="_blank" rel="noopener noreferrer"><Mail size={18} /></a>
            <a href="#" aria-label="Message" target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /></a>
            <a href="#" aria-label="Phone" target="_blank" rel="noopener noreferrer"><Phone size={18} /></a>
          </div>
        </div>

      </footer>




    </div>
  )
}

export default Home