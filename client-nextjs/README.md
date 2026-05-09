# PropRent Client (Next.js)

This is the Next.js version of the PropRent client application.

## Migration from Vite + React

This project has been migrated from Vite + React Router to Next.js 14 App Router.

### Key Changes

1. **Routing**: Migrated from React Router to Next.js App Router
2. **Components**: Converted to TypeScript with proper interfaces
3. **Structure**: Reorganized into Next.js app directory structure
4. **Styling**: Maintained Tailwind CSS configuration

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm start
```

### Project Structure

```
client-nextjs/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── properties/         # Properties pages
│   └── login/             # Auth pages
├── components/             # Reusable components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── services/              # API services
├── utils/                 # Utility functions
└── public/                # Static assets
```

### Features

- 🏠 Property browsing and search
- 👤 User authentication
- 📝 Property applications
- 💳 Payment processing
- 💬 Real-time messaging
- 📊 Admin dashboard
- 📱 Responsive design

### Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

The development server runs on `http://localhost:3000` by default.
