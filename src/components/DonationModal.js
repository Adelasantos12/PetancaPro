import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

const DonationModal = ({ isOpen, onClose, playerCount, paypalEmail }) => {
  if (!isOpen) {
    return null;
  }

  const donationAmount = playerCount * 2;
  const paypalLink = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${paypalEmail}&item_name=Aportación+voluntaria+para+el+torneo&amount=${donationAmount}.00&currency_code=USD`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full m-4 relative"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 !p-2"
            primary={false}
          >
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">¡Gracias por participar!</h2>
          <p className="text-gray-600 mb-6 text-center">
            Para ayudar a mantener estos torneos, te invitamos a hacer una aportación voluntaria. La cantidad sugerida es de <span className="font-bold">${donationAmount}</span> ({playerCount} jugadores x $2).
          </p>
          <div className="flex flex-col gap-4">
            <a
              href={paypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button primary className="w-full">
                Aportar con PayPal
              </Button>
            </a>
            <Button onClick={onClose} primary={false}>
              Continuar al torneo
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DonationModal;
