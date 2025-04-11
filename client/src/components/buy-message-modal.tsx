import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface BuyMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyMessageModal({ isOpen, onClose }: BuyMessageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center p-2">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 text-yellow-500 mb-6">
            <AlertTriangle className="h-6 w-6" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Manas Dewan Don't Buy Haha</h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is just a demo message. The purchase functionality is not available at this time.
          </p>
          
          <Button
            onClick={onClose}
            className="inline-flex justify-center"
          >
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
