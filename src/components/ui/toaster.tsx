"use client"
import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: string; title?: string; description?: string; type?: ToastType; duration?: number }
interface ToastContextValue { push: (t: Omit<ToastItem,'id'>) => void }
const ToastContext = createContext<ToastContextValue | null>(null)
export function ToastProvider({ children }: { children: React.ReactNode }) { const [items,setItems]=useState<ToastItem[]>([]) ; const push = useCallback((t:Omit<ToastItem,'id'>)=>{ const id = Math.random().toString(36).slice(2); const duration = t.duration ?? 3000; setItems(i=>[...i,{...t,id,duration}]); if(duration>0){ setTimeout(()=>{ setItems(i=>i.filter(x=>x.id!==id)) }, duration) } },[]) ; const remove = (id:string)=> setItems(i=>i.filter(x=>x.id!==id)); return <ToastContext.Provider value={{push}}><>{children}<div className="pointer-events-none fixed top-4 right-4 z-50 flex w-80 flex-col gap-2">
 {items.map(t=> <div key={t.id} className={cn('pointer-events-auto rounded-md border bg-card p-4 shadow transition-all data-[type=success]:border-green-400 data-[type=success]:bg-green-50 data-[type=error]:border-red-400 data-[type=error]:bg-red-50 data-[type=info]:border-blue-400 data-[type=info]:bg-blue-50',)} data-type={t.type || 'info'}>
  <div className="flex items-start gap-3">
    <div className="flex-1 space-y-1">
      {t.title && <p className="font-medium text-sm">{t.title}</p>}
      {t.description && <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>}
    </div>
    <button onClick={()=>remove(t.id)} className="text-muted-foreground/70 hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
  </div>
 </div>)}
</div></></ToastContext.Provider> }
export function useToast(){ const ctx = useContext(ToastContext); if(!ctx) throw new Error('useToast must be inside ToastProvider'); return ctx }
export function Toaster(){ return null }
export type { ToastItem }
