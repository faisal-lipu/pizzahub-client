"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Clock,
  Store,
  Users,
  Wheat,
  Sparkles,
  Zap,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Award,
  ShieldCheck,
  ChefHat,
  Star,
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    {
      icon: Flame,
      value: "500°C",
      label: "Wood-Fired Ovens",
      sub: "Authentic volcanic stone baking",
    },
    {
      icon: Clock,
      value: "15-25 min",
      label: "Fastest Hot Delivery",
      sub: "Direct from artisan kitchen",
    },
    {
      icon: Store,
      value: "25+",
      label: "Artisan Pizzerias",
      sub: "Verified independent vendors",
    },
    {
      icon: Users,
      value: "50k+",
      label: "Happy Pizza Lovers",
      sub: "Savoring fresh slices daily",
    },
  ];

  const pillars = [
    {
      icon: Wheat,
      title: "48-Hour Slow Fermentation",
      description:
        "Our dough is naturally fermented for 48 hours using double-zero Italian flour. The result is an ultra-airy, fragrant cornicione with authentic leopard charring that is naturally light and easy to digest.",
      badge: "Signature Crust",
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      icon: Sparkles,
      title: "100% Farm-Fresh Ingredients",
      description:
        "From San Marzano DOP plum tomatoes to artisanal buffalo mozzarella and organic garden basil picked every morning, zero compromises are made on freshness and authenticity.",
      badge: "Pure Quality",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      icon: Zap,
      title: "Thermal Direct Logistics",
      description:
        "Every pizza travels in high-grade heat-retaining thermal carriers. No cold cheese, no soggy crusts—just sizzling, bubbling artisan pizza arriving at your door as if served fresh at the counter.",
      badge: "Piping Hot",
      color: "bg-red-50 text-[#D91E18] border-red-200",
    },
    {
      icon: HeartHandshake,
      title: "Empowering Independent Pizzerias",
      description:
        "PizzaHub was built to champion neighborhood artisan pizza artisans. We provide small kitchens with modern digital ordering, live kitchen dispatch, and payment systems to thrive.",
      badge: "Community First",
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Handcrafted to Order",
      desc: "Each pie is hand-stretched and topped by experienced pizzaiolos the moment your order hits the kitchen display.",
    },
    {
      step: "02",
      title: "90-Second Stone Blast",
      desc: "Baked in blistering 500°C wood-fired ovens until the crust puffs with signature char and the cheese is molten perfection.",
    },
    {
      step: "03",
      title: "Live Stepper Tracking",
      desc: "Watch your pizza journey in real-time on your dashboard from 'Accepted' to 'Baking' to 'Out for Delivery'.",
    },
    {
      step: "04",
      title: "Unbox & Enjoy Hot",
      desc: "Arrives at your doorstep piping hot, perfectly sliced, and accompanied by our signature garlic herb dips.",
    },
  ];

  const team = [
    {
      name: "Chef Marco Rossi",
      role: "Master Pizzaiolo & Culinary Director",
      bio: "Born in Naples with 18 years of artisan baking experience. Trained in classical Vera Pizza Napoletana techniques.",
      image:
        "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80",
      tag: "Neapolitan Specialist",
    },
    {
      name: "Kabir Ahmed",
      role: "Co-Founder & Head of Operations",
      bio: "Tech entrepreneur and obsessive foodie on a mission to solve cold pizza delivery through smart culinary routing.",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      tag: "Platform Architect",
    },
    {
      name: "Elena Vance",
      role: "Quality & Dough Research Lead",
      bio: "Food scientist specialized in wild sourdough yeast cultures, hydration balancing, and gluten matrix fermentation.",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
      tag: "Fermentation Expert",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#D91E18] text-xs font-black tracking-wider uppercase">
            <Flame className="w-4 h-4 fill-[#D91E18]" />
            <span>The PizzaHub Journey</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-tight">
            Crafting Every Slice with{" "}
            <span className="text-[#D91E18] relative inline-block">
              Passion & Fire
              <svg
                className="absolute -bottom-2 left-0 w-full text-red-300 -z-10 h-3"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 15 Q 50 0 100 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium">
            Founded with a singular devotion: to connect food enthusiasts with the
            finest independent artisan pizzerias and deliver blistered, oven-hot
            perfection straight to your table in record time.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D91E18] text-white font-bold text-sm shadow-lg shadow-red-600/20 hover:bg-[#b81813] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white border border-stone-200 text-stone-800 font-bold text-sm hover:bg-stone-50 transition-colors shadow-xs"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>

        {/* Brand Stats Grid */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D91E18] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5">
                    {s.label}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-16 sm:py-24 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Story Image Composition */}
            <div className="relative">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80"
                  alt="Artisan Pizza in Wood-fired Oven"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                    Tradition & Mastery
                  </span>
                  <p className="text-sm font-medium text-white/90">
                    Hand-stretched slow dough baked at blistering heats for the signature airy crust.
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 bg-stone-900 text-white p-4 rounded-2xl shadow-xl border border-stone-800">
                <div className="w-10 h-10 rounded-xl bg-[#D91E18] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-300">Certified Authentic</div>
                  <div className="text-sm font-black text-white">100% Artisan Pizzerias</div>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider">
                <ChefHat className="w-3.5 h-3.5 text-[#D91E18]" />
                <span>Our Heritage & Vision</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight leading-snug">
                Born From a Refusal to Accept <br />
                <span className="text-[#D91E18]">Soggy, Cold Pizza.</span>
              </h2>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                For years, ordering pizza online felt like a gamble. Cold rubbery cheese,
                steam-trapped cardboard boxes that ruined crispy crusts, and standardized mass-produced
                chains taking the soul away from authentic baking.
              </p>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                We founded <strong>PizzaHub</strong> to celebrate true artisan pizza. We built a
                high-speed platform that pairs passionate local pizzaiolos with hyper-efficient
                dispatch technology. From 48-hour fermented sourdough to blistered leopard crusts, we
                bring the real trattoria experience directly to your living room.
              </p>

              <div className="pt-2 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-stone-700">
                    Direct-to-oven queueing reduces waiting time by 40%
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-stone-700">
                    All dough prepared with unbleached flour, olive oil, and live cultures
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-stone-700">
                    Transparent customer reviews and verified vendor metrics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#D91E18] text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The PizzaHub Standard</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Our Four Pillars of Quality
          </h2>
          <p className="text-sm text-stone-500">
            Every pie served through PizzaHub must adhere to our strict culinary principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800">
                      <Icon className="w-6 h-6 text-[#D91E18]" />
                    </div>
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${p.color}`}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#D91E18]">
              Seamless Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              The Journey of Your Pizza
            </h2>
            <p className="text-sm text-stone-400">
              From artisan fire to your hands in 4 simple stages
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="bg-stone-800/70 border border-stone-700/60 rounded-3xl p-6 relative flex flex-col justify-between hover:border-red-500/50 transition-colors"
              >
                <div className="text-4xl font-black text-white/10 mb-4">{st.step}</div>
                <div>
                  <h3 className="text-lg font-black text-white mb-2">{st.title}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culinary Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-wider border border-amber-200">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Master Craftsmen</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Meet the Masters Behind the Dough
          </h2>
          <p className="text-sm text-stone-500">
            The culinary visionaries and engineers dedicated to keeping pizza authentic and piping hot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
                    {member.tag}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-stone-900">{member.name}</h3>
                  <p className="text-xs font-bold text-[#D91E18] mb-3">{member.role}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Quote Banner */}
      <section className="py-16 bg-red-50/60 border-y border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="flex justify-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-lg sm:text-2xl font-black text-stone-900 leading-snug">
            &ldquo;PizzaHub completely transformed how we eat pizza on weekends. The crust still
            crunches, the cheese is molten, and we get to support incredible local bakers in our
            neighborhood!&rdquo;
          </blockquote>
          <p className="text-xs sm:text-sm font-bold text-stone-500">
            — Tasmia Rahman, Verified Pizza Lover & Customer
          </p>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-stone-900 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D91E18]">
              Ready for the Real Thing?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Hungry Yet? Your Perfect Slice is Minutes Away.
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Explore freshly tossed specials, artisan classics, and chef picks. Order now with
              instant tracking and direct-from-oven delivery.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#D91E18] text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:bg-[#b81813] transition-all"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                <span>Become a Pizza Vendor</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
