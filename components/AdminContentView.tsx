
import React, { useState } from 'react';
import { Article } from '../types';
import { MOCK_ARTICLES } from '../constants';

interface EditFormState {
  id?: string;
  title: string;
  category: string;
  author: string;
  excerpt: string;
  imageUrl: string;
}

const AdminContentView: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: '',
    category: '',
    author: '',
    excerpt: '',
    imageUrl: ''
  });

  const stats = [
    { label: '总文章数', value: '1,284', icon: 'article', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '待审核', value: '12', icon: 'pending_actions', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '本周发布', value: '48', icon: 'calendar_today', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: '平均阅读量', value: '4.2k', icon: 'visibility', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (id: string) => {
    if (id === '1') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase">已发布</span>;
    if (id === '2') return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase">草稿</span>;
    return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg uppercase">归档</span>;
  };

  const handleEdit = (article: Article) => {
    setEditForm({
      id: article.id,
      title: article.title,
      category: article.category,
      author: article.author,
      excerpt: article.excerpt,
      imageUrl: article.imageUrl
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditForm({
      title: '',
      category: '',
      author: '',
      excerpt: '',
      imageUrl: ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editForm.id) {
      // Update existing
      setArticles(prev => prev.map(a => a.id === editForm.id ? { ...a, ...editForm } : a));
    } else {
      // Create new
      const newArticle: Article = {
        ...editForm,
        id: Math.random().toString(36).substring(7),
        readTime: '5 分钟',
        readCount: 0,
        matchScore: 90,
        date: new Date().toISOString().split('T')[0],
        source: editForm.author
      } as Article;
      setArticles(prev => [newArticle, ...prev]);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-10 space-y-10 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">
              {editForm.id ? '编辑新闻文章' : '创建新文章'}
            </h2>
            <p className="text-slate-500">完善新闻素材，确保内容的准确性与时效性。</p>
          </div>
          <button 
            onClick={() => setIsEditing(false)}
            className="w-12 h-12 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl p-10 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">新闻类别</label>
              <input 
                value={editForm.category}
                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold transition-all"
                placeholder="例如：量子科技、金融..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">发布者/作者</label>
              <input 
                value={editForm.author}
                onChange={e => setEditForm({ ...editForm, author: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold transition-all"
                placeholder="作者名称或媒体来源"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">新闻标题</label>
            <input 
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-lg font-black transition-all"
              placeholder="输入一个吸引人的标题..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">正文内容</label>
            <textarea 
              rows={8}
              value={editForm.excerpt}
              onChange={e => setEditForm({ ...editForm, excerpt: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-3xl p-6 text-sm font-medium leading-relaxed transition-all resize-none"
              placeholder="在此输入新闻的详细内容..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">封面图片 URL</label>
            <input 
              value={editForm.imageUrl}
              onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold transition-all"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-10 py-4 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-50 transition-all"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              保存并发布
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">内容管理系统</h2>
          <p className="text-slate-500">管理、编辑并发布您的全球新闻资讯。</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">add</span> 创建新文章
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 focus:ring-2 focus:ring-primary/20 text-sm font-bold" 
              placeholder="搜索文章标题、作者或标签..." 
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-all">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-all">
              <span className="material-symbols-outlined">sort</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">文章信息</th>
                <th className="px-8 py-5">分类</th>
                <th className="px-8 py-5">作者</th>
                <th className="px-8 py-5">状态</th>
                <th className="px-8 py-5">发布日期</th>
                <th className="px-8 py-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={article.imageUrl} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="" />
                      <div>
                        <p className="font-black text-sm line-clamp-1 group-hover:text-primary transition-colors">{article.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{article.readTime}阅读时长</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{article.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black">{article.author}</p>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(article.id)}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-500 font-medium">{article.date}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(article)}
                        className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                      <button className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold">显示 {filteredArticles.length} 条文章（共 {articles.length} 条）</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold disabled:opacity-30" disabled>上一页</button>
            <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">1</button>
            <button className="px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentView;
