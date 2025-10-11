"use client"
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, 
  faStar, 
  faMicrophone, 
  faWaveSquare, 
  faUsers, 
  faInfinity,
  faCrown,
  faRocket
} from "@fortawesome/free-solid-svg-icons";
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

export default function Pricing() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  
  // Refs for scroll animations
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const ctaRef = useRef(null);
  
  // InView hooks
  const headerInView = useInView(headerRef, { once: false });
  const cardsInView = useInView(cardsRef, { once: false });
  const ctaInView = useInView(ctaRef, { once: false });

  // Animation variants - FASTER!
  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  const cardsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 20 },
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

  const plans = [
    {
      name: "Scene Partner",
      price: "$9",
      period: "/month",
      description: "Perfect for getting started with AI scene practice",
      icon: faMicrophone,
      color: "#72a4f2",
      bgGradient: "from-[#72a4f2] to-[#5b8ce8]",
      features: [
        "50 AI-generated lines per month",
        "Basic voice selection (10 voices)",
        "Standard audio quality",
        "Scene creation & editing",
        "Basic practice mode",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Leading Role",
      price: "$19",
      period: "/month",
      description: "Most popular for serious actors and performers",
      icon: faStar,
      color: "#ffa05a",
      bgGradient: "from-[#ffa05a] to-[#ff8a3a]",
      features: [
        "500 AI-generated lines per month",
        "Premium voice library (50+ voices)",
        "Voice cloning (3 custom voices)",
        "HD audio quality",
        "Advanced practice analytics",
        "Speed & delay controls",
        "Priority support",
        "Export audio files"
      ],
      popular: true
    },
    {
      name: "Director's Cut",
      price: "$39",
      period: "/month",
      description: "For professionals and drama schools",
      icon: faCrown,
      color: "#FFD96E",
      bgGradient: "from-[#FFD96E] to-[#ffc947]",
      features: [
        "Unlimited AI-generated lines",
        "Full voice library access",
        "Unlimited voice cloning",
        "Studio-quality audio",
        "Team collaboration tools",
        "Advanced scene analysis",
        "Custom voice training",
        "White-label options",
        "Dedicated account manager"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-32 h-32 bg-[#72a4f2] rounded-full opacity-5 -top-16 -left-16 animate-pulse"></div>
        <div className="absolute w-24 h-24 bg-[#ffa05a] rounded-full opacity-5 top-1/4 right-10 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-20 h-20 bg-[#FFD96E] rounded-full opacity-5 bottom-20 left-1/4 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <h2 className={`text-6xl font-bold mb-6 ${bogue.className}`}>
            Choose Your <span className="text-[#72a4f2]">Stage</span>
          </h2>
          <p className={`text-2xl text-gray-600 max-w-3xl mx-auto ${nunito.className}`}>
            From first audition to Broadway dreams, we've got the perfect plan for every performer
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          ref={cardsRef}
          variants={cardsContainerVariants}
          initial="hidden"
          animate={cardsInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="relative group"
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={`px-6 py-2 rounded-full text-white text-sm font-bold ${sunsetSerialMediumFont.className} shadow-lg`}
                       style={{ backgroundColor: plan.color }}>
                    <FontAwesomeIcon icon={faRocket} className="mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`
                relative bg-white rounded-3xl p-8 border-4 border-black shadow-xl
                transition-all duration-500 ease-out transform
                ${activeCard === index ? 'scale-105 shadow-2xl -translate-y-2' : 'hover:scale-102 hover:shadow-xl'}
                ${plan.popular ? 'ring-4 ring-[#ffa05a] ring-opacity-30' : ''}
              `}>
                {/* Header with icon */}
                <div className="text-center mb-8">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: plan.color }}
                  >
                    <FontAwesomeIcon icon={plan.icon} className="text-white text-2xl" />
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 ${sunsetSerialMediumFont.className}`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`text-gray-600 text-sm ${nunito.className}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className={`text-5xl font-bold ${bogue.className}`} style={{ color: plan.color }}>
                      {plan.price}
                    </span>
                    <span className={`text-xl text-gray-500 ml-2 ${nunito.className}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: plan.color }}
                      >
                        <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                      </div>
                      <span className={`text-gray-700 ${nunito.className}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`
                    w-full py-4 px-6 rounded-2xl font-bold text-lg border-3 border-black
                    transition-all duration-300 ease-out transform
                    ${sunsetSerialMediumFont.className}
                    ${plan.popular 
                      ? `bg-gradient-to-r ${plan.bgGradient} text-white shadow-lg hover:shadow-xl hover:-translate-y-1` 
                      : 'bg-white text-gray-800 hover:bg-gray-50 shadow-md hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  {plan.popular ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          ref={ctaRef}
          variants={ctaVariants}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          className="text-center mt-16"
        >
          <p className={`text-lg text-gray-600 mb-6 ${nunito.className}`}>
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="text-green-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
