import { 
  Heart, Wind, Stethoscope, Activity, Brain, Thermometer, Eye, Baby, 
  Building2, Landmark, ShieldCheck, Briefcase, Phone, Wallet, CreditCard, 
  Coins, FileText, Users, MapPin, Zap, Droplets, Waves, Wifi, Smartphone, Signal,
  Microscope, Library, Receipt, HardDrive, Filter, ShoppingBag, Truck, Factory,
  Cpu, GraduationCap, Utensils, Hammer, Home, Construction, Globe, Microscope as Biotech,
  Shovel, Tractor, Shirt, Car
} from 'lucide-react';

export type Sector = 
  | 'HEALTHCARE'
  | 'FINANCE'
  | 'TRADE'
  | 'SERVICES'
  | 'AGRICULTURE'
  | 'MANUFACTURING'
  | 'TECHNOLOGY'
  | 'CONSTRUCTION'
  | 'EDUCATION';

export type InstitutionType = 
  // Healthcare
  | 'CARDIOLOGIST' | 'PULMONOLOGIST' | 'GASTROENTEROLOGIST' | 'NEPHROLOGIST' | 'NEUROLOGIST' | 'ENDOCRINOLOGIST' | 'ORL' | 'OPHTHALMOLOGIST' | 'GENERALIST' | 'CLINIQUE' | 'HOPITAL_PRIVE' | 'PHARMACY'
  // Finance
  | 'BANQUE_PRIVEE' | 'ASSURANCE' | 'INVESTMENT'
  // Trade
  | 'SHOP' | 'WHOLESALER' | 'IMPORT_EXPORT'
  // Services
  | 'CONSULTING' | 'TOURISM' | 'TRANSPORT' | 'CLEANING' | 'PERSONAL_SERVICE'
  // Agriculture
  | 'FARM' | 'FOOD_PRODUCTION' | 'AGRI_EXPORT'
  // Manufacturing
  | 'FACTORY' | 'TEXTILE' | 'ELECTRONICS' | 'CAR_MANUF' | 'CONST_MATERIALS'
  // Technology
  | 'SOFTWARE' | 'STARTUP' | 'CYBERSECURITY' | 'TELECOM' | 'DIGITAL_SERVICE'
  // Construction
  | 'BUILDING_CO' | 'DEVELOPER' | 'REAL_ESTATE'
  // Education
  | 'SCHOOL' | 'UNIVERSITY' | 'TRAINING_CENTER' | 'ONLINE_EDU';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  wilaya: string;
  commune: string;
  lat: number;
  lng: number;
  address: string;
  closingTime: string;
  rating: number;
  reviewsCount: number;
  currentTicket: number;
  lastGivenTicket: number;
  photos?: string[];
  busyHours?: number[]; // Array of 24 numbers (0-100) for each hour of the day
}

export interface Ticket {
  id: string;
  institutionId: string;
  institutionName: string;
  ticketNumber: string;
  timestamp: string;
  targetDate: string; // YYYY-MM-DD
  userFullName?: string; // Stored for showing in the day's queue
  status: 'waiting' | 'called' | 'completed';
  estimatedTime: number; // in minutes (relative to now)
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  archived: boolean;
  type: 'REMINDER' | 'INFO' | 'ALERT';
}

export const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annabba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar",
  "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

