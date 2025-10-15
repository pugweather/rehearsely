"use client"
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
  src: "../../../public/fonts/sunsetSerialMedium.ttf",
})

const nunito = localFont({
  src: "../../../public/fonts/Nunito-Variable.ttf",
})

const ContactPage = () => {
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const router = useRouter()

  const handleBack = () => {
    setIsNavigatingBack(true)
    setTimeout(() => {
      router.back()
    }, 150)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      // You can add actual form submission logic here
      alert('Thank you for your message! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 2000)
  }

  const isFormValid = formData.name && formData.email && formData.subject && formData.message

  return (
    <div className="min-h-screen pt-[75px] bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc]">
      <div className="pt-12 p-4 pb-8">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] border-4 border-black shadow-xl rounded-3xl p-6 relative">
            {/* Back Button - Positioned at top left of form */}
            <button
              onClick={handleBack}
              disabled={isNavigatingBack}
              className={`absolute top-6 left-6 w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center transition-all duration-200 shadow-md z-10 ${
                isNavigatingBack 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-gray-50 hover:shadow-lg'
              }`}
            >
              {isNavigatingBack ? (
                <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700" />
              )}
            </button>

            {/* Header Section */}
            <div className="text-center mb-4 pt-4">
              <div className="w-16 h-16 rounded-full border-3 border-black bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-blue-600" />
              </div>
              <h2 className={`text-4xl font-bold text-gray-800 mb-3 ${sunsetSerialMediumFont.className}`}>
                Get in Touch
              </h2>
              <p className={`text-gray-700 text-xl font-medium ${nunito.className}`}>
                We'd love to hear from you! Drop us a line and let's chat!
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Email Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className={`block text-base font-bold text-gray-700 mb-2 ${sunsetSerialMediumFont.className}`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200 text-base ${nunito.className}`}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={`block text-base font-bold text-gray-700 mb-2 ${sunsetSerialMediumFont.className}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200 text-base ${nunito.className}`}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className={`block text-base font-bold text-gray-700 mb-2 ${sunsetSerialMediumFont.className}`}>
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200 text-base ${nunito.className}`}
                >
                  <option value="">Select a topic</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="bug-report">Bug Report</option>
                  <option value="general-inquiry">General Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className={`block text-base font-bold text-gray-700 mb-2 ${sunsetSerialMediumFont.className}`}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none text-base ${nunito.className}`}
                  placeholder="Please describe your question or issue in detail..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg border-3 border-black transition-all duration-300 ease-out transform ${sunsetSerialMediumFont.className} ${
                    !isFormValid || isSubmitting
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-[#72a4f2] to-[#5b8ce8] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <FontAwesomeIcon icon={faPaperPlane} />
                      <span>Send Message</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
