
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

const AdminUsersView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const stats = [
    { label: '总用户数', value: '12,482', icon: 'group', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '在线用户', value: '458', icon: 'bolt', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '付费会员', value: '2,840', icon: 'workspace_premium', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: '新增用户', value: '+124', icon: 'person_add', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: 'active' | 'banned') => {
    if (status === 'active') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase">正常</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-lg uppercase">已封禁</span>;
  };

  const getRoleBadge = (role: string) => {
    if (role === '管理员') return <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase">管理员</span>;
    return <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">{role}</span>;
  };

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">用户管理系统</h2>
          <p className="text-slate-500">监控用户活动、管理权限及处理账户事务。</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-6 py-4 rounded-2xl font-black hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            <span className="material-symbols-outlined">download</span> 导出数据
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
            <span className="material-symbols-outlined">person_add</span> 添加用户
          </button>
        </div>
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
              placeholder="搜索用户名、邮箱或标签..." 
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-xs font-black">全部</button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-black">已付费</button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-black">未付费</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">用户信息</th>
                <th className="px-8 py-5">角色</th>
                <th className="px-8 py-5">状态</th>
                <th className="px-8 py-5">兴趣标签</th>
                <th className="px-8 py-5">加入日期</th>
                <th className="px-8 py-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-slate-100" alt="" />
                      <div>
                        <p className="font-black text-sm group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1">
                      {user.interests.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 rounded">#{tag}</span>
                      ))}
                      {user.interests.length > 2 && <span className="text-[9px] font-bold text-slate-300">+{user.interests.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-500 font-medium">{user.joinDate}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all">
                        <span className="material-symbols-outlined text-lg">manage_accounts</span>
                      </button>
                      <button className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all">
                        <span className="material-symbols-outlined text-lg">block</span>
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
          <p className="text-xs text-slate-400 font-bold">显示 {filteredUsers.length} 位用户（共 {users.length} 位）</p>
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

export default AdminUsersView;
