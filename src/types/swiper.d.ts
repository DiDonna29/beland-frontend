// Local type declarations for swiper to work around package export/type resolution
declare module "swiper" {
  const Swiper: any;
  export default Swiper;
  export const Navigation: any;
  export const Pagination: any;
  export const Autoplay: any;
  export const EffectFade: any;
  export const A11y: any;
}

declare module "swiper/react" {
  import * as React from "react";
  export const Swiper: React.ComponentType<any>;
  export const SwiperSlide: React.ComponentType<any>;
  const _default: any;
  export default _default;
}

declare module "swiper/swiper-bundle.min.css" {
  const css: string;
  export default css;
}
