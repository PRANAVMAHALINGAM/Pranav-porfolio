import { createClient } from '@supabase/supabase-js';
import { linkedinPosts } from './src/data/linkedinPosts.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log('🚀 Starting migration of 16 posts...');
  
  const { data, error } = await supabase
    .from('posts')
    .insert(linkedinPosts.map(p => ({
      title: p.title,
      snippet: p.snippet,
      date: p.date,
      url: p.url,
      image: p.image,
      category: p.category
    })));

  if (error) {
    console.error('❌ Migration failed:', error.message);
  } else {
    console.log('✅ Success! 16 posts migrated to Supabase.');
  }
}

migrate();
