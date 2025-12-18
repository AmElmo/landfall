"use client";

import React, { useState, useRef } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Upload, X, Twitter, Github, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, NavCta, FooterColumn, NavbarLayout, FooterLayout } from "@/lib/types";

const SOCIAL_PLATFORMS = [
  { id: "twitter", name: "Twitter", icon: Twitter },
  { id: "github", name: "GitHub", icon: Github },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
];

// Navbar layout options with visual descriptions
const NAVBAR_LAYOUTS: { id: NavbarLayout; name: string; description: string }[] = [
  {
    id: "logo-left-links-right",
    name: "Classic",
    description: "Logo left, navigation links and CTAs on the right",
  },
  {
    id: "logo-center-links-sides",
    name: "Centered Logo",
    description: "Logo in center, links split on both sides",
  },
  {
    id: "logo-left-links-center",
    name: "Centered Links",
    description: "Logo left, navigation centered, CTAs right",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Logo and single CTA only, clean look",
  },
];

// Footer layout options with visual descriptions
const FOOTER_LAYOUTS: { id: FooterLayout; name: string; description: string }[] = [
  {
    id: "columns-simple",
    name: "Multi-Column",
    description: "Multiple link columns with social icons at bottom",
  },
  {
    id: "columns-with-logo",
    name: "Branded",
    description: "Logo and description on left, link columns on right",
  },
  {
    id: "centered-minimal",
    name: "Centered Minimal",
    description: "Centered logo, links in a row, simple copyright",
  },
  {
    id: "stacked",
    name: "Stacked",
    description: "All elements stacked vertically, centered",
  },
];

