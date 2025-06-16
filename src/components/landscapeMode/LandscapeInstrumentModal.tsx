// components/LandscapeInstrumentModal.tsx
import React, { useEffect } from "react";
import { unlockOrientation } from "./lockToLandscape";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const LandscapeInstrumentModal: React.FC<Props> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleBack = () => {
            unlockOrientation();
            onClose();
        };
        if (isOpen) {
            window.history.pushState(null, "", window.location.href);
            window.addEventListener("popstate", handleBack);
        }
        return () => {
            window.removeEventListener("popstate", handleBack);
            unlockOrientation();
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="overflow-x-auto relative w-full bg-white rounded-2xl shadow-xl p-4 landscape-modal"
                    >

                        <Button variant="outline"
                            onClick={onClose}
                            className=" px-4 py-2 rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-700 overflow-hidden hover:brightness-125 transition-all animate-pulse duration-5000 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] fixed top-5 right-5"
                            aria-label="Close"
                        >
                            <X size={18} /> Close
                        </Button>
                        <div className="mt-6">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LandscapeInstrumentModal;