export const WILAYA_COMMUNES: Record<string, string[]> = {
  "Adrar": ["Adrar", "Tamest", "Charouine", "Reggane", "In Zghmir"],
  "Chlef": ["Chlef", "Ténès", "Boukadir", "Ouled Fares", "Sidi Akkacha"],
  "Laghouat": ["Laghouat", "Ksar El Hirane", "Bennasser Benchohra", "Sidi Makhlouf", "Hassi Delaa"],
  "Oum El Bouaghi": ["Oum El Bouaghi", "Ain Beida", "Ain M'lila", "Ain Kercha", "Ain Babouche"],
  "Batna": ["Batna", "Arris", "Barika", "Merouana", "Timgad"],
  "Béjaïa": ["Béjaïa", "Amizour", "Akbou", "El Kseur", "Sidi Aïch"],
  "Biskra": ["Biskra", "Tolga", "Ouled Djellal", "Sidi Okba", "Lichana"],
  "Béchar": ["Béchar", "Kenadsa", "Béni Abbès", "Taghit", "Abadla"],
  "Blida": ["Blida", "Boufarik", "Beni Mered", "Ouled Yaïch", "Chiffa"],
  "Bouira": ["Bouira", "Lakhdaria", "Sour El Ghozlane", "Bechloul", "M'Chedallah"],
  "Tamanrasset": ["Tamanrasset", "In Salah", "In Amguel", "Idles", "Tazrouk"],
  "Tébessa": ["Tébessa", "Bir el-Ater", "Cheria", "Ouenza", "El Kouif"],
  "Tlemcen": ["Tlemcen", "Maghnia", "Ghazaouet", "Remchi", "Sebdou"],
  "Tiaret": ["Tiaret", "Sougueur", "Frenda", "Ksar Chellala", "Mahdia"],
  "Tizi Ouzou": ["Tizi Ouzou", "Azazga", "Draâ Ben Khedda", "L'Arbaâ Nath Irathen", "Azeffoun", "Tigzirt", "Boghni", "Ouadhias"],
  "Alger": ["Alger Centre", "Sidi M'Hamed", "El Biar", "Kouba", "Bir Mourad Raïs", "Hydra", "Dely Ibrahim", "Zéralda", "Staoueli", "Cheraga"],
  "Djelfa": ["Djelfa", "Ain Oussera", "Hassi Bahbah", "Messaad", "Birine"],
  "Jijel": ["Jijel", "Taher", "El Milia", "Chekfa", "El Ancer"],
  "Sétif": ["Sétif", "El Eulma", "Ain Oulmene", "Ain Arnat", "Bouandas"],
  "Saïda": ["Saïda", "Ain El Hadjar", "Sidi Amar", "Youb", "Hassasna"],
  "Skikda": ["Skikda", "El Harrouch", "Azzaba", "Collo", "Tamalous"],
  "Sidi Bel Abbès": ["Sidi Bel Abbès", "Tessala", "Sidi Lahcene", "Mostefa Ben Brahim", "Telagh"],
  "Annabba": ["Annaba", "El Bouni", "Sidi Amar", "Berrahal", "El Hadjar"],
  "Guelma": ["Guelma", "Oued Zenati", "Bouchegouf", "Héliopolis", "Hammam Debagh"],
  "Constantine": ["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad", "Zighoud Youcef"],
  "Médéa": ["Médéa", "Ksar Boukhari", "Berrouaghia", "Beni Slimane", "Tablat"],
  "Mostaganem": ["Mostaganem", "Ain Nouissy", "Hassi Maameche", "Mesra", "Bouguirat"],
  "M'Sila": ["M'Sila", "Bou Saada", "Sidi Aissa", "Magra", "Hammam Dhalaa"],
  "Mascara": ["Mascara", "Sig", "Mohammadia", "Tighennif", "Ghriss"],
  "Ouargla": ["Ouargla", "Hassi Messaoud", "Rouissat", "Ain Beida", "Sidi Khouiled"],
  "Oran": ["Oran", "Es Sénia", "Bir El Djir", "Arzew", "Bethioua", "Gdyel", "Aïn El Turk"],
  "El Bayadh": ["El Bayadh", "Rogassa", "Brezina", "El Abiodh Sidi Cheikh", "Bougtob"],
  "Illizi": ["Illizi", "Djanet", "Debdeb", "Bordj Omar Driss", "Bordj El Haouas"],
  "Bordj Bou Arreridj": ["Bordj Bou Arreridj", "Ras El Oued", "Mansoura", "Medjana", "Bordj Ghedir"],
  "Boumerdès": ["Boumerdès", "Dellys", "Boudouaou", "Thenia", "Khemis El Khechna"],
  "El Tarf": ["El Tarf", "El Kala", "Dréan", "Besbes", "Ben Mehidi"],
  "Tindouf": ["Tindouf", "Oum el Assel", "Hassi Mounir", "Hassi Abdallah", "Hassi Naga"],
  "Tissemsilt": ["Tissemsilt", "Theniet El Had", "Lardjem", "Lazharia", "Bordj Bou Naama"],
  "El Oued": ["El Oued", "Guemar", "Debila", "Robbah", "Bayadha"],
  "Khenchela": ["Khenchela", "Kais", "Ouled Rechache", "Bouhmama", "El Hamma"],
  "Souk Ahras": ["Souk Ahras", "Sedrata", "M'daourouch", "Taoura", "Haddada"],
  "Tipaza": ["Tipaza", "Cherchell", "Kolea", "Hadjout", "Bou Ismail"],
  "Mila": ["Mila", "Chelghoum Laid", "Ferdjioua", "Grarem Gouga", "Teleghma"],
  "Aïn Defla": ["Aïn Defla", "Khemis Miliana", "Miliana", "El Attaf", "Djendel"],
  "Naâma": ["Naâma", "Mecheria", "Ain Sefra", "Moghrar", "Asla"],
  "Aïn Témouchent": ["Aïn Témouchent", "Beni Saf", "Hammam Bou Hadjar", "El Amria", "El Malah"],
  "Ghardaïa": ["Ghardaïa", "Metlili", "El Guerrara", "Bounoura", "Zelfana"],
  "Relizane": ["Relizane", "Oued Rhiou", "Mazouna", "Yellel", "Ammi Moussa"],
  "Timimoun": ["Timimoun", "Aougrout", "Ksar Kaddour", "Tinerkouk", "Ouled Said"],
  "Bordj Badji Mokhtar": ["Bordj Badji Mokhtar", "Timiaouine", "Ksar El Baraka", "In Zghmir", "Reggane"],
  "Ouled Djellal": ["Ouled Djellal", "Sidi Khaled", "Besbes", "Ras El Miaad", "Doucen"],
  "Béni Abbès": ["Béni Abbès", "Kerzaz", "Igli", "Tabelbala", "Ouled Khoudir"],
  "In Salah": ["In Salah", "In Ghar", "Foggaret Ezzaouia", "In Amguel", "Idles"],
  "In Guezzam": ["In Guezzam", "Tin Zaouatine", "In Salah", "In Ghar", "Tamanrasset"],
  "Touggourt": ["Touggourt", "Temacine", "Megarine", "El Haidj", "Blidet Amor"],
  "Djanet": ["Djanet", "Bordj El Haouas", "Illizi", "Debdeb", "Bordj Omar Driss"],
  "El M'Ghair": ["El M'Ghair", "Djamaa", "Still", "Mrara", "Oum Touyour"],
  "El Meniaa": ["El Meniaa", "Hassi Gara", "Hassi Fehal", "Mansoura", "Metlili"]
};

