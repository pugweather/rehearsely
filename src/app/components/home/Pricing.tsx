"use client"
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, 
  faStar, 
  faMicrophone, 
  faWaveSquare, 
  faUsers, 
  faInfinity,
  faCrown,
  faRocket,
  faSkull,
  faFire
} from "@fortawesome/free-solid-svg-icons";
import localFont from "next/font/local";

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
  const [isVisible, setIsVisible] = useState(false);
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

  // Creative pricing animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 100, 
      scale: 0.8,
      rotateX: 15
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 300
      }
    }
  };

  const plans = [
    {
      name: "Starter Pack",
      price: "Free",
      period: "",
      description: "Perfect for trying out our app",
      icon: faMicrophone,
      color: "#72a4f2",
      bgGradient: "from-[#72a4f2] to-[#5b8ce8]",
      features: [
        "3 pages per month",
        "Choose from our selection of lifelike AI voices",
        "Auto import scripts from PDF",
        "Unlimited takes"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$10",
      period: "/month",
      description: "Most popular for serious actors and performers",
      icon: faStar,
      color: "#FFD96E",
      bgGradient: "from-[#FFD96E] to-[#ffc947]",
      features: [
        "25 pages per month",
        "Everything in Starter Pack",
        "Voice cloning & recording",
        "Teleprompter access"
      ],
      popular: true
    },
    {
      name: "Master",
      price: "$28",
      period: "/month",
      description: "For professionals and drama schools",
      icon: faCrown,
      color: "#dc2626",
      bgGradient: "from-[#dc2626] to-[#991b1b]",
      features: [
        "Unlimited pages",
        "Everything in Pro",
        "Priority support",
        "Early access to new features"
      ],
      popular: false
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-32 h-32 bg-[#72a4f2] rounded-full opacity-5 top-10 -left-16 animate-pulse"></div>
        <div className="absolute w-24 h-24 bg-[#ffa05a] rounded-full opacity-5 top-1/4 right-10 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-20 h-20 bg-[#72a4f2] rounded-full opacity-5 bottom-20 left-1/4 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className={`text-6xl font-bold mb-6 ${bogue.className}`}>
            Choose Your <span className="text-[#72a4f2]">Stage</span>
          </h2>
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
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Popular badge - attached to top */}
              {plan.popular && (
                <div className="absolute -top-[11px] left-0 right-0 z-20">
                  <div className={`mx-auto w-fit px-6 py-2 rounded-xl text-white text-sm font-bold ${sunsetSerialMediumFont.className} shadow-lg`}
                       style={{ backgroundColor: plan.color, borderRadius: "10px"}}>
                    <FontAwesomeIcon icon={faRocket} className="mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`
                relative bg-white rounded-3xl p-8 border-4 border-black shadow-xl
                ${plan.popular ? 'mt-8' : ''}
                ${plan.name === 'Pro' ? 'ring-4 ring-yellow-200' : ''}
                ${plan.name === 'Master' ? 'ring-4 ring-red-200' : ''}
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
                    bg-gradient-to-r ${plan.bgGradient} text-white shadow-lg 
                    hover:shadow-xl hover:-translate-y-1 hover:scale-105
                  `}
                >
                  {plan.name === 'Starter Pack' ? 'Start Free' : 
                   plan.name === 'Master' ? 'Go Master' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '800ms' }}>
        </div>
      </div>
    </section>
  );
}
