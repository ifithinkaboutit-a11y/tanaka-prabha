-- ==================================================================
-- TANAK PRABHA DASHBOARD - DATABASE SCHEMA REFERENCE
-- ==================================================================
-- This file is a REFERENCE for the dashboard's data model.
-- The actual production schema is in: Server/backend/production_schema.sql
-- 
-- For deployment, use the production_schema.sql file in the backend folder.
-- ==================================================================

-- Refer to: Server/backend/production_schema.sql for complete schema

-- ==================================================================
-- QUICK REFERENCE: TABLE STRUCTURE
-- ==================================================================

/*
TABLES:
  - users              : Farmer profiles (CRM)
  - land_details       : Farmer's land information
  - livestock_details  : Farmer's livestock inventory
  - otps               : OTP authentication storage
  - schemes            : Government schemes & programs (CMS)
  - banners            : App home screen banners (CMS)
  - notifications      : User notifications
  - professionals      : Doctors, vets, experts (Connect)
  - connections        : Connection history
  - appointments       : Scheduled appointments
  - activity_logs      : Analytics & audit trail

FUNCTIONS:
  - get_heatmap_data() : Returns farmer locations for heatmap
  - get_dashboard_stats() : Returns dashboard statistics
  - get_user_distribution() : Returns farmers per district
  - get_available_slots(professional_id, date) : Available appointment slots
  - is_fully_booked(professional_id, date) : Check if fully booked
  - cleanup_expired_otps() : Clean up old OTPs
*/

-- See production_schema.sql for complete implementation
