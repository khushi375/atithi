import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Plus, Trash, Image as ImageIcon, AlignLeft, Send, ArrowLeft, Upload } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface BlogSection {
  type: 'text' | 'image';
  content: string;
}

export const AddDestination: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Basic fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'North' | 'South' | 'East' | 'West'>('North');
  const [price, setPrice] = useState('');
  const [distance, setDistance] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Blog Sections
  const [sections, setSections] = useState<BlogSection[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Convert files to Base64 strings
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Result = reader.result as string;
      if (target === 'cover') {
        setCoverImage(base64Result);
      } else {
        const updated = [...sections];
        updated[target].content = base64Result;
        setSections(updated);
      }
    };
    reader.onerror = (err) => {
      console.error('File reading failed: ', err);
    };
  };

  // Blog builder helpers
  const addSection = (type: 'text' | 'image') => {
    setSections([...sections, { type, content: '' }]);
  };

  const removeSection = (idx: number) => {
    const updated = sections.filter((_, i) => i !== idx);
    setSections(updated);
  };

  const handleSectionTextChange = (idx: number, val: string) => {
    const updated = [...sections];
    updated[idx].content = val;
    setSections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!coverImage) {
      return setError('A cover image is required for this destination package.');
    }

    // Ensure all sections have content
    const emptySection = sections.some(s => !s.content);
    if (emptySection) {
      return setError('Please provide content for all added blog sections.');
    }

    setSubmitting(true);
    try {
      const token = await currentUser?.getIdToken();
      await axios.post(
        `${API_URL}/destinations`,
        {
          name,
          category,
          price: Number(price),
          distance: Number(distance),
          travelTime,
          bestTime,
          coverImage,
          sections
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Destination package published successfully! Synced to Google Sheets.');
      setTimeout(() => {
        navigate('/admin/manage-destinations');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Publishing failed. Please verify configurations.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-left">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/manage-destinations')}
            className="p-2 border border-slate-200 dark:border-luxury-800 rounded-full hover:bg-slate-100 dark:hover:bg-luxury-900 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-350" />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
              Create Tourism Package
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add cover photos, specifications, and build customized section blogs.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs rounded-xl text-center">
            {success}
          </div>
        )}

        {/* CMS Form Layout */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Main specifications */}
          <div className="glass p-8 rounded-2xl border border-slate-200/50 dark:border-luxury-850 space-y-6">
            <h3 className="font-serif text-base font-bold text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-luxury-800/50 pb-3">
              Package Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Destination Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Manali Tour"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Territory Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="North">North India</option>
                  <option value="South">South India</option>
                  <option value="East">East India</option>
                  <option value="West">West India</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Base Price Cab Fare (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="12000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Travel Distance (km)</label>
                <input
                  type="number"
                  required
                  placeholder="570"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estimated Travel Time</label>
                <input
                  type="text"
                  required
                  placeholder="11 hours"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Best Time to Visit</label>
                <input
                  type="text"
                  required
                  placeholder="October to March"
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>
            </div>

            {/* Cover Image Loader */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Cover Image</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex items-center gap-2 py-2 px-4 border border-dashed border-gold-400/30 hover:border-gold-400/70 rounded-xl bg-gold-400/5 cursor-pointer text-xs transition duration-200">
                  <Upload className="w-4 h-4 text-gold-500" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    className="hidden"
                  />
                </label>
                {coverImage && (
                  <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-luxury-800 shrink-0">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Blog Builder system */}
          <div className="glass p-8 rounded-2xl border border-slate-200/50 dark:border-luxury-850 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-luxury-800/50 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-800 dark:text-white">
                Detailed Blog Sections
              </h3>
              
              {/* Dynamic Add Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addSection('text')}
                  className="inline-flex items-center gap-1.5 py-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-luxury-800 dark:hover:bg-luxury-850 border border-slate-200 dark:border-luxury-700 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-gold-500" />
                  <span>Add Text Block</span>
                </button>
                <button
                  type="button"
                  onClick={() => addSection('image')}
                  className="inline-flex items-center gap-1.5 py-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-luxury-800 dark:hover:bg-luxury-850 border border-slate-200 dark:border-luxury-700 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-gold-500" />
                  <span>Add Image Block</span>
                </button>
              </div>
            </div>

            {sections.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No extra detailed sections have been appended yet. Use the buttons above to build layout cards.
              </p>
            ) : (
              <div className="space-y-6">
                {sections.map((section, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 border border-slate-200/60 dark:border-luxury-850 bg-slate-50/50 dark:bg-luxury-950/20 rounded-xl relative space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-gold-500 tracking-wider">
                        Block #{idx + 1}: {section.type === 'text' ? 'Text Paragraph' : 'Scenery Image'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSection(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 transition"
                        title="Delete Block"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Renders dynamic inputs */}
                    {section.type === 'text' ? (
                      <textarea
                        required
                        rows={4}
                        placeholder="Write dynamic content details..."
                        value={section.content}
                        onChange={(e) => handleSectionTextChange(idx, e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-white dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                      />
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className="flex items-center gap-2 py-2 px-4 border border-dashed border-gold-400/30 hover:border-gold-400/70 rounded-xl bg-gold-400/5 cursor-pointer text-xs transition duration-200">
                          <Upload className="w-4 h-4 text-gold-500" />
                          <span>Choose Block Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, idx)}
                            className="hidden"
                          />
                        </label>
                        {section.content && (
                          <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-luxury-850 shrink-0">
                            <img src={section.content} alt={`Preview block #${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission trigger */}
          <div className="text-right">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-8 rounded-lg text-xs shadow-md shadow-gold-500/10 transition"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publishing Package...' : 'Publish Destination Package'}</span>
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
export default AddDestination;
