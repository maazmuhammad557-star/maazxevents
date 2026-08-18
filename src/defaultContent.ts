import { SiteContent } from './types';
import { mockItems } from './data';

export const defaultContent: SiteContent = {
  header: {
    logo: '/logo.png',
    bookAppointmentUrl: 'https://api.whatsapp.com/send/?phone=923252938365&text&type=phone_number&app_absent=0',
    phone: '+923252938365',
  },
  hero: {
    title: 'MAKING YOUR\nMOMENTS ICONIC',
    subtitle: 'Advanced event design and modern aesthetic styling designed to elevate your celebrations.',
    bgImage: '/herosection.webp',
    exploreButtonText: 'Explore our Designs',
    radialItems: [
      { title: "Dholki Setups", angle: -70 },
      { title: "Engagement Setups", angle: -50 },
      { title: "Mayo Setups", angle: -30 },
      { title: "Bridal Shower Setups", angle: -10 },
      { title: "Nikkah Setups", angle: 10 },
      { title: "Mehndi Setups", angle: 30 },
      { title: "Bridal Shower Setups", angle: 50 },
      { title: "Family Gathering", angle: 70 },
    ],
  },
  whyChooseUs: {
    sectionTag: 'Why Choose Us',
    title: 'Creating Celebrations That\nLeave a Lasting Impression',
    beforeImage: '/before.png',
    afterImage: '/after.png',
    sliderTitle: 'From Vision to Reality',
    sliderSub: '500+ Events Styled ✦ Premium Event Design',
    fastBookingTitle: 'Fast Booking',
    fastBookingDesc: 'Share your event details and get started in minutes.',
    stressFreeTitle: 'Stress-Free Planning',
    stressFreeImage: '/handshake.png',
    tailoredTitle: 'Tailored to your vision',
    tailoredDesc: 'Every celebration is customized to match your style, theme, and special occasion.',
    tailoredImages: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=200',
    ],
    floralArchImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    setupsCountValue: '20+',
    setupsCountSub: 'Successful Setups',
    setupsCountBadge: '4 Event Categories',
    setupsCountBgText: 'Since 2025',
    reviewsRatingText: '99%',
    reviewsSubText: '2k+ Global trusted customers',
    testimonials: [
      {
        name: 'Sofia Hale',
        role: 'Actress',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      },
      {
        name: 'Olivia Chen',
        role: 'Creative Director',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        quote: '"I was nervous about the outdoor setup, but the results looked completely magical and elegant."',
      }
    ],
  },
  aboutUs: {
    sectionTag: 'Our Story',
    title: 'Elevating your special moments with timeless elegance.',
    desc1: 'At MaazXevents, we are passionate about transforming your vision into breathtaking reality. With years of expertise in luxury event styling, we meticulously curate every detail so you can focus on celebrating.',
    desc2: 'From intimate gatherings to grand celebrations, our dedicated team brings creativity, precision, and an eye for aesthetics to craft environments that leave a lasting impression on you and your guests.',
    image1: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600',
    image2: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=500',
    stats: [
      { value: '150+', label: 'Events Orchestrated' },
      { value: '100%', label: 'Client Satisfaction' }
    ],
    ctaText: 'Plan your event with us',
  },
  footer: {
    logo: '/logo.png',
    description: 'Premium event and birthday decoration studio crafting Instagram-worthy celebrations across Pakistan with a touch of modern luxury.',
    location: 'Lahore, Pakistan',
    phone: '+92349 3038385',
    email: 'eventsbymaaz@gmail.com',
    facebookUrl: '#',
    instagramUrl: '#',
    tiktokUrl: '#',
    copyright: '© 2026 MaazXevents. All rights reserved',
  },
  themesSection: {
    categories: ["Wedding", "Birthday", "Gathering", "Room Decor"],
    subcategories: {
      Wedding: ["Bridal Shower", "Nikkah", "Mehndi", "Mayo", "Engagement", "Dholki"],
      Birthday: ["Kids Party", "Adults", "Themed"],
      Gathering: ["Family", "Corporate", "Friends"],
      "Room Decor": ["Hotel Room", "Anniversary", "Date Night"]
    },
    items: mockItems,
  },
  seo: {
    metaTitle: 'Maazx Events',
    metaDescription: 'Premium event and birthday decoration studio crafting Instagram-worthy celebrations.',
    favicon: '/logo.png',
  }
};
