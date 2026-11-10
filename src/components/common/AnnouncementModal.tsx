import React, { useState, useEffect } from 'react';
import { useBooking } from '@/context/BookingContext';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Megaphone, Bell, Calendar, CheckCircle2 } from 'lucide-react';

interface AnnouncementModalProps {
  // If controlled externally (e.g. from bottom nav or profile)
  isOpen?: boolean;
  onClose?: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const { announcement } = useBooking();
  const [internalOpen, setInternalOpen] = useState(false);

  // Auto-show on site entry if active and not previously dismissed
  useEffect(() => {
    if (!announcement || !announcement.active || !announcement.message) return;

    try {
      const dismissedId = localStorage.getItem('maya_dismissed_announcement_id');
      if (dismissedId !== announcement.id) {
        // Delay slightly for smooth page entrance
        const timer = setTimeout(() => {
          setInternalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Storage notice:', e);
    }
  }, [announcement]);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;

  const handleClose = () => {
    if (announcement?.id) {
      try {
        localStorage.setItem('maya_dismissed_announcement_id', announcement.id);
      } catch (e) {
        console.warn('Storage notice:', e);
      }
    }
    setInternalOpen(false);
    if (externalOnClose) externalOnClose();
  };

  if (!announcement || !announcement.active) {
    if (externalIsOpen) {
      return (
        <Modal
          isOpen={true}
          onClose={externalOnClose || (() => {})}
          title="Venue Notices & Updates"
          description="Official announcements from Maya Sports Centre administration."
        >
          <div className="text-center py-8 space-y-3">
            <Bell className="w-10 h-10 text-surface-300 mx-auto" />
            <h4 className="text-sm font-bold text-surface-800">No Active Announcements</h4>
            <p className="text-xs text-surface-500">
              There are currently no urgent maintenance breaks or schedule alerts. All courts are operating on regular hours.
            </p>
            <Button size="sm" variant="outline" onClick={externalOnClose} className="mt-2 font-bold">
              Got it
            </Button>
          </div>
        </Modal>
      );
    }
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={announcement.title || 'Official Venue Announcement'}
      description="Important update from Maya Sports Centre management."
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="space-y-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                Venue Notice
              </span>
              {announcement.date && (
                <span className="text-[11px] text-surface-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3" /> {announcement.date}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-surface-900 tracking-tight">
              {announcement.title}
            </h3>
          </div>
        </div>

        <div className="bg-surface-50 rounded-2xl border border-surface-200 p-4 text-xs sm:text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">
          {announcement.message}
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
            onClick={handleClose}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Understood &amp; Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
