import ProductoClient from "./ProductoClient";
import { getPublicProducts } from "@/lib/products-public";

export const metadata = {
  title: "Escanciador de Sidra Automático",
  description:
    "Compra el escanciador de sidra automático: diseño elegante, batería recargable y envío rápido.",
  keywords: [
    "escanciador de sidra automático",
    "comprar escanciador de sidra",
    "escanciador eléctrico",
    "escanciador recargable",
  ],
  alternates: {
    canonical: "/producto",
  },
  openGraph: {
    title: "Escanciador de Sidra Automático",
    description:
      "Compra el escanciador de sidra automático: diseño elegante, batería recargable y envío rápido.",
    url: "/producto",
    images: [
      {
        url: "/img/i1862459534.webp",
        width: 1200,
        height: 630,
        alt: "Escanciador de sidra automático",
      },
    ],
  },
};

export const revalidate = 60;

export default async function ProductoPage() {
  const products = await getPublicProducts();
  const product = products?.[0] || null;

  const productImages = product
    ? (Array.isArray(product.gallery) && product.gallery.length > 0
        ? product.gallery
        : product.imageUrl
          ? [product.imageUrl]
          : [])
    : [];

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description:
          product.description ||
          "Escanciador de sidra automatico recargable con diseno elegante y servicio uniforme.",
        image: productImages,
        sku: String(product.id),
        offers: {
          "@type": "Offer",
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.escancidorbarato.com"}/producto`,
          priceCurrency: "EUR",
          price: Number(product.price || 0).toFixed(2),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      }
    : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo funciona el escanciador de sidra automático?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Funciona con un botón de activación que impulsa la sidra de forma constante para facilitar un servicio cómodo, limpio y uniforme.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto tarda en cargar la batería?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La carga completa recomendada es de aproximadamente 2 horas con un cargador compatible.",
        },
      },
      {
        "@type": "Question",
        name: "¿Sirve para uso diario?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, está diseñado para uso frecuente tanto en casa como en reuniones y hostelería.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué incluye la compra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Incluye el escanciador y sus componentes principales. El contenido exacto puede variar según la configuración actual del producto.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hacéis envíos rápidos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, trabajamos para que recibas tu pedido lo antes posible con seguimiento del envío.",
        },
      },
    ],
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductoClient initialProducts={products} />
    </>
  );
}
