import LegalPage from '../components/LegalPage/LegalPage'

export default function Privacy() {
  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      body: [
        'This Privacy Policy explains how CoLiving collects, uses, and shares your information.'
      ],
    },
    {
      id: 'what-we-collect',
      title: 'What we collect',
      body: [
        {
          list: [
            'Account data: name, email, hashed password, university/profession',
            'Optional lifestyle profile: budget, sleep schedule, cleanliness, noise, smoking, alcohol, guests, pets, religion, personality type',
            'Listing data: title, description, price, address, district, nearest university, phone number, photos, map location',
            'Messages',
            'Technical data: login token stored in the browser'
          ]
        }
      ],
    },
    {
      id: 'how-we-use',
      title: 'How we use your data',
      body: [
        'Create/secure account, show listings and map, calculate compatibility, deliver messages, prevent abuse and improve the platform. We do not sell personal data.'
      ],
    },
    {
      id: 'what-others-see',
      title: 'What other users can see',
      body: [
        'Listings are public including address, map location and phone number if added; profiles and lifestyle details are visible to other users for compatibility; messages only to sender and receiver; every lifestyle field is optional.'
      ],
    },
    {
      id: 'third-parties',
      title: 'Sharing with third parties',
      body: [
        'Map/address search providers get only what they need; legal requirements.'
      ],
    },
    {
      id: 'storage-security',
      title: 'Storage and security',
      body: [
        'Passwords hashed, HTTPS, choose a strong password.'
      ],
    },
    {
      id: 'data-retention',
      title: 'How long we keep data',
      body: [
        'We keep your data as long as your account is active.'
      ],
    },
    {
      id: 'your-choices',
      title: 'Your choices and rights',
      body: [
        'Edit profile/listings, leave optional fields empty, request deletion via support@coliving.az, log out to remove the token.'
      ],
    },
    {
      id: 'browser-storage',
      title: 'Browser storage',
      body: [
        'Token and basic account details in local storage; the "Remember me" email; cleared by logging out or clearing browser data.'
      ],
    },
    {
      id: 'age-limit',
      title: 'Age limit',
      body: [
        '18+'
      ],
    },
    {
      id: 'changes-to-policy',
      title: 'Changes to this policy',
      body: [
        'We may update this policy occasionally.'
      ],
    }
  ]

  return (
    <LegalPage
      title="Privacy Policy"
      icon="privacy"
      updated="October 2026"
      intro="Learn how CoLiving protects and uses your data."
      sections={sections}
      otherLink={{ to: '/terms', label: 'Read Terms of Use' }}
    />
  )
}
