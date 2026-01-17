
import React, { useState, useEffect, useRef } from 'react';
import { View, Article, User } from './types';
import { MOCK_ARTICLES, MOCK_USERS } from './constants';
import Sidebar from './components/Sidebar';
import ArticleCard from './components/ArticleCard';
import AdminContentView from './components/AdminContentView';
import AdminUsersView from './components/AdminUsersView';
import { aiService } from './services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";
import { useArticlesByCategory } from './hooks/useArticles';
import { useSubscriptions } from './hooks/useSubscriptions';
import { authAPI } from './services/api';

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- PORTAL COMPONENTS ---

const PortalNewsItem: React.FC<{ article: Article; onClick: (a: Article) => void }> = ({ article, onClick }) => {
  return (
    <div className="py-6 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/30 transition-colors group cursor-pointer" onClick={() => onClick(article)}>
      <h3 className="text-[20px] font-bold mb-4 line-clamp-2 group-hover:text-red-500 transition-colors leading-snug">
        {article.title}
      </h3>

      {article.images && article.images.length >= 3 ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {article.images.map((img, i) => (
            <div key={i} className="aspect-[16/10] rounded overflow-hidden bg-slate-100">
              <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed">{article.excerpt}</p>
          </div>
          {article.imageUrl && (
            <div className="w-48 h-32 shrink-0 rounded overflow-hidden bg-slate-100">
              <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mt-2">
        <div className="flex items-center gap-4">
          <span className="hover:text-red-500 transition-colors">{article.source}</span>
          {article.commentCount !== undefined && <span className="hover:text-red-500 transition-colors">{article.commentCount} 评论</span>}
          <span>{article.date}</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

// --- MODULE: LOGIN ---
const LoginView: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [email, setEmail] = useState('alex.r@newspulse.com'); // Default for demo
  const [password, setPassword] = useState('password123'); // Default for demo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.login(email, password);
      onNext();
    } catch (err) {
      console.error('Login failed:', err);
      setError('登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13566c]/80 to-black/90 z-10"></div>
        <div
          className="w-full h-full bg-center bg-cover scale-105 animate-pulse-slow"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504711432869-efd597cdd045?auto=format&fit=crop&q=80&w=2000')" }}
        />
      </div>
      <div className="relative z-20 w-full max-w-[1200px] px-6 flex flex-col lg:flex-row items-center gap-16">
        <div className="hidden lg:flex flex-col flex-1 gap-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl fill-1">waves</span>
            </div>
            <span className="text-3xl font-black tracking-tighter">NewsPulse</span>
          </div>
          <h1 className="text-7xl font-black leading-[1.1] tracking-tighter">
            重塑您的<br />
            <span className="text-secondary">信息获取。</span>
          </h1>
          <p className="text-xl text-white/70 max-w-md leading-relaxed">
            全球顶尖资讯的智能汇聚地。为您提供深度、及时且绝对个性化的阅读体验。
          </p>
          <div className="flex gap-10 mt-4">
            <div>
              <p className="text-4xl font-black">50K+</p>
              <p className="text-sm text-white/50 font-bold uppercase tracking-widest">每日活跃读者</p>
            </div>
            <div>
              <p className="text-4xl font-black">99%</p>
              <p className="text-sm text-white/50 font-bold uppercase tracking-widest">内容精准匹配</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 w-full max-w-[460px] rounded-[32px] shadow-2xl p-10 flex flex-col gap-8 transform transition-all hover:scale-[1.01]">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">欢迎回来</h2>
            <p className="text-slate-500 text-sm">请输入您的凭据以访问您的私人简报</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">电子邮箱</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border-slate-100 bg-slate-50 dark:bg-slate-800 h-14 pl-12 pr-4 text-base focus:ring-primary focus:border-primary border-2 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">密码</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border-slate-100 bg-slate-50 dark:bg-slate-800 h-14 pl-12 pr-4 text-base focus:ring-primary focus:border-primary border-2 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95 ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? '正在登录...' : <><span className="material-symbols-outlined">login</span> 立即登录</>}
            </button>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-xs font-bold uppercase">或</span>
            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="h-12 border-2 border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" className="w-5 h-5" /> Google
            </button>
            <button className="h-12 border-2 border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <img src="https://www.svgrepo.com/show/303114/apple-logo.svg" className="w-5 h-5 dark:invert" /> Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ARTICLE VIEW ---
const ArticleView: React.FC<{
  article: Article;
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  onViewMore: (category: string) => void;
  isSubscribed: boolean;
  onToggleSubscribe: () => void;
}> = ({ article, onBack, onArticleClick, onViewMore, isSubscribed, onToggleSubscribe }) => {
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const recommendedArticles = MOCK_ARTICLES.filter(a => a.category === article.category && a.id !== article.id);

  const generateSummary = async () => {
    setLoadingSummary(true);
    const text = await aiService.summarizeArticle(article.title, article.excerpt);
    setSummary(text);
    setLoadingSummary(false);
  };

  const handleSpeak = async () => {
    if (isBroadcasting) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      setIsBroadcasting(false);
      return;
    }
    setIsBroadcasting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Say in a professional news reporter voice: ${article.title}. ${article.excerpt}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsBroadcasting(false);
        audioSourceRef.current = source;
        source.start();
      } else {
        setIsBroadcasting(false);
      }
    } catch (e) {
      console.error(e);
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-12 group">
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1 text-sm">arrow_back</span> 返回
        </button>

        <header className="mb-12">
          <div className="flex items-center gap-6 mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">{article.category}</span>
            <span className="text-slate-400 text-xs font-bold">{article.readTime}阅读时间</span>
            <span className="text-slate-400 text-xs font-bold">已读 {article.readCount.toLocaleString()} 次</span>
          </div>

          <div className="flex items-start justify-between gap-12 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight flex-1">{article.title}</h1>
            <button
              onClick={handleSpeak}
              className={`flex flex-col items-center justify-center gap-1 w-24 h-24 shrink-0 rounded-2xl border-2 transition-all ${isBroadcasting ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'border-slate-100 dark:border-slate-800 text-primary hover:bg-slate-50'}`}
            >
              <span className={`material-symbols-outlined text-3xl ${isBroadcasting ? 'fill-1' : ''}`}>volume_up</span>
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">语音播报</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <img src={article.imageUrl} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
              <div>
                <p className="font-bold">{article.author}</p>
                <p className="text-slate-500 text-xs">{article.source} · {article.date}</p>
              </div>
            </div>
            <button
              onClick={onToggleSubscribe}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${isSubscribed ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <span className={`material-symbols-outlined text-lg ${isSubscribed ? 'fill-1' : ''}`}>{isSubscribed ? 'notifications_active' : 'add'}</span>
              {isSubscribed ? '已订阅' : '订阅'}
            </button>
          </div>
        </header>

        <div className="prose prose-xl prose-slate dark:prose-invert max-w-none space-y-8 mb-10">
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">{article.excerpt}</p>
          <img src={article.imageUrl} className="w-full h-auto rounded-[32px] shadow-2xl" alt={article.title} />
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            这是一篇深度资讯的演示。在现代社会，信息的准确性和深度至关重要。作为读者的您，能够在这里获得 AI 赋能的摘要、语音以及精准的个性化推荐。
          </p>
        </div>

        {/* 文章交互按钮 - 点赞、点踩、收藏、转发 */}
        <div className="flex items-center justify-center gap-3 py-8 mb-10 border-y border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { setLiked(!liked); if (disliked) setDisliked(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${liked ? 'bg-red-50 text-red-500 shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            <span className={`material-symbols-outlined text-xl ${liked ? 'fill-1' : ''}`}>thumb_up</span> 点赞
          </button>
          <button
            onClick={() => { setDisliked(!disliked); if (liked) setLiked(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${disliked ? 'bg-slate-200 text-slate-700 shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            <span className={`material-symbols-outlined text-xl ${disliked ? 'fill-1' : ''}`}>thumb_down</span> 点踩
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${bookmarked ? 'bg-amber-50 text-amber-500 shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            <span className={`material-symbols-outlined text-xl ${bookmarked ? 'fill-1' : ''}`}>bookmark</span> 收藏
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined text-xl">share</span> 转发
          </button>
        </div>

        {/* AI summary button if not already generated */}
        {!summary && !loadingSummary && (
          <div className="mb-20 p-8 bg-primary/5 rounded-[32px] border border-primary/10 flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined fill-1">auto_awesome</span>
            </div>
            <p className="text-sm font-bold text-primary">生成 AI 深度摘要与解析</p>
            <button onClick={generateSummary} className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-lg">立即生成</button>
          </div>
        )}

        {summary && (
          <div className="mb-20 p-8 bg-primary/5 rounded-[32px] border border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary fill-1">auto_awesome</span>
              <h4 className="font-black text-primary">AI 深度洞察</h4>
            </div>
            <p className="text-xl text-primary font-medium italic leading-relaxed">"{summary}"</p>
          </div>
        )}

        <section className="mt-20 space-y-8 border-t border-slate-100 pt-12">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-2xl font-black">为您推荐</h3>
            <button onClick={() => onViewMore(article.category)} className="text-sm font-black text-red-500 hover:underline">更多相关 &gt;</button>
          </div>
          <div className="grid gap-6">
            {recommendedArticles.length > 0 ? (
              recommendedArticles.map(a => <ArticleCard key={a.id} article={a} onClick={onArticleClick} />)
            ) : (
              <p className="text-slate-400 text-sm italic py-4">暂无更多同类推荐</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- MAIN APP LOGIC ---
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [activePersonalList, setActivePersonalList] = useState<string | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [activePortalTab, setActivePortalTab] = useState('推荐');

  // 从 API 获取文章数据
  const { allArticles, articlesByCategory, loading: articlesLoading, error: articlesError, refetch: refetchArticles } = useArticlesByCategory();

  // 订阅列表数据
  const { subscriptions, loading: subsLoading, toggleSubscription } = useSubscriptions();

  // 合并 API 数据和 Mock 数据，优先使用 API 数据
  const articles = allArticles.length > 0 ? allArticles : MOCK_ARTICLES;

  const portalTabs = ['关注', '推荐', '北京', '视频', '财经', '科技', '热点', '国际', '更多'];
  const hotTopics = [
    { id: 1, title: '来自中国的“机遇清单”', tag: null },
    { id: 2, title: '北京2024年第一场雪', tag: '热' },
    { id: 3, title: '本轮寒潮与08年冰灾范围相似', tag: null },
    { id: 4, title: '冰雪消费新观察', tag: null },
    { id: 5, title: '男孩车祸昏迷55天苏醒 妈妈发声', tag: null },
    { id: 6, title: '中国芯片迎来最大IPO', tag: null },
    { id: 7, title: '网警发布领取育儿补贴硬核攻略', tag: null },
    { id: 8, title: '女子直播换50套衣服配合丝滑如游戏', tag: '新' },
    { id: 9, title: '美舰过航台湾海峡 东部战区跟监警戒', tag: '新' },
    { id: 10, title: '宁夏装死小羊身价暴涨至30万', tag: null },
  ];

  const mockPublishers = [
    { id: 'p1', name: '连线杂志', followers: '12.4w', avatar: 'https://images.unsplash.com/photo-1541872703-74c5e443d1f5?w=100' },
    { id: 'p2', name: '彭博金融', followers: '45.2w', avatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100' },
    { id: 'p3', name: '体育周报', followers: '8.1w', avatar: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=100' },
    { id: 'p4', name: '国际评论', followers: '2.5w', avatar: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=100' },
  ];

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView(View.ARTICLE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderViewContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return (
          <div className="p-10 space-y-12 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                  <span className="material-symbols-outlined text-[14px] fill-1">bolt</span> 为你推荐
                </div>
                <h2 className="text-4xl font-black tracking-tighter">早安，Alex。</h2>
              </div>
              {/* 刷新按钮 */}
              <button
                onClick={refetchArticles}
                disabled={articlesLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-lg ${articlesLoading ? 'animate-spin' : ''}`}>refresh</span>
                {articlesLoading ? '加载中...' : '刷新数据'}
              </button>
            </div>
            {articlesError && (
              <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm">
                <span className="material-symbols-outlined align-middle mr-2">error</span>
                加载失败：{articlesError}，正在显示缓存数据
              </div>
            )}
            <section className="grid gap-6">
              {articlesLoading && articles.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                articles.map(article => <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />)
              )}
            </section>
          </div>
        );
      case View.CATEGORY:
        return (
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 animate-in fade-in duration-500">
            <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm px-8 border-b border-slate-100 dark:border-slate-800">
              <div className="max-w-7xl mx-auto flex items-center gap-10 py-5 whitespace-nowrap overflow-x-auto scrollbar-hide">
                {portalTabs.map(tab => (
                  <button key={tab} onClick={() => setActivePortalTab(tab)} className={`text-[17px] font-bold transition-all relative px-1 ${activePortalTab === tab ? 'text-red-500 scale-110' : 'text-slate-700 dark:text-slate-300 hover:text-red-400'}`}>
                    {tab}
                    {activePortalTab === tab && <div className="absolute -bottom-5 left-0 right-0 h-1 bg-red-500 rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-w-7xl mx-auto w-full px-8 py-8 grid grid-cols-12 gap-10">
              <div className="col-span-12 lg:col-span-8">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(activePortalTab === '推荐' ? articles : articles.filter(a => a.category === activePortalTab)).map(article => (
                    <PortalNewsItem key={article.id} article={article} onClick={handleArticleClick} />
                  ))}
                  <div className="py-16 text-center">
                    <button className="px-10 py-3 rounded-full border border-slate-200 text-slate-400 text-sm font-bold hover:bg-slate-50 transition-all">
                      正在为您搜寻更多精彩内容...
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block lg:col-span-4 space-y-12">
                {/* Widgets removed as per screenshot request */}
                <div className="space-y-6 bg-white dark:bg-slate-900 rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-red-500 fill-1">local_fire_department</span><h4 className="font-black text-lg">头条热榜</h4></div></div>
                  <div className="space-y-6">
                    {hotTopics.map((item, i) => (
                      <div key={item.id} className="flex items-start gap-5 cursor-pointer group">
                        <span className={`text-[19px] font-black shrink-0 w-6 ${i < 3 ? 'text-red-500' : 'text-slate-300'}`}>{item.id}</span>
                        <div className="flex-1 flex items-start justify-between gap-3"><p className="text-[15px] font-bold leading-snug group-hover:text-red-500 transition-colors line-clamp-2">{item.title}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case View.STATS:
        return (
          <div className="p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">个人中心</h2>
                <p className="text-slate-500">2024年3月度回顾 · 基于您的 1,240 分钟阅读时长</p>
              </div>
              <button className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl font-bold shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
                <span className="material-symbols-outlined">download</span> 导出报告
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative">
                    <img src={MOCK_USERS[0].avatar} className="w-40 h-40 rounded-[48px] object-cover border-8 border-slate-50 dark:border-slate-800 shadow-xl" alt="" />
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-black">Alex Rivera</h3>
                    <p className="text-slate-500 font-bold text-lg">alex.r@newspulse.com</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-black shadow-sm">
                        <span className="material-symbols-outlined text-[16px] fill-1">workspace_premium</span> 专业版会员
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-black shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span> 加入 156 天
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-6">
                  <div
                    onClick={() => setActivePersonalList(activePersonalList === 'read' ? null : 'read')}
                    className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] border transition-all cursor-pointer hover:shadow-md ${activePersonalList === 'read' ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">本月阅读</p>
                    <p className="text-xl font-black text-blue-500">142 篇</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg inline-block mt-2 bg-emerald-50 text-emerald-600">+12%</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">阅读时长</p>
                    <p className="text-xl font-black text-emerald-500">1.2k min</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg inline-block mt-2 bg-emerald-50 text-emerald-600">+5%</span>
                  </div>
                  <div
                    onClick={() => setActivePersonalList(activePersonalList === 'subs' ? null : 'subs')}
                    className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] border transition-all cursor-pointer hover:shadow-md ${activePersonalList === 'subs' ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">我的订阅</p>
                    <p className="text-xl font-black text-primary">{subscriptions.length} 个</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg inline-block mt-2 bg-slate-50 text-slate-500">查看列表</span>
                  </div>
                </div>

                {/* Bookmark Module */}
                <div
                  onClick={() => setActivePersonalList(activePersonalList === 'bookmarks' ? null : 'bookmarks')}
                  className={`bg-white dark:bg-slate-900 rounded-[32px] p-8 border transition-all cursor-pointer hover:shadow-lg ${activePersonalList === 'bookmarks' ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl fill-1">bookmark</span>
                      </div>
                      <div>
                        <h4 className="font-black text-lg">收藏文章</h4>
                        <p className="text-xs text-slate-400 font-bold">查看您最近收藏的深度报道和资讯</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-orange-500">28 篇</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase">点击展开列表</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Lists Container */}
                {activePersonalList && (
                  <div className="animate-in slide-in-from-top-4 duration-300 space-y-4">
                    <div className="flex items-center justify-between px-4">
                      <h4 className="text-xl font-black">
                        {activePersonalList === 'read' ? '本月阅读历史' : activePersonalList === 'subs' ? '我的频道订阅' : '我的收藏夹'}
                      </h4>
                      <button onClick={() => setActivePersonalList(null)} className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {activePersonalList === 'subs' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {subsLoading ? (
                            <div className="col-span-2 flex justify-center py-10">
                              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : subscriptions.length === 0 ? (
                            <div className="col-span-2 text-center py-10 text-slate-400">
                              暂无订阅，快去发现感兴趣的发布者吧！
                            </div>
                          ) : (
                            subscriptions.map(sub => (
                              <div key={sub.id} className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                  <img src={sub.publisher_avatar || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                  <div>
                                    <p className="font-bold text-sm">{sub.publisher_name}</p>
                                    <p className="text-xs text-slate-400">{sub.followers_count || '0'} 关注者</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleSubscription({ name: sub.publisher_name })}
                                  className="px-4 py-1.5 border-2 border-primary/20 bg-primary/5 text-primary text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors group"
                                >
                                  <span className="group-hover:hidden">已订阅</span>
                                  <span className="hidden group-hover:inline">取消订阅</span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      ) : (
                        MOCK_ARTICLES.map(article => (
                          <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                  <h4 className="font-black text-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">interests</span> 兴趣雷达
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {['量子计算', 'Web3', '金融科技', '太空探索', '可持续能源'].map(interest => (
                      <span key={interest} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                        {interest}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto space-y-4 pt-10 border-t border-slate-50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">近期活动</h5>
                    {[
                      { icon: 'history', text: '阅读了《硅悖论》', time: '2小时前' },
                      { icon: 'bookmark', text: '收藏了《华尔街预测》', time: '昨天' },
                      { icon: 'share', text: '分享了《足球的未来》', time: '2天前' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-slate-300 text-lg">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold leading-tight">{item.text}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case View.PROFILE:
        return (
          <div className="p-10 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black">账户设置</h2>
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-8 mb-10">
              <img src={MOCK_USERS[0].avatar} className="w-32 h-32 rounded-[40px] object-cover border-8 border-slate-50 dark:border-slate-800 shadow-xl" alt="" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Alex Rivera</h3>
                <p className="text-slate-500 font-bold text-lg">alex.r@newspulse.com</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black">
                  <span className="material-symbols-outlined text-[16px] fill-1">workspace_premium</span> 专业版年度会员
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h4 className="font-black mb-6 uppercase tracking-widest text-slate-400 text-xs">通知偏好</h4>
                <div className="space-y-4">
                  {['每日简报', '紧急新闻', 'AI 深度分析', '活动提醒'].map(item => (
                    <div key={item} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <span className="font-bold text-sm">{item}</span>
                      <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h4 className="font-black mb-6 uppercase tracking-widest text-slate-400 text-xs">安全管理</h4>
                <div className="space-y-4">
                  <button className="w-full text-left p-4 border-2 border-slate-50 dark:border-slate-800 rounded-2xl font-bold text-sm hover:border-primary/20 transition-all flex justify-between items-center">
                    修改登录密码 <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </button>
                  <button className="w-full text-left p-4 border-2 border-slate-50 dark:border-slate-800 rounded-2xl font-bold text-sm hover:border-primary/20 transition-all flex justify-between items-center">
                    生物识别授权 <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </button>
                  <button className="w-full text-left p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all">
                    退出当前账号
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case View.ADMIN_CONTENT:
        return <AdminContentView />;
      case View.ADMIN_USERS:
        return <AdminUsersView />;
      case View.ARTICLE:
        return selectedArticle && (
          <ArticleView
            article={selectedArticle}
            onBack={() => { setCurrentView(View.CATEGORY); setSelectedArticle(null); }}
            onArticleClick={handleArticleClick}
            onViewMore={(cat) => { setActivePortalTab(cat); setCurrentView(View.CATEGORY); }}
            isSubscribed={subscriptions.some(s => s.publisher_name === selectedArticle.author || s.publisher_name === selectedArticle.source)}
            onToggleSubscribe={() => toggleSubscription({
              name: selectedArticle.author || selectedArticle.source || 'Unknown',
              avatar: selectedArticle.imageUrl // 暂时使用文章图片作为头像，后续应优化
            })}
          />
        );
      default:
        return <div className="p-10"><h2 className="text-4xl font-black">{currentView}</h2></div>;
    }
  };

  if (currentView === View.LOGIN) return <LoginView onNext={() => setCurrentView(View.FACE_SCAN)} />;
  if (currentView === View.FACE_SCAN) return <FaceScanView onNext={() => setCurrentView(View.ONBOARDING)} />;
  if (currentView === View.ONBOARDING) return <OnboardingView onComplete={(interests) => { setUserInterests(interests); setCurrentView(View.DASHBOARD); }} />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} isAdmin={isAdmin} />
      <main className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-950 relative">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-10 py-5 flex items-center justify-between">
          <div className="relative w-full max-w-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-[20px] py-3 pl-12 focus:ring-0 text-sm font-medium transition-all" placeholder="搜索新闻、兴趣、话题..." />
          </div>
          <div className="flex items-center gap-6">
            <button className="w-12 h-12 rounded-[18px] hover:bg-slate-50 dark:hover:bg-slate-800 relative group transition-colors">
              <span className="material-symbols-outlined text-slate-500 group-hover:text-red-500">notifications</span>
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-[3px] border-white dark:border-slate-900"></span>
            </button>
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setActivePersonalList(null); setCurrentView(View.STATS); }}>
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-red-500 transition-colors">Alex Rivera</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">PRO ACCESS</p>
              </div>
              <img src={MOCK_USERS[0].avatar} className="w-12 h-12 rounded-[20px] border-[3px] border-primary/20 object-cover group-hover:scale-105 transition-transform" />
            </div>
          </div>
        </header>
        <div className="flex-1">
          {renderViewContent()}
        </div>
      </main>
    </div>
  );
};

// --- FACE SCAN VIEW ---
const FaceScanView: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [statusText, setStatusText] = useState('正在启动摄像头...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // 启动摄像头
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            setStatusText('请将面部置于框内');
          };
        }
      } catch (e) {
        console.error("摄像头访问失败:", e);
        setStatusText('摄像头访问失败，请检查权限');
      }
    };

    startCamera();

    // 组件卸载时关闭摄像头
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 扫描进度
  useEffect(() => {
    if (!cameraReady || !scanning) return;

    // 延迟 1 秒后开始扫描
    const startDelay = setTimeout(() => {
      setStatusText('正在扫描面部特征...');
    }, 1000);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setScanning(false);
          setStatusText('认证成功！');
          // 关闭摄像头
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          setTimeout(onNext, 1200);
          return 100;
        }
        return p + 1.5;
      });
    }, 60);

    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
    };
  }, [cameraReady, scanning, onNext]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-10 text-white">
        {/* 标题 */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black">面部识别验证</h2>
          <p className="text-slate-400 text-sm">请保持面部在取景框内，系统将自动识别</p>
        </div>

        {/* 摄像头区域 */}
        <div className="relative mx-auto w-72 h-72">
          {/* 外圈动画 */}
          <div className={`absolute inset-0 rounded-full border-4 ${scanning && cameraReady ? 'border-primary animate-pulse' : progress >= 100 ? 'border-green-500' : 'border-white/20'} transition-colors duration-500`}></div>

          {/* 角落装饰 */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>

          {/* 视频容器 */}
          <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-all duration-500 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* 加载指示器 */}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* 扫描线动画 */}
            {scanning && cameraReady && (
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-primary/80 to-transparent shadow-[0_0_30px_#13566c] animate-scan-line"></div>
            )}

            {/* 成功覆盖层 */}
            {progress >= 100 && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-in fade-in duration-300">
                <span className="material-symbols-outlined text-6xl text-green-400 fill-1 animate-in zoom-in duration-300">check_circle</span>
              </div>
            )}
          </div>
        </div>

        {/* 进度条和状态 */}
        <div className="space-y-4">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            {scanning && cameraReady && progress < 100 && (
              <span className="material-symbols-outlined text-primary text-lg animate-pulse">face</span>
            )}
            <p className={`font-bold uppercase tracking-widest text-sm ${progress >= 100 ? 'text-green-400' : 'text-primary'}`}>
              {statusText}
            </p>
          </div>

          {cameraReady && progress < 100 && (
            <p className="text-slate-500 text-xs">扫描进度: {Math.round(progress)}%</p>
          )}
        </div>

        {/* 取消按钮 */}
        {progress < 100 && (
          <button
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
              }
              onNext();
            }}
            className="text-slate-400 text-sm hover:text-white transition-colors"
          >
            跳过验证
          </button>
        )}
      </div>
    </div>
  );
};

// --- ONBOARDING VIEW ---
const OnboardingView: React.FC<{ onComplete: (interests: string[]) => void }> = ({ onComplete }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const categories = [
    { id: 'tech', label: '科技', icon: 'terminal', bg: 'bg-blue-500' },
    { id: 'finance', label: '金融', icon: 'payments', bg: 'bg-emerald-500' },
    { id: 'sports', label: '体育', icon: 'sports_soccer', bg: 'bg-orange-500' },
    { id: 'health', label: '医疗', icon: 'health_and_safety', bg: 'bg-red-500' },
    { id: 'politics', label: '政治', icon: 'account_balance', bg: 'bg-slate-700' },
    { id: 'culture', label: '文化', icon: 'palette', bg: 'bg-purple-500' },
    { id: 'science', label: '科学', icon: 'science', bg: 'bg-indigo-500' },
    { id: 'lifestyle', label: '生活方式', icon: 'shopping_bag', bg: 'bg-pink-500' },
  ];
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col p-10 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center gap-12">
        <h2 className="text-5xl font-black tracking-tight">为您定制专属资讯</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => toggle(cat.id)} className={`relative h-40 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 transition-all border-2 ${selected.includes(cat.id) ? 'border-primary bg-primary/5 shadow-md scale-105' : 'border-slate-100 hover:border-primary/20'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.bg} text-white shadow-lg`}>
                <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
              </div>
              <span className="font-black text-lg">{cat.label}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={() => onComplete(selected)} disabled={selected.length < 3} className={`px-10 h-16 rounded-2xl font-black text-lg flex items-center gap-3 transition-all ${selected.length >= 3 ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            开启 NewsPulse <span className="material-symbols-outlined">rocket_launch</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
