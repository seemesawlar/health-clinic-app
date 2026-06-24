🏥 Health Clinic Storage Organizer

A frontend-focused inventory management system built to help clinic staff easily track, visualize, and manage medical supplies across multiple storage locations.

Built with React (Vite) and integrated with Supabase for real-time data syncing and persistence.

🎯 Project Focus

This project prioritizes:

Fast and intuitive frontend user experience
Clear inventory visibility for clinic staff
Simple workflows for tracking and using supplies
Real-time UI updates to reflect clinic activity instantly

The backend (Supabase) is used as a supporting data layer, while the core emphasis is on UI structure, state management, and usability.

🖥️ Core Features (Frontend-First)
📦 Inventory Dashboard
Clean, filterable inventory table
Search by item name, category, or location
Status indicators:
🟢 Healthy
🟡 Low Stock
🔴 Expired
Expiry-aware UI highlighting
🧑‍⚕️ Usage Tracking Interface
Simple form-based usage logging
Team selection (Nurse Practitioners, Walk-In Clinic, Health Shelter)
Immediate UI updates after usage submission
🗺️ Storage Visualization
Bin-based layout (A-1, B-2, etc.)
Helps staff quickly identify item locations
📊 Dashboard Overview
Inventory summary cards
Stock health overview
Quick insights into clinic supply status
⚙️ Tech Stack (Frontend Emphasis)
Frontend
React (Vite)
JavaScript (ES6+)
Component-based architecture
Custom hooks for state/data handling
Backend (Support Layer)
Supabase (PostgreSQL)
Real-time subscriptions
Database functions for inventory updates
🧠 Frontend Architecture
Component Structure
Reusable UI components (Sidebar, Topbar, Cards)
Page-based routing structure:
Dashboard
Inventory
Storage Map
Usage Logging
Reports
State Management
Custom React hooks:
useInventory() → inventory state + actions
useUsageLog() → usage history tracking
Data Flow

Supabase → Custom Hooks → React State → UI Components

🔄 Real-Time UI Updates

The UI updates instantly when:

Items are added or edited
Stock levels change
Usage is recorded

This ensures staff always see current inventory status without refreshing the page.

🧱 Backend (Minimal Role)

Supabase is used for:

Storing inventory data
Recording usage history
Providing real-time updates
Running safe atomic stock updates

The backend is intentionally lightweight to keep the focus on frontend usability and experience design.

📁 Project Structure
src/
├── components/ # UI components (ItemModal, MetricCard, Sidebar, StatusPills, Topbar)
├── pages/ # App screens (Dashboard, Inventory,RecordUsage, Reports, StorageMap)
├── hooks/ # Data + state logic
├── lib/ # Supabase client setup
💡 Key Design Decisions (Frontend Perspective)
Prioritized clarity over complexity in UI design
Used component reusability to keep UI consistent
Built custom hooks to separate logic from UI
Designed interface for non-technical clinic staff usability
🚧 Future Improvements
Barcode scanning UI integration
Drag-and-drop storage mapping
Advanced filtering and search UX
Mobile-responsive optimization
Offline mode for clinic environments
🏁 Setup
npm install
npm run dev

Create .env.local:

VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

👤 Author
Simisola Oyeniyi
