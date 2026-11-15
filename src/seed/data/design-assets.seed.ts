// Dữ liệu seed tài nguyên thiết kế (phông, màu, hình nền, phần tử, khung, lưới) theo kiểu Canva.
// Sinh tự động; sửa dữ liệu qua dashboard admin, không sửa file này trực tiếp trên server.
import type { DesignAssets } from '../../design-assets/design-assets.js';

export const DESIGN_ASSETS_SEED_DATA: DesignAssets = {
  "fonts": [
    {
      "id": "roboto",
      "name": "Roboto"
    },
    {
      "id": "lora",
      "name": "Lora"
    },
    {
      "id": "merriweather",
      "name": "Merriweather"
    },
    {
      "id": "poppins",
      "name": "Poppins"
    },
    {
      "id": "raleway",
      "name": "Raleway"
    },
    {
      "id": "nunito",
      "name": "Nunito"
    },
    {
      "id": "quicksand",
      "name": "Quicksand"
    },
    {
      "id": "inter",
      "name": "Inter"
    },
    {
      "id": "bebas-neue",
      "name": "Bebas Neue"
    },
    {
      "id": "abril-fatface",
      "name": "Abril Fatface"
    },
    {
      "id": "cinzel",
      "name": "Cinzel"
    },
    {
      "id": "great-vibes",
      "name": "Great Vibes"
    },
    {
      "id": "satisfy",
      "name": "Satisfy"
    },
    {
      "id": "yellowtail",
      "name": "Yellowtail"
    },
    {
      "id": "caveat",
      "name": "Caveat"
    },
    {
      "id": "permanent-marker",
      "name": "Permanent Marker"
    },
    {
      "id": "bangers",
      "name": "Bangers"
    },
    {
      "id": "righteous",
      "name": "Righteous"
    },
    {
      "id": "josefin-sans",
      "name": "Josefin Sans"
    },
    {
      "id": "alex-brush",
      "name": "Alex Brush"
    },
    {
      "id": "tangerine",
      "name": "Tangerine"
    },
    {
      "id": "cormorant-garamond",
      "name": "Cormorant Garamond"
    },
    {
      "id": "dancing-script",
      "name": "Dancing Script"
    },
    {
      "id": "montserrat",
      "name": "Montserrat"
    },
    {
      "id": "oswald",
      "name": "Oswald"
    },
    {
      "id": "pacifico",
      "name": "Pacifico"
    }
  ],
  "colors": [
    "#000000",
    "#ffffff",
    "#f5f5f5",
    "#d9d9d9",
    "#8c8c8c",
    "#404040",
    "#1f2937",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#facc15",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#fecaca",
    "#fed7aa",
    "#fef08a",
    "#bbf7d0",
    "#a5f3fc",
    "#bfdbfe",
    "#ddd6fe",
    "#fbcfe8",
    "#7c2d12",
    "#854d0e",
    "#14532d",
    "#164e63",
    "#1e3a8a",
    "#4c1d95",
    "#831843",
    "#d4a373",
    "#faedcd",
    "#e9edc9"
  ],
  "backdrops": [
    {
      "id": "c-bd-sunset",
      "name": "Hoàng hôn",
      "type": "gradient",
      "value": "linear-gradient(135deg,#ff9a8b,#ff6a88,#ff99ac)"
    },
    {
      "id": "c-bd-ocean",
      "name": "Đại dương",
      "type": "gradient",
      "value": "linear-gradient(135deg,#2193b0,#6dd5ed)"
    },
    {
      "id": "c-bd-forest",
      "name": "Rừng xanh",
      "type": "gradient",
      "value": "linear-gradient(135deg,#11998e,#38ef7d)"
    },
    {
      "id": "c-bd-lavender",
      "name": "Oải hương",
      "type": "gradient",
      "value": "linear-gradient(135deg,#c3cfe2,#dfe9f3)"
    },
    {
      "id": "c-bd-gold",
      "name": "Vàng kim",
      "type": "gradient",
      "value": "linear-gradient(135deg,#f7d794,#e1b12c)"
    },
    {
      "id": "c-bd-blush",
      "name": "Hồng phấn",
      "type": "gradient",
      "value": "linear-gradient(180deg,#fdfbfb,#ebedee)"
    },
    {
      "id": "c-bd-night",
      "name": "Đêm xanh",
      "type": "gradient",
      "value": "linear-gradient(180deg,#0f2027,#2c5364)"
    },
    {
      "id": "c-bd-peach",
      "name": "Đào",
      "type": "gradient",
      "value": "radial-gradient(circle at 30% 20%,#ffe3d6,#ffb4a2)"
    },
    {
      "id": "c-bd-mint",
      "name": "Bạc hà",
      "type": "gradient",
      "value": "radial-gradient(circle at 70% 30%,#e0f7f1,#a8e6cf)"
    },
    {
      "id": "c-bd-dusk",
      "name": "Chạng vạng",
      "type": "gradient",
      "value": "linear-gradient(160deg,#a18cd1,#fbc2eb)"
    }
  ],
  "elements": [
    {
      "id": "c-square",
      "name": "Hình vuông",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#3b82f6",
      "stroke": false,
      "parts": [
        {
          "d": "M6 6H94V94H6Z"
        }
      ]
    },
    {
      "id": "c-rsquare",
      "name": "Vuông bo tròn",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#8b5cf6",
      "stroke": false,
      "parts": [
        {
          "d": "M28 6H72A22 22 0 0 1 94 28V72A22 22 0 0 1 72 94H28A22 22 0 0 1 6 72V28A22 22 0 0 1 28 6Z"
        }
      ]
    },
    {
      "id": "c-circle",
      "name": "Hình tròn",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#ec4899",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6A44 44 0 1 0 50 94A44 44 0 1 0 50 6Z"
        }
      ]
    },
    {
      "id": "c-ellipse",
      "name": "Hình elip",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#f97316",
      "stroke": false,
      "parts": [
        {
          "d": "M6 50A44 28 0 1 0 94 50A44 28 0 1 0 6 50Z"
        }
      ]
    },
    {
      "id": "c-half",
      "name": "Bán nguyệt",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#14b8a6",
      "stroke": false,
      "parts": [
        {
          "d": "M6 70A44 44 0 0 1 94 70Z"
        }
      ]
    },
    {
      "id": "c-quarter",
      "name": "Góc tròn",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#84cc16",
      "stroke": false,
      "parts": [
        {
          "d": "M6 94V6H6A88 88 0 0 1 94 94Z"
        }
      ]
    },
    {
      "id": "c-diamond",
      "name": "Thoi",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#10b981",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4L96 50L50 96L4 50Z"
        }
      ]
    },
    {
      "id": "c-rtri",
      "name": "Tam giác vuông",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#f59e0b",
      "stroke": false,
      "parts": [
        {
          "d": "M6 94V6L94 94Z"
        }
      ]
    },
    {
      "id": "c-trap",
      "name": "Hình thang",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#06b6d4",
      "stroke": false,
      "parts": [
        {
          "d": "M24 12H76L96 88H4Z"
        }
      ]
    },
    {
      "id": "c-para",
      "name": "Hình bình hành",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#6366f1",
      "stroke": false,
      "parts": [
        {
          "d": "M24 14H96L76 86H4Z"
        }
      ]
    },
    {
      "id": "c-drop",
      "name": "Giọt nước",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#0ea5e9",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6C78 24 90 44 90 62A40 40 0 0 1 10 62C10 44 22 24 50 6Z"
        }
      ]
    },
    {
      "id": "c-cross",
      "name": "Dấu cộng",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#f97316",
      "stroke": false,
      "parts": [
        {
          "d": "M36 6H64V36H94V64H64V94H36V64H6V36H36Z"
        }
      ]
    },
    {
      "id": "c-heart",
      "name": "Trái tim",
      "category": "shape",
      "group": "Hình dạng cơ bản",
      "color": "#e8506b",
      "stroke": false,
      "parts": [
        {
          "d": "M50 90C6 58 20 16 50 38C80 16 94 58 50 90Z"
        }
      ]
    },
    {
      "id": "c-poly3",
      "name": "Tam giác đều",
      "category": "shape",
      "group": "Đa giác",
      "color": "#f59e0b",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6 L88.1 72 L11.9 72 Z"
        }
      ]
    },
    {
      "id": "c-poly5",
      "name": "Ngũ giác",
      "category": "shape",
      "group": "Đa giác",
      "color": "#ef4444",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6 L91.8 36.4 L75.9 85.6 L24.1 85.6 L8.2 36.4 Z"
        }
      ]
    },
    {
      "id": "c-poly6",
      "name": "Lục giác",
      "category": "shape",
      "group": "Đa giác",
      "color": "#06b6d4",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6 L88.1 28 L88.1 72 L50 94 L11.9 72 L11.9 28 Z"
        }
      ]
    },
    {
      "id": "c-poly7",
      "name": "Thất giác",
      "category": "shape",
      "group": "Đa giác",
      "color": "#22c55e",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6 L84.4 22.6 L92.9 59.8 L69.1 89.6 L30.9 89.6 L7.1 59.8 L15.6 22.6 Z"
        }
      ]
    },
    {
      "id": "c-poly8",
      "name": "Bát giác",
      "category": "shape",
      "group": "Đa giác",
      "color": "#a855f7",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6 L81.1 18.9 L94 50 L81.1 81.1 L50 94 L18.9 81.1 L6 50 L18.9 18.9 Z"
        }
      ]
    },
    {
      "id": "c-poly10",
      "name": "Thập giác",
      "category": "shape",
      "group": "Đa giác",
      "color": "#ec4899",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6 L75.9 14.4 L91.8 36.4 L91.8 63.6 L75.9 85.6 L50 94 L24.1 85.6 L8.2 63.6 L8.2 36.4 L24.1 14.4 Z"
        }
      ]
    },
    {
      "id": "c-star4",
      "name": "Sao 4 cánh",
      "category": "shape",
      "group": "Hình ngôi sao",
      "color": "#facc15",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L59.1 40.9 L96 50 L59.1 59.1 L50 96 L40.9 59.1 L4 50 L40.9 40.9 Z"
        }
      ]
    },
    {
      "id": "c-star5",
      "name": "Sao 5 cánh",
      "category": "shape",
      "group": "Hình ngôi sao",
      "color": "#f59e0b",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L63.5 31.4 L93.7 35.8 L71.9 57.1 L77 87.2 L50 73 L23 87.2 L28.1 57.1 L6.3 35.8 L36.5 31.4 Z"
        }
      ]
    },
    {
      "id": "c-star6",
      "name": "Sao 6 cánh",
      "category": "shape",
      "group": "Hình ngôi sao",
      "color": "#f97316",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L62.7 28.1 L89.8 27 L75.3 50 L89.8 73 L62.7 71.9 L50 96 L37.4 71.9 L10.2 73 L24.7 50 L10.2 27 L37.3 28.1 Z"
        }
      ]
    },
    {
      "id": "c-star7",
      "name": "Sao 7 cánh",
      "category": "shape",
      "group": "Hình ngôi sao",
      "color": "#ef4444",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L62 25.1 L86 21.3 L76.9 43.9 L94.8 60.2 L71.6 67.2 L70 91.4 L50 77.6 L30 91.4 L28.4 67.2 L5.2 60.2 L23.1 43.9 L14 21.3 L38 25.1 Z"
        }
      ]
    },
    {
      "id": "c-star8",
      "name": "Sao 8 cánh",
      "category": "shape",
      "group": "Hình ngôi sao",
      "color": "#e11d48",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L60.9 23.7 L82.5 17.5 L76.3 39.1 L96 50 L76.3 60.9 L82.5 82.5 L60.9 76.3 L50 96 L39.1 76.3 L17.5 82.5 L23.7 60.9 L4 50 L23.7 39.1 L17.5 17.5 L39.1 23.7 Z"
        }
      ]
    },
    {
      "id": "c-star12",
      "name": "Sao 12 cánh",
      "category": "shape",
      "group": "Hình ngôi sao",
      "color": "#eab308",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L59.5 14.5 L73 10.2 L76 24 L89.8 27 L85.5 40.5 L96 50 L85.5 59.5 L89.8 73 L76 76 L73 89.8 L59.5 85.5 L50 96 L40.5 85.5 L27 89.8 L24 76 L10.2 73 L14.5 59.5 L4 50 L14.5 40.5 L10.2 27 L24 24 L27 10.2 L40.5 14.5 Z"
        }
      ]
    },
    {
      "id": "c-star16",
      "name": "Nổ tung",
      "category": "shape",
      "group": "Hình ngôi sao",
      "color": "#fb923c",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L57.6 11.7 L67.6 7.5 L71.7 17.5 L82.5 17.5 L82.5 28.3 L92.5 32.4 L88.3 42.4 L96 50 L88.3 57.6 L92.5 67.6 L82.5 71.7 L82.5 82.5 L71.7 82.5 L67.6 92.5 L57.6 88.3 L50 96 L42.4 88.3 L32.4 92.5 L28.3 82.5 L17.5 82.5 L17.5 71.7 L7.5 67.6 L11.7 57.6 L4 50 L11.7 42.4 L7.5 32.4 L17.5 28.3 L17.5 17.5 L28.3 17.5 L32.4 7.5 L42.4 11.7 Z"
        }
      ]
    },
    {
      "id": "c-arr-r",
      "name": "Mũi tên phải",
      "category": "shape",
      "group": "Mũi tên",
      "color": "#0ea5e9",
      "stroke": false,
      "parts": [
        {
          "d": "M6 36H58V14L94 50L58 86V64H6Z"
        }
      ]
    },
    {
      "id": "c-arr-l",
      "name": "Mũi tên trái",
      "category": "shape",
      "group": "Mũi tên",
      "color": "#0ea5e9",
      "stroke": false,
      "parts": [
        {
          "d": "M94 36H42V14L6 50L42 86V64H94Z"
        }
      ]
    },
    {
      "id": "c-arr-u",
      "name": "Mũi tên lên",
      "category": "shape",
      "group": "Mũi tên",
      "color": "#0ea5e9",
      "stroke": false,
      "parts": [
        {
          "d": "M36 94V42H14L50 6L86 42H64V94Z"
        }
      ]
    },
    {
      "id": "c-arr-d",
      "name": "Mũi tên xuống",
      "category": "shape",
      "group": "Mũi tên",
      "color": "#0ea5e9",
      "stroke": false,
      "parts": [
        {
          "d": "M36 6V58H14L50 94L86 58H64V6Z"
        }
      ]
    },
    {
      "id": "c-arr-2",
      "name": "Mũi tên hai chiều",
      "category": "shape",
      "group": "Mũi tên",
      "color": "#6366f1",
      "stroke": false,
      "parts": [
        {
          "d": "M6 50L36 20V38H64V20L94 50L64 80V62H36V80Z"
        }
      ]
    },
    {
      "id": "c-chev",
      "name": "Chevron",
      "category": "shape",
      "group": "Mũi tên",
      "color": "#22c55e",
      "stroke": false,
      "parts": [
        {
          "d": "M26 10L74 50L26 90L10 74L44 50L10 26Z"
        }
      ]
    },
    {
      "id": "c-arr-curve",
      "name": "Mũi tên cong",
      "category": "shape",
      "group": "Mũi tên",
      "color": "#f97316",
      "stroke": false,
      "parts": [
        {
          "d": "M10 80Q50 -10 86 62L96 52L92 78L66 72L76 62Q46 22 16 92Z"
        }
      ]
    },
    {
      "id": "c-line",
      "name": "Đường thẳng",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M6 50H94"
        }
      ]
    },
    {
      "id": "c-slash",
      "name": "Đường chéo",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M14 86L86 14"
        }
      ]
    },
    {
      "id": "c-vline",
      "name": "Đường dọc",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M50 6V94"
        }
      ]
    },
    {
      "id": "c-zigzag",
      "name": "Zích zắc",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M6 70L30 30L54 70L78 30L94 60"
        }
      ]
    },
    {
      "id": "c-wave2",
      "name": "Sóng",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M6 55q11-34 22 0t22 0t22 0t22 0"
        }
      ]
    },
    {
      "id": "c-arc",
      "name": "Cung",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M10 80Q50 -10 90 80"
        }
      ]
    },
    {
      "id": "c-double",
      "name": "Hai đường",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M6 40H94M6 60H94"
        }
      ]
    },
    {
      "id": "c-ring",
      "name": "Vòng tròn viền",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M50 10A40 40 0 1 0 50 90A40 40 0 1 0 50 10Z"
        }
      ]
    },
    {
      "id": "c-sqring",
      "name": "Khung vuông viền",
      "category": "shape",
      "group": "Đường kẻ",
      "color": "#111827",
      "stroke": true,
      "parts": [
        {
          "d": "M10 10H90V90H10Z"
        }
      ]
    },
    {
      "id": "c-sparkle",
      "name": "Lấp lánh",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#f5b301",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4L59 41L96 50L59 59L50 96L41 59L4 50L41 41Z"
        }
      ]
    },
    {
      "id": "c-sparkle2",
      "name": "Lấp lánh nhỏ",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#fbbf24",
      "stroke": false,
      "parts": [
        {
          "d": "M28 6L33 27L54 32L33 37L28 58L23 37L2 32L23 27Z"
        },
        {
          "d": "M74 52L77 64L89 67L77 70L74 82L71 70L59 67L71 64Z"
        }
      ]
    },
    {
      "id": "c-check",
      "name": "Dấu tích",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#22c55e",
      "stroke": true,
      "parts": [
        {
          "d": "M14 52L40 78L88 22"
        }
      ]
    },
    {
      "id": "c-xmark",
      "name": "Dấu nhân",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#ef4444",
      "stroke": true,
      "parts": [
        {
          "d": "M18 18L82 82M82 18L18 82"
        }
      ]
    },
    {
      "id": "c-bubble2",
      "name": "Bong bóng chat",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#a855f7",
      "stroke": false,
      "parts": [
        {
          "d": "M14 10H86A8 8 0 0 1 94 18V64A8 8 0 0 1 86 72H44L22 92V72H14A8 8 0 0 1 6 64V18A8 8 0 0 1 14 10Z"
        }
      ]
    },
    {
      "id": "c-quote",
      "name": "Dấu ngoặc kép",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#6366f1",
      "stroke": false,
      "parts": [
        {
          "d": "M12 56V84H40V56H28Q28 44 40 40V30Q18 34 12 56ZM60 56V84H88V56H76Q76 44 88 40V30Q66 34 60 56Z"
        }
      ]
    },
    {
      "id": "c-smile",
      "name": "Mặt cười",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#facc15",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6A44 44 0 1 0 50 94A44 44 0 1 0 50 6Z"
        },
        {
          "d": "M30 38A7 7 0 1 0 30.01 38Z",
          "tone": "dark"
        },
        {
          "d": "M70 38A7 7 0 1 0 70.01 38Z",
          "tone": "dark"
        },
        {
          "d": "M26 58Q50 84 74 58Q50 74 26 58Z",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-badge",
      "name": "Huy hiệu",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#f59e0b",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L60.7 10 L73 10.2 L79.3 20.7 L89.8 27 L90 39.3 L96 50 L90 60.7 L89.8 73 L79.3 79.3 L73 89.8 L60.7 90 L50 96 L39.3 90 L27 89.8 L20.7 79.3 L10.2 73 L10 60.7 L4 50 L10 39.3 L10.2 27 L20.7 20.7 L27 10.2 L39.3 10 Z"
        }
      ]
    },
    {
      "id": "c-ribbon",
      "name": "Dải băng",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#ec4899",
      "stroke": false,
      "parts": [
        {
          "d": "M6 30H94V64H6Z"
        },
        {
          "d": "M6 64L20 78L6 92Z",
          "tone": "dark"
        },
        {
          "d": "M94 64L80 78L94 92Z",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-tag",
      "name": "Thẻ",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#14b8a6",
      "stroke": false,
      "parts": [
        {
          "d": "M10 14H58L90 50L58 86H10Z"
        },
        {
          "d": "M22 34A7 7 0 1 0 22.01 34Z",
          "tone": "white"
        }
      ]
    },
    {
      "id": "c-bolt",
      "name": "Tia chớp",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#facc15",
      "stroke": false,
      "parts": [
        {
          "d": "M58 4L18 56H46L36 96L82 40H54Z"
        }
      ]
    },
    {
      "id": "c-crown",
      "name": "Vương miện",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#f5b301",
      "stroke": false,
      "parts": [
        {
          "d": "M10 82V32L35 56L50 20L65 56L90 32V82Z"
        }
      ]
    },
    {
      "id": "c-bell",
      "name": "Chuông",
      "category": "graphic",
      "group": "Biểu tượng & Sticker",
      "color": "#f59e0b",
      "stroke": false,
      "parts": [
        {
          "d": "M50 8A6 6 0 0 1 56 14V17C70 21 78 33 78 49V61L88 75H12L22 61V49C22 33 30 21 44 17V14A6 6 0 0 1 50 8Z"
        },
        {
          "d": "M42 84A8 8 0 0 0 58 84Z",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-cloud",
      "name": "Đám mây",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#60a5fa",
      "stroke": false,
      "parts": [
        {
          "d": "M26 74A18 18 0 0 1 24 38A24 24 0 0 1 70 32A20 20 0 0 1 74 74Z"
        }
      ]
    },
    {
      "id": "c-sun",
      "name": "Mặt trời",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#fbbf24",
      "stroke": false,
      "parts": [
        {
          "d": "M50 28A22 22 0 1 0 50 72A22 22 0 1 0 50 28Z"
        },
        {
          "d": "M80 50 L94 50 L92.7 60.6 Z"
        },
        {
          "d": "M71.2 71.2 L81.1 81.1 L72.7 87.7 Z"
        },
        {
          "d": "M50 80 L50 94 L39.4 92.7 Z"
        },
        {
          "d": "M28.8 71.2 L18.9 81.1 L12.3 72.7 Z"
        },
        {
          "d": "M20 50 L6 50 L7.3 39.4 Z"
        },
        {
          "d": "M28.8 28.8 L18.9 18.9 L27.3 12.3 Z"
        },
        {
          "d": "M50 20 L50 6 L60.6 7.3 Z"
        },
        {
          "d": "M71.2 28.8 L81.1 18.9 L87.7 27.3 Z"
        }
      ]
    },
    {
      "id": "c-moon",
      "name": "Trăng khuyết",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#6366f1",
      "stroke": false,
      "parts": [
        {
          "d": "M66 8A44 44 0 1 0 92 66A36 36 0 0 1 66 8Z"
        }
      ]
    },
    {
      "id": "c-leaf",
      "name": "Chiếc lá",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#22c55e",
      "stroke": false,
      "parts": [
        {
          "d": "M10 90C10 40 40 10 90 10C90 60 60 90 10 90Z"
        }
      ]
    },
    {
      "id": "c-mountain",
      "name": "Núi",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#16a34a",
      "stroke": false,
      "parts": [
        {
          "d": "M4 86L38 30L60 64L72 46L96 86Z"
        },
        {
          "d": "M38 30L28 46L36 42L44 48Z",
          "tone": "white"
        }
      ]
    },
    {
      "id": "c-tree",
      "name": "Cây thông",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#15803d",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6L82 60H64L86 92H14L36 60H18Z"
        },
        {
          "d": "M42 92H58V100H42Z",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-drop2",
      "name": "Giọt",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#38bdf8",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6C74 36 84 54 84 68A34 34 0 0 1 16 68C16 54 26 36 50 6Z"
        }
      ]
    },
    {
      "id": "c-flower2",
      "name": "Hoa 5 cánh",
      "category": "graphic",
      "group": "Thiên nhiên & Thời tiết",
      "color": "#f472b6",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6A16 16 0 0 1 66 24A16 16 0 0 1 82 36A16 16 0 0 1 72 56A16 16 0 0 1 56 70A16 16 0 0 1 34 70A16 16 0 0 1 28 56A16 16 0 0 1 18 36A16 16 0 0 1 34 24A16 16 0 0 1 50 6Z"
        },
        {
          "d": "M50 36A14 14 0 1 0 50 64A14 14 0 1 0 50 36Z",
          "tone": "light"
        }
      ]
    },
    {
      "id": "c-envelope",
      "name": "Phong thư",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#ef4444",
      "stroke": false,
      "parts": [
        {
          "d": "M6 24H94V80H6Z"
        },
        {
          "d": "M6 24L50 58L94 24Z",
          "tone": "light"
        }
      ]
    },
    {
      "id": "c-camera",
      "name": "Máy ảnh",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#374151",
      "stroke": false,
      "parts": [
        {
          "d": "M8 30H30L38 18H62L70 30H92V84H8Z"
        },
        {
          "d": "M50 40A20 20 0 1 0 50 80A20 20 0 1 0 50 40Z",
          "tone": "white"
        },
        {
          "d": "M50 48A12 12 0 1 0 50 72A12 12 0 1 0 50 48Z",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-calendar",
      "name": "Lịch",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#ef4444",
      "stroke": false,
      "parts": [
        {
          "d": "M10 18H90V90H10Z"
        },
        {
          "d": "M10 18H90V34H10Z",
          "tone": "dark"
        },
        {
          "d": "M26 46H38V58H26Z",
          "tone": "white"
        },
        {
          "d": "M46 46H58V58H46Z",
          "tone": "white"
        },
        {
          "d": "M66 46H78V58H66Z",
          "tone": "white"
        },
        {
          "d": "M26 66H38V78H26Z",
          "tone": "white"
        },
        {
          "d": "M46 66H58V78H46Z",
          "tone": "white"
        }
      ]
    },
    {
      "id": "c-gift2",
      "name": "Hộp quà",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#ec4899",
      "stroke": false,
      "parts": [
        {
          "d": "M10 40H90V90H10Z"
        },
        {
          "d": "M6 26H94V40H6Z"
        },
        {
          "d": "M44 26H56V90H44Z",
          "tone": "light"
        }
      ]
    },
    {
      "id": "c-balloon2",
      "name": "Bóng bay",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#f43f5e",
      "stroke": false,
      "parts": [
        {
          "d": "M50 8C72 8 84 26 84 44C84 66 64 74 50 74C36 74 16 66 16 44C16 26 28 8 50 8Z"
        },
        {
          "d": "M46 74L50 82L54 74Z"
        },
        {
          "d": "M50 82Q44 92 52 98",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-pin",
      "name": "Ghim vị trí",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#dc2626",
      "stroke": false,
      "parts": [
        {
          "d": "M50 94C30 66 18 48 18 36A32 32 0 0 1 82 36C82 48 70 66 50 94Z"
        },
        {
          "d": "M50 26A12 12 0 1 0 50 50A12 12 0 1 0 50 26Z",
          "tone": "white"
        }
      ]
    },
    {
      "id": "c-ticket",
      "name": "Vé",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#f59e0b",
      "stroke": false,
      "parts": [
        {
          "d": "M6 26H94V44A8 8 0 0 0 94 56V74H6V56A8 8 0 0 0 6 44Z"
        }
      ]
    },
    {
      "id": "c-cake",
      "name": "Bánh kem",
      "category": "graphic",
      "group": "Đồ vật",
      "color": "#f9a8d4",
      "stroke": false,
      "parts": [
        {
          "d": "M12 56H88V90H12Z"
        },
        {
          "d": "M12 42H88V56H12Z"
        },
        {
          "d": "M12 56Q25 66 38 56T64 56T88 56V66H12Z",
          "tone": "white"
        },
        {
          "d": "M46 22H54V42H46Z"
        }
      ]
    },
    {
      "id": "c-sphere3",
      "name": "Quả cầu",
      "category": "3d",
      "group": "3D",
      "color": "#5b8cff",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6A44 44 0 1 0 50 94A44 44 0 1 0 50 6Z"
        },
        {
          "d": "M36 26A12 8 -30 1 0 36.01 26Z",
          "tone": "white"
        }
      ]
    },
    {
      "id": "c-cube3",
      "name": "Khối lập phương",
      "category": "3d",
      "group": "3D",
      "color": "#ff7a59",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6L90 28L50 50L10 28Z"
        },
        {
          "d": "M10 28L50 50V94L10 72Z",
          "tone": "main"
        },
        {
          "d": "M90 28L50 50V94L90 72Z",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-cyl3",
      "name": "Hình trụ",
      "category": "3d",
      "group": "3D",
      "color": "#34d399",
      "stroke": false,
      "parts": [
        {
          "d": "M12 24V76A38 14 0 0 0 88 76V24Z"
        },
        {
          "d": "M50 10A38 14 0 1 0 50 38A38 14 0 1 0 50 10Z",
          "tone": "light"
        }
      ]
    },
    {
      "id": "c-cone3",
      "name": "Hình nón",
      "category": "3d",
      "group": "3D",
      "color": "#f59e0b",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6L90 76A40 14 0 0 1 10 76Z"
        },
        {
          "d": "M50 6L30 62A40 14 0 0 0 70 62Z",
          "tone": "light"
        }
      ]
    },
    {
      "id": "c-pyr3",
      "name": "Kim tự tháp",
      "category": "3d",
      "group": "3D",
      "color": "#a78bfa",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6L8 74L50 94Z"
        },
        {
          "d": "M50 6L92 74L50 94Z",
          "tone": "dark"
        }
      ]
    },
    {
      "id": "c-torus3",
      "name": "Vòng xuyến",
      "category": "3d",
      "group": "3D",
      "color": "#f472b6",
      "stroke": false,
      "parts": [
        {
          "d": "M50 6A44 44 0 1 0 50 94A44 44 0 1 0 50 6ZM50 26A24 24 0 1 1 50 74A24 24 0 1 1 50 26Z"
        }
      ]
    },
    {
      "id": "c-pill3",
      "name": "Viên nang",
      "category": "3d",
      "group": "3D",
      "color": "#fb7185",
      "stroke": false,
      "parts": [
        {
          "d": "M30 4H70A26 26 0 0 1 96 30V70A26 26 0 0 1 70 96H30A26 26 0 0 1 4 70V30A26 26 0 0 1 30 4Z"
        }
      ]
    },
    {
      "id": "c-gem3",
      "name": "Kim cương",
      "category": "3d",
      "group": "3D",
      "color": "#38bdf8",
      "stroke": false,
      "parts": [
        {
          "d": "M26 12H74L94 38L50 92L6 38Z"
        },
        {
          "d": "M26 12L38 38H62L74 12Z",
          "tone": "light"
        },
        {
          "d": "M6 38H38L50 92Z",
          "tone": "dark"
        },
        {
          "d": "M94 38H62L50 92Z",
          "tone": "main"
        }
      ]
    },
    {
      "id": "c-heart3",
      "name": "Tim phồng",
      "category": "3d",
      "group": "3D",
      "color": "#ff4d6d",
      "stroke": false,
      "parts": [
        {
          "d": "M50 90C6 58 20 16 50 38C80 16 94 58 50 90Z"
        },
        {
          "d": "M28 32A9 5 -35 1 0 28.01 32Z",
          "tone": "white"
        }
      ]
    },
    {
      "id": "c-star3",
      "name": "Sao nổi",
      "category": "3d",
      "group": "3D",
      "color": "#ffc531",
      "stroke": false,
      "parts": [
        {
          "d": "M50 4 L63.5 31.4 L93.7 35.8 L71.9 57.1 L77 87.2 L50 73 L23 87.2 L28.1 57.1 L6.3 35.8 L36.5 31.4 Z"
        }
      ]
    },
    {
      "id": "c-donut3",
      "name": "Bánh donut",
      "category": "3d",
      "group": "3D",
      "color": "#d97706",
      "stroke": false,
      "parts": [
        {
          "d": "M50 8A42 42 0 1 0 50 92A42 42 0 1 0 50 8ZM50 36A14 14 0 1 1 50 64A14 14 0 1 1 50 36Z"
        }
      ]
    },
    {
      "id": "c-cube-rounded",
      "name": "Khối bo tròn",
      "category": "3d",
      "group": "3D",
      "color": "#8b5cf6",
      "stroke": false,
      "parts": [
        {
          "d": "M22 14H78A8 8 0 0 1 86 22V78A8 8 0 0 1 78 86H22A8 8 0 0 1 14 78V22A8 8 0 0 1 22 14Z"
        },
        {
          "d": "M22 14H78A8 8 0 0 1 86 22V40H14V22A8 8 0 0 1 22 14Z",
          "tone": "light"
        }
      ]
    }
  ],
  "frames": [
    {
      "id": "c-fr-diamond",
      "name": "Thoi",
      "ratio": 1,
      "d": "M0.5 0 L1 0.5 L0.5 1 L0 0.5 Z"
    },
    {
      "id": "c-fr-oct",
      "name": "Bát giác",
      "ratio": 1,
      "d": "M0.5 0 L0.854 0.146 L1 0.5 L0.854 0.854 L0.5 1 L0.146 0.854 L0 0.5 L0.146 0.146 Z"
    },
    {
      "id": "c-fr-pent",
      "name": "Ngũ giác",
      "ratio": 1,
      "d": "M0.5 0 L0.976 0.345 L0.794 0.905 L0.206 0.905 L0.024 0.345 Z"
    },
    {
      "id": "c-fr-tri",
      "name": "Tam giác",
      "ratio": 0.87,
      "d": "M0.5 0 L1 1 L0 1 Z"
    },
    {
      "id": "c-fr-star",
      "name": "Sao 5 cánh",
      "ratio": 1,
      "d": "M0.5 0 L0.647 0.298 L0.976 0.345 L0.738 0.577 L0.794 0.905 L0.5 0.75 L0.206 0.905 L0.262 0.577 L0.024 0.345 L0.353 0.298 Z"
    },
    {
      "id": "c-fr-drop",
      "name": "Giọt",
      "ratio": 1,
      "d": "M0.5 0 C0.7 0.25 1 0.45 1 0.7 A0.5 0.5 0 0 1 0 0.7 C0 0.45 0.3 0.25 0.5 0Z"
    },
    {
      "id": "c-fr-tallarch",
      "name": "Vòm cao",
      "ratio": 1.4,
      "radius": "50% 50% 0 0 / 30% 30% 0 0"
    },
    {
      "id": "c-fr-roundtall",
      "name": "Bo góc cao",
      "ratio": 1.4,
      "radius": "18%"
    },
    {
      "id": "c-fr-semi",
      "name": "Bán nguyệt",
      "ratio": 0.5,
      "radius": "50% 50% 0 0 / 100% 100% 0 0"
    },
    {
      "id": "c-fr-ticket",
      "name": "Vé",
      "ratio": 1.6,
      "radius": "8%"
    }
  ],
  "grids": [
    {
      "id": "c-g-3x2",
      "name": "Lưới 3×2",
      "cells": [
        [
          0.0,
          0.0,
          0.3333333333333333,
          0.5
        ],
        [
          0.3333333333333333,
          0.0,
          0.3333333333333333,
          0.5
        ],
        [
          0.6666666666666666,
          0.0,
          0.3333333333333333,
          0.5
        ],
        [
          0.0,
          0.5,
          0.3333333333333333,
          0.5
        ],
        [
          0.3333333333333333,
          0.5,
          0.3333333333333333,
          0.5
        ],
        [
          0.6666666666666666,
          0.5,
          0.3333333333333333,
          0.5
        ]
      ]
    },
    {
      "id": "c-g-4col",
      "name": "4 cột",
      "cells": [
        [
          0.0,
          0,
          0.25,
          1
        ],
        [
          0.25,
          0,
          0.25,
          1
        ],
        [
          0.5,
          0,
          0.25,
          1
        ],
        [
          0.75,
          0,
          0.25,
          1
        ]
      ]
    },
    {
      "id": "c-g-3row",
      "name": "3 hàng",
      "cells": [
        [
          0,
          0.0,
          1,
          0.3333333333333333
        ],
        [
          0,
          0.3333333333333333,
          1,
          0.3333333333333333
        ],
        [
          0,
          0.6666666666666666,
          1,
          0.3333333333333333
        ]
      ]
    },
    {
      "id": "c-g-cross",
      "name": "Chữ thập",
      "cells": [
        [
          0.3333333333333333,
          0,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0,
          0.3333333333333333,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0.3333333333333333,
          0.3333333333333333,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0.6666666666666666,
          0.3333333333333333,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0.3333333333333333,
          0.6666666666666666,
          0.3333333333333333,
          0.3333333333333333
        ]
      ]
    },
    {
      "id": "c-g-mosaic",
      "name": "Khảm",
      "cells": [
        [
          0,
          0,
          0.6666666666666666,
          0.6666666666666666
        ],
        [
          0.6666666666666666,
          0,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0.6666666666666666,
          0.3333333333333333,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0,
          0.6666666666666666,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0.3333333333333333,
          0.6666666666666666,
          0.3333333333333333,
          0.3333333333333333
        ],
        [
          0.6666666666666666,
          0.6666666666666666,
          0.3333333333333333,
          0.3333333333333333
        ]
      ]
    },
    {
      "id": "c-g-lshape",
      "name": "Chữ L",
      "cells": [
        [
          0,
          0,
          0.3333333333333333,
          1
        ],
        [
          0.3333333333333333,
          0,
          0.6666666666666666,
          0.5
        ],
        [
          0.3333333333333333,
          0.5,
          0.3333333333333333,
          0.5
        ],
        [
          0.6666666666666666,
          0.5,
          0.3333333333333333,
          0.5
        ]
      ]
    },
    {
      "id": "c-g-polaroid2",
      "name": "Ảnh đôi",
      "cells": [
        [
          0,
          0,
          0.5,
          1
        ],
        [
          0.5,
          0,
          0.5,
          1
        ]
      ]
    },
    {
      "id": "c-g-stack",
      "name": "Xếp chồng",
      "cells": [
        [
          0,
          0,
          1,
          0.4
        ],
        [
          0,
          0.4,
          0.5,
          0.6
        ],
        [
          0.5,
          0.4,
          0.5,
          0.6
        ]
      ]
    }
  ]
};
