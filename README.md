# ThekaWatch 🍺

A production-ready full-stack web app that shows nearby liquor shops on a map with routes, open/closed status, and live crowd levels — using **only free and open-source APIs**.

## Features

✅ **Real-time Shop Discovery** - Automatically fetches nearby liquor shops using OpenStreetMap data  
✅ **Interactive Map** - Built with Leaflet.js and OpenStreetMap tiles  
✅ **Crowd-Sourced Data** - Users vote on crowd levels and open/closed status  
✅ **Smart Routing** - Walking and driving routes using OSRM API  
✅ **Spam Protection** - Rate limiting without requiring user login  
✅ **Real-Time Updates** - Auto-refresh every 15 seconds  
✅ **Dark Premium UI** - Smooth animations and mobile-first design  

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** (Dark theme)
- **Leaflet.js** + **react-leaflet**
- **OpenStreetMap** tiles
- Browser Geolocation API

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Atlas free tier)
- **Axios** for API calls
- **node-cache** for caching

### Free APIs Used
- **Overpass API** (OpenStreetMap) - Shop discovery
- **OSRM** (Open Source Routing Machine) - Route calculation

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier)

### Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd thekawatch
```

2. **Install root dependencies**
```bash
npm install
```

3. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thekawatch?retryWrites=true&w=majority
NODE_ENV=development
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
OSRM_API_URL=https://router.project-osrm.org
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the App

**Option 1: Run both frontend and backend together (from root)**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## How It Works

### 1. User Location
- On page load, requests browser geolocation
- Centers map on user's location
- Falls back to default location if denied

### 2. Shop Discovery
- Backend queries Overpass API for nearby shops
- Searches for: `shop=alcohol`, `shop=beverages`, `amenity=bar`
- Default radius: 3km (configurable)
- Results cached for 5 minutes

### 3. Crowd System
- Users vote: 1 (Low), 2 (Medium), 3 (High)
- Only votes from last 20 minutes count
- Average converted to 🟢🟡🔴
- One vote per shop per 10 minutes

### 4. Open/Closed Status
- Users mark shops as Open or Closed
- Majority vote from last 15 minutes decides status
- Shows "Updated X mins ago"

### 5. Routing
- Uses OSRM public API
- Supports walking and driving modes
- Shows distance, ETA, and route polyline

### 6. Spam Control
- Anonymous user ID stored in localStorage
- Rate limiting: 1 vote per shop per 10 minutes
- No login required

## Database Schema

### Shops Collection
```javascript
{
  osmId: String (unique),
  name: String,
  lat: Number,
  lon: Number,
  type: String (alcohol|beverages|bar),
  address: String,
  lastSeen: Date,
  timestamps: true
}
```

### CrowdVote Collection
```javascript
{
  shopId: String,
  userId: String,
  level: Number (1-3),
  timestamp: Date
}
```

### StatusVote Collection
```javascript
{
  shopId: String,
  userId: String,
  isOpen: Boolean,
  timestamp: Date
}
```

## API Endpoints

### Shops
- `GET /api/shops/nearby?lat=<lat>&lon=<lon>&radius=<radius>` - Fetch nearby shops
- `GET /api/shops/:shopId?userLat=<lat>&userLon=<lon>` - Get shop details

### Crowd
- `POST /api/crowd/vote` - Submit crowd vote
  ```json
  { "shopId": "...", "userId": "...", "level": 1-3 }
  ```
- `GET /api/crowd/:shopId` - Get crowd level

### Status
- `POST /api/status/vote` - Submit status vote
  ```json
  { "shopId": "...", "userId": "...", "isOpen": true/false }
  ```
- `GET /api/status/:shopId` - Get open/closed status

### Routing
- `GET /api/routing/route?fromLat=<lat>&fromLon=<lon>&toLat=<lat>&toLon=<lon>&mode=<foot|car>` - Get route

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
OSRM_API_URL=https://router.project-osrm.org
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Production Deployment

### Backend
1. Deploy to Railway, Render, or any Node.js host
2. Set environment variables
3. Ensure MongoDB Atlas is accessible

### Frontend
1. Deploy to Vercel (recommended for Next.js)
2. Set `NEXT_PUBLIC_API_URL` to your backend URL
3. Build command: `npm run build`

## Contributing

This is a production-ready application. Feel free to:
- Add more features
- Improve UI/UX
- Optimize performance
- Add tests

## License

MIT

---

Built with ❤️ using only free and open-source technologies.


