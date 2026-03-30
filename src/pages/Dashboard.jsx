import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Edit2, Trash2, LogOut, Loader2, Image as ImageIcon } from 'lucide-react';
import PostEditor from '../components/PostEditor';
import { motion, AnimatePresence } from 'framer-motion';
import './Admin.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setPosts(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (!error) {
        setPosts(posts.filter(post => post.id !== id));
      }
    }
  };

  const openEditor = (post = null) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingPost(null);
  };

  const handleSave = () => {
    fetchPosts();
    closeEditor();
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <header className="dashboard-header">
          <div className="dashboard-title">
            <h2>Blog Management</h2>
            <p>Welcome back, Administrator</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={() => openEditor()}>
              <Plus size={18} style={{ marginRight: '8px' }} /> New Post
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-center">
            <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            <p className="mt-4 font-bold">Fetching your posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found. Start by creating your first blog content!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-posts-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.tr 
                      key={post.id} 
                      className="post-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <td>
                        {post.image ? (
                          <img src={post.image} alt="" className="post-admin-thumbnail" />
                        ) : (
                          <div className="post-admin-thumbnail flex items-center justify-center bg-gray-100">
                            <ImageIcon size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="font-bold">{post.title}</td>
                      <td>
                        <span className="blog-card-category" style={{ position: 'static', fontSize: '10px' }}>
                          {post.category}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">{post.date}</td>
                      <td>
                        <div className="post-actions">
                          <button className="action-btn" onClick={() => openEditor(post)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="action-btn delete" onClick={() => handleDelete(post.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <PostEditor 
            post={editingPost} 
            onClose={closeEditor} 
            onSave={handleSave} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