export const WILAYA_COORDS: Record<string, { lat: number, lng: number }> = {
  "Adrar": { lat: 27.8742, lng: -0.2939 },
  "Chlef": { lat: 36.1647, lng: 1.3317 },
  "Laghouat": { lat: 33.8, lng: 2.8651 },
  "Oum El Bouaghi": { lat: 35.8754, lng: 7.1135 },
  "Batna": { lat: 35.5559, lng: 6.1741 },
  "Béjaïa": { lat: 36.7515, lng: 5.0558 },
  "Biskra": { lat: 34.85, lng: 5.7333 },
  "Béchar": { lat: 31.6167, lng: -2.2167 },
  "Blida": { lat: 36.47, lng: 2.83 },
  "Bouira": { lat: 36.3749, lng: 3.902 },
  "Tamanrasset": { lat: 22.785, lng: 5.5228 },
  "Tébessa": { lat: 35.4042, lng: 8.1242 },
  "Tlemcen": { lat: 34.8783, lng: -1.315 },
  "Tiaret": { lat: 35.3711, lng: 1.3169 },
  "Tizi Ouzou": { lat: 36.7118, lng: 4.0459 },
  "Alger": { lat: 36.7538, lng: 3.0588 },
  "Djelfa": { lat: 34.6667, lng: 3.25 },
  "Jijel": { lat: 36.8205, lng: 5.7661 },
  "Sétif": { lat: 36.1911, lng: 5.4133 },
  "Saïda": { lat: 34.8303, lng: 0.1517 },
  "Skikda": { lat: 36.8762, lng: 6.9092 },
  "Sidi Bel Abbès": { lat: 35.1899, lng: -0.6308 },
  "Annabba": { lat: 36.9, lng: 7.7667 },
  "Guelma": { lat: 36.4621, lng: 7.4261 },
  "Constantine": { lat: 36.365, lng: 6.6147 },
  "Médéa": { lat: 36.2642, lng: 2.7539 },
  "Mostaganem": { lat: 35.9333, lng: 0.0833 },
  "M'Sila": { lat: 35.7058, lng: 4.5419 },
  "Mascara": { lat: 35.3961, lng: 0.1403 },
  "Ouargla": { lat: 31.9493, lng: 5.325 },
  "Oran": { lat: 35.6987, lng: -0.6359 },
  "El Bayadh": { lat: 33.6803, lng: 1.0192 },
  "Illizi": { lat: 26.4833, lng: 8.4667 },
  "Bordj Bou Arreridj": { lat: 36.0733, lng: 4.7611 },
  "Boumerdès": { lat: 36.7597, lng: 3.4731 },
  "El Tarf": { lat: 36.7672, lng: 8.3136 },
  "Tindouf": { lat: 27.6711, lng: -8.1472 },
  "Tissemsilt": { lat: 35.6072, lng: 1.8106 },
  "El Oued": { lat: 33.3667, lng: 6.8667 },
  "Khenchela": { lat: 35.4358, lng: 7.1433 },
  "Souk Ahras": { lat: 36.2864, lng: 7.9511 },
  "Tipaza": { lat: 36.5894, lng: 2.4475 },
  "Mila": { lat: 36.4503, lng: 6.2644 },
  "Aïn Defla": { lat: 36.2633, lng: 1.9678 },
  "Naâma": { lat: 33.2667, lng: -0.3167 },
  "Aïn Témouchent": { lat: 35.2975, lng: -1.1403 },
  "Ghardaïa": { lat: 32.4909, lng: 3.6735 },
  "Relizane": { lat: 35.7372, lng: 0.5558 },
  "Timimoun": { lat: 29.2639, lng: 0.2306 },
  "Bordj Badji Mokhtar": { lat: 21.3269, lng: 0.9542 },
  "Ouled Djellal": { lat: 34.42, lng: 5.06 },
  "Béni Abbès": { lat: 30.0833, lng: -2.1667 },
  "In Salah": { lat: 27.1936, lng: 2.4828 },
  "In Guezzam": { lat: 19.5683, lng: 5.7667 },
  "Touggourt": { lat: 33.1, lng: 6.0667 },
  "Djanet": { lat: 24.55, lng: 9.4833 },
  "El M'Ghair": { lat: 33.95, lng: 5.9167 },
  "El Meniaa": { lat: 30.5833, lng: 2.8833 }
};

