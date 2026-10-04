import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ShieldCheck, Mail } from 'lucide-react'
import './LegalPage.css'

export default function LegalPage({ title, icon, updated, intro, sections, otherLink }) {
  useEffect(() => {
    const originalTitle = document.title
    document.title = `${title} - CoLiving`
    window.scrollTo(0, 0)
    return () => {
      document.title = originalTitle
    }
  }, [title])

  const IconComponent = icon === 'privacy' ? ShieldCheck : FileText

  return (
    <div className="legal-page">
      {/* Hero Section */}
      <div className="legal-hero">
        <div className="legal-hero-content">
          <Link to="/signup" className="legal-back-link">
            ← Back to sign up
          </Link>
          <div className="legal-icon-box">
            <IconComponent size={32} />
          </div>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-updated">Last updated: {updated}</p>
          <p className="legal-intro">{intro}</p>
        </div>
      </div>

      <div className="legal-container">
        {/* Table of Contents */}
        <aside className="legal-sidebar">
          <div className="legal-toc">
            <h3>Table of Contents</h3>
            <ul>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span className="toc-number">{index + 1}.</span> {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="legal-content">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="legal-section-card">
              <h2>
                <span className="section-number">{index + 1}.</span> {section.title}
              </h2>
              <div className="section-body">
                {section.body.map((block, i) => {
                  if (typeof block === 'string') {
                    return <p key={i}>{block}</p>
                  }
                  if (block.list) {
                    return (
                      <ul key={i}>
                        {block.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    )
                  }
                  return null
                })}
              </div>
            </section>
          ))}

          {/* Bottom Card */}
          <div className="legal-footer-card">
            <div className="legal-questions">
              <h3>Questions?</h3>
              <p>If you have any questions about these {title.toLowerCase()}, please contact us.</p>
              <a href="mailto:support@coliving.az" className="support-link">
                <Mail size={18} />
                support@coliving.az
              </a>
            </div>
            {otherLink && (
              <div className="legal-other-link">
                <Link to={otherLink.to} className="legal-button">
                  {otherLink.label}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
