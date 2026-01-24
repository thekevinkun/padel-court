export interface SiteSettings {
  id: string;
  
  // Business Information
  business_name: string;
  business_description: string;
  logo_url: string | null;
  
  // Contact Information
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  google_maps_url: string;
  
  // Social Media
  facebook_url: string;
  instagram_url: string;
  whatsapp_community_url: string;
  
  // Operating Hours
  operating_hours: {
    weekday: {
      open: string;
      close: string;
    };
    weekend: {
      open: string;
      close: string;
    };
  };
  
  // Booking Rules
  min_advance_booking: number;
  max_advance_booking: number;
  cancellation_window: number;
  require_deposit: boolean;
  deposit_percentage: number;
  refund_full_hours: number;
  refund_partial_hours: number;
  refund_partial_percentage: number;
  
  // Payment Settings
  payment_settings: {
    midtrans_client_key: string;
    midtrans_is_production: boolean;
    enable_credit_card: boolean;
    enable_bank_transfer: boolean;
    enable_ewallet: boolean;
    enable_qris: boolean;
  };
  
  // Notification Settings
  notification_settings: {
    email_notifications: boolean;
    whatsapp_notifications: boolean;
    booking_confirmation: boolean;
    payment_reminder: boolean;
    booking_reminder: boolean;
  };
  
  // SEO
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SettingsResponse {
  success: boolean;
  settings: SiteSettings;
}