import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((type, message, duration = 4000) => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, type, message }]);
        if (duration > 0) setTimeout(() => remove(id), duration);
        return id;
    }, [remove]);

    const toast = {
        success: (msg, d) => push('success', msg, d),
        error: (msg, d) => push('error', msg, d),
        info: (msg, d) => push('info', msg, d),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastViewport toasts={toasts} onRemove={remove} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
    return ctx;
}

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const STYLES = {
    success: 'border-juju-dore/40',
    error: 'border-red-500/40',
    info: 'border-juju-violet/40',
};
const ICON_COLORS = {
    success: 'text-juju-dore',
    error: 'text-red-400',
    info: 'text-juju-violet',
};

function ToastViewport({ toasts, onRemove }) {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none">
            {toasts.map((t) => {
                const Icon = ICONS[t.type] || Info;
                return (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border bg-juju-light-card dark:bg-juju-bleu shadow-2xl animate-toast-in ${STYLES[t.type] || STYLES.info}`}
                    >
                        <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_COLORS[t.type] || ICON_COLORS.info}`} />
                        <p className="text-sm text-juju-light-texte dark:text-juju-texte flex-1">{t.message}</p>
                        <button
                            onClick={() => onRemove(t.id)}
                            className="shrink-0 text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-light-texte dark:hover:text-juju-texte transition-colors"
                            aria-label="Fermer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}