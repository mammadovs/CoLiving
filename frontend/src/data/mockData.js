export const mockListings = [
    {
        id: '1',
        title: 'Baku Student Apartment',
        description: 'Comfortable apartment close to university and public transport.',
        price_per_person: 250,
        address: '12 Nizami Street, Baku',
        district: 'Nasimi',
        nearest_university: 'ADA University',
        available_spots: 2,
        phone_number: '+994 50 111 22 33',
        preferred_gender: 'any',
        smoking_allowed: false,
        alcohol_allowed: false,
        religion_preference: 'secular',
        has_wifi: true,
        is_furnished: true,
        owner_id: '101',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80'],
    },
    {
        id: '2',
        title: 'Modern Student House',
        description: 'Bright shared home with a quiet study area and a welcoming kitchen.',
        price_per_person: 190,
        address: '8 Hasan Aliyev, Baku',
        district: 'Yasamal',
        nearest_university: 'BDU',
        available_spots: 1,
        phone_number: '+994 50 444 55 66',
        preferred_gender: 'female',
        smoking_allowed: false,
        alcohol_allowed: true,
        religion_preference: 'other',
        has_wifi: true,
        is_furnished: true,
        owner_id: '102',
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80'],
    },
]

export const mockProfiles = {
    me: {
        id: 'me', full_name: 'Aysel Mammadova', email: 'aysel@example.com', budget: 300,
        sleep_schedule: 'night_owl', cleanliness_level: 'very_tidy', religion: 'secular',
        noise_tolerance: 'moderate', smoking_habit: 'no', drinks_alcohol: 'occasionally',
        pet_friendly: true, guest_frequency: 'sometimes', work_or_study_schedule: 'mostly_out',
        personality_type: 'ambivert',
    },
    101: {
        id: '101', full_name: 'Murad Aliyev', email: 'murad@example.com', budget: 280,
        sleep_schedule: 'early_bird', cleanliness_level: 'average', religion: 'secular',
        noise_tolerance: 'quiet', smoking_habit: 'no', drinks_alcohol: 'no', pet_friendly: false,
        guest_frequency: 'rarely', work_or_study_schedule: 'mostly_out', personality_type: 'introvert',
    },
}

export const mockConversations = [
    {
        userId: '101', name: 'Murad Aliyev', lastMessage: 'The room is still available.', messages: [
            { id: 'm1', from: '101', content: 'Hi! Are you interested in the room?' },
            { id: 'm2', from: 'me', content: 'Yes, I would love to know more.' },
        ]
    },
]
