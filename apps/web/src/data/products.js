import React from 'react';
// NOTE: This is mock data. Once Supabase is connected, this will be replaced with API calls.
export const products = [
    {
      id: 'nst-ph-001',
      name: 'pH Glass Electrode',
      category: 'pH Electrodes',
      shortDescription: 'High-performance glass electrode for general laboratory use.',
      image: 'A professional pH glass electrode with a blue cap, used for scientific measurements in a lab.',
      features: [
        'Durable glass body',
        '0-14 pH range',
        'Fast response time',
        'Low sodium ion error',
      ],
      specifications: {
        'Model': 'NST-pH-001',
        'pH Range': '0 - 14 pH',
        'Temperature Range': '0 - 80 °C',
        'Junction': 'Ceramic',
        'Connector': 'BNC',
      },
    },
    {
      id: 'nst-kf-001',
      name: 'Karl Fischer Titration Electrode',
      category: 'Specialty Electrodes',
      shortDescription: 'Double platinum pin electrode for Karl Fischer titration.',
      image: 'A specialized Karl Fischer Titration electrode with two platinum pins, designed for moisture analysis.',
      features: [
        'High sensitivity for moisture detection',
        'Robust construction',
        'Compatible with all major titrators',
        'Easy to clean and maintain',
      ],
      specifications: {
        'Model': 'NST-KF-001',
        'Type': 'Double Platinum Pin',
        'Body Material': 'Glass',
        'Cable Length': '1 meter',
        'Connector': 'Standard KF Plug',
      },
    },
    {
      id: 'nst-ph-002',
      name: 'Combination pH Electrode',
      category: 'pH Electrodes',
      shortDescription: 'All-in-one electrode with built-in temperature sensor.',
      image: 'A combination pH electrode with an integrated temperature probe, for accurate measurements.',
      features: [
        'Integrated temperature compensation',
        'Refillable electrolyte',
        'Epoxy body for durability',
        'Ideal for field use',
      ],
      specifications: {
        'Model': 'NST-pH-002',
        'pH Range': '0 - 14 pH',
        'Temperature Range': '-5 - 105 °C',
        'Reference': 'Ag/AgCl',
        'Connector': 'BNC, Phono',
      },
    },
    {
      id: 'nst-ph-003',
      name: 'Flat Surface pH Electrode',
      category: 'pH Electrodes',
      shortDescription: 'Designed for measuring pH on flat surfaces like paper, skin, or agar plates.',
      image: 'A pH electrode with a flat sensor tip, suitable for measuring on surfaces.',
      features: [
        'Flat sensing bulb',
        'Minimal sample volume required',
        'Open pore junction',
        'Durable construction',
      ],
      specifications: {
        'Model': 'NST-pH-003',
        'pH Range': '0 - 12 pH',
        'Temperature Range': '5 - 60 °C',
        'Body Material': 'Glass',
        'Connector': 'BNC',
      },
    },
];