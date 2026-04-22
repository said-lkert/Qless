import { Institution } from '../types';

// Helper to generate random busy hours
const genBusyHours = () => Array.from({ length: 24 }, (_, i) => {
  if (i < 8 || i > 20) return 0; // Closed hours
  // Peaks around 10am and 3pm
  const base = Math.sin((i - 8) * Math.PI / 12) * 80;
  return Math.max(10, Math.floor(base + Math.random() * 20));
});

export const mockInstitutions: Institution[] = [
  // HEALTHCARE - Alger & Center
  {
    id: 'h1',
    name: 'Clinique Al-Azhar',
    type: 'CLINIQUE',
    wilaya: 'Alger',
    commune: 'Dely Ibrahim',
    lat: 36.7550,
    lng: 2.9900,
    address: 'Route de Chéraga, Dely Ibrahim',
    closingTime: '20:00',
    rating: 4.6,
    reviewsCount: 980,
    currentTicket: 67,
    lastGivenTicket: 89,
    photos: [
      'https://picsum.photos/seed/algiers-clinic/800/600',
      'https://picsum.photos/seed/hospital-room/800/600'
    ]
  },
  {
    id: 'h2',
    name: 'Dr. Amrani - Cardiologue',
    type: 'CARDIOLOGIST',
    wilaya: 'Alger',
    commune: 'Hydra',
    lat: 36.7410,
    lng: 3.0530,
    address: '12 Rue des Jardins, Hydra',
    closingTime: '17:00',
    rating: 4.9,
    reviewsCount: 340,
    currentTicket: 8,
    lastGivenTicket: 15,
    photos: [
      'https://picsum.photos/seed/doctor-office/800/600',
      'https://picsum.photos/seed/medical-consult/800/600'
    ]
  },
  {
    id: 'h-orl',
    name: 'Cabinet ORL Dr. Zerrouki',
    type: 'ORL',
    wilaya: 'Alger',
    commune: 'El Biar',
    lat: 36.7680,
    lng: 3.0290,
    address: 'Avenue Ali Khodja, El Biar',
    closingTime: '18:30',
    rating: 4.7,
    reviewsCount: 112,
    currentTicket: 4,
    lastGivenTicket: 9,
    photos: [
      'https://picsum.photos/seed/medical-center/800/600',
      'https://picsum.photos/seed/waiting-room-orl/800/600'
    ]
  },
  {
    id: 'h-ophtalmo',
    name: 'Centre de Vision Dr. Benali',
    type: 'OPHTHALMOLOGIST',
    wilaya: 'Alger',
    commune: 'Kouba',
    lat: 36.7180,
    lng: 3.0780,
    address: 'Cité Oasis, Kouba',
    closingTime: '17:00',
    rating: 4.5,
    reviewsCount: 88,
    currentTicket: 3,
    lastGivenTicket: 7,
    photos: [
      'https://picsum.photos/seed/eye-center/800/600',
      'https://picsum.photos/seed/vision-test/800/600'
    ]
  },
  {
    id: 'h-pharmacy',
    name: 'Pharmacie de la Grande Poste',
    type: 'PHARMACY',
    wilaya: 'Alger',
    commune: 'Alger Centre',
    lat: 36.7725,
    lng: 3.0610,
    address: 'Rue Larbi Ben M\'hidi',
    closingTime: '23:59',
    rating: 4.8,
    reviewsCount: 450,
    currentTicket: 12,
    lastGivenTicket: 20,
    photos: [
      'https://picsum.photos/seed/algiers-street/800/600',
      'https://picsum.photos/seed/pharmacy-shelf/800/600'
    ]
  },

  // FINANCE - West (Oran)
  {
    id: 'f1',
    name: 'Société Générale Algérie - Oran Front de Mer',
    type: 'BANQUE_PRIVEE',
    wilaya: 'Oran',
    commune: 'Oran',
    lat: 35.7080,
    lng: -0.6350,
    address: 'Bd de l\'ALN (Front de Mer), Oran',
    closingTime: '16:30',
    rating: 4.3,
    reviewsCount: 1100,
    currentTicket: 145,
    lastGivenTicket: 178,
    photos: ['https://picsum.photos/seed/oran-city/800/600', 'https://picsum.photos/seed/bank-interior/800/600']
  },
  {
    id: 'f-assurance',
    name: 'SAA Assurances Oran Est',
    type: 'ASSURANCE',
    wilaya: 'Oran',
    commune: 'Bir El Djir',
    lat: 35.7250,
    lng: -0.5820,
    address: 'Rond-point Canastel, Bir El Djir',
    closingTime: '17:00',
    rating: 4.1,
    reviewsCount: 320,
    currentTicket: 5,
    lastGivenTicket: 12,
    photos: [
      'https://picsum.photos/seed/office-building/800/600',
      'https://picsum.photos/seed/insurance-oran/800/600'
    ]
  },
  {
    id: 'f-invest',
    name: 'Invest DZ Capital Oran',
    type: 'INVESTMENT',
    wilaya: 'Oran',
    commune: 'Es Sénia',
    lat: 35.6510,
    lng: -0.6120,
    address: 'Zone des Activités Es Sénia',
    closingTime: '17:30',
    rating: 4.7,
    reviewsCount: 56,
    currentTicket: 1,
    lastGivenTicket: 3,
    photos: [
      'https://picsum.photos/seed/business-modern/800/600',
      'https://picsum.photos/seed/stock-oran/800/600'
    ]
  },

  // TRADE - East (Constantine & Sétif)
  {
    id: 't-shop',
    name: 'Sétif Mall - Supermarché Uno',
    type: 'SHOP',
    wilaya: 'Sétif',
    commune: 'Sétif',
    lat: 36.1911,
    lng: 5.4133,
    address: 'Place de l\'Indépendance, Sétif Mall',
    closingTime: '22:00',
    rating: 4.5,
    reviewsCount: 5600,
    currentTicket: 89,
    lastGivenTicket: 120,
    photos: ['https://picsum.photos/seed/mall/800/600', 'https://picsum.photos/seed/market/800/600']
  },
  {
    id: 't-wholesale',
    name: 'Grossiste Alimentaire El Eulma',
    type: 'WHOLESALER',
    wilaya: 'Sétif',
    commune: 'El Eulma',
    lat: 36.1550,
    lng: 5.6920,
    address: 'Quartier Dubai, El Eulma',
    closingTime: '18:00',
    rating: 4.2,
    reviewsCount: 1500,
    currentTicket: 45,
    lastGivenTicket: 70,
    photos: [
      'https://picsum.photos/seed/warehouse/800/600',
      'https://picsum.photos/seed/wholesale-dz/800/600'
    ]
  },
  {
    id: 't-import',
    name: 'Algérie Import-Export Logistics',
    type: 'IMPORT_EXPORT',
    wilaya: 'Skikda',
    commune: 'Skikda',
    lat: 36.8762,
    lng: 6.9092,
    address: 'Zone Portuaire de Skikda',
    closingTime: '19:00',
    rating: 4.4,
    reviewsCount: 89,
    currentTicket: 3,
    lastGivenTicket: 10,
    photos: [
      'https://picsum.photos/seed/port/800/600',
      'https://picsum.photos/seed/shipping-containers/800/600'
    ]
  },

  // SERVICES - Scattered
  {
    id: 's-consult',
    name: 'Cabinet de Conseil IT Constantine',
    type: 'CONSULTING',
    wilaya: 'Constantine',
    commune: 'Constantine',
    lat: 36.3650,
    lng: 6.6147,
    address: 'Avenue Aouati Mostefa, Constantine',
    closingTime: '18:00',
    rating: 4.8,
    reviewsCount: 74,
    currentTicket: 2,
    lastGivenTicket: 5,
    photos: [
      'https://picsum.photos/seed/constantine-bridge/800/600',
      'https://picsum.photos/seed/it-office/800/600'
    ]
  },
  {
    id: 's-travel',
    name: 'Sahara Voyages & Tourism Bechar',
    type: 'TOURISM',
    wilaya: 'Béchar',
    commune: 'Taghit',
    lat: 30.9167,
    lng: -2.0333,
    address: 'Place des Palmiers, Taghit',
    closingTime: '20:00',
    rating: 4.9,
    reviewsCount: 1200,
    currentTicket: 1,
    lastGivenTicket: 4,
    photos: ['https://picsum.photos/seed/desert-sahara/800/600', 'https://picsum.photos/seed/oasis/800/600']
  },
  {
    id: 's-transport',
    name: 'Trans-Logistics Bejaia Port',
    type: 'TRANSPORT',
    wilaya: 'Béjaïa',
    commune: 'Béjaïa',
    lat: 36.7515,
    lng: 5.0558,
    address: 'Terminal Container Bejaia',
    closingTime: '18:00',
    rating: 4.0,
    reviewsCount: 220,
    currentTicket: 14,
    lastGivenTicket: 25,
    photos: [
      'https://picsum.photos/seed/bejaia-bay/800/600',
      'https://picsum.photos/seed/truck-fleet/800/600'
    ]
  },
  {
    id: 's-clean',
    name: 'Nettoyage Pro Annaba',
    type: 'CLEANING',
    wilaya: 'Annabba',
    commune: 'Annaba',
    lat: 36.9000,
    lng: 7.7667,
    address: 'Cours de la Révolution, Annaba',
    closingTime: '17:30',
    rating: 4.6,
    reviewsCount: 45,
    currentTicket: 2,
    lastGivenTicket: 6,
    photos: [
      'https://picsum.photos/seed/mediterranean/800/600',
      'https://picsum.photos/seed/cleaning-service/800/600'
    ]
  },
  {
    id: 's-personal',
    name: 'Services à la Personne El Oued',
    type: 'PERSONAL_SERVICE',
    wilaya: 'El Oued',
    commune: 'El Oued',
    lat: 33.3667,
    lng: 6.8667,
    address: 'Cité des 1000 Coupoles',
    closingTime: '19:00',
    rating: 4.7,
    reviewsCount: 38,
    currentTicket: 1,
    lastGivenTicket: 4,
    photos: [
      'https://picsum.photos/seed/souk/800/600',
      'https://picsum.photos/seed/care-home/800/600'
    ]
  },

  // AGRICULTURE - Biskra & South
  {
    id: 'a-farm',
    name: 'Palmeraie Deglet Nour Biskra',
    type: 'FARM',
    wilaya: 'Biskra',
    commune: 'Tolga',
    lat: 34.8500,
    lng: 5.3833,
    address: 'Zone Agricole Tolga',
    closingTime: '18:00',
    rating: 4.9,
    reviewsCount: 250,
    currentTicket: 8,
    lastGivenTicket: 15,
    photos: [
      'https://picsum.photos/seed/dates-palm/800/600',
      'https://picsum.photos/seed/biskra-oasis/800/600'
    ]
  },
  {
    id: 'a-food',
    name: 'Laiterie de la Mitidja Blida',
    type: 'FOOD_PRODUCTION',
    wilaya: 'Blida',
    commune: 'Boufarik',
    lat: 36.4700,
    lng: 2.8300,
    address: 'Route de Blida, Boufarik',
    closingTime: '17:00',
    rating: 4.4,
    reviewsCount: 890,
    currentTicket: 34,
    lastGivenTicket: 50,
    photos: [
      'https://picsum.photos/seed/mitidja/800/600',
      'https://picsum.photos/seed/milk-production/800/600'
    ]
  },

  // MANUFACTURING - BBA & Industrial Zones
  {
    id: 'm-factory',
    name: 'Condor Electronics Plant BBA',
    type: 'ELECTRONICS',
    wilaya: 'Bordj Bou Arreridj',
    commune: 'Bordj Bou Arreridj',
    lat: 36.0733,
    lng: 4.7611,
    address: 'Zone Industrielle Bordj Bou Arreridj',
    closingTime: '16:00',
    rating: 4.7,
    reviewsCount: 2500,
    currentTicket: 200,
    lastGivenTicket: 250,
    photos: [
      'https://picsum.photos/seed/factory-electronics/800/600',
      'https://picsum.photos/seed/condor-bba/800/600'
    ]
  },
  {
    id: 'm-textile',
    name: 'Algérie Textile Tlemcen',
    type: 'TEXTILE',
    wilaya: 'Tlemcen',
    commune: 'Maghnia',
    lat: 34.8460,
    lng: -1.7300,
    address: 'Zone Industrielle Maghnia',
    closingTime: '17:00',
    rating: 4.1,
    reviewsCount: 150,
    currentTicket: 12,
    lastGivenTicket: 20,
    photos: [
      'https://picsum.photos/seed/tlemcen-zianides/800/600',
      'https://picsum.photos/seed/textile-mill/800/600'
    ]
  },

  // TECHNOLOGY - Tech Parks
  {
    id: 'te-startup',
    name: 'Sidi Abdellah Cyber-Park HQ',
    type: 'STARTUP',
    wilaya: 'Alger',
    commune: 'Zéralda',
    lat: 36.7160,
    lng: 2.8460,
    address: 'Incubateur National ANPT',
    closingTime: '20:00',
    rating: 4.9,
    reviewsCount: 450,
    currentTicket: 5,
    lastGivenTicket: 12,
    photos: [
      'https://picsum.photos/seed/tech-modern/800/600',
      'https://picsum.photos/seed/cyberpark-sidi-abdellah/800/600'
    ]
  },
  {
    id: 'te-telecom',
    name: 'Djezzy Direction Générale',
    type: 'TELECOM',
    wilaya: 'Alger',
    commune: 'Dar El Beïda',
    lat: 36.7140,
    lng: 3.1900,
    address: 'Route d\'Arzew, Dar El Beïda',
    closingTime: '18:00',
    rating: 4.4,
    reviewsCount: 3400,
    currentTicket: 120,
    lastGivenTicket: 156,
    photos: [
      'https://picsum.photos/seed/telecom/800/600',
      'https://picsum.photos/seed/phone-tower/800/600'
    ]
  },

  // CONSTRUCTION
  {
    id: 'c-realestate',
    name: 'Promotion Immobilière Bessa Alger',
    type: 'REAL_ESTATE',
    wilaya: 'Alger',
    commune: 'Chéraga',
    lat: 36.7620,
    lng: 2.9550,
    address: 'Route de Bouchaoui, Chéraga',
    closingTime: '17:00',
    rating: 4.2,
    reviewsCount: 1200,
    currentTicket: 45,
    lastGivenTicket: 67,
    photos: [
      'https://picsum.photos/seed/modern-algiers/800/600',
      'https://picsum.photos/seed/construction-site/800/600'
    ]
  },

  // EDUCATION
  {
    id: 'e-university',
    name: 'Université Privée Constantine 3',
    type: 'UNIVERSITY',
    wilaya: 'Constantine',
    commune: 'El Khroub',
    lat: 36.2650,
    lng: 6.6900,
    address: 'Nouvelle Ville Ali Mendjeli',
    closingTime: '19:00',
    rating: 4.6,
    reviewsCount: 8900,
    currentTicket: 450,
    lastGivenTicket: 520,
    photos: [
      'https://picsum.photos/seed/university-campus/800/600',
      'https://picsum.photos/seed/lecture-hall/800/600'
    ]
  },

  // ADDING MISSING TYPES FOR COMPLETE COVERAGE
  // HEALTHCARE CONTINUED
  {
    id: 'h-pulmo',
    name: 'Cabinet de Pneumologie Dr. Kadi',
    type: 'PULMONOLOGIST',
    wilaya: 'Tizi Ouzou',
    commune: 'Tizi Ouzou',
    lat: 36.7118,
    lng: 4.0459,
    address: 'Place de la Liberté, Tizi Ouzou',
    closingTime: '17:30',
    rating: 4.7,
    reviewsCount: 145,
    currentTicket: 5,
    lastGivenTicket: 12,
    photos: [
      'https://picsum.photos/seed/kabylie-mountains/800/600',
      'https://picsum.photos/seed/clinic-tizi/800/600'
    ]
  },
  {
    id: 'h-gastro',
    name: 'Dr. Merad - Gastro-entérologue',
    type: 'GASTROENTEROLOGIST',
    wilaya: 'Djelfa',
    commune: 'Djelfa',
    lat: 34.6667,
    lng: 3.2500,
    address: 'Cité des 40 Logements, Djelfa',
    closingTime: '18:00',
    rating: 4.5,
    reviewsCount: 67,
    currentTicket: 2,
    lastGivenTicket: 8,
    photos: [
      'https://picsum.photos/seed/djelfa-steppe/800/600',
      'https://picsum.photos/seed/medical-djelfa/800/600'
    ]
  },
  {
    id: 'h-nephro',
    name: 'Centre d\'Hémodialyse El Masra',
    type: 'NEPHROLOGIST',
    wilaya: 'Mascara',
    commune: 'Mascara',
    lat: 35.3961,
    lng: 0.1403,
    address: 'Route d\'Oran, Mascara',
    closingTime: '20:00',
    rating: 4.6,
    reviewsCount: 89,
    currentTicket: 15,
    lastGivenTicket: 25,
    photos: [
      'https://picsum.photos/seed/mascara-fields/800/600',
      'https://picsum.photos/seed/dialysis-unit/800/600'
    ]
  },
  {
    id: 'h-neuro',
    name: 'Neurologie Dr. Belhadj',
    type: 'NEUROLOGIST',
    wilaya: 'Sidi Bel Abbès',
    commune: 'Sidi Bel Abbès',
    lat: 35.1899,
    lng: -0.6308,
    address: 'Boulevard Mektoub, SBA',
    closingTime: '17:00',
    rating: 4.8,
    reviewsCount: 56,
    currentTicket: 1,
    lastGivenTicket: 5,
    photos: [
      'https://picsum.photos/seed/mektoub-sba/800/600',
      'https://picsum.photos/seed/neurology-room/800/600'
    ]
  },
  {
    id: 'h-endo',
    name: 'Endocrinologie Dr. Toumi',
    type: 'ENDOCRINOLOGIST',
    wilaya: 'Mostaganem',
    commune: 'Mostaganem',
    lat: 35.9333,
    lng: 0.0833,
    address: 'Place du 1er Novembre, Mostaganem',
    closingTime: '18:00',
    rating: 4.7,
    reviewsCount: 42,
    currentTicket: 3,
    lastGivenTicket: 7,
    photos: [
      'https://picsum.photos/seed/mostaganem-sea/800/600',
      'https://picsum.photos/seed/medical-mosta/800/600'
    ]
  },
  {
    id: 'h-gen',
    name: 'Dr. Brahimi - Médecine Générale',
    type: 'GENERALIST',
    wilaya: 'Jijel',
    commune: 'Jijel',
    lat: 36.8205,
    lng: 5.7661,
    address: 'Corniche de Jijel',
    closingTime: '17:00',
    rating: 4.9,
    reviewsCount: 156,
    currentTicket: 4,
    lastGivenTicket: 10,
    photos: [
      'https://picsum.photos/seed/jijel-green/800/600',
      'https://picsum.photos/seed/gp-office/800/600'
    ]
  },
  {
    id: 'h-hosp',
    name: 'Hôpital Privé des Oasis',
    type: 'HOPITAL_PRIVE',
    wilaya: 'Ghardaïa',
    commune: 'Ghardaïa',
    lat: 32.4909,
    lng: 3.6735,
    address: 'Vallée du M\'Zab, Ghardaïa',
    closingTime: '23:59',
    rating: 4.8,
    reviewsCount: 670,
    currentTicket: 56,
    lastGivenTicket: 89,
    photos: [
      'https://picsum.photos/seed/mzab-ghardaia/800/600',
      'https://picsum.photos/seed/hospital-modern-mzab/800/600'
    ]
  },

  // AGRICULTURE CONTINUED
  {
    id: 'a-export',
    name: 'Exportation Agrumes de la Mitidja',
    type: 'AGRI_EXPORT',
    wilaya: 'Tipaza',
    commune: 'Tipaza',
    lat: 36.5894,
    lng: 2.4475,
    address: 'Zone Industrielle Tipaza',
    closingTime: '18:00',
    rating: 4.5,
    reviewsCount: 34,
    currentTicket: 2,
    lastGivenTicket: 5,
    photos: [
      'https://picsum.photos/seed/tipaza-roman/800/600',
      'https://picsum.photos/seed/citrus-farm/800/600'
    ]
  },

  // MANUFACTURING CONTINUED
  {
    id: 'm-fact',
    name: 'SPA Ifri - Usine d\'Embouteillage',
    type: 'FACTORY',
    wilaya: 'Béjaïa',
    commune: 'Akbou',
    lat: 36.4578,
    lng: 4.5350,
    address: 'Zone Industrielle Taharacht, Akbou',
    closingTime: '18:00',
    rating: 4.7,
    reviewsCount: 890,
    currentTicket: 12,
    lastGivenTicket: 20,
    photos: [
      'https://picsum.photos/seed/bejaia-mountains/800/600',
      'https://picsum.photos/seed/water-bottling/800/600'
    ]
  },
  {
    id: 'm-car',
    name: 'Usine de Montage TMC',
    type: 'CAR_MANUF',
    wilaya: 'Tiaret',
    commune: 'Tiaret',
    lat: 35.3711,
    lng: 1.3169,
    address: 'Zone de Développement Tiaret',
    closingTime: '16:00',
    rating: 4.3,
    reviewsCount: 450,
    currentTicket: 5,
    lastGivenTicket: 15,
    photos: [
      'https://picsum.photos/seed/tiaret-landscape/800/600',
      'https://picsum.photos/seed/car-assembly/800/600'
    ]
  },
  {
    id: 'm-const',
    name: 'Cimenterie GICA Oued Fodda',
    type: 'CONST_MATERIALS',
    wilaya: 'Chlef',
    commune: 'Sidi Akkacha',
    lat: 36.4647,
    lng: 1.3317,
    address: 'Zone Industrielle Oued Fodda',
    closingTime: '17:00',
    rating: 4.2,
    reviewsCount: 120,
    currentTicket: 8,
    lastGivenTicket: 12,
    photos: [
      'https://picsum.photos/seed/chlef-industry/800/600',
      'https://picsum.photos/seed/cement-factory/800/600'
    ]
  },

  // TECHNOLOGY CONTINUED
  {
    id: 'te-soft',
    name: 'IT Soft Algérie Solutions',
    type: 'SOFTWARE',
    wilaya: 'Constantine',
    commune: 'Didouche Mourad',
    lat: 36.4500,
    lng: 6.6400,
    address: 'Cyber Village Constantine',
    closingTime: '18:30',
    rating: 4.8,
    reviewsCount: 92,
    currentTicket: 2,
    lastGivenTicket: 6,
    photos: [
      'https://picsum.photos/seed/constantine-night/800/600',
      'https://picsum.photos/seed/coding-office/800/600'
    ]
  },
  {
    id: 'te-cyber',
    name: 'DZ Cyber Security Hub',
    type: 'CYBERSECURITY',
    wilaya: 'Alger',
    commune: 'Sidi M\'Hamed',
    lat: 36.7550,
    lng: 3.0550,
    address: 'Avenue Pasteur, Alger',
    closingTime: '19:00',
    rating: 4.9,
    reviewsCount: 110,
    currentTicket: 1,
    lastGivenTicket: 4,
    photos: [
      'https://picsum.photos/seed/modern-office-dz/800/600',
      'https://picsum.photos/seed/server-room/800/600'
    ]
  },
  {
    id: 'te-digital',
    name: 'Digicom Tlemcen',
    type: 'DIGITAL_SERVICE',
    wilaya: 'Tlemcen',
    commune: 'Tlemcen',
    lat: 34.8783,
    lng: -1.3150,
    address: 'Immeuble Zianides, Tlemcen',
    closingTime: '18:00',
    rating: 4.6,
    reviewsCount: 78,
    currentTicket: 3,
    lastGivenTicket: 8,
    photos: [
      'https://picsum.photos/seed/tlemcen-history/800/600',
      'https://picsum.photos/seed/digital-agency/800/600'
    ]
  },

  // CONSTRUCTION CONTINUED
  {
    id: 'c-build',
    name: 'Cosider Construction Adrar',
    type: 'BUILDING_CO',
    wilaya: 'Adrar',
    commune: 'Adrar',
    lat: 27.8742,
    lng: -0.2939,
    address: 'Base de Vie Cosider, Adrar',
    closingTime: '16:00',
    rating: 4.4,
    reviewsCount: 210,
    currentTicket: 12,
    lastGivenTicket: 30,
    photos: [
      'https://picsum.photos/seed/adrar-sand/800/600',
      'https://picsum.photos/seed/construction-adrar/800/600'
    ]
  },
  {
    id: 'c-dev',
    name: 'Immo Plus Développement Médéa',
    type: 'DEVELOPER',
    wilaya: 'Médéa',
    commune: 'Médéa',
    lat: 36.2642,
    lng: 2.7539,
    address: 'Boulevard de l\'Indépendance, Médéa',
    closingTime: '17:00',
    rating: 4.3,
    reviewsCount: 88,
    currentTicket: 4,
    lastGivenTicket: 10,
    photos: [
      'https://picsum.photos/seed/medea-city/800/600',
      'https://picsum.photos/seed/real-estate-medea/800/600'
    ]
  },

  // EDUCATION CONTINUED
  {
    id: 'e-school',
    name: 'École Privée L\'Excellence Blida',
    type: 'SCHOOL',
    wilaya: 'Blida',
    commune: 'Ouled Yaïch',
    lat: 36.4800,
    lng: 2.8500,
    address: 'Quartier Administratif, Blida',
    closingTime: '16:30',
    rating: 4.7,
    reviewsCount: 1200,
    currentTicket: 89,
    lastGivenTicket: 156,
    photos: [
      'https://picsum.photos/seed/school-algeria/800/600',
      'https://picsum.photos/seed/classroom/800/600'
    ]
  },
  {
    id: 'e-train',
    name: 'Centre de Formation Pro Biskra',
    type: 'TRAINING_CENTER',
    wilaya: 'Biskra',
    commune: 'Biskra',
    lat: 34.8500,
    lng: 5.7333,
    address: 'Avenue de la République, Biskra',
    closingTime: '20:00',
    rating: 4.5,
    reviewsCount: 340,
    currentTicket: 23,
    lastGivenTicket: 45,
    photos: [
      'https://picsum.photos/seed/biskra-market/800/600',
      'https://picsum.photos/seed/workshop-train/800/600'
    ]
  },
  {
    id: 'e-online',
    name: 'DZ Learn Online Hub',
    type: 'ONLINE_EDU',
    wilaya: 'Alger',
    commune: 'Hydra',
    lat: 36.7450,
    lng: 3.0550,
    address: 'Technoparc Hydra',
    closingTime: '21:00',
    rating: 4.8,
    reviewsCount: 2200,
    currentTicket: 150,
    lastGivenTicket: 300,
    photos: [
      'https://picsum.photos/seed/student-dz/800/600',
      'https://picsum.photos/seed/online-learning/800/600'
    ]
  }
];
