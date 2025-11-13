"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  Bell,
  CreditCard,
  Shield,
  Upload,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SiteSettings } from "@/types/settings";
import {
  uploadImage,
  deleteImage,
  extractFilePathFromUrl,
  validateImageFile,
} from "@/lib/upload";

const SettingsPageClient = () => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Logo upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("business");

  // Handle logo file selection
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, 5); // Max 5MB
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Invalid file");
      setSaveStatus("error");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Upload logo to Supabase Storage
  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 Uploading logo...");

      // Delete old logo if exists
      if (settings?.logo_url) {
        const oldFilePath = extractFilePathFromUrl(
          settings.logo_url,
          "settings"
        );
        if (oldFilePath) {
          await deleteImage("settings", oldFilePath);
          console.log("🗑️ Old logo deleted");
        }
      }

      // Upload new logo to 'settings' bucket, 'logos' folder
      const publicUrl = await uploadImage("settings", file, "logos");

      if (!publicUrl) {
        throw new Error("Failed to upload logo");
      }

      console.log("✅ Logo uploaded successfully:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
  };

  // Save all settings
  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      let logoUrl = settings.logo_url;

      // Upload logo if new file selected
      if (logoFile) {
        const uploaded = await uploadLogo(logoFile);
        if (uploaded) {
          logoUrl = uploaded;
        } else {
          throw new Error("Failed to upload logo. Please try again.");
        }
      }

      // Prepare settings payload
      const payload = {
        ...settings,
        logo_url: logoUrl,
      };

      // Send PUT request
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      const data = await response.json();

      if (data.success) {
        // Update local state with saved data
        setSettings(data.settings);
        setLogoPreview(data.settings.logo_url);
        setLogoFile(null);

        // Show success message
        setSaveStatus("success");
        console.log("✅ Settings saved successfully");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setErrorMessage(
        error.message || "Failed to save settings. Please try again."
      );
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // Update settings field
  const updateField = (field: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  // Update nested field (for objects like operating_hours)
  const updateNestedField = (
    parent: keyof SiteSettings,
    child: string,
    value: any
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [parent]: {
        ...(settings[parent] as any),
        [child]: value,
      },
    });
  };

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
        setLogoPreview(data.settings.logo_url);
        console.log("✅ Settings loaded:", data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setErrorMessage("Failed to load settings. Please refresh the page.");
      setSaveStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  // Show error if settings failed to load
  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage ||
              "Failed to load settings. Please refresh the page."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business settings and configurations
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saveStatus === "success" ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {saveStatus === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully! Changes will appear on your website
            shortly.
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage || "Failed to save settings. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Business Info Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-forest" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={settings.business_name}
                  onChange={(e) => updateField("business_name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessDescription">
                  Business Description
                </Label>
                <Textarea
                  id="businessDescription"
                  value={settings.business_description}
                  onChange={(e) =>
                    updateField("business_description", e.target.value)
                  }
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label>Business Logo</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Recommended: Square image (500x500px), max 5MB
                </p>
                <div className="mt-2">
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-32 h-32 object-contain border rounded-lg p-2 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setLogoFile(null);
                          // If there was an old logo, restore it
                          if (settings?.logo_url) {
                            setLogoPreview(settings.logo_url);
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-block border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-forest transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium text-center">
                        Upload Logo
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        JPG, PNG, GIF, WebP
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-forest" />
                  Operating Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Weekday Hours</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="time"
                        value={settings.operating_hours.weekday.open}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operating_hours: {
                              ...settings.operating_hours,
                              weekday: {
                                ...settings.operating_hours.weekday,
                                open: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <span className="self-center">to</span>
                      <Input
                        type="time"
                        value={settings.operating_hours.weekday.close}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operating_hours: {
                              ...settings.operating_hours,
                              weekday: {
                                ...settings.operating_hours.weekday,
                                close: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Weekend Hours</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="time"
                        value={settings.operating_hours.weekend.open}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operating_hours: {
                              ...settings.operating_hours,
                              weekend: {
                                ...settings.operating_hours.weekend,
                                open: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <span className="self-center">to</span>
                      <Input
                        type="time"
                        value={settings.operating_hours.weekend.close}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operating_hours: {
                              ...settings.operating_hours,
                              weekend: {
                                ...settings.operating_hours.weekend,
                                close: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-forest" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  value={settings.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Business Address
                </Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="googleMapsUrl">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Google Maps URL
                </Label>
                <Input
                  id="googleMapsUrl"
                  value={settings.google_maps_url}
                  onChange={(e) =>
                    updateField("google_maps_url", e.target.value)
                  }
                  className="mt-1"
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-forest" />
                  Social Media Links
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="facebook">
                      <Facebook className="w-4 h-4 inline mr-2" />
                      Facebook Page
                    </Label>
                    <Input
                      id="facebook"
                      value={settings.facebook_url}
                      onChange={(e) =>
                        updateField("facebook_url", e.target.value)
                      }
                      className="mt-1"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">
                      <Instagram className="w-4 h-4 inline mr-2" />
                      Instagram Profile
                    </Label>
                    <Input
                      id="instagram"
                      value={settings.instagram_url}
                      onChange={(e) =>
                        updateField("instagram_url", e.target.value)
                      }
                      className="mt-1"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsappCommunity">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      WhatsApp Community
                    </Label>
                    <Input
                      id="whatsappCommunity"
                      value={settings.whatsapp_community_url}
                      onChange={(e) =>
                        updateField("whatsapp_community_url", e.target.value)
                      }
                      className="mt-1"
                      placeholder="https://chat.whatsapp.com/..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings Tab */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-forest" />
                Booking Rules & Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  These settings control how customers can book courts and
                  cancellation policies.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minAdvance">
                    Minimum Advance Booking (hours)
                  </Label>
                  <Input
                    id="minAdvance"
                    type="number"
                    min="0"
                    value={settings.min_advance_booking}
                    onChange={(e) =>
                      updateField(
                        "min_advance_booking",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer must book at least this many hours in advance
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxAdvance">
                    Maximum Advance Booking (days)
                  </Label>
                  <Input
                    id="maxAdvance"
                    type="number"
                    min="1"
                    value={settings.max_advance_booking}
                    onChange={(e) =>
                      updateField(
                        "max_advance_booking",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer can book up to this many days ahead
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="cancellation">
                  Cancellation Window (hours)
                </Label>
                <Input
                  id="cancellation"
                  type="number"
                  min="0"
                  value={settings.cancellation_window}
                  onChange={(e) =>
                    updateField(
                      "cancellation_window",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Customer can cancel free of charge up to this many hours
                  before booking
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Require Deposit</Label>
                    <p className="text-sm text-muted-foreground">
                      Require customers to pay a deposit when booking
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_deposit}
                    onCheckedChange={(checked) =>
                      updateField("require_deposit", checked)
                    }
                  />
                </div>

                {settings.require_deposit && (
                  <div>
                    <Label htmlFor="depositPercent">Deposit Percentage</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <Input
                        id="depositPercent"
                        type="number"
                        min="0"
                        max="100"
                        value={settings.deposit_percentage}
                        onChange={(e) =>
                          updateField(
                            "deposit_percentage",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-forest" />
                Payment Gateway Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Configure Midtrans payment gateway. Get your keys from{" "}
                  <a
                    href="https://dashboard.midtrans.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Midtrans Dashboard
                  </a>
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="midtransKey">Midtrans Client Key</Label>
                <Input
                  id="midtransKey"
                  type="password"
                  value={settings.payment_settings.midtrans_client_key}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment_settings: {
                        ...settings.payment_settings,
                        midtrans_client_key: e.target.value,
                      },
                    })
                  }
                  className="mt-1"
                  placeholder="SB-Mid-client-..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Production Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable for live payments (disable for testing)
                  </p>
                </div>
                <Switch
                  checked={settings.payment_settings.midtrans_is_production}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      payment_settings: {
                        ...settings.payment_settings,
                        midtrans_is_production: checked,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Enabled Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Credit/Debit Card</Label>
                    <Switch
                      checked={settings.payment_settings.enable_credit_card}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          payment_settings: {
                            ...settings.payment_settings,
                            enable_credit_card: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Bank Transfer</Label>
                    <Switch
                      checked={settings.payment_settings.enable_bank_transfer}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          payment_settings: {
                            ...settings.payment_settings,
                            enable_bank_transfer: checked,
                          },
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>QRIS</Label>
                    <Switch
                      checked={settings.payment_settings.enable_qris}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          payment_settings: {
                            ...settings.payment_settings,
                            enable_qris: checked,
                          },
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>E-Wallet (GoPay, ShopeePay, Dana)</Label>
                    <Switch
                      checked={settings.payment_settings.enable_ewallet}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          payment_settings: {
                            ...settings.payment_settings,
                            enable_ewallet: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-forest" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Configure which notifications you want to receive for bookings
                  and payments.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notification_settings.email_notifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notification_settings: {
                          ...settings.notification_settings,
                          email_notifications: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={
                      settings.notification_settings.whatsapp_notifications
                    }
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notification_settings: {
                          ...settings.notification_settings,
                          whatsapp_notifications: checked,
                        },
                      })
                    }
                  />
                </div>

                <Separator />

                <h3 className="font-semibold">Notification Types</h3>

                <div className="flex items-center justify-between">
                  <Label>Booking Confirmation</Label>
                  <Switch
                    checked={
                      settings.notification_settings.booking_confirmation
                    }
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notification_settings: {
                          ...settings.notification_settings,
                          booking_confirmation: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Payment Reminder</Label>
                  <Switch
                    checked={settings.notification_settings.payment_reminder}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notification_settings: {
                          ...settings.notification_settings,
                          payment_reminder: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Booking Reminder (24h before)</Label>
                  <Switch
                    checked={settings.notification_settings.booking_reminder}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notification_settings: {
                          ...settings.notification_settings,
                          booking_reminder: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-forest" />
                SEO & Meta Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Optimize your website for search engines and social media
                  sharing.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.meta_title}
                  onChange={(e) => updateField("meta_title", e.target.value)}
                  className="mt-1"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {settings.meta_title.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.meta_description}
                  onChange={(e) =>
                    updateField("meta_description", e.target.value)
                  }
                  className="mt-1"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {settings.meta_description.length}/160 characters (optimal:
                  150-160)
                </p>
              </div>

              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={settings.meta_keywords}
                  onChange={(e) => updateField("meta_keywords", e.target.value)}
                  className="mt-1"
                  placeholder="padel, samarinda, sports, booking"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate keywords with commas
                </p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={settings.og_image}
                  onChange={(e) => updateField("og_image", e.target.value)}
                  className="mt-1"
                  placeholder="/images/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Image shown when sharing on social media (recommended:
                  1200x630px)
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold mb-2 text-sm">Preview</h3>
                <div className="space-y-2">
                  <div className="text-blue-600 text-lg font-medium">
                    {settings.meta_title}
                  </div>
                  <div className="text-green-700 text-xs">
                    padelbap.com › booking
                  </div>
                  <div className="text-sm text-gray-600">
                    {settings.meta_description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button - Fixed at bottom on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving All Changes...
            </>
          ) : saveStatus === "success" ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Spacer for mobile fixed button */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default SettingsPageClient;
