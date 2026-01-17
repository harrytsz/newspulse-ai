
import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  layout?: 'horizontal' | 'vertical';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, layout = 'horizontal' }) => {
  if (layout === 'horizontal') {
    return (
      <div 
        onClick={() => onClick(article)}
        className="flex bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      >
        <div className="w-48 h-32 rounded-xl overflow-hidden shrink-0">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        <div className="ml-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] fill-1">bolt</span> 为你匹配
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{article.category}</span>
            </div>
            <div className="flex gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="hover:text-primary"><span className="material-symbols-outlined text-xl">thumb_up</span></button>
              <button className="hover:text-primary"><span className="material-symbols-outlined text-xl">bookmark</span></button>
            </div>
          </div>
          <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{article.excerpt}</p>
          <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200">{article.author}</span>
            <span>•</span>
            <span>{article.readTime}阅读</span>
            <span>•</span>
            <span>{article.matchScore}% 匹配度</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(article)}
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
    >
      <div 
        className="aspect-video bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
        style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.9) 100%), url('${article.imageUrl}')` }}
      />
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] fill-1">verified</span> {article.matchScore}% 匹配度
        </span>
      </div>
      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-primary/90 text-xs font-bold uppercase mb-2">{article.category}</p>
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{article.title}</h3>
        <div className="flex items-center gap-3 text-slate-300 text-xs">
          <span className="font-bold text-white">{article.author}</span>
          <span>•</span>
          <span>{article.readTime}阅读时间</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
