"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

import { ShopProduct } from "@/types";

import { blurDataURL } from "@/lib/image-blur";
import { ImagePresets } from "@/lib/supabase/image-transform";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface ShopProductsProps {
  products: ShopProduct[];
}

const ShopProducts = ({ products }: ShopProductsProps) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section id="products" className="!pb-17 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl -z-10" />

      <div className="container-custom">
        {/* Products Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {products.slice(0, 6).map((product, index) => (
            <motion.div key={product.id} variants={fadeInUp}>
              <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-500 border-0">
                <CardContent className="p-0">
                  {/* Image with Caption Overlay */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={
                        product.image_url
                          ? ImagePresets.shopProduct(product.image_url)
                          : "/images/placeholder-court.webp"
                      }
                      alt={product.name}
                      fill
                      quality={85}
                      priority={index < 3}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      loading={index < 3 ? undefined : "lazy"}
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                    />

                    {/* Gradient Overlay - Always on mobile, hover on desktop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Caption - Always visible on mobile, slides up on desktop */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-display font-bold text-lg md:text-xl text-white mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {product.caption}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Show count if more than 6 */}
        {products.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(6, products.length)} of {products.length}{" "}
              products
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ShopProducts;
