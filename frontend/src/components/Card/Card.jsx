import { memo, useCallback } from 'react'
import { MapPin, School, Users, Wifi, Sofa, Image as ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../Button/Button'
import { formatPrice, resolveImageUrl } from '../../utils/format'
import './Card.css'

/**
 * Card — memo() ilə sarılıb ki, parent re-render-ləri zamanı
 * props dəyişməyibsə yenidən render olmasın.
 */
const Card = memo(function Card({
  id,
  title,
  price_per_person,
  district,
  nearest_university,
  image,           // ListingImage object { id, image_url } ya da string URL, ya da null
  has_wifi,
  is_furnished,
  preferred_gender,
}) {
  const navigate = useNavigate()

  // useCallback — hər render-də yeni funksiya yaratmır
  const handleViewDetails = useCallback(() => {
    navigate(`/listings/${id}`)
  }, [navigate, id])

  const handleBtnClick = useCallback((e) => {
    e.stopPropagation()
    navigate(`/listings/${id}`)
  }, [navigate, id])

  // Şəkil URL-ini tam URL-ə çevir (nisbi yolsa base URL əlavə et)
  const imgSrc = resolveImageUrl(image)
  const formattedPrice = formatPrice(price_per_person)

  return (
    <div className="card" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
      <div className="card-image">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            width={400}
            height={250}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={(e) => {
              // Şəkil yüklənmə xətasında placeholder-ə keç
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling?.removeAttribute('style')
            }}
          />
        ) : null}
        {/* Placeholder — şəkil yoxdursa və ya yüklənmə xətası olduqda göstərilir */}
        <div
          className="card-image-placeholder"
          style={imgSrc ? { display: 'none' } : {}}
          aria-label="Şəkil yoxdur"
        >
          <ImageIcon size={40} strokeWidth={1.5} />
          <span>Şəkil əlavə edilməyib</span>
        </div>

        <div className="card-price-badge">
          {formattedPrice} AZN <span style={{ fontSize: '0.75rem' }}>/ ay</span>
        </div>
      </div>

      <div className="card-content">
        <h2>{title}</h2>

        <div className="card-info">
          {district && (
            <div className="card-info-item">
              <MapPin size={18} strokeWidth={2} />
              <span>{district}</span>
            </div>
          )}
          {nearest_university && (
            <div className="card-info-item">
              <School size={18} strokeWidth={2} />
              <span>{nearest_university}</span>
            </div>
          )}
        </div>

        <div className="card-badges" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', marginBottom: '1rem' }}>
          {has_wifi && (
            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wifi size={14} /> WiFi
            </span>
          )}
          {is_furnished && (
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sofa size={14} /> Əşyalı
            </span>
          )}
          {preferred_gender && preferred_gender !== 'any' && (
            <span style={{ background: '#f3e8ff', color: '#9333ea', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} /> Yalnız {preferred_gender === 'female' ? 'Qadın' : 'Kişi'}
            </span>
          )}
        </div>

        <Button onClick={handleBtnClick}>
          Ətraflı
        </Button>
      </div>
    </div>
  )
})

export default Card