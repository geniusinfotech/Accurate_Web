"use client";

import Modal from "@/components/admin/Modal";

export interface LotTraceModalProps {
  isOpen: boolean;
  lotId: string | null;
  onClose: () => void;
}

export function LotTraceModal({ isOpen, lotId, onClose }: LotTraceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manufacturing Lot Trace"
      subtitle={lotId ? `Batch / Lot ID: ${lotId}` : "Trace raw materials and production history"}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-sm text-charcoal">
        {lotId ? (
          <div className="bg-cream/60 border border-border-gray rounded-sm p-4 space-y-2">
            <p className="font-semibold text-charcoal">Lot Details</p>
            <p className="text-xs text-charcoal/70">Batch Reference: <span className="font-mono">{lotId}</span></p>
            <p className="text-xs text-charcoal/50">Tracking manufacturing lineage and material source.</p>
          </div>
        ) : (
          <p className="text-charcoal/50 italic">No lot selected.</p>
        )}
      </div>
    </Modal>
  );
}
