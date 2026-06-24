Goal
Build a simple but powerful Health Clinic Storage Organizer that allows staff to:
• Track medical inventory in real time
• Record and monitor usage across three teams
• Prevent stockouts and duplicate ordering
• Identify expired supplies
• Improve visibility into storage organization and supply consumption
• Support monthly reporting and operational decision-making
• The system should replace the current spreadsheet-based workflow with a structured, reliable, and easy-to-use application.

Users
• Nurse Practitioners
• Walk-In Health Clinic Staff
• Health Shelter Staff
Each group consumes shared inventory and must have usage tracked independently.

Problem Statement
Current inventory management suffers from:
• No centralized visibility of stock levels
• Expired items remaining in circulation
• Duplicate ordering due to lack of stock awareness
• No structured tracking of usage by team
• Disorganized storage (items mixed in bins)
• No reporting system for monthly analysis
• Reliance on spreadsheets leading to inaccurate data

Core Features (MVP)
1.Inventory Management
• Add, edit, delete inventory items
• Track quantity, location, and expiry
• Categorize items
• Assign storage locations (bins/shelves)

2. Usage Tracking
   • Record when supplies are used
   • Associate usage with a specific team
   • Automatically reduce inventory
   • Store usage history for reporting

3. Inventory Visibility
   • View all current stock
   • Search and filter items
   • Highlight low-stock items
   • Highlight expired items

4. Basic Reporting
   • Monthly usage summaries
   • Usage by team
   • Most consumed items
   • Expired items list

Key Design Decisions

1. Separate Inventory and Usage Logs - Usage is stored independently to:
   • maintain audit history
   • support reporting
   • ensure data integrity

2. Real-time Inventory Updates
   • Improves collaboration between teams and reduces duplication errors.

3. Location Tracking
   • Each item includes storage location (bin/shelf) to improve physical organization of supplies.

4. Expiry Awareness
   • Expiry tracking is critical for patient safety and reducing waste.

Assumptions
• Single clinic location
• Three teams share the same inventory system
• Inventory items are measurable in discrete quantities
• Staff will interact with system regularly during supply usage
• No external supplier integration required for MVP

Future Improvements
• Barcode scanning integration
• Automated reorder suggestions
• Advanced analytics dashboard
• Role-based access control
• Multi-location inventory support
• Supplier and purchase order tracking
• Mobile-first interface for clinic staff

Success Criteria
The system is successful if it:
• Provides real-time visibility into inventory
• Prevents over-ordering and stock duplication
• Tracks usage accurately by team
• Highlights expired or low-stock items
• Replaces spreadsheet workflow with structured system
• Is intuitive for non-technical clinic staff
