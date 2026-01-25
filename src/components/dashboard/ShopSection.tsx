"use client";

import Image from "next/image";
import {
  Edit,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  GripVertical,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { ShopSectionCMS } from "@/types";

const ShopSection = ({
  shop,
  setShop,
  tempShop,
  setTempShop,
  shopWelcomeDialogOpen,
  setShopWelcomeDialogOpen,
  shopWelcomeFiles,
  setShopWelcomeFiles,
  shopWelcomePreviews,
  tempShopWelcomePreviews,
  setTempShopWelcomePreviews,
  onShopWelcomeImageSelect,
  saveShopWelcome,
  savingShopWelcome,
  openShopWelcomeDialog,
  editingShopProduct,
  setEditingShopProduct,
  shopProductDialogOpen,
  setShopProductDialogOpen,
  shopProductImageFile,
  setShopProductImageFile,
  shopProductPreview,
  setShopProductPreview,
  onShopProductImageSelect,
  openAddShopProduct,
  openEditShopProduct,
  deleteShopProduct,
  saveShopProduct,
  savingShopProduct,
}: ShopSectionCMS) => {
  if (!tempShop || !shop) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Shop
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage shop welcome section and product catalog
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* WELCOME SECTION */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Welcome Section</h3>
              <Button
                onClick={openShopWelcomeDialog}
                size="sm"
                className="gap-2"
              >
                <Edit className="w-4 h-4" /> Edit Welcome
              </Button>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Images Preview */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Images</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1].map((idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
                        >
                          {shopWelcomePreviews[idx] ? (
                            <Image
                              src={shopWelcomePreviews[idx]}
                              alt={`Welcome image ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="192px"
                              quality={75}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              Image {idx + 1}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Badge
                      </Label>
                      <p className="text-sm font-medium">
                        {shop.welcome_badge}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Heading
                      </Label>
                      <p className="text-sm font-semibold">
                        {shop.welcome_heading}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {shop.welcome_description}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Subheading
                      </Label>
                      <p className="text-sm font-medium">
                        {shop.welcome_subheading}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* PRODUCTS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Products</h3>
                <p className="text-xs text-muted-foreground">
                  Max 6 products will be displayed on frontend
                </p>
              </div>
              <Button onClick={openAddShopProduct} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </div>

            {shop.products.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No products yet. Click "Add Product" to create one.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shop.products
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((product) => (
                    <Card key={product.id} className="overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="flex gap-4 p-4">
                          {/* Drag Handle */}
                          <div className="flex items-center">
                            <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                          </div>

                          {/* Image Preview */}
                          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                                quality={75}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                No image
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant={
                                      product.is_active
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {product.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    #{product.display_order}
                                  </span>
                                </div>
                                <p className="font-medium text-sm truncate">
                                  {product.name}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {product.caption}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditShopProduct(product)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteShopProduct(product.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WELCOME EDIT DIALOG */}
      <Dialog
        open={shopWelcomeDialogOpen}
        onOpenChange={setShopWelcomeDialogOpen}
      >
        <DialogContent className="max-w-4xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="custom-scrollbar">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Edit Shop Welcome Section</DialogTitle>
                <DialogDescription className="sr-only">
                  Edit welcome text and images
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Images */}
                <div>
                  <Label className="mb-2 block">Welcome Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((idx) => (
                      <div key={idx}>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          Image {idx + 1}{" "}
                          {idx === 0
                            ? "(Top-Right)"
                            : "(Bottom-Left, Overlaps)"}
                        </Label>
                        {tempShopWelcomePreviews[idx] ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <Image
                              src={tempShopWelcomePreviews[idx]}
                              alt={`preview ${idx + 1}`}
                              quality={75}
                              fill
                              className="object-cover"
                              sizes="384px"
                            />
                            <button
                              onClick={() => {
                                const np = [...tempShopWelcomePreviews];
                                np[idx] = "";
                                setTempShopWelcomePreviews(
                                  np as [string, string],
                                );
                                const nf = [...shopWelcomeFiles];
                                nf[idx] = null;
                                setShopWelcomeFiles(
                                  nf as [File | null, File | null],
                                );
                              }}
                              className="absolute z-10 top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-forest transition-colors block">
                            <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs">Upload Image {idx + 1}</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                onShopWelcomeImageSelect(idx as 0 | 1, e)
                              }
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Text Content */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Badge</Label>
                    <Input
                      value={tempShop.welcome_badge}
                      onChange={(e) =>
                        setTempShop({
                          ...tempShop,
                          welcome_badge: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Heading *</Label>
                    <Input
                      value={tempShop.welcome_heading}
                      onChange={(e) =>
                        setTempShop({
                          ...tempShop,
                          welcome_heading: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={tempShop.welcome_description}
                    onChange={(e) =>
                      setTempShop({
                        ...tempShop,
                        welcome_description: e.target.value,
                      })
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Subheading *</Label>
                  <Input
                    value={tempShop.welcome_subheading}
                    onChange={(e) =>
                      setTempShop({
                        ...tempShop,
                        welcome_subheading: e.target.value,
                      })
                    }
                    placeholder="e.g., Discover Your Perfect Padel Racket"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Subdescription *</Label>
                  <Textarea
                    value={tempShop.welcome_subdescription}
                    onChange={(e) =>
                      setTempShop({
                        ...tempShop,
                        welcome_subdescription: e.target.value,
                      })
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Separator />

                {/* CTA Buttons */}
                <div>
                  <Label className="mb-3 block">CTA Buttons</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground">
                        Primary Button
                      </Label>
                      <Input
                        value={tempShop.cta_primary_text}
                        onChange={(e) =>
                          setTempShop({
                            ...tempShop,
                            cta_primary_text: e.target.value,
                          })
                        }
                        placeholder="Button text"
                      />
                      <Input
                        value={tempShop.cta_primary_href}
                        onChange={(e) =>
                          setTempShop({
                            ...tempShop,
                            cta_primary_href: e.target.value,
                          })
                        }
                        placeholder="Button link"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground">
                        Secondary Button
                      </Label>
                      <Input
                        value={tempShop.cta_secondary_text}
                        onChange={(e) =>
                          setTempShop({
                            ...tempShop,
                            cta_secondary_text: e.target.value,
                          })
                        }
                        placeholder="Button text"
                      />
                      <Input
                        value={tempShop.cta_secondary_href}
                        onChange={(e) =>
                          setTempShop({
                            ...tempShop,
                            cta_secondary_href: e.target.value,
                          })
                        }
                        placeholder="Button link"
                      />

                      <Input
                        value={tempShop.cta_secondary_href}
                        onChange={(e) =>
                          setTempShop({
                            ...tempShop,
                            cta_secondary_href: e.target.value,
                          })
                        }
                        placeholder="Button link"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShopWelcomeDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={saveShopWelcome}
                    disabled={savingShopWelcome}
                  >
                    {savingShopWelcome ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Welcome Section"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PRODUCT ADD/EDIT DIALOG */}
      <Dialog
        open={shopProductDialogOpen}
        onOpenChange={setShopProductDialogOpen}
      >
        <DialogContent className="max-w-2xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="custom-scrollbar">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>
                  {editingShopProduct?.id.startsWith("new-")
                    ? "Add New Product"
                    : "Edit Product"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Add or edit product details
                </DialogDescription>
              </DialogHeader>

              {editingShopProduct && (
                <div className="space-y-4 mt-6">
                  <div>
                    <Label>Product Name *</Label>
                    <Input
                      value={editingShopProduct.name}
                      onChange={(e) =>
                        setEditingShopProduct({
                          ...editingShopProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., Premium Rackets"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Caption *</Label>
                    <Textarea
                      value={editingShopProduct.caption}
                      onChange={(e) =>
                        setEditingShopProduct({
                          ...editingShopProduct,
                          caption: e.target.value,
                        })
                      }
                      placeholder="Short description shown on hover/mobile"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Product Image</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Recommended: 600x600px (square), WebP, 85% quality
                    </p>
                    <div className="mt-2">
                      {shopProductPreview ? (
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={shopProductPreview}
                            alt="preview"
                            quality={75}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 672px"
                          />
                          <button
                            onClick={() => {
                              setShopProductPreview(null);
                              setShopProductImageFile(null);
                            }}
                            className="absolute z-10 top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-forest transition-colors block">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            Click to upload product image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP up to 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onShopProductImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingShopProduct.display_order}
                        onChange={(e) =>
                          setEditingShopProduct({
                            ...editingShopProduct,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower numbers appear first
                      </p>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <select
                        value={
                          editingShopProduct.is_active ? "active" : "inactive"
                        }
                        onChange={(e) =>
                          setEditingShopProduct({
                            ...editingShopProduct,
                            is_active: e.target.value === "active",
                          })
                        }
                        className="block w-full mt-1 p-2 border rounded-lg"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only active products show on frontend
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShopProductDialogOpen(false);
                        setEditingShopProduct(null);
                        setShopProductPreview(null);
                        setShopProductImageFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={saveShopProduct}
                      disabled={
                        savingShopProduct ||
                        !editingShopProduct.name ||
                        !editingShopProduct.caption
                      }
                    >
                      {savingShopProduct ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Product"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopSection;
