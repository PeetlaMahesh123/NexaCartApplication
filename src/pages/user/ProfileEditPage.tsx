import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Upload, 
  ArrowLeft, 
  Save, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const ProfileEditPage = () => {
  const { profile, user, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      // Path: avatars/user-id-random.ext
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile DB immediately or wait for Save?
      // Better to update on Save to keep it consistent, but preview is enough for now.
      setPreviewUrl(publicUrl);
      toast.success('Image signal uploaded to buffer');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: previewUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      toast.success('User identity updated successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans">
      <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest italic">Return to Node Monitor</span>
      </Link>

      <div className="flex items-center space-x-4 mb-10">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-white italic underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-widest">Identity Override</h1>
          <p className="text-slate-500 text-sm mt-1">Modify your profile parameters and visual signature.</p>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave} 
        className="sleek-container space-y-8"
      >
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-primary/20 overflow-hidden relative">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 italic text-[10px]">No Signal</div>
              )}
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          
          <div className="mt-4 text-center">
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-tighter">Visual Signature</h3>
            <p className="text-[10px] text-slate-500 italic">Recommended: Square Aspect, Max 2MB (JPG/PNG)</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Full Legal Alias</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-medium"
              placeholder="e.g. Satoshi Nakamoto"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">System Identifier</label>
            <input
              type="email"
              className="w-full bg-slate-950/30 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-mono text-sm"
              value={user?.email || ''}
              disabled
            />
            <p className="mt-2 text-[9px] text-slate-600 italic px-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Identifier nodes are immutable once synchronized.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-end">
          <button
            type="submit"
            disabled={isUpdating || isUploading}
            className="gradient-button px-8 py-3 rounded-xl flex items-center space-x-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Synchronizing...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save New Identity</span>
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default ProfileEditPage;
