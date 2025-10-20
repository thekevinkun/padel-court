"use client";

import { useState } from "react";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { initialSettings } from "@/lib/dashboard";

const SettingsPageClient = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);
  const [activeTab, setActiveTab] = useState("business");

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    // Simulate upload - replace with actual Supabase upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file));
      }, 1000);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = settings.logo;
      if (logoFile) {
        const uploaded = await uploadLogo(logoFile);
        if (uploaded) logoUrl = uploaded;
      }

      // Save to database
      // await supabase.from('settings').upsert({ ...settings, logo: logoUrl })

      setSettings((prev) => ({ ...prev, logo: logoUrl }));

      // Success notification
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
      setLogoFile(null);
    }
  };

  return (
    <div className="space-y-6">
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
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

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
                  value={settings.businessName}
                  onChange={(e) =>
                    setSettings({ ...settings, businessName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessDescription">
                  Business Description
                </Label>
                <Textarea
                  id="businessDescription"
                  value={settings.businessDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      businessDescription: e.target.value,
                    })
                  }
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label>Business Logo</Label>
                <div className="mt-2">
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-32 h-32 object-contain border rounded-lg p-2"
                      />
                      <button
                        onClick={() => {
                          setLogoPreview(null);
                          setLogoFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
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
                      <input
                        type="file"
                        accept="image/*"
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
                        value={settings.operatingHours.weekday.open}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operatingHours: {
                              ...settings.operatingHours,
                              weekday: {
                                ...settings.operatingHours.weekday,
                                open: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <span className="self-center">to</span>
                      <Input
                        type="time"
                        value={settings.operatingHours.weekday.close}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operatingHours: {
                              ...settings.operatingHours,
                              weekday: {
                                ...settings.operatingHours.weekday,
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
                        value={settings.operatingHours.weekend.open}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operatingHours: {
                              ...settings.operatingHours,
                              weekend: {
                                ...settings.operatingHours.weekend,
                                open: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <span className="self-center">to</span>
                      <Input
                        type="time"
                        value={settings.operatingHours.weekend.close}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            operatingHours: {
                              ...settings.operatingHours,
                              weekend: {
                                ...settings.operatingHours.weekend,
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
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
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
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp: e.target.value })
                  }
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
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
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
                  value={settings.googleMapsUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, googleMapsUrl: e.target.value })
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
                      value={settings.socialMedia.facebook}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            facebook: e.target.value,
                          },
                        })
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
                      value={settings.socialMedia.instagram}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            instagram: e.target.value,
                          },
                        })
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
                      value={settings.socialMedia.whatsappCommunity}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            whatsappCommunity: e.target.value,
                          },
                        })
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
                    value={settings.bookingSettings.minAdvanceBooking}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bookingSettings: {
                          ...settings.bookingSettings,
                          minAdvanceBooking: parseInt(e.target.value) || 0,
                        },
                      })
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
                    value={settings.bookingSettings.maxAdvanceBooking}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bookingSettings: {
                          ...settings.bookingSettings,
                          maxAdvanceBooking: parseInt(e.target.value) || 1,
                        },
                      })
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
                  value={settings.bookingSettings.cancellationWindow}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bookingSettings: {
                        ...settings.bookingSettings,
                        cancellationWindow: parseInt(e.target.value) || 0,
                      },
                    })
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
                    checked={settings.bookingSettings.requireDeposit}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        bookingSettings: {
                          ...settings.bookingSettings,
                          requireDeposit: checked,
                        },
                      })
                    }
                  />
                </div>

                {settings.bookingSettings.requireDeposit && (
                  <div>
                    <Label htmlFor="depositPercent">Deposit Percentage</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <Input
                        id="depositPercent"
                        type="number"
                        min="0"
                        max="100"
                        value={settings.bookingSettings.depositPercentage}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bookingSettings: {
                              ...settings.bookingSettings,
                              depositPercentage: parseInt(e.target.value) || 0,
                            },
                          })
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
                  value={settings.paymentSettings.midtransClientKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        midtransClientKey: e.target.value,
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
                  checked={settings.paymentSettings.midtransIsProduction}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        midtransIsProduction: checked,
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
                      checked={settings.paymentSettings.enableCreditCard}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          paymentSettings: {
                            ...settings.paymentSettings,
                            enableCreditCard: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bank Transfer</Label>
                    <Switch
                      checked={settings.paymentSettings.enableBankTransfer}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          paymentSettings: {
                            ...settings.paymentSettings,
                            enableBankTransfer: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>E-Wallet (GoPay, OVO, Dana, ShopeePay)</Label>
                    <Switch
                      checked={settings.paymentSettings.enableEWallet}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          paymentSettings: {
                            ...settings.paymentSettings,
                            enableEWallet: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>QRIS</Label>
                    <Switch
                      checked={settings.paymentSettings.enableQRIS}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          paymentSettings: {
                            ...settings.paymentSettings,
                            enableQRIS: checked,
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
                    checked={settings.notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          emailNotifications: checked,
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
                      settings.notificationSettings.whatsappNotifications
                    }
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          whatsappNotifications: checked,
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
                    checked={settings.notificationSettings.bookingConfirmation}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          bookingConfirmation: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Payment Reminder</Label>
                  <Switch
                    checked={settings.notificationSettings.paymentReminder}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          paymentReminder: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Booking Reminder (24h before)</Label>
                  <Switch
                    checked={settings.notificationSettings.bookingReminder}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          bookingReminder: checked,
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
                  value={settings.seo.metaTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaTitle: e.target.value },
                    })
                  }
                  className="mt-1"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {settings.seo.metaTitle.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaDescription: e.target.value },
                    })
                  }
                  className="mt-1"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {settings.seo.metaDescription.length}/160 characters (optimal:
                  150-160)
                </p>
              </div>

              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={settings.seo.metaKeywords}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaKeywords: e.target.value },
                    })
                  }
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
                  value={settings.seo.ogImage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, ogImage: e.target.value },
                    })
                  }
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
                    {settings.seo.metaTitle}
                  </div>
                  <div className="text-green-700 text-xs">
                    padelbap.com › booking
                  </div>
                  <div className="text-sm text-gray-600">
                    {settings.seo.metaDescription}
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
}

export default SettingsPageClient;