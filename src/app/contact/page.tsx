"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    orderId: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const contactCards = [
    {
      icon: MapPin,
      title: "Kitchen Headquarters",
      detail: "124 Artisan Ave, Culinary District, Dhaka, Bangladesh",
      note: "Visit our central test kitchen & pickup hub",
      badge: "Central Hub",
      color: "bg-red-50 text-[#D91E18] border-red-200",
    },
    {
      icon: Phone,
      title: "Express Hotline",
      detail: "+880 1700-PIZZAHUB (749924)",
      note: "Instant support for live orders & dispatch",
      badge: "Toll Free",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      icon: Mail,
      title: "Email Support",
      detail: "support@pizzahub.com",
      note: "Response typically within 2 business hours",
      badge: "24/7 Monitored",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      icon: Clock,
      title: "Kitchen Hours",
      detail: "Monday - Sunday: 10:00 AM - 12:00 AM",
      note: "Open all 7 days including public holidays",
      badge: "Open Daily",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const faqs = [
    {
      q: "How fast is pizza delivery with PizzaHub?",
      a: "Our artisan kitchens prepare orders immediately upon receipt. Average delivery time ranges between 15 and 30 minutes depending on your distance from the selected artisan vendor.",
    },
    {
      q: "How do I become a verified Pizza Vendor on the platform?",
      a: "Pizzeria owners can register by clicking 'Create an Account' or 'Become a Pizza Vendor' on the Sign Up page. Select the 'Vendor' role to gain access to the Vendor Dashboard, where you can upload menu items, set prices, and accept live orders.",
    },
    {
      q: "What payment options are supported?",
      a: "We support instant online card payments (Visa, Mastercard, American Express via Stripe Elements), mobile financial services, and Cash on Delivery (COD) upon receipt.",
    },
    {
      q: "Can I track my order status in real time?",
      a: "Yes! Every order has a live visual status timeline in your Customer Dashboard. You can see when your order is Placed, Accepted by the Kitchen, Baking, and Out for Delivery.",
    },
    {
      q: "What if there is an issue with my pizza or delivery?",
      a: "Customer satisfaction is our highest priority. If an item arrives damaged, incorrect, or delayed, please submit the contact form with your Order ID or call our hotline directly for an instant replacement or refund.",
    },
    {
      q: "Do you offer bulk orders for corporate events or parties?",
      a: "Absolutely! For orders larger than 10 pizzas, choose 'Corporate Catering / Bulk Order' in the inquiry form below, and our dispatch manager will coordinate with your preferred pizzeria for scheduled delivery.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields (Name, Email, Message)");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Thank you! Your message has been received by our support team.");
    }, 1000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("124 Artisan Ave, Culinary District, Dhaka, Bangladesh");
    setCopiedAddress(true);
    toast.success("Headquarters address copied to clipboard!");
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 overflow-hidden">
      {/* Header Banner */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#D91E18] text-xs font-black tracking-wider uppercase">
            <MessageSquare className="w-4 h-4 fill-[#D91E18]" />
            <span>Connect with PizzaHub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900">
            We&apos;re Here to Help You{" "}
            <span className="text-[#D91E18]">Feast</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
            Have questions about an active order, interested in joining as a partner pizzeria, or want to
            give us feedback? Our dedicated kitchen and support team is ready to assist.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactCards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D91E18] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${c.color}`}
                    >
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mb-1">{c.title}</h3>
                  <p className="text-xs sm:text-sm font-semibold text-stone-800 leading-snug">
                    {c.detail}
                  </p>
                </div>
                <div className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">
                  {c.note}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Form & Hub Location Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xs">
              <div className="mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-[#D91E18]">
                  Direct Message
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  Send Us a Note
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Fill out the form below and we will route your inquiry to the right department.
                </p>
              </div>

              {isSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900">
                    Message Dispatched Successfully!
                  </h3>
                  <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Our culinary support team has
                    received your message regarding <em>{formData.category}</em> and will reply to{" "}
                    <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        category: "General Inquiry",
                        orderId: "",
                        message: "",
                      });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Faisal Ahmed"
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D91E18]/30 focus:border-[#D91E18] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="faisal@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D91E18]/30 focus:border-[#D91E18] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+880 1700-000000"
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D91E18]/30 focus:border-[#D91E18] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D91E18]/30 focus:border-[#D91E18] transition-all"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order Status / Delivery Issue">
                          Order Status / Delivery Issue
                        </option>
                        <option value="Vendor Partnership / Join Hub">
                          Vendor Partnership / Join Hub
                        </option>
                        <option value="Corporate Catering / Bulk Order">
                          Corporate Catering / Bulk Order
                        </option>
                        <option value="App Feedback / Suggestion">
                          App Feedback / Suggestion
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Order ID (If applicable)
                    </label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="e.g. 6aff25e88c5e899f8458e620"
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D91E18]/30 focus:border-[#D91E18] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you need, describe your order inquiry, or ask how to partner with PizzaHub..."
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D91E18]/30 focus:border-[#D91E18] transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-[#D91E18] hover:bg-[#b81813] text-white font-bold text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Dispatching Your Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Support</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Support & Location Card Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Order Support Notice */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-950">
                    Need Urgent Order Support?
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
                    If you have an active pizza order out for delivery right now, you can view live
                    status updates in your dashboard or call our hotline for direct intervention.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href="/dashboard/customer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-950 text-white text-xs font-bold hover:bg-stone-900 transition-colors"
                    >
                      <span>Track in Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href="tel:+8801700749924"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-amber-300 text-amber-950 text-xs font-bold hover:bg-amber-100/50 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#D91E18]" />
                      <span>Call +880 1700-749924</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylized Headquarters Map Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D91E18]" />
                  <span className="text-sm font-black text-stone-900">
                    PizzaHub Central Kitchen Hub
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open Now
                </span>
              </div>

              {/* Visual Map Mockup Card */}
              <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                {/* Stylized background representing map */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-stone-50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#D91E18] text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-stone-800 mt-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-xs border border-stone-200">
                    124 Artisan Ave, Culinary District, Dhaka
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-stone-500">
                  Direct curbside pickup & logistics center
                </div>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Vendor Callout Card */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D91E18]">
                For Pizzerias & Bakers
              </span>
              <h3 className="text-lg font-black text-white">Want to Sell on PizzaHub?</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Join our curated network of artisan kitchens. Reach thousands of local pizza lovers
                with zero listing fees and instant automated dispatch.
              </p>
              <div className="pt-2">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D91E18] text-white text-xs font-bold hover:bg-[#b81813] transition-colors"
                >
                  <span>Apply as Vendor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 sm:py-20 bg-white border-t border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#D91E18]" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Got Questions? We Have Answers.
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Quick answers to the most common inquiries regarding ordering, delivery, and vendor onboarding.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-stone-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-stone-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#D91E18]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-2 bg-white text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
