# FindMyEvent - Student Event Discovery Platform

FindMyEvent is a comprehensive platform for students to discover, register, and attend technical events like hackathons, workshops, seminars, and college fests across India.

## 🚀 Features

### For Students

- **Smart Event Discovery**: Personalized recommendations based on interests and location
- **Easy Registration**: One-click registration with multiple payment options
- **QR Code Tickets**: Digital tickets with QR codes for seamless check-ins
- **Community Integration**: Join event WhatsApp/Telegram groups
- **Mobile-First Design**: Optimized for mobile devices
- **Real-time Notifications**: WhatsApp, Telegram, and email reminders

### For Organizers

- **Event Management**: Create and manage events with detailed analytics
- **Verification System**: Verified organizer badges for trust
- **Zero Commission**: Direct UPI payments with no platform fees
- **Attendee Management**: QR code scanning for check-ins
- **Analytics Dashboard**: Real-time insights on registrations and attendance

### For Admins

- **Organizer Verification**: Approve and manage organizer applications
- **Platform Analytics**: Comprehensive platform statistics
- **Content Moderation**: Monitor and manage platform content

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Payments**: Razorpay UPI integration
- **Deployment**: Netlify/Vercel
- **UI Components**: shadcn/ui, Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router 6

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Razorpay account (for payments)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd findmyevent
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your actual credentials:

   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL from `supabase/migrations/001_create_tables.sql` in your Supabase SQL Editor
   - This creates all tables, RLS policies, storage buckets, and functions

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Quick Deploy to Netlify

1. [Connect to Netlify](#open-mcp-popover) MCP integration
2. Configure environment variables
3. Deploy with a single click

### Manual Deployment

See [PRODUCTION.md](PRODUCTION.md) for detailed deployment instructions.

## 📁 Project Structure

```
findmyevent/
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and configurations
│   └── hooks/             # Custom React hooks
├── shared/                # Shared types and utilities
├── supabase/             # Database migrations
├── scripts/              # Setup and utility scripts
└── docs/                 # Documentation
```

## 🔑 Key Components

### Authentication Flow

- Email/Phone + OTP authentication
- Google Sign-in integration
- Role-based access (Student/Organizer/Admin)
- Automatic profile creation

### Event Management

- Complete CRUD operations for events
- Multiple ticket types with pricing
- Event analytics and reporting
- QR code generation for tickets

### Payment Integration

- Razorpay UPI payments
- Zero commission for organizers
- Secure payment handling
- Automatic ticket generation

### Security Features

- Row Level Security (RLS) on all tables
- Secure file upload policies
- API key protection
- CORS configuration
- Input validation and sanitization

## 🔍 Health Monitoring

The application includes a built-in health check system that monitors:

- Supabase connection status
- Database accessibility
- Authentication service availability

## 📱 Mobile Experience

- Progressive Web App (PWA) ready
- Mobile-first responsive design
- Touch-optimized interfaces
- Fast loading times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Documentation**: [PRODUCTION.md](PRODUCTION.md) for deployment
- **Setup Guide**: [scripts/setup-supabase.md](scripts/setup-supabase.md)
- **Issues**: Create an issue in the repository

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with love for the student community
- Powered by Supabase for backend services
- UI components by shadcn/ui
- Icons by Lucide React

## 🔄 Recent Updates

- Enhanced QR scanner with improved camera handling and cleanup
- Added proper media stream management for mobile devices
- Improved authentication flow with logout event handling
- Enhanced mobile-first responsive design

---

**Ready to revolutionize student events? Let's build something amazing together! 🚀**
