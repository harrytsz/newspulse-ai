
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isAdmin }) => {
  const navItems = [
    { id: View.DASHBOARD, label: '发现', icon: 'explore' },
    { id: View.CATEGORY, label: '聚合新闻', icon: 'grid_view' },
    { id: View.STATS, label: '个人中心', icon: 'account_circle' },
    { id: View.PROFILE, label: '账户设置', icon: 'settings' },
  ];

  const adminItems = [
    { id: View.ADMIN_CONTENT, label: '内容管理', icon: 'description' },
    { id: View.ADMIN_USERS, label: '用户管理', icon: 'group' },
  ];

  return (
    <aside className="w-72 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-12 cursor-pointer group" onClick={() => onNavigate(View.DASHBOARD)}>
          <div className="w-12 h-12 bg-primary rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl fill-1">waves</span>
          </div>
          <div>
            <h1 className="text-xl font-black leading-none tracking-tight">NewsPulse</h1>
            <p className="text-[10px] text-primary/70 font-black tracking-widest uppercase mt-1">PRO ACCESS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <div className="px-5 uppercase text-[10px] font-black tracking-[0.2em] text-slate-400 mb-4">主菜单</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                currentView === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 font-bold'
              }`}
            >
              <span className={`material-symbols-outlined ${currentView === item.id ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}

          {isAdmin && (
            <>
              <div className="pt-8 pb-4 px-5 uppercase text-[10px] font-black tracking-[0.2em] text-slate-400">系统管理</div>
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                    currentView === item.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 font-bold'
                  }`}
                >
                  <span className={`material-symbols-outlined ${currentView === item.id ? 'fill-1' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </>
          )}
          
          <div className="pt-8 pb-4 px-5 uppercase text-[10px] font-black tracking-[0.2em] text-slate-400">关注焦点</div>
          <button onClick={() => onNavigate(View.CATEGORY)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 font-bold transition-all">
            <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500 text-lg">terminal</span>
            </div>
            <span className="text-sm">量子科技</span>
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 font-bold transition-all">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-lg">payments</span>
            </div>
            <span className="text-sm">Web3 金融</span>
          </button>
        </nav>

        <div className="mt-auto p-6 bg-gradient-to-br from-primary to-secondary rounded-[32px] shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-xs font-black mb-2 text-white/90">邀请好友体验</p>
          <p className="text-[11px] mb-5 text-white/60 leading-relaxed font-bold">送出 30 天免费 Pro 会员。</p>
          <button className="w-full py-2.5 bg-white text-primary text-[11px] font-black rounded-xl hover:shadow-lg transition-all active:scale-95">
            立即邀请
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
