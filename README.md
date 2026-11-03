# StudioSpace — Creative Space Booking Platform

<p align="center">
  <strong>Discover. Book. Create.</strong>
</p>

<p align="center">
  A peer-to-peer marketplace connecting creators with professional creative spaces.
</p>

<p align="center">
  <a href="https://studiospace1.vercel.app/"><strong>Live Demo</strong></a> ·
  <a href="https://github.com/walid573/StudioSpace-Client"><strong>Client Repository</strong></a>
</p>

---

## Overview

**StudioSpace** is a peer-to-peer marketplace designed to make booking creative workspaces simple and accessible. It connects creators with space owners, allowing users to discover, explore, and book creative environments by the hour.

Whether you need a professional photography studio, a film production stage, a podcast room, a music suite, or an art workshop, StudioSpace helps you find the right space for your next project.

Space owners can also list their properties, manage their listings, and receive booking requests from creators.

## ✨ Key Features

### 🔍 Discover Creative Spaces

- Browse available studios across multiple categories.
- Explore spaces by category, including Photo Studio, Film Stage, Podcast Lounge, Music Suite, and Workshop.
- View detailed studio information, images, amenities, location, ratings, and hourly pricing.

### 📅 Seamless Booking Experience

- Book creative spaces by selecting a date and time.
- Choose flexible start and end times.
- Calculate booking costs dynamically based on selected hours.
- View applicable security deposits.
- Submit booking requests for host approval.
- Track booking requests and their current status.

### 🏠 Studio Management

- List your own creative workspace on the platform.
- Edit existing studio information.
- Delete your own listings.
- Manage all hosted studios from the My Listings dashboard.

### 🔐 Authentication & Security

- Secure authentication powered by Better Auth.
- User registration and login.
- Session management.
- Authenticated booking requests using Bearer tokens.
- Ownership validation to prevent users from booking their own studios.

### 📊 User Dashboard

- **My Bookings:** View your booking requests and their statuses.
- **My Listings:** Manage studios you have listed on the platform.

### 🎨 Modern User Experience

- Fully responsive interface for desktop, tablet, and mobile.
- Theme-aware UI with light and dark mode support.
- Reusable components built with shadcn/ui.
- Interactive image galleries and carousels.
- Clean layouts and intuitive navigation.

---

## 🛠️ Tech Stack

| Category         | Technologies               |
| ---------------- | -------------------------- |
| Framework        | Next.js 16 (App Router)    |
| Frontend         | React 19, TypeScript       |
| Styling          | Tailwind CSS 4             |
| UI Components    | shadcn/ui, Base UI         |
| Authentication   | Better Auth                |
| Database         | MongoDB                    |
| Date Handling    | date-fns, React Day Picker |
| Icons            | Lucide React               |
| Carousels        | Embla, Swiper              |
| Charts           | Recharts                   |
| Theme Management | next-themes                |
| Package Manager  | Bun                        |
| Code Quality     | ESLint, React Compiler     |
| Deployment       | Vercel                     |

---

## 📌 Application Routes

| Route           | Description                                                                   |
| --------------- | ----------------------------------------------------------------------------- |
| `/`             | Landing page with hero section, categories, how it works, and host guarantees |
| `/studios`      | Explore and filter available creative spaces                                  |
| `/studios/[id]` | Studio details, gallery, amenities, and booking panel                         |
| `/add-studio`   | Create a new studio listing                                                   |
| `/my-bookings`  | View and manage booking requests                                              |
| `/my-listings`  | Manage your listed studios                                                    |
| `/how-it-works` | Learn how the platform works                                                  |
| `/about-us`     | Information about StudioSpace                                                 |
| `/login`        | User authentication                                                           |

---

## 📂 Project Structure

