import React from 'react';
import Slider from 'react-slick';
import { Package } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function ProductImageGallery({ 
  images, 
  name, 
  discount, 
  selectedImage, 
  goToImage, 
  sliderRef, 
  sliderSettings 
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <Slider ref={sliderRef} {...sliderSettings}>
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <div key={index} className="aspect-square outline-none">
                <motion.div
                   initial={{ scale: 1.1, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ duration: 0.5 }}
                   className="w-full h-full"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${name} - ${index + 1}`}
                    className="w-full h-full object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              </div>
            ))
          ) : (
            <div className="aspect-square bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-[2rem]">
              <Package className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </Slider>
        
        {discount > 0 && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-10 left-10 bg-rose-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-xl z-10 uppercase tracking-widest"
          >
            -{discount}% OFF
          </motion.div>
        )}

        {/* Decorative corner element */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
      </div>

      {images?.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-5 gap-4"
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`aspect-square rounded-[1.25rem] overflow-hidden border-2 transition-all duration-500 shadow-sm ${
                selectedImage === index 
                  ? 'border-blue-600 ring-4 ring-blue-600/10 scale-105' 
                  : 'border-white dark:border-slate-800 hover:border-blue-200 opacity-60 hover:opacity-100'
              }`}
            >
              <ImageWithFallback src={image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
