# Qless

Qless is a mobile-first queue management web application designed to help users in Algeria reserve tickets remotely, follow live waiting lines, and reduce time spent in physical queues.

The application combines interactive maps, institution discovery, booking flows, live queue simulation, QR-code tickets, multilingual support, and account features in a polished consumer experience.

## Overview

Qless was designed to simplify access to private institutions and services:

- discover nearby institutions on a map or in a list
- reserve appointments remotely
- follow live queue progression
- estimate waiting time before leaving
- manage active reservations and favorites
- use the app in French, English, or Arabic

The experience is organized around three primary areas:

- `Explore` for search, filters, maps, and institution discovery
- `Reservations` for live tickets and scheduled bookings
- `Account` for profile, language, notifications, and saved places

## Product Highlights

### Explore

- interactive map and list views
- search by institution, wilaya, commune, and category
- filters by sector, institution type, wilaya, and commune
- geolocation support with user positioning
- street and satellite map modes
- institution details with photos, ratings, directions, and sharing

### Reservations

- live queue tickets for walk-in services
- scheduled bookings for appointment-based services
- calendar-based slot selection
- queue position and estimated wait time
- QR-code ticket display
- cancellation and postponement flows

### Account

- onboarding and phone-based profile flow
- profile editing
- saved institutions
- notification center
- dark mode
- French, English, and Arabic localization

### Smart Queue Features

- simulated real-time queue progression
- near-turn notifications when fewer than 15 people remain ahead
- occupancy indicators and saturation levels
- estimated departure timing based on queue state
- live ticket expiration handling

## Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `Motion`
- `Leaflet`
- `React Leaflet`
- `Firebase`
- `QRCode React`
- `Lucide React`

## Project Structure

```text
public/
  logo.png        application logo
src/
  components/     main screens and reusable UI
  contexts/       language provider
  data/           mock institution data
  hooks/          shared hooks
  lib/            Firebase and utility helpers
  App.tsx         main application flow
firestore.rules   Firebase security rules
```

## Local Setup

### Prerequisites

- `Node.js`
- `npm`
- Firebase project configuration if you want to connect backend services

### Installation

```bash
npm install
```

### Environment

Create a local environment file from `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

The project also includes Firebase configuration files:

- `firebase-applet-config.json`
- `firebase-blueprint.json`
- `firestore.rules`

### Run

```bash
npm run dev
```

The development server runs on `http://localhost:3000`.

### Build

```bash
npm run build
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Data and Integrations

- mock institution catalog for product demonstration
- Firebase initialization for authentication and Firestore access
- geolocation APIs for user positioning
- Google Maps links for directions
- QR-code generation for ticket validation

## Positioning

Qless was created as a consumer queue-management concept focused on convenience, mobility, and local service access. It demonstrates how map discovery, reservation flows, and live queue visibility can be combined into one coherent experience for users who want to manage appointments without waiting on site.

## License

No license has been specified yet.