export const SECTORS: { id: Sector; label: string; icon: any; color: string }[] = [
  { id: 'HEALTHCARE', label: 'Healthcare (Private)', icon: Heart, color: '#ef4444' },
  { id: 'FINANCE', label: 'Finance & Banking', icon: Landmark, color: '#0f766e' },
  { id: 'TRADE', label: 'Trade (Commerce)', icon: Receipt, color: '#f59e0b' },
  { id: 'SERVICES', label: 'Services', icon: Users, color: '#6366f1' },
  { id: 'AGRICULTURE', label: 'Agriculture & Agribusiness', icon: Tractor, color: '#10b981' },
  { id: 'MANUFACTURING', label: 'Manufacturing & Industry', icon: Factory, color: '#4b5563' },
  { id: 'TECHNOLOGY', label: 'Technology & IT', icon: Cpu, color: '#3b82f6' },
  { id: 'CONSTRUCTION', label: 'Construction & Real Estate', icon: Construction, color: '#8b5cf6' },
  { id: 'EDUCATION', label: 'Education (Private)', icon: Library, color: '#ec4899' },
];

export const INSTITUTION_TYPES: { type: InstitutionType; sector: Sector; color: string; icon: any }[] = [
  // Healthcare
  { type: 'CARDIOLOGIST', sector: 'HEALTHCARE', color: '#ef4444', icon: Heart },
  { type: 'PULMONOLOGIST', sector: 'HEALTHCARE', color: '#06b6d4', icon: Wind },
  { type: 'GASTROENTEROLOGIST', sector: 'HEALTHCARE', color: '#f97316', icon: Microscope },
  { type: 'NEPHROLOGIST', sector: 'HEALTHCARE', color: '#8b5cf6', icon: Activity },
  { type: 'NEUROLOGIST', sector: 'HEALTHCARE', color: '#6366f1', icon: Brain },
  { type: 'ENDOCRINOLOGIST', sector: 'HEALTHCARE', color: '#ec4899', icon: Thermometer },
  { type: 'ORL', sector: 'HEALTHCARE', color: '#14b8a6', icon: Signal },
  { type: 'OPHTHALMOLOGIST', sector: 'HEALTHCARE', color: '#3b82f6', icon: Eye },
  { type: 'GENERALIST', sector: 'HEALTHCARE', color: '#10b981', icon: Baby },
  { type: 'CLINIQUE', sector: 'HEALTHCARE', color: '#2dd4bf', icon: Building2 },
  { type: 'HOPITAL_PRIVE', sector: 'HEALTHCARE', color: '#0f172a', icon: Landmark },
  { type: 'PHARMACY', sector: 'HEALTHCARE', color: '#10b981', icon: Droplets },

  // Finance
  { type: 'BANQUE_PRIVEE', sector: 'FINANCE', color: '#0f766e', icon: Wallet },
  { type: 'ASSURANCE', sector: 'FINANCE', color: '#1d4ed8', icon: ShieldCheck },
  { type: 'INVESTMENT', sector: 'FINANCE', color: '#059669', icon: Coins },

  // Trade
  { type: 'SHOP', sector: 'TRADE', color: '#f59e0b', icon: ShoppingBag },
  { type: 'WHOLESALER', sector: 'TRADE', color: '#d97706', icon: Truck },
  { type: 'IMPORT_EXPORT', sector: 'TRADE', color: '#b45309', icon: Globe },

  // Services
  { type: 'CONSULTING', sector: 'SERVICES', color: '#7c3aed', icon: FileText },
  { type: 'TOURISM', sector: 'SERVICES', color: '#fbbf24', icon: Waves },
  { type: 'TRANSPORT', sector: 'SERVICES', color: '#4b5563', icon: Truck },
  { type: 'CLEANING', sector: 'SERVICES', color: '#60a5fa', icon: Droplets },
  { type: 'PERSONAL_SERVICE', sector: 'SERVICES', color: '#f472b6', icon: Users },

  // Agriculture
  { type: 'FARM', sector: 'AGRICULTURE', color: '#059669', icon: Home },
  { type: 'FOOD_PRODUCTION', sector: 'AGRICULTURE', color: '#10b981', icon: Utensils },
  { type: 'AGRI_EXPORT', sector: 'AGRICULTURE', color: '#047857', icon: Globe },

  // Manufacturing
  { type: 'FACTORY', sector: 'MANUFACTURING', color: '#4b5563', icon: Factory },
  { type: 'TEXTILE', sector: 'MANUFACTURING', color: '#6b7280', icon: Shirt },
  { type: 'ELECTRONICS', sector: 'MANUFACTURING', color: '#3b82f6', icon: Cpu },
  { type: 'CAR_MANUF', sector: 'MANUFACTURING', color: '#1e293b', icon: Car },
  { type: 'CONST_MATERIALS', sector: 'MANUFACTURING', color: '#92400e', icon: Hammer },

  // Technology
  { type: 'SOFTWARE', sector: 'TECHNOLOGY', color: '#2563eb', icon: HardDrive },
  { type: 'STARTUP', sector: 'TECHNOLOGY', color: '#8b5cf6', icon: Zap },
  { type: 'CYBERSECURITY', sector: 'TECHNOLOGY', color: '#ef4444', icon: ShieldCheck },
  { type: 'TELECOM', sector: 'TECHNOLOGY', color: '#10b981', icon: Signal },
  { type: 'DIGITAL_SERVICE', sector: 'TECHNOLOGY', color: '#6366f1', icon: Smartphone },

  // Construction
  { type: 'BUILDING_CO', sector: 'CONSTRUCTION', color: '#444', icon: Building2 },
  { type: 'DEVELOPER', sector: 'CONSTRUCTION', color: '#111', icon: Landmark },
  { type: 'REAL_ESTATE', sector: 'CONSTRUCTION', color: '#2563eb', icon: Home },

  // Education
  { type: 'SCHOOL', sector: 'EDUCATION', color: '#8b5cf6', icon: GraduationCap },
  { type: 'UNIVERSITY', sector: 'EDUCATION', color: '#7c3aed', icon: Library },
  { type: 'TRAINING_CENTER', sector: 'EDUCATION', color: '#4f46e5', icon: FileText },
  { type: 'ONLINE_EDU', sector: 'EDUCATION', color: '#3b82f6', icon: Globe },
];