```text
StudioSpace-Client/
│
├── public/                  # Static assets and images
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Homepage
│   │   ├── studios/         # Studio browsing and details
│   │   ├── add-studio/      # Studio listing
│   │   ├── my-bookings/     # Booking dashboard
│   │   ├── my-listings/     # Host dashboard
│   │   ├── login/           # Authentication
│   │   ├── about-us/        # About page
│   │   └── how-it-works/    # Platform guide
│   │
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   └── studios/         # Studio-related components
│   │
│   └── lib/                 # Utilities, auth and helpers
│
├── components.json          # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── eslint.config.mjs        # ESLint configuration
├── package.json
├── bun.lock
└── tsconfig.json
```

---

## 🚀 Getting Started

Follow these steps to run StudioSpace locally.

### Prerequisites

Make sure you have the following installed:

- [Bun](https://bun.sh/) (recommended)
- Node.js 20+ (if using npm)
- MongoDB database
- StudioSpace backend API

### 1. Clone the Repository

```bash
git clone https://github.com/walid573/StudioSpace-Client.git

cd StudioSpace-Client
```

### 2. Install Dependencies

Using Bun:

```bash
bun install
```

Alternatively, using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
BETTER_AUTH_SECRET=your-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
```

**Environment variable descriptions:**

| Variable              | Description                                  |
| --------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API             |
| `MONGODB_URI`         | MongoDB connection string for authentication |
| `BETTER_AUTH_SECRET`  | Secret used by Better Auth                   |
| `BETTER_AUTH_URL`     | Base URL of the authentication server        |

> Keep your `.env.local` file private. Never commit credentials, database connection strings, or authentication secrets to GitHub.

### 4. Start the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `bun dev`       | Start the development server         |
| `bun run build` | Create an optimized production build |
| `bun start`     | Start the production server          |
| `bun run lint`  | Run ESLint                           |

---

## 🔗 Backend Integration

StudioSpace Client communicates with a separate REST API. Configure its base URL through `NEXT_PUBLIC_API_URL`.

### API Endpoints

| Method | Endpoint       | Description                           |
| ------ | -------------- | ------------------------------------- |
| `GET`  | `/studios`     | Retrieve available studios            |
| `GET`  | `/studios/:id` | Retrieve studio details by ID or slug |
| `POST` | `/my-bookings` | Submit a booking request              |

### Booking Request Example

```json
{
  "studioId": "6ae611e945ba49ee8b3c6c64",
  "userEmail": "user@example.com",
  "userName": "Jane Doe",
  "date": "2026-11-12",
  "start": "10:00",
  "end": "14:00",
  "hours": 4,
  "total": 480
}
```

### Authentication

Authenticated API requests use a Bearer token in the Authorization header.

```http
Authorization: Bearer <your-auth-token>
```

**Backend configuration requirements:**

- Configure CORS to allow your frontend origin.
- Allow the `Authorization` request header.
- Ensure the backend handles authenticated booking requests.
- Configure the appropriate frontend and authentication URLs for production.

---

## ☁️ Deployment

StudioSpace Client is deployed using [Vercel](https://vercel.com/).

To deploy your own instance:

1. Fork or clone the repository.
2. Import the project into Vercel.
3. Configure the required environment variables.
4. Make sure your backend API allows your deployed frontend origin.
5. Deploy the application.

**Live Application:** https://studiospace1.vercel.app/

---

## 🔮 Future Improvements

Potential enhancements for the platform include:

- Online payment integration.
- Advanced studio search and filtering.
- Booking availability management.
- Booking cancellation and rescheduling.
- Reviews and ratings from verified customers.
- Notifications for booking updates.
- Interactive maps for studio locations.

---

## 👨‍💻 Author

**Mohammad Walid**

Full-Stack Developer | React · Next.js · TypeScript · Node.js

- GitHub: [@walid573](https://github.com/walid573)
- LinkedIn: [Mohammad Walid](https://www.linkedin.com/in/mohammad-walid1/)

---

<p align="center">
  <strong>Built with ❤️ for creators and creative communities.</strong>
</p>
