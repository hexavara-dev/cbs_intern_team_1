"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useApproveCostOut,
  useProcessCostOut,
  useRejectCostOut,
} from "@/hooks/useCostOut";
import { useParams } from "next/navigation";

interface CostActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "approve" | "reject" | "process" | null;
  recordId: string | null;
  onSuccess?: () => void;
  /** Optional: override projectId from useParams(). Used in global cost control context. */
  projectId?: string;
}

export function CostActionDialog({
  isOpen,
  onOpenChange,
  actionType,
  recordId,
  onSuccess,
  projectId: propProjectId,
}: CostActionDialogProps) {
  const params = useParams();
  // Use prop if provided (global context), fallback to URL params (per-project context)
  const projectId = propProjectId ?? (params.projectId as string);

  const { mutate: approveCostOut, isPending: isApproving } =
    useApproveCostOut();
  const { mutate: rejectCostOut, isPending: isRejecting } = useRejectCostOut();
  const { mutate: processCostOut, isPending: isProcessing } =
    useProcessCostOut(projectId);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const handleClose = () => {
    onOpenChange(false);
    setProofFile(null);
    setRejectReason("");
  };

  const confirmAction = () => {
    if (!recordId || !actionType) return;

    if (actionType === "approve") {
      if (!proofFile) return;
      const formData = new FormData();
      formData.append("bukti", proofFile);
      approveCostOut(
        { recordId, data: formData },
        {
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          },
        }
      );
    } else if (actionType === "process") {
      processCostOut(
        { recordId },
        {
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          },
        }
      );
    } else {
      if (!rejectReason) return;
      rejectCostOut(
        { recordId, reason: rejectReason },
        {
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          },
        }
      );
    }
  };

  const isPending = isApproving || isRejecting || isProcessing;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) =>
        !isPending && (open ? onOpenChange(true) : handleClose())
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "approve"
              ? "Approve Cost"
              : actionType === "reject"
                ? "Reject Cost"
                : "Process Cost"}
          </DialogTitle>
          <DialogDescription>
            {actionType === "approve"
              ? "Apakah anda yakin menyetujui ajuan ini? Mohon sertakan bukti transfer/pembayaran"
              : actionType === "reject"
                ? "Apakah anda yakin menolak ajuan ini? Mohon sertakan alasan penolakan"
                : "Apakah anda yakin ingin memproses ajuan ini?"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {actionType === "approve" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Bukti Transfer <span className="text-red-500">*</span>
              </label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                disabled={isPending}
              />
            </div>
          ) : actionType === "reject" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="rejectReason"
                placeholder="Masukkan alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                disabled={isPending}
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={
              actionType === "approve"
                ? "default"
                : actionType === "reject"
                  ? "destructive"
                  : "default"
            }
            onClick={confirmAction}
            disabled={
              isPending ||
              (actionType === "approve"
                ? !proofFile
                : actionType === "reject"
                  ? !rejectReason
                  : false)
            }
          >
            {isPending
              ? "Processing..."
              : `Confirm ${actionType === "approve" ? "Approval" : actionType === "reject" ? "Rejection" : "Processing"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
