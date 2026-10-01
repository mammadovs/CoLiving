import { useState } from 'react'
import { MapPin, Users, Heart, Star } from 'lucide-react'

import Button from '../Button/Button'
import { isFavorite, toggleFavorite } from '../../utils/favorites'
import { useToast } from '../../context/ToastContext'

import './Card.css'

/**
 * Card component
 *
 * Props:
 *   id           – listing ID
 *   title        – listing title
 *   location     – address string
 *   roommates    – number of available spots
 *   description  – short text
 *   image        – primary image URL (or null)
 *   images       – optional array of image URLs; activates carousel dots
 *   price        – price per person (number); shown as "XXX AZN / nəfər"
 *   rating       – optional number 0–5; shows star row (static placeholder if omitted)
 *   reviewCount  – optional number shown next to stars
 *   onViewDetails – click handler for the button
 */
function Card({
  id,
  title,
  location,
  roommates,
  description,
  image,
  images,
  price,
  rating,
  reviewCount,
  onViewDetails,
}) {
  const { showToast } = useToast()
  const [isFav, setIsFav] = useState(() => isFavorite(id))

  // Build the images array: prefer the `images` prop, fall back to single `image`
  const allImages = Array.isArray(images) && images.length > 0
    ? images
    : image ? [image] : []

  const [activeIdx, setActiveIdx] = useState(0)
  const currentSrc = allImages[activeIdx] ?? null
  const hasMultiple = allImages.length > 1

  // Star display helpers
  const displayRating = rating != null ? Number(rating).toFixed(1) : null
  const fullStars     = displayRating ? Math.round(Number(displayRating)) : 4  // placeholder: 4 stars
  const isPlaceholder = displayRating == null

  return (
    <div className="card">

      {/* ── Image area ─────────────────────────────── */}
      <div className="card-image">

        {currentSrc ? (
          <img src={currentSrc} alt={title} loading="lazy" />
        ) : (
          <div className="card-image-placeholder" aria-label="No image">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Favorite button — top-left */}
        <button
          type="button"
          className={`card-fav-btn${isFav ? ' card-fav-btn--active' : ''}`}
          onClick={(e) => { 
            e.stopPropagation()
            const newState = toggleFavorite(id)
            setIsFav(newState)
            if (newState) {
              showToast('Sevimlilərə əlavə edildi', 'success')
            } else {
              showToast('Sevimlilərdən silindi', 'info')
            }
          }}
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={isFav}
        >
          <Heart
            size={16}
            strokeWidth={2}
            fill={isFav ? 'currentColor' : 'none'}
          />
        </button>

        {/* Price badge — top-right */}
        {price != null && (
          <span className="card-price-badge">
            {price} <span className="card-price-unit">AZN / nəfər</span>
          </span>
        )}

        {/* Carousel dots */}
        {hasMultiple && (
          <div className="card-dots" role="tablist" aria-label="Image carousel">
            {allImages.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={`Image ${i + 1}`}
                className={`card-dot${i === activeIdx ? ' card-dot--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveIdx(i) }}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Content area ───────────────────────────── */}
      <div className="card-content">

        {/* Title row */}
        <h2 className="card-title">{title}</h2>

        {/* Star rating row */}
        <div className="card-rating" aria-label={displayRating ? `Rating: ${displayRating} out of 5` : 'Rating not yet available'}>
          <span className="card-stars" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={13}
                strokeWidth={1.5}
                className={i < fullStars ? 'star--filled' : 'star--empty'}
              />
            ))}
          </span>
          {isPlaceholder ? (
            <span className="card-rating-label card-rating-placeholder">New</span>
          ) : (
            <span className="card-rating-label">
              {displayRating}
              {reviewCount != null && (
                <span className="card-rating-count"> ({reviewCount})</span>
              )}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="card-info">
          <div className="card-info-item">
            <MapPin size={15} strokeWidth={2} />
            <span>{location}</span>
          </div>
          <div className="card-info-item">
            <Users size={15} strokeWidth={2} />
            <span>{roommates} spots available</span>
          </div>
        </div>

        {/* Description */}
        <p className="card-description">{description}</p>

        {/* Footer: price repeat + CTA */}
        <div className="card-footer">
          {price != null && (
            <p className="card-footer-price">
              <strong>{price} AZN</strong>
              <span> / nəfər / ay</span>
            </p>
          )}
          <Button onClick={onViewDetails}>
            View Details
          </Button>
        </div>

      </div>

    </div>
  )
}

export default Card