export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  color: string;
}

export interface Product3DModel {
  id: "branco" | "preto" | string;
  name: string;
  colorName: string;
  modelUrl: string;
  colorHex: string;
  colorGradient: string;
  badge: string;
  tagline: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  priceCustom: number;
  currency: string;
  customizable: boolean;
  images: ProductImage[];
  specs: ProductSpec[];
  badge?: string;
  models3D?: Product3DModel[];
}

export const products: Product[] = [
  {
    id: "disup",
    name: "Disup",
    tagline: "O seu suporte de lata",
    description:
      "Suporte de lata impresso em 3D com design exclusivo. Disponível com personalização de iniciais para tornar único.",
    longDescription:
      "O DISUP é um suporte de lata com design orgânico e elegante, inspirado em formas naturais. Cada peça é produzida individualmente com filamento de alta qualidade. A opção personalizada traz as iniciais do cliente em relevo no escudo frontal da peça — ideal para presente ou coleção pessoal.",
    price: 129.9,
    priceCustom: 149.9,
    currency: "BRL",
    customizable: true,
    badge: "Personalizável",
    models3D: [
      {
        id: "branco",
        name: "DISUP Branco Ártico",
        colorName: "Branco Ártico",
        modelUrl: "/products/disup/Disup-branco.glb",
        colorHex: "#f8fafc",
        colorGradient: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
        badge: "Mais Procurado",
        tagline: "Acabamento puro e sedoso",
        description: "Acabamento sedoso em PLA premium com alta fidelidade de detalhes e estética pura.",
      },
      {
        id: "preto",
        name: "DISUP Preto Ônix",
        colorName: "Preto Ônix",
        modelUrl: "/products/disup/Disup-preto.glb",
        colorHex: "#121217",
        colorGradient: "linear-gradient(135deg, #373747 0%, #0d0d12 100%)",
        badge: "Edição Especial",
        tagline: "Minimalista e imponente",
        description: "Tonalidade profunda fosca com absorção de luz e visual contemporâneo arrojado.",
      },
    ],
    images: [
      {
        src: "/products/disup/disup-branco.svg",
        alt: "DISUP na cor branca",
        color: "Branco",
      },
      {
        src: "/products/disup/disup-creme.svg",
        alt: "DISUP na cor creme",
        color: "Creme",
      },
      {
        src: "/products/disup/disup-amarelo.svg",
        alt: "DISUP na cor amarela",
        color: "Amarelo",
      },
    ],
    specs: [
      { label: "Material", value: "PLA de alta resistência" },
      { label: "Dimensões", value: "≈ 12 × 8 × 10 cm" },
      { label: "Compatível com", value: "Latas 350ml e 473ml" },
      { label: "Cores disponíveis", value: "Branco Ártico e Preto Ônix" },
      { label: "Personalização", value: "Iniciais em relevo (2 letras)" },
      { label: "Prazo de produção", value: "3–5 dias úteis" },
    ],
  },

  {
    id: "hamus-adamantinus",
    name: "Hamus Adamantinus",
    tagline: "O seu suporte de headset e controle",
    description:
      "Suporte de lata impresso em 3D com design exclusivo. Disponível com personalização de iniciais para tornar único.",
    longDescription:
      "O DISUP é um suporte de lata com design orgânico e elegante, inspirado em formas naturais. Cada peça é produzida individualmente com filamento de alta qualidade. A opção personalizada traz as iniciais do cliente em relevo no escudo frontal da peça — ideal para presente ou coleção pessoal.",
    price: 79.9,
    priceCustom: 99.9,
    currency: "BRL",
    customizable: true,
    badge: "Personalizável",
    models3D: [
      {
        id: "branco",
        name: "DISUP Branco Ártico",
        colorName: "Branco Ártico",
        modelUrl: "/products/KitParede/KITPAREDE-BRANCO.glb",
        colorHex: "#f8fafc",
        colorGradient: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
        badge: "Mais Procurado",
        tagline: "Acabamento puro e sedoso",
        description: "Acabamento sedoso em PLA premium com alta fidelidade de detalhes e estética pura.",
      },
      {
        id: "preto",
        name: "DISUP Preto Ônix",
        colorName: "Preto Ônix",
        modelUrl: "/products/KitParede/KITPAREDE-PRETO.glb",
        colorHex: "#121217",
        colorGradient: "linear-gradient(135deg, #373747 0%, #0d0d12 100%)",
        badge: "Edição Especial",
        tagline: "Minimalista e imponente",
        description: "Tonalidade profunda fosca com absorção de luz e visual contemporâneo arrojado.",
      },
    ],
    images: [
      {
        src: "/products/disup/disup-branco.svg",
        alt: "DISUP na cor branca",
        color: "Branco",
      },
      {
        src: "/products/disup/disup-creme.svg",
        alt: "DISUP na cor creme",
        color: "Creme",
      },
      {
        src: "/products/disup/disup-amarelo.svg",
        alt: "DISUP na cor amarela",
        color: "Amarelo",
      },
    ],
    specs: [
      { label: "Material", value: "PLA de alta resistência" },
      { label: "Dimensões", value: "≈ 12 × 8 × 10 cm" },
      { label: "Compatível com", value: "Latas 350ml e 473ml" },
      { label: "Cores disponíveis", value: "Branco Ártico e Preto Ônix" },
      { label: "Personalização", value: "Iniciais em relevo (2 letras)" },
      { label: "Prazo de produção", value: "3–5 dias úteis" },
    ],
  },
];

export const brandInfo = {
  name: "Diamond Lepus",
  tagline: "Impressão 3D com identidade",
  about: `A Diamond Lepus nasceu da paixão pela fabricação digital e pelo design funcional. Cada peça produzida carrega a precisão da tecnologia de impressão 3D aliada à personalidade única de quem a encomenda.\n\nNossa marca acredita que objetos do cotidiano podem — e devem — ter identidade. Por isso criamos produtos que unem estética, funcionalidade e personalização, tornando cada peça verdadeiramente sua.`,
  contact: {
    instagram: "@diamondlepus", // ← atualize aqui
    whatsapp: "+55 (XX) XXXXX-XXXX", // ← atualize aqui
    email: "contato@diamondlepus.com", // ← atualize aqui
  },
};
