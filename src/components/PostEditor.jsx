import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PostEditor = ({ post, onClose, onSave }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [snippet, setSnippet] = useState(post?.snippet || '');
  const [date, setDate] = useState(post?.date || '');
  const [category, setCategory] = useState(post?.category || '');
  const [url, setUrl] = useState(post?.url || '');
  const [image, setImage] = useState(post?.image || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const postData = {
      title,
      snippet,
      date,
      category,
      url,
      image,
      updated_at: new Date(),
    };

    let error;
    if (post) {
      // Update
      const result = await supabase
        .from('posts')
        .update(postData)
        .eq('id', post.id);
      error = result.error;
    } else {
      // Create
      const result = await supabase
        .from('posts')
        .insert([postData]);
      error = result.error;
    }

    if (!error) {
      onSave();
    } else {
      alert('Error saving post: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="modal-header">
          <h3>{post ? 'Edit Post' : 'Create New Post'}</h3>
          <button className="action-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="form-group form-full">
              <label>Post Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter compelling title..."
                required 
                style={{ paddingLeft: '1rem' }}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{ paddingLeft: '1rem' }}
              >
                <option value="">Select Category</option>
                <option value="Hackathons">Hackathons</option>
                <option value="Master's Journey">Master's Journey</option>
                <option value="Projects">Projects</option>
                <option value="Judging">Judging</option>
                <option value="AI & Future">AI & Future</option>
                <option value="Lectures & Mentorship">Lectures & Mentorship</option>
                <option value="Workshops">Workshops</option>
                <option value="Research & Conferences">Research & Conferences</option>
              </select>
            </div>

            <div className="form-group">
              <label>Display Date</label>
              <input 
                type="text" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                placeholder="e.g. Feb 2025"
                required 
                style={{ paddingLeft: '1rem' }}
              />
            </div>

            <div className="form-group form-full">
              <label>Thumbnail Image URL</label>
              <input 
                type="url" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
                placeholder="https://media.licdn.com/..."
                required 
                style={{ paddingLeft: '1rem' }}
              />
            </div>

            <div className="form-group form-full">
              <label>LinkedIn Post Link</label>
              <input 
                type="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://www.linkedin.com/posts/..."
                required 
                style={{ paddingLeft: '1rem' }}
              />
            </div>

            <div className="form-group form-full">
              <label>Snippet / Description</label>
              <textarea 
                rows="4" 
                value={snippet} 
                onChange={(e) => setSnippet(e.target.value)}
                placeholder="Briefly describe the post content..."
                required
                style={{ paddingLeft: '1rem' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Save size={18} style={{ marginRight: '8px' }} />
                  {post ? 'Update Post' : 'Publish Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PostEditor;
