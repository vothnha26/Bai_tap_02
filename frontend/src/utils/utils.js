import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format shipping address from object or string to a displayable string
 * @param {Object|String} address 
 * @returns {String}
 */
export const formatAddress = (address) => {
  if (!address) return 'N/A';
  if (typeof address === 'string') return address;
  
  if (address.fullText) return address.fullText;

  const parts = [
    address.street,
    address.ward,
    address.district,
    address.province
  ].filter(part => part && part !== 'N/A' && part !== '');
  
  return parts.length > 0 ? parts.join(', ') : 'N/A';
};
