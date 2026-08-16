import { ThemeItem } from './types';

const numberNames = ['1', '2', '3', '4', '5'];
const images = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505944357431-27579db47558?auto=format&fit=crop&q=80&w=800',
];

const categorySubcategories = {
  Wedding: ["Bridal Shower", "Nikkah", "Mehndi", "Mayo", "Engagement", "Dholki"],
  Birthday: ["Kids Party", "Adults", "Themed"],
  Gathering: ["Family", "Corporate", "Friends"],
  "Room Decor": ["Hotel Room", "Anniversary", "Date Night"]
};

export const mockItems: ThemeItem[] = [];
let idCounter = 1;

Object.keys(categorySubcategories).forEach((cat) => {
  const subs = categorySubcategories[cat as keyof typeof categorySubcategories];
  subs.forEach((sub) => {
    numberNames.forEach((num, index) => {
      const img1 = images[(idCounter) % images.length];
      const img2 = images[(idCounter + 1) % images.length];
      mockItems.push({
        id: idCounter++,
        title: `${sub} setup ${num}`,
        price: `Rs ${20 + index * 5},000`,
        actualPrice: `Rs ${15 + index * 5},000`,
        image: img1,
        gallery: [img1, img2],
        description: `Experience the magic of traditional elegance with ${sub} setup ${num}. This meticulously crafted arrangement combines vibrant colors, intricate detailing, and warm ambient lighting to create the perfect backdrop for your celebrations.`,
        category: sub,
        attributes: [
          { label: 'Setup Time', value: '3-4 Hours before event' },
          { label: 'Space Required', value: 'Minimum 15x15 ft area' },
          { label: 'Included', value: 'Backdrop, stage seating, lighting, props' }
        ]
      });
    });
  });
});