export default function NavigationStep() {
  const { navigation, sitemap, updateNavigation } = useLandfall();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!navigation || !sitemap) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingLogo(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "logo");

    try {
      const res = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        updateNavigation({
          navbar: {
            ...navigation.navbar,
            logo: { type: "image", value: data.path, imagePath: data.path },
          },
        });
      }
    } catch (error) {
      console.error("Logo upload failed:", error);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const removeLogo = () => {
    updateNavigation({
      navbar: {
        ...navigation.navbar,
        logo: { type: "image", value: "", imagePath: null },
      },
    });
  };

  const addNavLink = () => {
    const newLink: NavLink = {
      label: "New Link",
      target: "/",
      type: "internal",
    };
    updateNavigation({
      navbar: {
        ...navigation.navbar,
        links: [...navigation.navbar.links, newLink],
      },
    });
  };

  const updateNavLink = (index: number, link: Partial<NavLink>) => {
    const links = navigation.navbar.links.map((l, i) =>
      i === index ? { ...l, ...link } : l
    );
    updateNavigation({ navbar: { ...navigation.navbar, links } });
  };

  const removeNavLink = (index: number) => {
    updateNavigation({
      navbar: {
        ...navigation.navbar,
        links: navigation.navbar.links.filter((_, i) => i !== index),
      },
    });
  };

  const addCta = () => {
    // Limit to 2 CTAs max (primary + secondary is standard for landing pages)
    if (navigation.navbar.cta.length >= 2) return;

    const newCta: NavCta = {
      label: "Button",
      target: "/signup",
      style: navigation.navbar.cta.length === 0 ? "primary" : "secondary",
    };
    updateNavigation({
      navbar: {
        ...navigation.navbar,
        cta: [...navigation.navbar.cta, newCta],
      },
    });
  };

  const updateCta = (index: number, cta: Partial<NavCta>) => {
    const ctas = navigation.navbar.cta.map((c, i) =>
      i === index ? { ...c, ...cta } : c
    );
    updateNavigation({ navbar: { ...navigation.navbar, cta: ctas } });
  };

  const removeCta = (index: number) => {
    updateNavigation({
      navbar: {
        ...navigation.navbar,
        cta: navigation.navbar.cta.filter((_, i) => i !== index),
      },
    });
  };

  const addFooterColumn = () => {
    const newColumn: FooterColumn = {
      heading: "Column",
      links: [],
    };
    updateNavigation({
      footer: {
        ...navigation.footer,
        columns: [...navigation.footer.columns, newColumn],
      },
    });
  };

  const updateFooterColumn = (index: number, column: Partial<FooterColumn>) => {
    const columns = navigation.footer.columns.map((c, i) =>
      i === index ? { ...c, ...column } : c
    );
    updateNavigation({ footer: { ...navigation.footer, columns } });
  };

  const removeFooterColumn = (index: number) => {
    updateNavigation({
      footer: {
        ...navigation.footer,
        columns: navigation.footer.columns.filter((_, i) => i !== index),
      },
    });
  };

  const addColumnLink = (columnIndex: number) => {
    const columns = navigation.footer.columns.map((col, i) =>
      i === columnIndex
        ? { ...col, links: [...col.links, { label: "New Link", target: "/" }] }
        : col
    );
    updateNavigation({ footer: { ...navigation.footer, columns } });
  };

  const updateColumnLink = (
    columnIndex: number,
    linkIndex: number,
    link: { label: string; target: string }
  ) => {
    const columns = navigation.footer.columns.map((col, i) =>
      i === columnIndex
        ? {
            ...col,
            links: col.links.map((l, j) => (j === linkIndex ? link : l)),
          }
        : col
    );
    updateNavigation({ footer: { ...navigation.footer, columns } });
  };

  const removeColumnLink = (columnIndex: number, linkIndex: number) => {
    const columns = navigation.footer.columns.map((col, i) =>
      i === columnIndex
        ? { ...col, links: col.links.filter((_, j) => j !== linkIndex) }
        : col
    );
    updateNavigation({ footer: { ...navigation.footer, columns } });
  };

  const toggleSocial = (platform: string) => {
    const existing = navigation.footer.social.find((s) => s.platform === platform);
    if (existing) {
      updateNavigation({
        footer: {
          ...navigation.footer,
          social: navigation.footer.social.filter((s) => s.platform !== platform),
        },
      });
    } else {
      updateNavigation({
        footer: {
          ...navigation.footer,
          social: [...navigation.footer.social, { platform, url: "" }],
        },
      });
    }
  };

  const updateSocialUrl = (platform: string, url: string) => {
    updateNavigation({
      footer: {
        ...navigation.footer,
        social: navigation.footer.social.map((s) =>
          s.platform === platform ? { ...s, url } : s
        ),
      },
    });
  };

  return (
    <OnboardingShell
      stepIndex={5}
      title="Configure navigation"
      description="Set up your navbar and footer. These will appear on every page."
      preview={<NavigationPreview navigation={navigation} />}
    >
      <Tabs defaultValue="navbar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="navbar">Navbar</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="navbar" className="space-y-6 mt-6">
          {/* Navbar Layout Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Navbar Layout</Label>
            <p className="text-sm text-muted-foreground">
              Choose a layout style for your navigation bar
            </p>
            <div className="grid grid-cols-2 gap-3">
              {NAVBAR_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() =>
                    updateNavigation({
                      navbar: { ...navigation.navbar, layout: layout.id },
                    })
                  }
                  className={cn(
                    "p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50",
                    navigation.navbar.layout === layout.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  {/* Mini visual preview */}
                  <div className="mb-3 p-2 bg-muted/50 rounded border h-12 flex items-center justify-between text-[8px]">
                    {layout.id === "logo-left-links-right" && (
                      <>
                        <div className="w-8 h-3 bg-primary/60 rounded" />
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-2 bg-muted-foreground/30 rounded" />
                          <div className="w-4 h-2 bg-muted-foreground/30 rounded" />
                          <div className="w-6 h-3 bg-primary rounded" />
                        </div>
                      </>
                    )}
                    {layout.id === "logo-center-links-sides" && (
                      <>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 bg-muted-foreground/30 rounded" />
                          <div className="w-4 h-2 bg-muted-foreground/30 rounded" />
                        </div>
                        <div className="w-8 h-3 bg-primary/60 rounded" />
                        <div className="w-6 h-3 bg-primary rounded" />
                      </>
                    )}
                    {layout.id === "logo-left-links-center" && (
                      <>
                        <div className="w-8 h-3 bg-primary/60 rounded" />
                        <div className="flex gap-1">
                          <div className="w-4 h-2 bg-muted-foreground/30 rounded" />
                          <div className="w-4 h-2 bg-muted-foreground/30 rounded" />
                        </div>
                        <div className="w-6 h-3 bg-primary rounded" />
                      </>
                    )}
                    {layout.id === "minimal" && (
                      <>
                        <div className="w-8 h-3 bg-primary/60 rounded" />
                        <div className="w-6 h-3 bg-primary rounded" />
                      </>
                    )}
                  </div>
                  <div className="font-medium text-sm">{layout.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {layout.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Logo</Label>
            <p className="text-sm text-muted-foreground">
              Upload your logo image. Recommended: PNG or SVG, max height 40-60px, transparent background.
            </p>

            {navigation.navbar.logo.imagePath ? (
              <div className="relative inline-block border rounded-lg p-4 bg-muted/20">
                <img
                  src={navigation.navbar.logo.imagePath}
                  alt="Logo"
                  className="h-12 max-w-[200px] object-contain"
                />
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  isUploadingLogo
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isUploadingLogo ? "Uploading..." : "Click to upload your logo"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, SVG, or JPG • Max 2MB • Recommended height: 40-60px
                </p>
              </div>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Navigation Links</Label>
            <div className="space-y-2">
              {navigation.navbar.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Input
                    value={link.label}
                    onChange={(e) => updateNavLink(index, { label: e.target.value })}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={link.target}
                    onChange={(e) => updateNavLink(index, { target: e.target.value })}
                    placeholder="Target"
                    className="flex-1"
                  />
                  <Select
                    value={link.type}
                    onValueChange={(value: "internal" | "external" | "anchor") =>
                      updateNavLink(index, { type: value })
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="anchor">Anchor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNavLink(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addNavLink} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Label className="text-base font-medium">CTA Buttons</Label>
            <div className="space-y-2">
              {navigation.navbar.cta.map((cta, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={cta.label}
                    onChange={(e) => updateCta(index, { label: e.target.value })}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={cta.target}
                    onChange={(e) => updateCta(index, { target: e.target.value })}
                    placeholder="Target"
                    className="flex-1"
                  />
                  <Select
                    value={cta.style}
                    onValueChange={(value: "primary" | "secondary") =>
                      updateCta(index, { style: value })
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCta(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {navigation.navbar.cta.length < 2 && (
                <Button variant="outline" onClick={addCta} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add CTA
                </Button>
              )}
              {navigation.navbar.cta.length >= 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  Maximum 2 CTA buttons (primary + secondary is standard for landing pages)
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6 mt-6">
          {/* Footer Layout Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Footer Layout</Label>
            <p className="text-sm text-muted-foreground">
              Choose a layout style for your footer
            </p>
            <div className="grid grid-cols-2 gap-3">
              {FOOTER_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() =>
                    updateNavigation({
                      footer: { ...navigation.footer, layout: layout.id },
                    })
                  }
                  className={cn(
                    "p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50",
                    navigation.footer.layout === layout.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  {/* Mini visual preview */}
                  <div className="mb-3 p-2 bg-muted/50 rounded border h-16 flex flex-col justify-between text-[8px]">
                    {layout.id === "columns-simple" && (
                      <>
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <div className="w-6 h-1.5 bg-muted-foreground/40 rounded" />
                            <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                            <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                          </div>
                          <div className="space-y-1">
                            <div className="w-6 h-1.5 bg-muted-foreground/40 rounded" />
                            <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                            <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                          </div>
                          <div className="space-y-1">
                            <div className="w-6 h-1.5 bg-muted-foreground/40 rounded" />
                            <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-muted-foreground/10">
                          <div className="w-10 h-1 bg-muted-foreground/20 rounded" />
                          <div className="flex gap-0.5">
                            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                          </div>
                        </div>
                      </>
                    )}
                    {layout.id === "columns-with-logo" && (
                      <>
                        <div className="flex gap-4">
                          <div className="space-y-1">
                            <div className="w-8 h-2 bg-primary/60 rounded" />
                            <div className="w-12 h-1 bg-muted-foreground/20 rounded" />
                            <div className="w-10 h-1 bg-muted-foreground/20 rounded" />
                          </div>
                          <div className="flex gap-2">
                            <div className="space-y-1">
                              <div className="w-5 h-1.5 bg-muted-foreground/40 rounded" />
                              <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                            </div>
                            <div className="space-y-1">
                              <div className="w-5 h-1.5 bg-muted-foreground/40 rounded" />
                              <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                            </div>
                          </div>
                        </div>
                        <div className="w-12 h-1 bg-muted-foreground/20 rounded mx-auto" />
                      </>
                    )}
                    {layout.id === "centered-minimal" && (
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <div className="w-8 h-2 bg-primary/60 rounded" />
                        <div className="flex gap-2">
                          <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                          <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                          <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                        </div>
                        <div className="w-16 h-1 bg-muted-foreground/20 rounded" />
                      </div>
                    )}
                    {layout.id === "stacked" && (
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <div className="w-8 h-2 bg-primary/60 rounded" />
                        <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                        <div className="w-4 h-1 bg-muted-foreground/20 rounded" />
                        <div className="flex gap-0.5">
                          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                        </div>
                        <div className="w-12 h-1 bg-muted-foreground/20 rounded" />
                      </div>
                    )}
                  </div>
                  <div className="font-medium text-sm">{layout.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {layout.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Columns */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Footer Columns</Label>
            <div className="space-y-4">
              {navigation.footer.columns.map((column, colIndex) => (
                <div key={colIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={column.heading}
                      onChange={(e) =>
                        updateFooterColumn(colIndex, { heading: e.target.value })
                      }
                      placeholder="Column heading"
                      className="flex-1 font-medium"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFooterColumn(colIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-2 pl-4">
                    {column.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex items-center gap-2">
                        <Input
                          value={link.label}
                          onChange={(e) =>
                            updateColumnLink(colIndex, linkIndex, {
                              ...link,
                              label: e.target.value,
                            })
                          }
                          placeholder="Label"
                          className="flex-1"
                        />
                        <Input
                          value={link.target}
                          onChange={(e) =>
                            updateColumnLink(colIndex, linkIndex, {
                              ...link,
                              target: e.target.value,
                            })
                          }
                          placeholder="Target"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeColumnLink(colIndex, linkIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addColumnLink(colIndex)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addFooterColumn} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Social Links</Label>
            <div className="space-y-3">
              {SOCIAL_PLATFORMS.map((platform) => {
                const social = navigation.footer.social.find(
                  (s) => s.platform === platform.id
                );
                const Icon = platform.icon;
                return (
                  <div key={platform.id} className="flex items-center gap-3">
                    <Switch
                      checked={!!social}
                      onCheckedChange={() => toggleSocial(platform.id)}
                    />
                    <Icon className="h-4 w-4" />
                    <span className="w-20">{platform.name}</span>
                    {social && (
                      <Input
                        value={social.url}
                        onChange={(e) => updateSocialUrl(platform.id, e.target.value)}
                        placeholder={`https://${platform.id}.com/...`}
                        className="flex-1"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Copyright</Label>
            <Input
              value={navigation.footer.copyright}
              onChange={(e) =>
                updateNavigation({
                  footer: { ...navigation.footer, copyright: e.target.value },
                })
              }
              placeholder="© 2024 Your Company. All rights reserved."
            />
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Newsletter Signup</Label>
              <Switch
                checked={navigation.footer.newsletter.enabled}
                onCheckedChange={(enabled) =>
                  updateNavigation({
                    footer: {
                      ...navigation.footer,
                      newsletter: { ...navigation.footer.newsletter, enabled },
                    },
                  })
                }
              />
            </div>
            {navigation.footer.newsletter.enabled && (
              <div className="space-y-3 pl-4">
                <Input
                  value={navigation.footer.newsletter.heading}
                  onChange={(e) =>
                    updateNavigation({
                      footer: {
                        ...navigation.footer,
                        newsletter: {
                          ...navigation.footer.newsletter,
                          heading: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Newsletter heading"
                />
                <Input
                  value={navigation.footer.newsletter.placeholder}
                  onChange={(e) =>
                    updateNavigation({
                      footer: {
                        ...navigation.footer,
                        newsletter: {
                          ...navigation.footer.newsletter,
                          placeholder: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Email placeholder text"
                />
                <Input
                  value={navigation.footer.newsletter.buttonText}
                  onChange={(e) =>
                    updateNavigation({
                      footer: {
                        ...navigation.footer,
                        newsletter: {
                          ...navigation.footer.newsletter,
                          buttonText: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Button text"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </OnboardingShell>
  );
}

function NavigationPreview({
  navigation,
}: {
  navigation: NonNullable<ReturnType<typeof useLandfall>["navigation"]>;
}) {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border">
        <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        </div>

        <div className="min-h-[500px] flex flex-col">
          {/* Navbar Preview */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="font-semibold">{navigation.navbar.logo.value || "Logo"}</div>
            <div className="flex items-center gap-6">
              {navigation.navbar.links.map((link, i) => (
                <span key={i} className="text-sm text-muted-foreground">
                  {link.label}
                </span>
              ))}
              {navigation.navbar.cta.map((cta, i) => (
                <button
                  key={i}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg",
                    cta.style === "primary"
                      ? "bg-primary text-primary-foreground"
                      : "border"
                  )}
                >
                  {cta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Placeholder */}
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Page Content
          </div>

          {/* Footer Preview */}
          <div className="border-t bg-muted/30 p-6">
            <div className="grid grid-cols-4 gap-6 mb-6">
              {navigation.footer.columns.map((column, i) => (
                <div key={i}>
                  <div className="font-medium mb-2 text-sm">{column.heading}</div>
                  <div className="space-y-1">
                    {column.links.map((link, j) => (
                      <div key={j} className="text-sm text-muted-foreground">
                        {link.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {navigation.footer.newsletter.enabled && (
                <div>
                  <div className="font-medium mb-2 text-sm">
                    {navigation.footer.newsletter.heading || "Newsletter"}
                  </div>
                  <div className="flex gap-1">
                    <div className="h-8 flex-1 bg-background border rounded text-xs flex items-center px-2 text-muted-foreground">
                      {navigation.footer.newsletter.placeholder || "Email"}
                    </div>
                    <button className="h-8 px-3 bg-primary text-primary-foreground rounded text-xs">
                      {navigation.footer.newsletter.buttonText || "Subscribe"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                {navigation.footer.copyright || "© 2024 Your Company"}
              </div>
              <div className="flex gap-3">
                {navigation.footer.social.map((social) => {
                  const platform = SOCIAL_PLATFORMS.find(
                    (p) => p.id === social.platform
                  );
                  if (!platform) return null;
                  const Icon = platform.icon;
                  return <Icon key={social.platform} className="h-4 w-4 text-muted-foreground" />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
