import React, { useState } from 'react';
import { Globe, Send, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';

const initialPosts = [
  { id: '1', author: 'Alex', originalLang: 'en', content: 'What are your thoughts on the new serverless architecture trends?', translatedContent: {} },
  { id: '2', author: '田中', originalLang: 'ja', content: '新しいAIツールの開発スピードが早すぎて、毎日キャッチアップするのが大変です。', translatedContent: {} },
  { id: '3', author: '李明', originalLang: 'zh-CN', content: '发现时区差异和文化语境是比技术本身更难解决的问题。', translatedContent: {} }
];

export default function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [systemLang, setSystemLang] = useState('zh-CN');
  const [newPostContent, setNewPostContent] = useState('');
  const [translatingId, setTranslatingId] = useState(null);

  const translateText = async (text, targetLang) => {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });
      const data = await res.json();
      if (data.translatedText) return data.translatedText;
      throw new Error('Empty response');
    } catch (error) {
      console.error(error);
      return "【AI翻译请求失败】";
    }
  };

  const handleTranslate = async (postId, text) => {
    setTranslatingId(postId);
    const translatedText = await translateText(text, systemLang);
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, translatedContent: { ...post.translatedContent, [systemLang]: translatedText } };
      }
      return post;
    }));
    setTranslatingId(null);
  };

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    const newPost = {
      id: Date.now().toString(),
      author: '我 (You)',
      originalLang: systemLang,
      content: newPostContent,
      translatedContent: {}
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto py-8 px-4 font-sans bg-gray-50">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Globe className="text-blue-500" /> GlobalTalk
        </h1>
        <select value={systemLang} onChange={(e) => setSystemLang(e.target.value)} className="border p-2 rounded-lg bg-gray-50">
          <option value="zh-CN">🇨🇳 中文 (简体)</option>
          <option value="en">🇺🇸 English</option>
          <option value="ja">🇯🇵 日本語</option>
        </select>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
        <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="使用你的母语发帖..." className="w-full border rounded-lg p-3 min-h-[100px]" />
        <div className="flex justify-end mt-3">
          <button onClick={handlePost} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
            <Send size={18} /> 发 布
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map(post => {
          const isMyLanguage = post.originalLang === systemLang;
          const hasTranslation = post.translatedContent[systemLang];
          const isTranslating = translatingId === post.id;

          return (
            <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800">{post.author}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">🌐 原文: {post.originalLang}</span>
              </div>
              <div className="text-gray-700 mb-4 text-lg">
                {hasTranslation ? <div><p>{hasTranslation}</p><p className="text-sm text-gray-400 mt-2 border-t pt-2">原文: {post.content}</p></div> : <p>{post.content}</p>}
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-1 text-gray-500 text-sm"><MessageSquare size={16} /> 评论</button>
                {!isMyLanguage && !hasTranslation && (
                  <button onClick={() => handleTranslate(post.id, post.content)} disabled={isTranslating} className="flex items-center gap-1 text-purple-600 text-sm disabled:opacity-50">
                    {isTranslating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isTranslating ? '正在呼叫 AI...' : 'AI 翻译'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}