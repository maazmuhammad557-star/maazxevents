import React, { useState, useEffect, useRef } from 'react';
import { 
  CalendarCheck, Save, Upload, Plus, Trash2, Edit3, 
  LogOut, Settings, Image as ImageIcon, FileText, Layers, 
  ChevronRight, Sparkles, X, PlusCircle, CheckCircle, Menu, Check
} from 'lucide-react';
import { SiteContent, ThemeItem } from './types';
import { defaultContent } from './defaultContent';

interface AdminPanelProps {
  onBackToSite: () => void;
  initialContent: SiteContent | null;
}

export default function AdminPanel({ onBackToSite, initialContent }: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'about' | 'why' | 'themes'>('general');
  const [content, setContent] = useState<SiteContent>(() => {
    const raw = initialContent || defaultContent;
    return {
      ...defaultContent,
      ...raw,
      header: { ...defaultContent.header, ...raw.header },
      hero: { ...defaultContent.hero, ...raw.hero },
      whyChooseUs: { ...defaultContent.whyChooseUs, ...raw.whyChooseUs },
      aboutUs: { ...defaultContent.aboutUs, ...raw.aboutUs },
      footer: { ...defaultContent.footer, ...raw.footer },
      themesSection: {
        ...defaultContent.themesSection,
        ...raw.themesSection,
        categories: raw.themesSection?.categories || defaultContent.themesSection.categories,
        subcategories: raw.themesSection?.subcategories || defaultContent.themesSection.subcategories,
        items: raw.themesSection?.items || defaultContent.themesSection.items,
      },
      seo: { ...defaultContent.seo, ...raw.seo },
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Theme Section CRUD State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [formParentCategory, setFormParentCategory] = useState<string>('Wedding');
  const [editingItem, setEditingItem] = useState<ThemeItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subcatInputs, setSubcatInputs] = useState<Record<string, string>>({});
  const [editingSubcat, setEditingSubcat] = useState<{ parent: string; oldName: string; value: string } | null>(null);
  const [editingCat, setEditingCat] = useState<{ oldName: string; value: string } | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<{
    index: number | null;
    name: string;
    role: string;
    quote: string;
    image: string;
  } | null>(null);

  const findParentCategory = (subcat: string): string => {
    for (const [parent, subs] of Object.entries(content.themesSection.subcategories)) {
      if (Array.isArray(subs) && subs.includes(subcat)) return parent;
    }
    return content.themesSection.categories[0] || 'Wedding';
  };

  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  useEffect(() => {
    if (editingItem) {
      const parent = findParentCategory(editingItem.category);
      setFormParentCategory(parent);
    }
  }, [editingItem?.id]);

  // File Upload Ref Hooks
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const faviconUploadRef = useRef<HTMLInputElement>(null);
  const heroBgUploadRef = useRef<HTMLInputElement>(null);
  const beforeUploadRef = useRef<HTMLInputElement>(null);
  const afterUploadRef = useRef<HTMLInputElement>(null);
  const stressFreeUploadRef = useRef<HTMLInputElement>(null);
  const floralArchUploadRef = useRef<HTMLInputElement>(null);
  const aboutImage1UploadRef = useRef<HTMLInputElement>(null);
  const aboutImage2UploadRef = useRef<HTMLInputElement>(null);
  const themeItemImageUploadRef = useRef<HTMLInputElement>(null);
  const themeItemGalleryUploadRef = useRef<HTMLInputElement>(null);
  const tailoredImagesUploadRef = useRef<HTMLInputElement>(null);
  const testimonialImageUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await parseJson(res);
      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Failed to connect to authentication server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    setPassword('');
  };

  // Safely parse a fetch response as JSON, falling back to its raw text
  const parseJson = async (res: Response): Promise<any> => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: text || `Request failed (${res.status})` };
    }
  };

  // Helper function to upload an image to Vercel Blob
  const uploadImageFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem('admin_token');
    if (!token) throw new Error('Unauthorized');

    if (file.size > 4.5 * 1024 * 1024) {
      throw new Error(`Image too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please upload under 4 MB.`);
    }

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-File-Name': file.name,
        'Content-Type': file.type,
      },
      body: file,
    });
    
    if (!res.ok) {
      const errData = await parseJson(res);
      throw new Error(errData.error || 'Upload failed');
    }
    
    const data = await parseJson(res);
    return data.url;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading indicator
    setSaveMessage({ type: 'success', text: `Uploading ${file.name}...` });

    try {
      const url = await uploadImageFile(file);
      
      // Update state path dynamically
      const keys = path.split('.');
      setContent((prev: any) => {
        const updated = JSON.parse(JSON.stringify(prev));
        let temp = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          temp = temp[keys[i]];
        }
        temp[keys[keys.length - 1]] = url;
        return updated;
      });

      setSaveMessage({ type: 'success', text: 'Image uploaded successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Image upload failed' });
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setSaveMessage({ type: 'error', text: 'Unauthorized. Please log in again.' });
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await parseJson(res);
      if (res.ok && data.success) {
        setSaveMessage({ type: 'success', text: 'All changes saved and live successfully!' });
        // Refresh site content cached version on CDN by appending timestamp
        window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: content }));
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save changes.' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: 'Failed to connect to saving server.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // State text edits utility
  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let temp = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        temp = temp[keys[i]];
      }
      temp[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  // CRUD Helpers for Themes
  const saveThemeItem = async (item: ThemeItem) => {
    setContent((prev) => {
      const updated = { ...prev };
      const index = updated.themesSection.items.findIndex((x) => x.id === item.id);
      if (index > -1) {
        updated.themesSection.items[index] = item;
      } else {
        updated.themesSection.items.push(item);
      }
      return updated;
    });
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const deleteThemeItem = (id: number) => {
    if (window.confirm('Are you sure you want to delete this theme setup?')) {
      setContent((prev) => {
        const updated = { ...prev };
        updated.themesSection.items = updated.themesSection.items.filter((x) => x.id !== id);
        return updated;
      });
    }
  };

  // CRUD Helpers for Testimonials
  const saveTestimonial = () => {
    if (!editingTestimonial) return;
    const { index, name, role, quote, image } = editingTestimonial;
    if (!name.trim()) {
      setSaveMessage({ type: 'error', text: 'Testimonial name cannot be empty.' });
      return;
    }
    const entry = { name: name.trim(), role: role.trim(), quote: quote.trim() || undefined, image: image.trim() || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' };
    setContent((prev) => {
      const updated = { ...prev };
      const testimonials = [...prev.whyChooseUs.testimonials];
      if (index !== null) {
        testimonials[index] = entry;
      } else {
        testimonials.push(entry);
      }
      updated.whyChooseUs = { ...prev.whyChooseUs, testimonials };
      return updated;
    });
    setEditingTestimonial(null);
    setSaveMessage({ type: 'success', text: index !== null ? 'Testimonial updated!' : 'Testimonial added!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const deleteTestimonial = (index: number) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setContent((prev) => {
      const updated = { ...prev };
      updated.whyChooseUs = {
        ...prev.whyChooseUs,
        testimonials: prev.whyChooseUs.testimonials.filter((_, i) => i !== index),
      };
      return updated;
    });
    if (editingTestimonial?.index === index) setEditingTestimonial(null);
    setSaveMessage({ type: 'success', text: 'Testimonial deleted.' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const addNewThemeItem = () => {
    const newId = content.themesSection.items.length > 0 
      ? Math.max(...content.themesSection.items.map(x => x.id)) + 1 
      : 1;

    const defaultParent = content.themesSection.categories[0] || 'Wedding';
    const defaultSub = content.themesSection.subcategories[defaultParent]?.[0] || 'Bridal Shower';

    setEditingItem({
      id: newId,
      title: 'New Event Setup Design',
      category: defaultSub,
      price: 'Rs 25,000',
      actualPrice: 'Rs 20,000',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
      gallery: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800'],
      description: 'Setup details go here...',
      attributes: [
        { label: 'Setup Time', value: '3-4 Hours before event' },
        { label: 'Space Required', value: 'Minimum 15x15 ft area' },
        { label: 'Included', value: 'Backdrop, stage seating, lighting, props' }
      ]
    });
    setIsAddingNew(true);
  };

  // CRUD Helpers for Categories / Subcategories
  const addSubcategory = (parent: string, rawName: string) => {
    const name = rawName.trim();
    if (!name) {
      setSaveMessage({ type: 'error', text: 'Subcategory name cannot be empty.' });
      return;
    }
    const existing = content.themesSection.subcategories[parent] || [];
    if (existing.some((s) => s.toLowerCase() === name.toLowerCase())) {
      setSaveMessage({ type: 'error', text: `"${name}" already exists in ${parent}.` });
      return;
    }
    setContent((prev) => {
      const updated = { ...prev, themesSection: { ...prev.themesSection } };
      updated.themesSection.subcategories = {
        ...prev.themesSection.subcategories,
        [parent]: [...existing, name],
      };
      return updated;
    });
    setSaveMessage({ type: 'success', text: `Subcategory "${name}" added to ${parent}.` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const renameCategory = (oldName: string, rawName: string) => {
    const name = rawName.trim();
    if (!name) {
      setSaveMessage({ type: 'error', text: 'Category name cannot be empty.' });
      return;
    }
    if (name === oldName) {
      setEditingCat(null);
      return;
    }
    if (content.themesSection.categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setSaveMessage({ type: 'error', text: `"${name}" already exists as a category.` });
      return;
    }
    setContent((prev) => {
      const updated = { ...prev, themesSection: { ...prev.themesSection } };
      updated.themesSection.categories = prev.themesSection.categories.map((c) =>
        c === oldName ? name : c
      );
      const subs = prev.themesSection.subcategories[oldName] || [];
      const { [oldName]: _removed, ...rest } = prev.themesSection.subcategories;
      updated.themesSection.subcategories = { ...rest, [name]: subs };
      return updated;
    });
    if (selectedCategory === oldName) setSelectedCategory(name);
    setEditingCat(null);
    setSaveMessage({ type: 'success', text: `Renamed category "${oldName}" to "${name}".` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const renameSubcategory = (parent: string, oldName: string, rawName: string) => {
    const name = rawName.trim();
    if (!name) {
      setSaveMessage({ type: 'error', text: 'Subcategory name cannot be empty.' });
      return;
    }
    if (name === oldName) {
      setEditingSubcat(null);
      return;
    }
    const existing = content.themesSection.subcategories[parent] || [];
    if (existing.some((s) => s.toLowerCase() === name.toLowerCase())) {
      setSaveMessage({ type: 'error', text: `"${name}" already exists in ${parent}.` });
      return;
    }
    setContent((prev) => {
      const updated = { ...prev, themesSection: { ...prev.themesSection } };
      const subs = (updated.themesSection.subcategories[parent] || []).map((s) =>
        s === oldName ? name : s
      );
      updated.themesSection.subcategories = {
        ...prev.themesSection.subcategories,
        [parent]: subs,
      };
      updated.themesSection.items = updated.themesSection.items.map((item) =>
        item.category === oldName ? { ...item, category: name } : item
      );
      return updated;
    });
    if (selectedSubcategory === oldName) setSelectedSubcategory('All');
    setEditingSubcat(null);
    setSaveMessage({ type: 'success', text: `Renamed "${oldName}" to "${name}".` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const deleteSubcategory = (parent: string, name: string) => {
    const itemCount = content.themesSection.items.filter((i) => i.category === name).length;
    if (!window.confirm(`Delete subcategory "${name}" and ALL its theme setups${itemCount > 0 ? ` (${itemCount} items)` : ''}?`)) return;
    setContent((prev) => {
      const updated = { ...prev, themesSection: { ...prev.themesSection } };
      const subs = (prev.themesSection.subcategories[parent] || []).filter((s) => s !== name);
      updated.themesSection.subcategories = {
        ...prev.themesSection.subcategories,
        [parent]: subs,
      };
      updated.themesSection.items = prev.themesSection.items.filter((item) => item.category !== name);
      return updated;
    });
    if (selectedSubcategory === name) setSelectedSubcategory('All');
    if (editingSubcat?.oldName === name) setEditingSubcat(null);
    setSaveMessage({ type: 'success', text: `Subcategory "${name}" and its setups deleted.` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDF7EF] flex flex-col justify-center items-center px-4 font-sans selection:bg-[#6A665A] selection:text-white">
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 shadow-xl border border-[#EAE4D9] transition-all duration-300">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="MaazXevents Logo" className="h-12 w-auto mb-4" />
            <h1 className="text-xl font-semibold text-[#2C2A26]">CMS Administration</h1>
            <p className="text-xs text-[#8A867A] mt-1">Please enter password to access panel</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C584E] mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#EAE4D9] focus:outline-none focus:ring-2 focus:ring-[#6A665A] text-sm text-[#2C2A26]"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#6A665A] hover:bg-[#5C584E] transition rounded-xl text-white font-medium text-sm shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <button
            onClick={onBackToSite}
            className="w-full text-center text-xs font-semibold text-[#8A867A] hover:text-[#5C584E] mt-6 transition"
          >
            ← Return to Live Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#5C584E] flex font-sans selection:bg-[#6A665A] selection:text-white">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Dark Sidebar (Tabela Inspired) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] max-w-[85vw] bg-[#1E1B18] text-white flex flex-col justify-between shrink-0 border-r border-[#2C2A26] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Top Brand Logo */}
          <div className="p-6 border-b border-[#2C2A26] flex items-center justify-between">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto filter brightness-0 invert opacity-90" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-[#8E8A82] transition cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Menu Tabs */}
          <div className="flex-1 py-6 px-4 flex flex-col gap-1.5">
            <p className="text-[9px] font-bold text-[#8E8A82] uppercase tracking-wider px-3 mb-2">Sections</p>
            
            <button
              onClick={() => { setActiveTab('general'); setEditingItem(null); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'general' 
                  ? 'bg-[#343029] text-[#E7E2D8] shadow-md border-l-4 border-[#C8C2B7]' 
                  : 'text-[#8E8A82] hover:bg-white/5 hover:text-[#E7E2D8]'
              }`}
            >
              <Settings size={15} />
              General Branding
            </button>

            <button
              onClick={() => { setActiveTab('hero'); setEditingItem(null); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'hero' 
                  ? 'bg-[#343029] text-[#E7E2D8] shadow-md border-l-4 border-[#C8C2B7]' 
                  : 'text-[#8E8A82] hover:bg-white/5 hover:text-[#E7E2D8]'
              }`}
            >
              <Sparkles size={15} />
              Hero Section
            </button>

            <button
              onClick={() => { setActiveTab('why'); setEditingItem(null); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'why' 
                  ? 'bg-[#343029] text-[#E7E2D8] shadow-md border-l-4 border-[#C8C2B7]' 
                  : 'text-[#8E8A82] hover:bg-white/5 hover:text-[#E7E2D8]'
              }`}
            >
              <Layers size={15} />
              Why Choose Us
            </button>

            <button
              onClick={() => { setActiveTab('about'); setEditingItem(null); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'about' 
                  ? 'bg-[#343029] text-[#E7E2D8] shadow-md border-l-4 border-[#C8C2B7]' 
                  : 'text-[#8E8A82] hover:bg-white/5 hover:text-[#E7E2D8]'
              }`}
            >
              <FileText size={15} />
              About Studio
            </button>

            <button
              onClick={() => { setActiveTab('themes'); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'themes' 
                  ? 'bg-[#343029] text-[#E7E2D8] shadow-md border-l-4 border-[#C8C2B7]' 
                  : 'text-[#8E8A82] hover:bg-white/5 hover:text-[#E7E2D8]'
              }`}
            >
              <Layers size={15} />
              Themes & Catalog
            </button>
          </div>
        </div>

        {/* Bottom Profile and Log Out */}
        <div className="flex flex-col border-t border-[#2C2A26]">
          <button
            onClick={handleLogout}
            className="w-full text-left px-7 py-4.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-white/5 transition flex items-center gap-3 cursor-pointer"
          >
            <LogOut size={15} />
            Log Out
          </button>
          
          <div className="p-4 border-t border-[#2C2A26] flex items-center gap-3 bg-[#171513]">
            <div className="h-9 w-9 rounded-full bg-[#343029] border border-[#484339] flex items-center justify-center font-bold text-xs text-[#E7E2D8]">
              MK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Maaz Khan</p>
              <p className="text-[10px] text-[#8E8A82] truncate">CMS Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Content Area (Forms viewport) */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Content Header (Top Action Bar) */}
        <header className="sticky top-0 bg-[#FDF7EF]/95 backdrop-blur-md border-b border-[#EAE4D9]/80 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between gap-3 z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-black/5 text-[#5C584E] transition cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-serif font-bold text-[#2C2A26] leading-none truncate">
                {activeTab === 'general' && 'General Branding'}
                {activeTab === 'hero' && 'Hero Billboard Section'}
                {activeTab === 'why' && 'Why Choose Us Section'}
                {activeTab === 'about' && 'About Studio narrative'}
                {activeTab === 'themes' && 'Themes & Catalog Manager'}
              </h1>
              <p className="text-[10px] text-[#8A867A] mt-1.5 hidden sm:block">Manage live content, text edits, and asset uploads</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => window.open('/', '_blank')}
              className="hidden sm:flex px-4 py-2 hover:bg-black/5 border border-[#EAE4D9] rounded-xl text-xs font-bold text-[#5C584E] transition cursor-pointer"
            >
              Preview Site
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#6A665A] hover:bg-[#5C584E] text-white px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
            </button>
          </div>
        </header>

        {/* Save Notification Toast */}
        {saveMessage && (
          <div className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:top-24 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-medium animate-bounce ${
            saveMessage.type === 'success' ? 'bg-[#FDF7EF] text-[#6A665A] border-[#EAE4D9]' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {saveMessage.type === 'success' && <CheckCircle size={18} />}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Scrollable Form Panel canvas */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-serif text-[#2C2A26] font-semibold mb-1">General Branding</h2>
                <p className="text-xs text-[#8A867A]">Edit navigation, logo, and core links</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#F1EFEC]">
                {/* Logo Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#5C584E]">Branding Logo</label>
                  <div className="flex items-center gap-4 border border-[#EAE4D9] p-4 rounded-2xl bg-[#FDF7EF]/40">
                    <img src={content.header.logo} alt="Logo Preview" className="h-10 w-auto object-contain bg-black/5 p-2 rounded-lg" />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={logoUploadRef}
                        onChange={(e) => handleFileUpload(e, 'header.logo')}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoUploadRef.current?.click()}
                        className="flex items-center gap-1.5 bg-white border border-[#EAE4D9] px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-[#FDF7EF] transition shadow-sm cursor-pointer"
                      >
                        <Upload size={14} />
                        Replace Logo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Booking & Social Fields */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">WhatsApp Contact Number</label>
                    <input
                      type="text"
                      value={content.header.phone}
                      onChange={(e) => updateField('header.phone', e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">WhatsApp Direct Link URL</label>
                    <input
                      type="text"
                      value={content.header.bookAppointmentUrl}
                      onChange={(e) => updateField('header.bookAppointmentUrl', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#F1EFEC]">
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Footer Address</label>
                    <input
                      type="text"
                      value={content.footer.location}
                      onChange={(e) => updateField('footer.location', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Footer Phone</label>
                    <input
                      type="text"
                      value={content.footer.phone}
                      onChange={(e) => updateField('footer.phone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Footer Contact Email</label>
                    <input
                      type="text"
                      value={content.footer.email}
                      onChange={(e) => updateField('footer.email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                </div>

                {/* Footer Text Copy */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#5C584E] mb-2">Footer Description</label>
                  <textarea
                    value={content.footer.description}
                    onChange={(e) => updateField('footer.description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                  />
                </div>

                {/* Social Media Links */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#F1EFEC]">
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Facebook Page Link</label>
                    <input
                      type="text"
                      value={content.footer.facebookUrl}
                      onChange={(e) => updateField('footer.facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Instagram Profile Link</label>
                    <input
                      type="text"
                      value={content.footer.instagramUrl}
                      onChange={(e) => updateField('footer.instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">TikTok Profile Link</label>
                    <input
                      type="text"
                      value={content.footer.tiktokUrl || ''}
                      onChange={(e) => updateField('footer.tiktokUrl', e.target.value)}
                      placeholder="https://tiktok.com/@..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                </div>

                {/* Google Search & SEO Settings */}
                <div className="md:col-span-2 pt-6 mt-6 border-t border-[#F1EFEC] flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-serif text-[#2C2A26] font-semibold mb-1">Google Search & SEO Settings</h3>
                    <p className="text-xs text-[#8A867A]">Manage how your business appears on Google Search results and browser tabs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SEO Title & Description */}
                    <div className="md:col-span-2 flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#5C584E] mb-2">Search Engine Title (Google Title)</label>
                        <input
                          type="text"
                          value={content.seo?.metaTitle || ''}
                          onChange={(e) => updateField('seo.metaTitle', e.target.value)}
                          placeholder="Maazx Events"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                        />
                        <p className="text-[10px] text-[#8A867A] mt-1">Recommended: Under 60 characters. Shows up as the clickable link on Google.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#5C584E] mb-2">Search Engine Description (Google Description)</label>
                        <textarea
                          value={content.seo?.metaDescription || ''}
                          onChange={(e) => updateField('seo.metaDescription', e.target.value)}
                          placeholder="Premium event and birthday decoration studio crafting Instagram-worthy celebrations."
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                        />
                        <p className="text-[10px] text-[#8A867A] mt-1">Recommended: Under 160 characters. Shows up as the description snippet below your link on Google.</p>
                      </div>
                    </div>

                    {/* Google Favicon Logo Upload */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[#5C584E]">Google Logo / Browser Favicon</label>
                      <div className="border border-[#EAE4D9] rounded-2xl overflow-hidden shadow-inner bg-black/5 relative aspect-square flex flex-col justify-end p-4">
                        <img 
                          src={content.seo?.favicon || content.header.logo || '/logo.png'} 
                          alt="Favicon Preview" 
                          className="absolute inset-0 m-auto h-20 w-20 object-contain p-2 bg-white rounded-xl shadow-md z-0" 
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={faviconUploadRef}
                          onChange={(e) => handleFileUpload(e, 'seo.favicon')}
                          className="hidden"
                        />
                        <button
                          onClick={() => faviconUploadRef.current?.click()}
                          className="relative z-10 flex items-center justify-center gap-1.5 bg-black/60 hover:bg-black/80 text-white w-full py-2.5 rounded-xl text-xs font-medium backdrop-blur-sm transition cursor-pointer"
                        >
                          <Upload size={14} />
                          Upload New Favicon
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8A867A] mt-1 text-center">Google displays a 1:1 square icon next to your site in search results.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO */}
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-serif text-[#2C2A26] font-semibold mb-1">Hero Section Settings</h2>
                <p className="text-xs text-[#8A867A]">Configure top billboard copy, background, and tags</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-[#F1EFEC]">
                {/* Text Fields */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Hero Main Heading (Use \n for line breaks)</label>
                    <textarea
                      value={content.hero.title}
                      onChange={(e) => updateField('hero.title', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Hero Description Paragraph</label>
                    <textarea
                      value={content.hero.subtitle}
                      onChange={(e) => updateField('hero.subtitle', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Design Explore Link Text</label>
                    <input
                      type="text"
                      value={content.hero.exploreButtonText}
                      onChange={(e) => updateField('hero.exploreButtonText', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#5C584E]">Hero Billboard Background</label>
                  <div className="border border-[#EAE4D9] rounded-2xl overflow-hidden shadow-inner bg-black/5 relative aspect-[4/3] flex flex-col justify-end p-4">
                    <img src={content.hero.bgImage} alt="Hero BG Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                    <input
                      type="file"
                      accept="image/*"
                      ref={heroBgUploadRef}
                      onChange={(e) => handleFileUpload(e, 'hero.bgImage')}
                      className="hidden"
                    />
                    <button
                      onClick={() => heroBgUploadRef.current?.click()}
                      className="relative z-10 flex items-center justify-center gap-1.5 bg-black/60 hover:bg-black/80 text-white w-full py-2.5 rounded-xl text-xs font-medium backdrop-blur-sm transition cursor-pointer"
                    >
                      <Upload size={14} />
                      Upload New Background
                    </button>
                  </div>
                </div>

                {/* Radial Glass Tags */}
                <div className="lg:col-span-3 pt-6 border-t border-[#F1EFEC]">
                  <label className="block text-xs font-bold text-[#5C584E] mb-3">Radial Menu Items (Arcs)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {content.hero.radialItems.map((item, idx) => (
                      <div key={idx} className="border border-[#EAE4D9] rounded-xl p-3 bg-[#FDF7EF]/40 flex flex-col gap-2">
                        <span className="text-[10px] text-[#8A867A] font-bold">Arc Item {idx + 1}</span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const copy = [...content.hero.radialItems];
                            copy[idx].title = e.target.value;
                            updateField('hero.radialItems', copy);
                          }}
                          className="px-2 py-1.5 border border-[#EAE4D9] rounded-lg text-xs"
                        />
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-[#8A867A]">Angle:</span>
                          <span className="font-semibold">{item.angle}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHY CHOOSE US */}
          {activeTab === 'why' && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-serif text-[#2C2A26] font-semibold mb-1">Why Choose Us Section</h2>
                <p className="text-xs text-[#8A867A]">Manage before/after slider images and reviews</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#F1EFEC]">
                {/* Header text */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Section Tag</label>
                    <input
                      type="text"
                      value={content.whyChooseUs.sectionTag}
                      onChange={(e) => updateField('whyChooseUs.sectionTag', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Tailored Vision Details</label>
                    <textarea
                      value={content.whyChooseUs.tailoredDesc}
                      onChange={(e) => updateField('whyChooseUs.tailoredDesc', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                </div>

                {/* Slider & Stress-Free Text */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[#F1EFEC]">
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Slider Title (Before / After block)</label>
                    <input
                      type="text"
                      value={content.whyChooseUs.sliderTitle}
                      onChange={(e) => updateField('whyChooseUs.sliderTitle', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Slider Sub Text</label>
                    <input
                      type="text"
                      value={content.whyChooseUs.sliderSub}
                      onChange={(e) => updateField('whyChooseUs.sliderSub', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Stress-Free Planning Title</label>
                    <input
                      type="text"
                      value={content.whyChooseUs.stressFreeTitle}
                      onChange={(e) => updateField('whyChooseUs.stressFreeTitle', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                </div>

                {/* Tailored Avatars & Floral Arch */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#F1EFEC]">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5C584E]">Tailored Avatar Images ({content.whyChooseUs.tailoredImages.length})</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {content.whyChooseUs.tailoredImages.map((url, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-full overflow-hidden border border-[#EAE4D9] group">
                          <img src={url} alt="Tailored avatar" className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              const copy = content.whyChooseUs.tailoredImages.filter((_, i) => i !== idx);
                              updateField('whyChooseUs.tailoredImages', copy);
                            }}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Remove avatar"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <div className="w-24 h-24 rounded-full border border-dashed border-[#EAE4D9] flex items-center justify-center bg-[#FDF7EF]/40 hover:bg-[#FDF7EF] transition cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          ref={tailoredImagesUploadRef}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSaveMessage({ type: 'success', text: 'Uploading avatar...' });
                            try {
                              const url = await uploadImageFile(file);
                              updateField('whyChooseUs.tailoredImages', [...content.whyChooseUs.tailoredImages, url]);
                              setSaveMessage({ type: 'success', text: 'Avatar added!' });
                              setTimeout(() => setSaveMessage(null), 3000);
                            } catch (err: any) {
                              setSaveMessage({ type: 'error', text: err.message });
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          onClick={() => tailoredImagesUploadRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center text-[#8A867A] hover:text-[#5C584E] transition"
                          title="Add avatar"
                        >
                          <PlusCircle size={16} />
                          <span className="text-[9px] mt-1 font-bold">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5C584E]">Floral Arch Image (elegant decor photo)</label>
                    <div className="border border-[#EAE4D9] rounded-2xl overflow-hidden relative aspect-[16/9] flex flex-col justify-end p-3">
                      <img src={content.whyChooseUs.floralArchImage} alt="Floral Arch" className="absolute inset-0 w-full h-full object-cover z-0" />
                      <input
                        type="file"
                        accept="image/*"
                        ref={floralArchUploadRef}
                        onChange={(e) => handleFileUpload(e, 'whyChooseUs.floralArchImage')}
                        className="hidden"
                      />
                      <button
                        onClick={() => floralArchUploadRef.current?.click()}
                        className="relative z-10 w-full py-2 bg-black/60 hover:bg-black/85 text-white rounded-xl text-[10px] font-medium backdrop-blur-sm cursor-pointer"
                      >
                        Change Floral Arch
                      </button>
                    </div>
                  </div>
                </div>

                {/* Setups Count & Reviews Stats */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#F1EFEC]">
                  <div>
                    <h3 className="text-sm font-serif font-semibold text-[#2C2A26] mb-3">Setups Count Card</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Big Number (e.g. 20+)</label>
                        <input
                          type="text"
                          value={content.whyChooseUs.setupsCountValue}
                          onChange={(e) => updateField('whyChooseUs.setupsCountValue', e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Sub Text</label>
                        <input
                          type="text"
                          value={content.whyChooseUs.setupsCountSub}
                          onChange={(e) => updateField('whyChooseUs.setupsCountSub', e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={content.whyChooseUs.setupsCountBadge}
                          onChange={(e) => updateField('whyChooseUs.setupsCountBadge', e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Background Text</label>
                        <input
                          type="text"
                          value={content.whyChooseUs.setupsCountBgText}
                          onChange={(e) => updateField('whyChooseUs.setupsCountBgText', e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-serif font-semibold text-[#2C2A26] mb-3">Reviews Rating Card</h3>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Rating Text (e.g. 99%)</label>
                        <input
                          type="text"
                          value={content.whyChooseUs.reviewsRatingText}
                          onChange={(e) => updateField('whyChooseUs.reviewsRatingText', e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Sub Text (e.g. 2k+ trusted customers)</label>
                        <input
                          type="text"
                          value={content.whyChooseUs.reviewsSubText}
                          onChange={(e) => updateField('whyChooseUs.reviewsSubText', e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonials Manager */}
                <div className="md:col-span-3 pt-6 border-t border-[#F1EFEC] flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-serif font-semibold text-[#2C2A26]">Testimonials / Reviews Manager</h3>
                      <p className="text-[10px] text-[#8A867A] mt-0.5">Add, edit, or remove customer reviews shown in the ratings card</p>
                    </div>
                    {!editingTestimonial && (
                      <button
                        onClick={() => setEditingTestimonial({
                          index: null,
                          name: '',
                          role: '',
                          quote: '',
                          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
                        })}
                        className="flex items-center justify-center gap-1.5 bg-[#6A665A] hover:bg-[#5C584E] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                      >
                        <Plus size={14} />
                        Add Testimonial
                      </button>
                    )}
                  </div>

                  {editingTestimonial ? (
                    <div className="border border-[#EAE4D9] rounded-2xl bg-white p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[#2C2A26]">
                          {editingTestimonial.index === null ? 'New Testimonial' : `Edit Testimonial #${editingTestimonial.index + 1}`}
                        </h4>
                        <button
                          onClick={() => setEditingTestimonial(null)}
                          className="text-[10px] font-bold text-[#8A867A] hover:text-red-500 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Name</label>
                          <input
                            type="text"
                            value={editingTestimonial.name}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                            className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Role / Title</label>
                          <input
                            type="text"
                            value={editingTestimonial.role}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                            className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Quote (optional)</label>
                          <textarea
                            value={editingTestimonial.quote}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                            rows={3}
                            placeholder="Leave empty to show as a simple name-row review"
                            className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-[#8A867A]">Customer Photo</label>
                        <div className="flex items-center gap-4">
                          <img src={editingTestimonial.image} alt="Testimonial photo" className="h-16 w-16 rounded-full object-cover border border-[#EAE4D9]" />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={editingTestimonial.image}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, image: e.target.value })}
                              placeholder="Image URL"
                              className="w-full px-3 py-2 border border-[#EAE4D9] rounded-xl text-sm mb-2"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              ref={testimonialImageUploadRef}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setSaveMessage({ type: 'success', text: 'Uploading photo...' });
                                try {
                                  const url = await uploadImageFile(file);
                                  setEditingTestimonial({ ...editingTestimonial, image: url });
                                  setSaveMessage({ type: 'success', text: 'Photo uploaded!' });
                                  setTimeout(() => setSaveMessage(null), 3000);
                                } catch (err: any) {
                                  setSaveMessage({ type: 'error', text: err.message });
                                }
                              }}
                              className="hidden"
                            />
                            <button
                              onClick={() => testimonialImageUploadRef.current?.click()}
                              className="flex items-center gap-1.5 bg-[#FDF7EF] hover:bg-[#EBE7DF] text-[#6A665A] px-3.5 py-2 rounded-xl text-xs font-medium border border-[#EAE4D9] transition cursor-pointer"
                            >
                              <Upload size={13} />
                              Upload Photo
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={saveTestimonial}
                        className="self-end flex items-center gap-1.5 bg-[#6A665A] hover:bg-[#5C584E] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                      >
                        <Check size={14} />
                        Save Testimonial
                      </button>
                    </div>
                  ) : content.whyChooseUs.testimonials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.whyChooseUs.testimonials.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-3 border border-[#EAE4D9] rounded-2xl p-3.5 bg-[#FDF7EF]/40">
                          <img src={t.image} alt={t.name} className="h-12 w-12 rounded-full object-cover border border-[#EAE4D9]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#2C2A26] truncate">{t.name}</p>
                            <p className="text-[10px] text-[#8A867A] truncate">{t.role}</p>
                            {t.quote && <p className="text-[10px] text-[#6A665A] italic truncate mt-1">"{t.quote}"</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEditingTestimonial({ index: idx, name: t.name, role: t.role, quote: t.quote || '', image: t.image })}
                              className="p-2 hover:bg-white text-[#6A665A] rounded-xl transition border border-transparent hover:border-[#EAE4D9] cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => deleteTestimonial(idx)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition border border-transparent hover:border-red-100 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8A867A] border border-dashed border-[#EAE4D9] rounded-2xl p-6 text-center">
                      No testimonials yet. Click "Add Testimonial" to create one.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT */}
          {activeTab === 'about' && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-serif text-[#2C2A26] font-semibold mb-1">About Us Section</h2>
                <p className="text-xs text-[#8A867A]">Edit company narrative, image collage, and statistics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#F1EFEC]">
                {/* Text Side */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Section Tag</label>
                    <input
                      type="text"
                      value={content.aboutUs.sectionTag}
                      onChange={(e) => updateField('aboutUs.sectionTag', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Section Heading Title</label>
                    <input
                      type="text"
                      value={content.aboutUs.title}
                      onChange={(e) => updateField('aboutUs.title', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Paragraph 1 Copy</label>
                    <textarea
                      value={content.aboutUs.desc1}
                      onChange={(e) => updateField('aboutUs.desc1', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C584E] mb-2">Paragraph 2 Copy</label>
                    <textarea
                      value={content.aboutUs.desc2}
                      onChange={(e) => updateField('aboutUs.desc2', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4D9] text-sm text-[#2C2A26]"
                    />
                  </div>
                </div>

                {/* Images side */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5C584E]">Collage Image 1 (Left)</label>
                    <div className="border border-[#EAE4D9] rounded-2xl overflow-hidden relative aspect-[4/3] flex flex-col justify-end p-3">
                      <img src={content.aboutUs.image1} alt="About 1" className="absolute inset-0 w-full h-full object-cover z-0" />
                      <input
                        type="file"
                        accept="image/*"
                        ref={aboutImage1UploadRef}
                        onChange={(e) => handleFileUpload(e, 'aboutUs.image1')}
                        className="hidden"
                      />
                      <button
                        onClick={() => aboutImage1UploadRef.current?.click()}
                        className="relative z-10 w-full py-2 bg-black/60 hover:bg-black/85 text-white rounded-xl text-[10px] font-medium backdrop-blur-sm cursor-pointer"
                      >
                        Change Image 1
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#5C584E]">Collage Image 2 (Overlapping)</label>
                    <div className="border border-[#EAE4D9] rounded-2xl overflow-hidden relative aspect-[4/3] flex flex-col justify-end p-3">
                      <img src={content.aboutUs.image2} alt="About 2" className="absolute inset-0 w-full h-full object-cover z-0" />
                      <input
                        type="file"
                        accept="image/*"
                        ref={aboutImage2UploadRef}
                        onChange={(e) => handleFileUpload(e, 'aboutUs.image2')}
                        className="hidden"
                      />
                      <button
                        onClick={() => aboutImage2UploadRef.current?.click()}
                        className="relative z-10 w-full py-2 bg-black/60 hover:bg-black/85 text-white rounded-xl text-[10px] font-medium backdrop-blur-sm cursor-pointer"
                      >
                        Change Image 2
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[#F1EFEC]">
                  {content.aboutUs.stats.map((stat, idx) => (
                    <div key={idx} className="flex gap-4 border border-[#EAE4D9] rounded-xl p-4 bg-[#FDF7EF]/40">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Stat {idx + 1} Value</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const copy = [...content.aboutUs.stats];
                            copy[idx].value = e.target.value;
                            updateField('aboutUs.stats', copy);
                          }}
                          className="w-full px-3 py-1.5 border border-[#EAE4D9] rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-[#8A867A] mb-1">Stat {idx + 1} Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const copy = [...content.aboutUs.stats];
                            copy[idx].label = e.target.value;
                            updateField('aboutUs.stats', copy);
                          }}
                          className="w-full px-3 py-1.5 border border-[#EAE4D9] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: THEMES & CATALOG (CRUD) */}
          {activeTab === 'themes' && (
            <div className="flex flex-col gap-6 flex-1">
              {/* EDIT MODE PANEL */}
              {editingItem ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-[#F1EFEC] pb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                        className="p-1 hover:bg-black/5 rounded-lg text-[#6A665A] font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        ← Back to List
                      </button>
                      <h2 className="text-lg font-semibold text-[#2C2A26]">
                        {isAddingNew ? 'Add Event Theme Setup' : `Edit Setup #${editingItem.id}`}
                      </h2>
                    </div>
                    
                    <button
                      onClick={() => saveThemeItem(editingItem)}
                      className="bg-[#6A665A] hover:bg-[#5C584E] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      Save Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* General Text Info */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#5C584E] mb-1.5">Theme Setup Title</label>
                          <input
                            type="text"
                            value={editingItem.title}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            className="w-full px-3.5 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#5C584E] mb-1.5">Parent Category</label>
                          <select
                            value={formParentCategory}
                            onChange={(e) => {
                              const parent = e.target.value;
                              setFormParentCategory(parent);
                              const firstSub = content.themesSection.subcategories[parent]?.[0] || '';
                              setEditingItem({ ...editingItem, category: firstSub });
                            }}
                            className="w-full px-3.5 py-2 border border-[#EAE4D9] rounded-xl text-sm bg-white"
                          >
                            {content.themesSection.categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#5C584E] mb-1.5">Subcategory</label>
                          <select
                            value={editingItem.category}
                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                            className="w-full px-3.5 py-2 border border-[#EAE4D9] rounded-xl text-sm bg-white"
                          >
                            {(content.themesSection.subcategories[formParentCategory] || []).map((sub) => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#5C584E] mb-1.5">Display Price</label>
                          <input
                            type="text"
                            value={editingItem.price}
                            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                            placeholder="Rs 25,000"
                            className="w-full px-3.5 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#5C584E] mb-1.5">Discounted Price (crossed out)</label>
                          <input
                            type="text"
                            value={editingItem.actualPrice}
                            onChange={(e) => setEditingItem({ ...editingItem, actualPrice: e.target.value })}
                            placeholder="Rs 20,000"
                            className="w-full px-3.5 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#5C584E] mb-1.5">Detailed Description</label>
                        <textarea
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          rows={3}
                          className="w-full px-3.5 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                        />
                      </div>

                      {/* Attributes */}
                      <div className="border-t border-[#F1EFEC] pt-4 flex flex-col gap-3">
                        <label className="block text-xs font-bold text-[#5C584E]">Attributes & Setup Requirements</label>
                        {editingItem.attributes.map((attr, idx) => (
                          <div key={idx} className="flex gap-4">
                            <input
                              type="text"
                              value={attr.label}
                              onChange={(e) => {
                                const attributes = [...editingItem.attributes];
                                attributes[idx].label = e.target.value;
                                setEditingItem({ ...editingItem, attributes });
                              }}
                              placeholder="Attribute Name"
                              className="w-1/3 px-3 py-1.5 border border-[#EAE4D9] rounded-xl text-xs"
                            />
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => {
                                const attributes = [...editingItem.attributes];
                                attributes[idx].value = e.target.value;
                                setEditingItem({ ...editingItem, attributes });
                              }}
                              placeholder="Value Details"
                              className="flex-1 px-3 py-1.5 border border-[#EAE4D9] rounded-xl text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Image & Gallery Uploads */}
                    <div className="flex flex-col gap-4">
                      {/* Main Image */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#5C584E]">Main Image</label>
                        <div className="border border-[#EAE4D9] rounded-2xl overflow-hidden relative aspect-[4/3] flex flex-col justify-end p-3">
                          <img src={editingItem.image} alt="Main Setup" className="absolute inset-0 w-full h-full object-cover z-0" />
                          <input
                            type="file"
                            accept="image/*"
                            ref={themeItemImageUploadRef}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setSaveMessage({ type: 'success', text: `Uploading main image...` });
                              try {
                                const url = await uploadImageFile(file);
                                setEditingItem({ ...editingItem, image: url });
                                setSaveMessage({ type: 'success', text: 'Main image uploaded!' });
                                setTimeout(() => setSaveMessage(null), 3000);
                              } catch (err: any) {
                                setSaveMessage({ type: 'error', text: err.message });
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => themeItemImageUploadRef.current?.click()}
                            className="relative z-10 w-full py-2 bg-black/60 hover:bg-black/85 text-white rounded-xl text-[10px] font-medium backdrop-blur-sm cursor-pointer"
                          >
                            Replace Main Image
                          </button>
                        </div>
                      </div>

                      {/* Gallery Images */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#5C584E]">Gallery Showcase ({editingItem.gallery.length} Images)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {editingItem.gallery.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[#EAE4D9] group">
                              <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                              <button
                                onClick={() => {
                                  const gallery = editingItem.gallery.filter((_, i) => i !== index);
                                  setEditingItem({ ...editingItem, gallery });
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          <div className="aspect-square border border-dashed border-[#EAE4D9] rounded-xl flex items-center justify-center bg-[#FDF7EF]/40 hover:bg-[#FDF7EF] transition cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              ref={themeItemGalleryUploadRef}
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;
                                setSaveMessage({ type: 'success', text: `Uploading gallery image...` });
                                try {
                                  const url = await uploadImageFile(files[0]);
                                  setEditingItem({
                                    ...editingItem,
                                    gallery: [...editingItem.gallery, url]
                                  });
                                  setSaveMessage({ type: 'success', text: 'Gallery image added!' });
                                  setTimeout(() => setSaveMessage(null), 3000);
                                } catch (err: any) {
                                  setSaveMessage({ type: 'error', text: err.message });
                                }
                              }}
                              className="hidden"
                            />
                            <button
                              onClick={() => themeItemGalleryUploadRef.current?.click()}
                              className="w-full h-full flex flex-col items-center justify-center text-[#8A867A] hover:text-[#5C584E] transition"
                            >
                              <PlusCircle size={18} />
                              <span className="text-[9px] mt-1 font-bold">Add Image</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* MAIN ITEMS LIST GRID */
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#F1EFEC] pb-4">
                    <div>
                      <h2 className="text-xl font-serif text-[#2C2A26] font-semibold mb-1">Themes Setup Catalog</h2>
                      <p className="text-xs text-[#8A867A]">Manage list, add new entries, and detail galleries</p>
                    </div>

                    <button
                      onClick={addNewThemeItem}
                      className="flex items-center justify-center gap-1.5 bg-[#6A665A] hover:bg-[#5C584E] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      <Plus size={16} />
                      Add Setup Card
                    </button>
                  </div>

                  {/* Categories & Subcategories Manager */}
                  <div className="flex flex-col gap-4 border border-[#EAE4D9] rounded-2xl bg-white p-4 sm:p-5">
                    <div>
                      <h3 className="text-sm font-serif font-semibold text-[#2C2A26]">Categories & Subcategories Manager</h3>
                      <p className="text-[10px] text-[#8A867A] mt-0.5">Add, rename, or remove subcategories for each main category</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {content.themesSection.categories.map((cat) => {
                        const subs = content.themesSection.subcategories[cat] || [];
                        return (
                          <div key={cat} className="border border-[#F1EFEC] rounded-xl p-3.5 bg-[#FDF7EF]/50">
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2">
                                {editingCat && editingCat.oldName === cat ? (
                                  <div className="flex items-center gap-1.5 bg-white border border-[#6A665A] rounded-full pl-3 pr-1.5 py-1">
                                    <input
                                      type="text"
                                      value={editingCat.value}
                                      autoFocus
                                      onChange={(e) => setEditingCat({ ...editingCat, value: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') renameCategory(cat, editingCat.value);
                                        if (e.key === 'Escape') setEditingCat(null);
                                      }}
                                      className="w-32 bg-transparent text-xs font-medium text-[#2C2A26] focus:outline-none"
                                    />
                                    <button
                                      onClick={() => renameCategory(cat, editingCat.value)}
                                      className="p-1 text-[#6A665A] hover:text-[#2C2A26] transition cursor-pointer"
                                      title="Save"
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button
                                      onClick={() => setEditingCat(null)}
                                      className="p-1 text-[#8A867A] hover:text-red-500 transition cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs font-bold text-[#2C2A26]">{cat}</span>
                                    <button
                                      onClick={() => setEditingCat({ oldName: cat, value: cat })}
                                      className="p-1 text-[#8A867A] hover:text-[#6A665A] transition cursor-pointer"
                                      title="Rename Category"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                  </>
                                )}
                                <span className="text-[9px] font-semibold text-[#8A867A] bg-[#EBE7DF]/70 px-2 py-0.5 rounded-full">{subs.length} subcategory{subs.length === 1 ? '' : 'ies'}</span>
                              </div>
                            </div>

                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {subs.map((sub) =>
                                  editingSubcat && editingSubcat.parent === cat && editingSubcat.oldName === sub ? (
                                    <div key={sub} className="flex items-center gap-1.5 bg-white border border-[#6A665A] rounded-full pl-3 pr-1.5 py-1">
                                      <input
                                        type="text"
                                        value={editingSubcat.value}
                                        autoFocus
                                        onChange={(e) => setEditingSubcat({ ...editingSubcat, value: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') renameSubcategory(cat, sub, editingSubcat.value);
                                          if (e.key === 'Escape') setEditingSubcat(null);
                                        }}
                                        className="w-32 bg-transparent text-xs font-medium text-[#2C2A26] focus:outline-none"
                                      />
                                      <button
                                        onClick={() => renameSubcategory(cat, sub, editingSubcat.value)}
                                        className="p-1 text-[#6A665A] hover:text-[#2C2A26] transition cursor-pointer"
                                        title="Save"
                                      >
                                        <Check size={12} />
                                      </button>
                                      <button
                                        onClick={() => setEditingSubcat(null)}
                                        className="p-1 text-[#8A867A] hover:text-red-500 transition cursor-pointer"
                                        title="Cancel"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span key={sub} className="flex items-center gap-1.5 bg-white border border-[#EAE4D9] rounded-full pl-3 pr-1 py-1">
                                      <span className="text-xs font-medium text-[#5C584E]">{sub}</span>
                                      <button
                                        onClick={() => setEditingSubcat({ parent: cat, oldName: sub, value: sub })}
                                        className="p-1 text-[#8A867A] hover:text-[#6A665A] transition cursor-pointer"
                                        title="Rename"
                                      >
                                        <Edit3 size={11} />
                                      </button>
                                      <button
                                        onClick={() => deleteSubcategory(cat, sub)}
                                        className="p-1 text-[#8A867A] hover:text-red-500 transition cursor-pointer"
                                        title="Delete"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="New subcategory name..."
                                value={subcatInputs[cat] || ''}
                                onChange={(e) => setSubcatInputs((prev) => ({ ...prev, [cat]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addSubcategory(cat, subcatInputs[cat] || '');
                                    setSubcatInputs((prev) => ({ ...prev, [cat]: '' }));
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 border border-[#EAE4D9] rounded-lg text-xs text-[#2C2A26] focus:outline-none focus:ring-2 focus:ring-[#6A665A]/30"
                              />
                              <button
                                onClick={() => {
                                  addSubcategory(cat, subcatInputs[cat] || '');
                                  setSubcatInputs((prev) => ({ ...prev, [cat]: '' }));
                                }}
                                className="flex items-center gap-1 bg-[#6A665A] hover:bg-[#5C584E] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer"
                              >
                                <Plus size={12} />
                                Add
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-col gap-4 border-b border-[#F1EFEC] pb-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <input
                        type="text"
                        placeholder="Search design setups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-80 px-4 py-2 border border-[#EAE4D9] rounded-xl text-sm"
                      />
                      
                      <div className="flex flex-wrap gap-1">
                        {['All', ...content.themesSection.categories].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                              selectedCategory === cat 
                                ? 'bg-[#6A665A] text-white' 
                                : 'bg-[#EBE7DF]/60 hover:bg-[#EBE7DF] text-[#5C584E]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedCategory !== 'All' && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-dashed border-[#EAE4D9]/60">
                        <span className="text-xs font-bold text-[#8A867A] mr-1.5">Subcategory:</span>
                        <button
                          onClick={() => setSelectedSubcategory('All')}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                            selectedSubcategory === 'All'
                              ? 'bg-[#8B867B] text-white shadow-sm'
                              : 'bg-[#EBE7DF]/40 hover:bg-[#EBE7DF] text-[#6A665A]'
                          }`}
                        >
                          All Subcategories
                        </button>
                        {(content.themesSection.subcategories[selectedCategory] || []).map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                              selectedSubcategory === sub
                                ? 'bg-[#8B867B] text-white shadow-sm'
                                : 'bg-[#EBE7DF]/40 hover:bg-[#EBE7DF] text-[#6A665A]'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Themes Grid List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
                    {content.themesSection.items
                      .filter((x) => {
                        const matchesSearch = x.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              x.category.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        const itemParent = findParentCategory(x.category);
                        const matchesCategory = selectedCategory === 'All' || 
                                                itemParent.toLowerCase() === selectedCategory.toLowerCase();
                        
                        const matchesSubcategory = selectedSubcategory === 'All' || 
                                                   x.category.toLowerCase() === selectedSubcategory.toLowerCase();
                        
                        return matchesSearch && matchesCategory && matchesSubcategory;
                      })
                      .map((item) => (
                        <div key={item.id} className="border border-[#EAE4D9] rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col group hover:shadow-md transition duration-300">
                          <div className="relative aspect-[4/3] bg-black/5 overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#EBE7DF]/90 backdrop-blur-sm text-[#2C2A26] px-2.5 py-1 rounded-full">
                              {item.category}
                            </span>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-sm text-[#2C2A26] leading-snug mb-1 group-hover:text-[#6A665A] transition-colors">{item.title}</h4>
                              <p className="text-xs text-[#8A867A] line-clamp-2 leading-relaxed mb-3">{item.description}</p>
                            </div>
                            <div>
                              <div className="flex items-baseline gap-1.5 mb-3">
                                <span className="text-sm font-bold text-[#6A665A]">{item.price}</span>
                                {item.actualPrice && (
                                  <span className="text-[10px] text-[#8A867A] line-through">{item.actualPrice}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 border-t border-[#F1EFEC] pt-3">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="flex-1 py-2 bg-[#FDF7EF] hover:bg-[#EBE7DF] text-[#6A665A] font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-[#EAE4D9]/40 transition cursor-pointer"
                                >
                                  <Edit3 size={12} />
                                  Edit Info
                                </button>
                                <button
                                  onClick={() => deleteThemeItem(item.id)}
                                  className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition border border-transparent hover:border-red-100 cursor-pointer"
                                  title="Delete Design"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
