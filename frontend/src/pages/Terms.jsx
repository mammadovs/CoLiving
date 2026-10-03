import LegalPage from '../components/LegalPage/LegalPage'

export default function Terms() {
  const sections = [
    {
      id: 'accepting-these-terms',
      title: 'Accepting these terms',
      body: [
        'CoLiving helps students and hosts in Baku find rooms and compatible roommates.'
      ],
    },
    {
      id: 'who-can-use',
      title: 'Who can use CoLiving',
      body: [
        {
          list: [
            '18+',
            'Students must use a university email ending in edu.az',
            'Hosts may use any valid email',
            'One account per person',
            'Accurate information'
          ]
        }
      ],
    },
    {
      id: 'your-account',
      title: 'Your account',
      body: [
        'Keep password secret, responsible for activity, report misuse.'
      ],
    },
    {
      id: 'listings-and-hosts',
      title: 'Listings and hosts',
      body: [
        'Accurate price/address/photos/spots. Only list rooms you have the right to rent. Real photos. Keep listings up to date. No unlawful discrimination.'
      ],
    },
    {
      id: 'profiles-matching',
      title: 'Profiles and roommate matching',
      body: [
        'Lifestyle info is used for a compatibility score. It is only a suggestion. Filling the profile is optional.'
      ],
    },
    {
      id: 'messages-behavior',
      title: 'Messages and behavior',
      body: [
        'Be respectful. No harassment, spam, scams, asking for money before viewing or written agreement, illegal or copyrighted content, attacks on the platform.'
      ],
    },
    {
      id: 'rental-agreements',
      title: 'Rental agreements between users',
      body: [
        'CoLiving is not a party to any rental agreement, does not verify every listing, cannot guarantee reliability. Recommend visiting in person, signing a written agreement, never sending money to someone you have not met.'
      ],
    },
    {
      id: 'your-content',
      title: 'Your content',
      body: [
        'Users keep rights, grant permission to display it on the platform. We may remove content that breaks the rules.'
      ],
    },
    {
      id: 'suspending-accounts',
      title: 'Suspending or closing accounts',
      body: [
        'We reserve the right to suspend or close accounts that violate these terms.'
      ],
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer and limits of liability',
      body: [
        'Service provided "as is".'
      ],
    },
    {
      id: 'changes-to-terms',
      title: 'Changes to these terms',
      body: [
        'We may update these terms occasionally. Your continued use of the platform constitutes acceptance.'
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing law',
      body: [
        'Republic of Azerbaijan.'
      ],
    }
  ]

  return (
    <LegalPage
      title="Terms of Use"
      icon="terms"
      updated="October 2026"
      intro="Please read these terms carefully before using CoLiving."
      sections={sections}
      otherLink={{ to: '/privacy', label: 'Read Privacy Policy' }}
    />
  )
}
