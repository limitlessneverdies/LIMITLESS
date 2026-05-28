import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, AlertTriangle, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'info'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-y-0 inset-x-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-2xl z-10 space-y-5 text-left"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${
                type === 'danger'
                  ? 'bg-red-950/30 border border-red-900/40 text-red-500'
                  : type === 'warning'
                    ? 'bg-amber-950/30 border border-amber-900/40 text-amber-500'
                    : 'bg-gold-brand/10 border border-gold-brand/20 text-gold-brand'
              }`}>
                {type === 'danger' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold font-serif italic text-gold-brand">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans select-none">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-dark-card border border-dark-border text-text-bright hover:bg-dark-hover rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider ${
                  type === 'danger'
                    ? 'bg-red-650 hover:bg-red-700 text-white shadow-red-950/20'
                    : 'bg-gold-brand hover:bg-gold-brand/90 text-black shadow-gold-brand/10'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
