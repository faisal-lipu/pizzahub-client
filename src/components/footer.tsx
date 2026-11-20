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

            {/* Social Links with the NEW X Logo per UI Design Requirements */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-[#D91E18] text-stone-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                aria-label="Follow PizzaHub on X"
              >
                {/* Official new X logo (not old Twitter bird) */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-[#D91E18] text-stone-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                aria-label="Like PizzaHub on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-[#D91E18] text-stone-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                aria-label="Follow PizzaHub on Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
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
