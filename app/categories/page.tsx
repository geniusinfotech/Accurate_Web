"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { PageFrame } from "@/components/storefront";

import { api, getImageUrl } from "@/lib/api";
import type { Category as ApiCategory } from "@/lib/types/api";

const fallbackCategories = [
  { _id: "1", name: "Laundry Care", slug: "laundry-care", image: "https://images.unsplash.com/photo-1582735689149-c12e524bd645?auto=format&fit=crop&q=80&w=800" },
  { _id: "2", name: "Dish Care", slug: "dish-care", image: "https://images.unsplash.com/photo-1585002242080-60fbebb84eb6?auto=format&fit=crop&q=80&w=800" },
  { _id: "3", name: "Surface Care", slug: "surface-care", image: "https://images.unsplash.com/photo-1584820927498-cafe4c10776b?auto=format&fit=crop&q=80&w=800" },
  { _id: "4", name: "Specialized Cleaning", slug: "specialized-cleaning", image: "https://images.unsplash.com/photo-1596755490731-0df04f4a3e9c?auto=format&fit=crop&q=80&w=800" },
  { _id: "5", name: "Personal Care", slug: "personal-care", image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=800" },
  { _id: "6", name: "Toilet Cleaner", slug: "toilet-cleaner-liquid", image: "https://images.unsplash.com/photo-1584820927506-697960fc5d4c?auto=format&fit=crop&q=80&w=800" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get<ApiCategory[] | { items: ApiCategory[] }>("/categories")
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.items || [];
        const active = list.filter((c: any) => c.isActive !== false);
        if (active.length > 0) {
          setCategories(
            active.map((cat: any, index: number) => ({
              _id: cat._id || cat.id,
              name: cat.name,
              slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
              image:
                getImageUrl(cat.image || cat.homepageCoverImage) ||
                fallbackCategories[index % fallbackCategories.length].image,
            }))
          );
        }
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageFrame>
      <div className="limewash-section min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Shop by Category
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our premium range of cleaning solutions tailored for your every need.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {categories.map((category: any, index: number) => (
              <motion.div key={category._id || index} variants={itemVariants}>
                <Link href={`/shop?category=${category.slug || category.name.toLowerCase().replace(/ /g, '-')}`}>
                  <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 h-[300px] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-gray-200">
                      <Image
                        src={category.image || fallbackCategories[index % fallbackCategories.length].image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="relative z-10 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                      <div className="flex items-center text-blue-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Explore Products</span>
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
    </PageFrame>
  );
}
