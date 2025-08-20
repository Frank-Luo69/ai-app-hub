"use client";
import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';

type Lang = 'zh' | 'en';
type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = {
  zh: {
    brand: 'AI Mini-App Hub',
    submit: '提交应用',
    login: '登录',
    logout: '登出',
    searchPlaceholder: '搜索应用标题或简介…',
    noApps: '暂无应用，去「提交应用」发布一个吧～',
    play: '去玩',
    myApps: '我的应用',
    draft: '草稿',
    published: '已发布',
    filterAll: '全部',
    tags: '标签',
    prev: '上一页',
    next: '下一页',
    edit: '编辑',
    delete: '删除',
  },
  en: {
    brand: 'AI Mini-App Hub',
    submit: 'Submit App',
    login: 'Login',
    logout: 'Logout',
    searchPlaceholder: 'Search by title or description…',
    noApps: 'No apps yet — submit one!',
    play: 'Play',
    myApps: 'My Apps',
    draft: 'Draft',
    published: 'Published',
    filterAll: 'All',
    tags: 'Tags',
    prev: 'Prev',
    next: 'Next',
    edit: 'Edit',
    delete: 'Delete',
  }
};

const I18nCtx = createContext<{ t: (k: string) => string; lang: Lang; setLang: (l: Lang) => void }>({
  t: (k) => k,
  lang: 'zh',
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh');
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('lang') as Lang | null) : null;
    if (saved === 'en' || saved === 'zh') setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('lang', lang);
  }, [lang]);
  const t = useMemo(() => (k: string) => dicts[lang][k] ?? k, [lang]);
  const v = useMemo(() => ({ t, lang, setLang }), [t, lang]);
  return <I18nCtx.Provider value={v}>{children}</I18nCtx.Provider>;
}

export function useI18n() { return useContext(I18nCtx); }
