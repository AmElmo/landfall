"use client";

import React, { useState } from "react";
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
import { Plus, Trash2, GripVertical, Menu, Twitter, Github, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, NavCta, FooterColumn, SocialLink } from "@/lib/types";

const SOCIAL_PLATFORMS = [
  { id: "twitter", name: "Twitter", icon: Twitter },
  { id: "github", name: "GitHub", icon: Github },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
];

export default function NavigationStep() {
  const { navigation, sitemap, updateNavigation } = useLandfall();

  if (!navigation || !sitemap) return null;

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
    const newCta: NavCta = {
      label: "Button",
      target: "/signup",
      style: "primary",
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
      stepIndex={4}
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
          {/* Logo */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Logo</Label>
            <div className="flex items-center gap-4">
              <Select
                value={navigation.navbar.logo.type}
                onValueChange={(value: "text" | "image") =>
                  updateNavigation({
                    navbar: {
                      ...navigation.navbar,
                      logo: { ...navigation.navbar.logo, type: value },
                    },
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={navigation.navbar.logo.value}
                onChange={(e) =>
                  updateNavigation({
                    navbar: {
                      ...navigation.navbar,
                      logo: { ...navigation.navbar.logo, value: e.target.value },
                    },
                  })
                }
                placeholder={
                  navigation.navbar.logo.type === "text" ? "Logo text" : "Image URL"
                }
                className="flex-1"
              />
            </div>
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
              <Button variant="outline" onClick={addCta} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add CTA
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6 mt-6">
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
