import { Home, Users, ShieldCheck } from 'lucide-react'
import room1 from '../../assets/room1.jpg'
import room2 from '../../assets/room2.jpg'
import './AuthLayout.css'

const BENEFITS = [
  { Icon: Home, text: 'Verified student-friendly rooms' },
  { Icon: Users, text: 'Roommates matched by lifestyle' },
  { Icon: ShieldCheck, text: 'Safe and simple messaging' },
]

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-layout">
      {/* ── Left visual panel (desktop only) ── */}
      <div className="auth-panel" aria-hidden="true">
        {/* Decorative background circles */}
        <div className="auth-panel__circle auth-panel__circle--1" />
        <div className="auth-panel__circle auth-panel__circle--2" />
        <div className="auth-panel__circle auth-panel__circle--3" />

        <div className="auth-panel__content">
          <div className="auth-panel__top">
            {/* Brand */}
            <div className="auth-panel__brand">CoLiving</div>

            {/* Headline */}
            <h2 className="auth-panel__title">{title}</h2>
            {subtitle && <p className="auth-panel__subtitle">{subtitle}</p>}

            {/* Benefit rows */}
            <ul className="auth-panel__benefits">
              {BENEFITS.map(({ Icon, text }) => (
                <li key={text} className="auth-panel__benefit">
                  <span className="auth-panel__benefit-icon">
                    <Icon size={18} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="auth-panel__bottom">
            {/* Image collage */}
            <div className="auth-panel__collage">
              <div className="auth-panel__img-wrap auth-panel__img-wrap--1">
                <img src={room1} alt="Cozy student room" />
                <div className="auth-panel__float-card auth-panel__float-card--price">
                  250 AZN / person
                </div>
              </div>
              <div className="auth-panel__img-wrap auth-panel__img-wrap--2">
                <img src={room2} alt="Modern shared apartment" />
                <div className="auth-panel__float-card auth-panel__float-card--spots">
                  2 spots left
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="auth-panel__testimonial">
              <p className="auth-panel__quote">"CoLiving made it so easy to find an affordable room near campus. My new roommates are amazing!"</p>
              <span className="auth-panel__author">– Leyla, student at ADA</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form area ── */}
      <div className="auth-form-col">
        {/* Mobile-only logo above the card */}
        <div className="auth-mobile-logo" aria-hidden="true">CoLiving</div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
