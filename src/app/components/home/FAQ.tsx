"use client"
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import localFont from "next/font/local";
import { motion } from "framer-motion";

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
  const [isVisible, setIsVisible] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Creative FAQ animation variants - Quick and snappy
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9, 
      y: 30
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 500,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -30, 
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 600
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

  const handleContactClick = () => {
    setIsContactLoading(true);
    setTimeout(() => {
      window.location.href = '/contact';
    }, 300);
  };

  const faqItems = [
    {
      question: "What is Rehearsely?",
      answer: "Rehearsely is an AI-powered scene partner that helps actors practice their lines and shoot auditions anytime, anywhere. Whether you're auditioning or rehearsing a scene, our virtual scene partner provides realistic voice interactions to help you perfect your performance."
    },
    {
      question: "What voice options do I have?",
      answer: "For each line in your scene, you can choose how the AI delivers it: Select a character, type in the text, and click 'Save' for text-to-speech. Or, tap 'Record Audio' to enhance the expression and nuance for a more immersive experience!"
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
      question: "What file formats can I upload?",
      answer: "You can upload scripts in PDF format, and we'll automatically parse the dialogue and character assignments. You can also create scenes manually by typing in the dialogue. We support most standard script formats used in theater, film, and television."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! All your scenes, voice recordings, and personal data are encrypted and stored securely. We never share your content with third parties, and you maintain full ownership of all your uploaded scripts and created content. Your artistic work stays private."
    },
    {
      question: "Can I collaborate with other actors?",
      answer: "With our Pro & Master plans, you can share scenes with scene partners, directors, or classmates. This is especially popular with drama schools and acting coaches who want to assign practice materials to their students."
    }
  ];

  return (
    <section ref={sectionRef} className="relative mx-auto flex w-full justify-center px-5 py-16 md:px-24 md:py-24 overflow-hidden">
      {/* 3D Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl opacity-30 -top-20 -left-20 transform rotate-12 shadow-2xl"></div>
        <div className="absolute w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl opacity-25 top-1/4 right-10 transform -rotate-6 shadow-xl"></div>
        <div className="absolute w-28 h-28 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl opacity-20 bottom-20 left-1/3 transform rotate-45 shadow-lg"></div>
        <div className="absolute w-36 h-36 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl opacity-15 bottom-10 right-1/4 transform -rotate-12 shadow-xl"></div>
        <div className="absolute w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-25 top-1/2 left-10 transform rotate-30 shadow-md"></div>
      </div>

      <motion.div 
        className="rounded-3xl z-10 w-full max-w-4xl bg-white p-6 md:p-12 border-4 border-black shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-5xl md:text-6xl font-bold mb-4 ${bogue.className}`}>
            Frequently Asked <span className="text-[#72a4f2]">Questions</span>
          </h2>
          <p className={`text-xl text-gray-600 ${nunito.className}`}>
            Everything you need to know about your AI scene partner
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div 
              key={index} 
              className="group"
              variants={itemVariants}
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
                faq-answer overflow-hidden transition-all duration-300 ease-out
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
        <div className={`text-center mt-12 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '800ms' }}>
          <p className={`text-lg text-gray-600 mb-6 ${nunito.className}`}>
            Still have questions? We're here to help!
          </p>
          <button 
            onClick={handleContactClick}
            disabled={isContactLoading}
            className={`group relative inline-flex items-center justify-center
              px-8 py-4 rounded-2xl font-bold text-lg border-4 border-black
              bg-gradient-to-br from-[#72a4f2] to-[#5b8ce8] text-white
              transition-all duration-300 ease-out transform min-w-[200px]
              shadow-xl hover:shadow-2xl ${sunsetSerialMediumFont.className} ${
                isContactLoading 
                  ? 'cursor-not-allowed opacity-80 scale-95' 
                  : 'hover:-translate-y-2 hover:scale-105 active:translate-y-0 active:scale-100'
              }
            `}
          >
            {/* Subtle inner glow effect */}
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none opacity-60"></div>
            
            {/* Button content */}
            <div className="relative z-10">
              {isContactLoading ? (
                <div className="flex items-center gap-3">
                  {/* Elegant pulsing dots */}
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                  </div>
                  <span>Loading</span>
                </div>
              ) : (
                'Contact Support'
              )}
            </div>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
