"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Heart } from "lucide-react";

/**
 * Footer Component
 * Provides comprehensive website links, contact info, and copyright
 */
export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-white/10 p-0.5">
                <Image
                  src="/pizzahub-logo.webp"
                  alt="PizzaHub Logo"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Pizza<span className="text-[#D91E18]">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Authentic handcrafted pizzas delivered hot and fresh to your doorstep in 15 minutes.
              Supporting local artisan pizzerias and hungry pizza lovers everywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Browse Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer & Vendor Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Join the Hub
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-in" className="hover:text-white transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-white transition-colors">
                  Create an Account
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-white transition-colors">
                  Become a Pizza Vendor
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D91E18] shrink-0 mt-0.5" />
                <span>124 Artisan Ave, Culinary District, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D91E18] shrink-0" />
                <span>+880 1700-123456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D91E18] shrink-0" />
                <span>support@pizzahub.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} PizzaHub Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#D91E18] fill-[#D91E18]" /> for pizza lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
