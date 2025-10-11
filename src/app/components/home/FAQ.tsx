"use client"
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import localFont from "next/font/local";
import { motion, useInView } from "framer-motion";

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

const nunito = localFont({
    src: "../../../../public/fonts/Nunito-Variable.ttf",
})

const bogue = localFont({
    src: "../../../../public/fonts/bogue-black.ttf",
})

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  
  // Refs for scroll animations
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const ctaRef = useRef(null);
  
  // InView hooks
  const containerInView = useInView(containerRef, { once: false });
  const headerInView = useInView(headerRef, { once: false });
  const ctaInView = useInView(ctaRef, { once: false });

  // Animation variants - FASTER!
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut" as const
      }
    }
  };

  const faqItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut" as const
      }
    }
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: 0.1,
        ease: "easeOut" as const
      }
    }
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "What is Rehearsely?",
      answer: "Rehearsely is an AI-powered scene partner that helps actors practice their lines anytime, anywhere. Whether you're preparing for an audition or rehearsing a scene, our virtual scene partner provides realistic voice interactions to help you perfect your performance."
    },
    {
      question: "How does voice cloning work?",
      answer: "Simply record a short voice sample of your scene partner, and our AI will clone their voice to deliver their lines. This creates an incredibly realistic practice experience that feels like rehearsing with the actual person. Each voice clone is unique to your scenes and stored securely."
    },
    {
      question: "Do I need special equipment?",
      answer: "Not at all! Rehearsely works with any device that has a microphone - your laptop, phone, or tablet. Our speech recognition technology adapts to your environment, whether you're in a quiet studio or a busy coffee shop."
    },
    {
      question: "Can I use Rehearsely for audition prep?",
      answer: "Absolutely! Rehearsely is perfect for self-taping and audition preparation. Practice your lines until they're perfect, adjust the pacing of your scene partner, and build confidence before your big moment. Many actors use us specifically for callback preparation."
    },
    {
      question: "How accurate is the speech recognition?",
      answer: "Our advanced speech recognition technology is specifically trained for theatrical dialogue and can handle various accents, speaking speeds, and emotional deliveries. It provides real-time feedback on your line delivery and tracks your progress through each scene."
    },
    {
      question: "What file formats can I upload?",
      answer: "You can upload scripts in PDF format, and we'll automatically parse the dialogue and character assignments. You can also create scenes manually by typing in the dialogue. We support most standard script formats used in theater, film, and television."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! All your scenes, voice recordings, and personal data are encrypted and stored securely. We never share your content with third parties, and you maintain full ownership of all your uploaded scripts and created content. Your artistic work stays private."
    },
    {
      question: "Can I collaborate with other actors?",
      answer: "With our Director's Cut plan, you can share scenes with scene partners, directors, or classmates. This is especially popular with drama schools and acting coaches who want to assign practice materials to their students."
    }
  ];

  return (
    <section className="relative mx-auto flex w-full justify-center px-5 py-16 md:px-24 md:py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-64 h-64 bg-white rounded-full opacity-5 -top-32 -right-32 animate-pulse"></div>
        <div className="absolute w-48 h-48 bg-[#ffa05a] rounded-full opacity-10 bottom-10 -left-24 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-32 h-32 bg-[#FFD96E] rounded-full opacity-15 top-1/3 right-1/4 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <motion.div 
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate={containerInView ? "visible" : "hidden"}
        className="rounded-3xl z-10 w-full max-w-4xl bg-white p-6 md:p-12 border-4 border-black shadow-2xl"
      >
        
        {/* Header */}
        <motion.div 
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <h2 className={`text-5xl md:text-6xl font-bold mb-4 ${bogue.className}`}>
            Frequently Asked <span className="text-[#72a4f2]">Questions</span>
          </h2>
          <p className={`text-xl text-gray-600 ${nunito.className}`}>
            Everything you need to know about your AI scene partner
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-4">
          {faqItems.map((item, index) => (
            <motion.div 
              key={index}
              variants={faqItemVariants}
              initial="hidden"
              animate={containerInView ? "visible" : "hidden"}
              transition={{ delay: index * 0.1 }}
              className="faq-item"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(index)}
                className={`
                  faq-question w-full text-left rounded-2xl border-3 border-black 
                  bg-gradient-to-r from-[#f8f5f0] to-[#f2e9dc] 
                  py-5 pl-7 pr-12 text-lg md:text-2xl font-bold 
                  transition-all duration-300 ease-out transform
                  hover:scale-105 hover:shadow-lg active:scale-100
                  ${sunsetSerialMediumFont.className}
                  ${openItems.includes(index) ? 'shadow-lg' : 'shadow-md'}
                  relative
                `}
              >
                {item.question}
                
                {/* Chevron Icon */}
                <div className={`
                  absolute right-6 top-1/2 transform -translate-y-1/2
                  transition-transform duration-300 ease-out
                  ${openItems.includes(index) ? 'rotate-180' : 'rotate-0'}
                `}>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className="text-[#72a4f2] text-xl"
                  />
                </div>
              </button>

              {/* Answer Panel */}
              <div className={`
                faq-answer overflow-hidden transition-all duration-500 ease-out
                ${openItems.includes(index) 
                  ? 'max-h-96 opacity-100 mt-2' 
                  : 'max-h-0 opacity-0 mt-0'
                }
              `}>
                <div className="rounded-2xl bg-gradient-to-r from-[#e9dfd2] to-[#f2e9dc] border-2 border-black">
                  <div className={`p-7 text-base md:text-xl text-gray-700 leading-relaxed ${nunito.className}`}>
                    {item.answer}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          ref={ctaRef}
          variants={ctaVariants}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          className="text-center mt-12"
        >
          <p className={`text-lg text-gray-600 mb-6 ${nunito.className}`}>
            Still have questions? We're here to help!
          </p>
          <motion.button 
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.98,
              y: 0
            }}
            className={`
              px-8 py-4 rounded-2xl font-bold text-lg border-3 border-black
              bg-gradient-to-r from-[#72a4f2] to-[#5b8ce8] text-white
              transition-all duration-300 ease-out transform
              shadow-lg ${sunsetSerialMediumFont.className}
            `}
          >
            Contact Support
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
