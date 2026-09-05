// Auto-generated mock data
export interface ProductVariant {
  id: string
  size: string
  color: string
  image: string
  image_back: string
  inventory_quantity: number
}

export interface Product {
  id: string
  title: string
  slug: string
  price: number
  compare_at_price?: number | null
  category: string
  collection: string
  collection_slug: string
  description: string
  specs: string[]
  editorial_story: string
  model_image: string | null
  images: string[]
  images_back: string[]
  product_variants: ProductVariant[]
}

export interface Collection {
  name: string
  slug: string
  description: string
  image: string
}

export const collections: Collection[] = [
  {
    "name": "Been Brooklyn",
    "slug": "been-brooklyn",
    "description": "Forged in Brooklyn. Built with heavyweight fleece, raw NYC energy, and iconic borough pride.",
    "image": "/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png"
  },
  {
    "name": "So New York",
    "slug": "so-new-york",
    "description": "The definitive New York essential collection. Designed for the kinetic energy of SoHo and the five boroughs.",
    "image": "/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png"
  }
];

export const mockProducts: Product[] = [
  {
    "id": "1",
    "title": "Been Brooklyn Hoodie",
    "slug": "been-brooklyn-hoodie",
    "price": 55,
    "compare_at_price": null,
    "category": "hoodies",
    "collection": "Been Brooklyn",
    "collection_slug": "been-brooklyn",
    "description": "Forged in Brooklyn. Heavyweight 10oz fleece built to endure the city.",
    "specs": [
      "10 oz./yd\u00b2 (US) 16.7 oz /L yd (CA), 70/30 ring-spun cotton/polyester blend 3-end fleece with 100% cotton face, 32 singles",
      "Generous fit with fleece lined hood",
      "Split stitch double-needle sewing on all seams",
      "Twill neck tape",
      "1x1 ribbing at cuffs and waistband",
      "Nickel eyelets"
    ],
    "editorial_story": "forged out of the raw energy of brooklyn. Made of heavyweight cotton with an iconic nyc style",
    "model_image": "/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png",
    "images": [
      "/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png",
      "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_brookyn_blk_blue_blk_hoodie.jpg",
      "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_brookyn_blk n wh_blk_hoodie.jpg"
    ],
    "images_back": [
      "/been-brooklyn-blk-hood-blk-text-model-new.png",
      "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_bk_blk_blk_hoodie_back.jpg",
      "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg"
    ],
    "product_variants": [
      {
        "id": "1-black-black-s",
        "size": "S",
        "color": "Black/Black",
        "image": "/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png",
        "image_back": "/been-brooklyn-blk-hood-blk-text-model-new.png",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-black-m",
        "size": "M",
        "color": "Black/Black",
        "image": "/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png",
        "image_back": "/been-brooklyn-blk-hood-blk-text-model-new.png",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-black-l",
        "size": "L",
        "color": "Black/Black",
        "image": "/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png",
        "image_back": "/been-brooklyn-blk-hood-blk-text-model-new.png",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-black-xl",
        "size": "XL",
        "color": "Black/Black",
        "image": "/been-brooklyn-blk-hood-blk-text-model-new-front-frt.png",
        "image_back": "/been-brooklyn-blk-hood-blk-text-model-new.png",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-navy-s",
        "size": "S",
        "color": "Black/Navy",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_brookyn_blk_blue_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-navy-m",
        "size": "M",
        "color": "Black/Navy",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_brookyn_blk_blue_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-navy-l",
        "size": "L",
        "color": "Black/Navy",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_brookyn_blk_blue_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-navy-xl",
        "size": "XL",
        "color": "Black/Navy",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_brookyn_blk_blue_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-white-s",
        "size": "S",
        "color": "Black/White",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_brookyn_blk n wh_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-white-m",
        "size": "M",
        "color": "Black/White",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_brookyn_blk n wh_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-white-l",
        "size": "L",
        "color": "Black/White",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_brookyn_blk n wh_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "1-black-white-xl",
        "size": "XL",
        "color": "Black/White",
        "image": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_brookyn_blk n wh_blk_hoodie.jpg",
        "image_back": "/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      }
    ]
  },
  {
    "id": "2",
    "title": "Been Brooklyn Baller Hoodie",
    "slug": "been-brooklyn-baller-hoodie",
    "price": 55,
    "compare_at_price": null,
    "category": "hoodies",
    "collection": "Been Brooklyn",
    "collection_slug": "been-brooklyn",
    "description": "Heritage collegiate Baller stripes meet modern Brooklyn athletic streetwear tailoring.",
    "specs": [
      "10 oz./yd\u00b2 (US) 16.7 oz /L yd (CA), 70/30 ring-spun cotton/polyester blend 3-end fleece with 100% cotton face, 32 singles",
      "Generous fit with fleece lined hood",
      "Split stitch double-needle sewing on all seams",
      "Twill neck tape",
      "1x1 ribbing at cuffs and waistband",
      "Nickel eyelets"
    ],
    "editorial_story": "Heritage collegiate Baller stripes meet modern Brooklyn athletic streetwear tailoring.",
    "model_image": "/outer-line-models-uniform-1200x1500/exec-a2383f3d-d5d5-4e00-b234-a805eee97f51-4x5.png",
    "images": [
      "/outer-line-models-uniform-1200x1500/exec-a2383f3d-d5d5-4e00-b234-a805eee97f51-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-4e2f213c-0849-4984-ba90-acae102dcee5-4x5.png",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_hoodie.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie.jpg"
    ],
    "images_back": [
      "/outer-line-models-uniform-1200x1500/exec-7598b7f9-9714-416e-afba-4bf7dd74e8d6-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-7171cfbe-2773-4bf2-b1d0-60b8550afab0-4x5.png",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie_back.jpg"
    ],
    "product_variants": [
      {
        "id": "2-baller-black-blue-s",
        "size": "S",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-a2383f3d-d5d5-4e00-b234-a805eee97f51-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7598b7f9-9714-416e-afba-4bf7dd74e8d6-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-baller-black-blue-m",
        "size": "M",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-a2383f3d-d5d5-4e00-b234-a805eee97f51-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7598b7f9-9714-416e-afba-4bf7dd74e8d6-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-baller-black-blue-l",
        "size": "L",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-a2383f3d-d5d5-4e00-b234-a805eee97f51-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7598b7f9-9714-416e-afba-4bf7dd74e8d6-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-baller-black-blue-xl",
        "size": "XL",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-a2383f3d-d5d5-4e00-b234-a805eee97f51-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7598b7f9-9714-416e-afba-4bf7dd74e8d6-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-baller-black-red-s",
        "size": "S",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-4e2f213c-0849-4984-ba90-acae102dcee5-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7171cfbe-2773-4bf2-b1d0-60b8550afab0-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-baller-black-red-m",
        "size": "M",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-4e2f213c-0849-4984-ba90-acae102dcee5-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7171cfbe-2773-4bf2-b1d0-60b8550afab0-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-baller-black-red-l",
        "size": "L",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-4e2f213c-0849-4984-ba90-acae102dcee5-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7171cfbe-2773-4bf2-b1d0-60b8550afab0-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-baller-black-red-xl",
        "size": "XL",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-4e2f213c-0849-4984-ba90-acae102dcee5-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-7171cfbe-2773-4bf2-b1d0-60b8550afab0-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-red-stripe-s",
        "size": "S",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-red-stripe-m",
        "size": "M",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-red-stripe-l",
        "size": "L",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-red-stripe-xl",
        "size": "XL",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-blue-stripe-s",
        "size": "S",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-blue-stripe-m",
        "size": "M",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-blue-stripe-l",
        "size": "L",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie_back.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "2-black-blue-stripe-xl",
        "size": "XL",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_hoodie/grey_baller_blue_stripe_wht_hoodie_back.jpg",
        "inventory_quantity": 15
      }
    ]
  },
  {
    "id": "3",
    "title": "Been Brooklyn Baller Tee",
    "slug": "been-brooklyn-baller-tee",
    "price": 35,
    "compare_at_price": null,
    "category": "tees",
    "collection": "Been Brooklyn",
    "collection_slug": "been-brooklyn",
    "description": "Iconic Been Brooklyn Baller typography on premium 4.3oz ringspun cotton.",
    "specs": [
      "4.3 oz./yd\u00b2 (US), 7.2 oz./L yd (CA), 100% combed ring-spun cotton, 32 singles",
      "Oatmeal is 99/1 cotton/polyester",
      "Heather Grey is 90/10 cotton/polyester",
      "Regular fit",
      "Self 3/8\u201d shoulder to shoulder binding",
      "3/4\u201d neckband with 1x1 rib",
      "Side seams"
    ],
    "editorial_story": "Iconic Been Brooklyn Baller typography on premium 4.3oz ringspun cotton.",
    "model_image": "/outer-line-models-uniform-1200x1500/exec-fdd62316-25df-4c8f-bdb0-00c34acf1be6-4x5.png",
    "images": [
      "/outer-line-models-uniform-1200x1500/exec-fdd62316-25df-4c8f-bdb0-00c34acf1be6-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-ef9b1dd7-b53d-4f43-8c23-cec3246c4ce4-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-0e29a152-87df-4b38-a765-0360001d80c0-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-2898790c-ba7c-4f7e-bb51-bfc48ead0475-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/grey_baller_red_stripe_blk_tee.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/grey_baller_red_stripe_wht_tee.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/grey_baller_blue_stripe_blk_tee.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/grey_baller_blue_stripe_wht_tee.jpg"
    ],
    "images_back": [
      "/outer-line-models-uniform-1200x1500/exec-48ea7409-602c-4ebc-ab12-9b2b4da6d993-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-45036c46-37f0-49f6-92d6-3a51425191b8-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-74c9f991-cdd8-41d9-852f-96aa44c55af8-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-d7ae12f2-0ccb-43b2-b54f-1a3cee4e7988-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
      "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/been_bk__wht_tee_bac2.jpg"
    ],
    "product_variants": [
      {
        "id": "3-baller-black-blue-s",
        "size": "S",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-fdd62316-25df-4c8f-bdb0-00c34acf1be6-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-48ea7409-602c-4ebc-ab12-9b2b4da6d993-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-black-blue-m",
        "size": "M",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-fdd62316-25df-4c8f-bdb0-00c34acf1be6-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-48ea7409-602c-4ebc-ab12-9b2b4da6d993-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-black-blue-l",
        "size": "L",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-fdd62316-25df-4c8f-bdb0-00c34acf1be6-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-48ea7409-602c-4ebc-ab12-9b2b4da6d993-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-black-blue-xl",
        "size": "XL",
        "color": "Baller Black/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-fdd62316-25df-4c8f-bdb0-00c34acf1be6-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-48ea7409-602c-4ebc-ab12-9b2b4da6d993-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-black-red-s",
        "size": "S",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-ef9b1dd7-b53d-4f43-8c23-cec3246c4ce4-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-45036c46-37f0-49f6-92d6-3a51425191b8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-black-red-m",
        "size": "M",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-ef9b1dd7-b53d-4f43-8c23-cec3246c4ce4-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-45036c46-37f0-49f6-92d6-3a51425191b8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-black-red-l",
        "size": "L",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-ef9b1dd7-b53d-4f43-8c23-cec3246c4ce4-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-45036c46-37f0-49f6-92d6-3a51425191b8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-black-red-xl",
        "size": "XL",
        "color": "Baller Black/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-ef9b1dd7-b53d-4f43-8c23-cec3246c4ce4-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-45036c46-37f0-49f6-92d6-3a51425191b8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-blue-s",
        "size": "S",
        "color": "Baller White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-0e29a152-87df-4b38-a765-0360001d80c0-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-74c9f991-cdd8-41d9-852f-96aa44c55af8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-blue-m",
        "size": "M",
        "color": "Baller White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-0e29a152-87df-4b38-a765-0360001d80c0-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-74c9f991-cdd8-41d9-852f-96aa44c55af8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-blue-l",
        "size": "L",
        "color": "Baller White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-0e29a152-87df-4b38-a765-0360001d80c0-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-74c9f991-cdd8-41d9-852f-96aa44c55af8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-blue-xl",
        "size": "XL",
        "color": "Baller White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-0e29a152-87df-4b38-a765-0360001d80c0-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-74c9f991-cdd8-41d9-852f-96aa44c55af8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-red-s",
        "size": "S",
        "color": "Baller White/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-2898790c-ba7c-4f7e-bb51-bfc48ead0475-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-d7ae12f2-0ccb-43b2-b54f-1a3cee4e7988-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-red-m",
        "size": "M",
        "color": "Baller White/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-2898790c-ba7c-4f7e-bb51-bfc48ead0475-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-d7ae12f2-0ccb-43b2-b54f-1a3cee4e7988-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-red-l",
        "size": "L",
        "color": "Baller White/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-2898790c-ba7c-4f7e-bb51-bfc48ead0475-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-d7ae12f2-0ccb-43b2-b54f-1a3cee4e7988-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-red-xl",
        "size": "XL",
        "color": "Baller White/Red",
        "image": "/outer-line-models-uniform-1200x1500/exec-2898790c-ba7c-4f7e-bb51-bfc48ead0475-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-d7ae12f2-0ccb-43b2-b54f-1a3cee4e7988-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-black-s",
        "size": "S",
        "color": "Baller White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-black-m",
        "size": "M",
        "color": "Baller White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-black-l",
        "size": "L",
        "color": "Baller White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-baller-white-black-xl",
        "size": "XL",
        "color": "Baller White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-red-stripe-s",
        "size": "S",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/grey_baller_red_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-red-stripe-m",
        "size": "M",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/grey_baller_red_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-red-stripe-l",
        "size": "L",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/grey_baller_red_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-red-stripe-xl",
        "size": "XL",
        "color": "Black/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/grey_baller_red_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-red-stripe-s",
        "size": "S",
        "color": "White/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/grey_baller_red_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-red-stripe-m",
        "size": "M",
        "color": "White/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/grey_baller_red_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-red-stripe-l",
        "size": "L",
        "color": "White/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/grey_baller_red_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-red-stripe-xl",
        "size": "XL",
        "color": "White/Red Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/grey_baller_red_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-blue-stripe-s",
        "size": "S",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/grey_baller_blue_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-blue-stripe-m",
        "size": "M",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/grey_baller_blue_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-blue-stripe-l",
        "size": "L",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/grey_baller_blue_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-black-blue-stripe-xl",
        "size": "XL",
        "color": "Black/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/grey_baller_blue_stripe_blk_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-blue-stripe-s",
        "size": "S",
        "color": "White/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/grey_baller_blue_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-blue-stripe-m",
        "size": "M",
        "color": "White/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/grey_baller_blue_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-blue-stripe-l",
        "size": "L",
        "color": "White/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/grey_baller_blue_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "3-white-blue-stripe-xl",
        "size": "XL",
        "color": "White/Blue Stripe",
        "image": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/grey_baller_blue_stripe_wht_tee.jpg",
        "image_back": "/grey_baller_red_stripe_blk_hoodie/grey_baller_blue_stripe_wht_tee/been_bk__wht_tee_bac2.jpg",
        "inventory_quantity": 15
      }
    ]
  },
  {
    "id": "4",
    "title": "Been Brooklyn Tee",
    "slug": "been-brooklyn-tee",
    "price": 35,
    "compare_at_price": null,
    "category": "tees",
    "collection": "Been Brooklyn",
    "collection_slug": "been-brooklyn",
    "description": "Authentic Brooklyn typography essential tee in premium ringspun cotton.",
    "specs": [
      "4.3 oz./yd\u00b2 (US), 7.2 oz./L yd (CA), 100% combed ring-spun cotton, 32 singles",
      "Oatmeal is 99/1 cotton/polyester",
      "Heather Grey is 90/10 cotton/polyester",
      "Regular fit",
      "Self 3/8\u201d shoulder to shoulder binding",
      "3/4\u201d neckband with 1x1 rib",
      "Side seams"
    ],
    "editorial_story": "Authentic Brooklyn typography essential tee in premium ringspun cotton.",
    "model_image": "/outer-line-models-uniform-1200x1500/exec-717c3829-88e6-44c4-9f77-26fa9a148190-4x5.png",
    "images": [
      "/outer-line-models-uniform-1200x1500/exec-717c3829-88e6-44c4-9f77-26fa9a148190-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
      "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee.jpg",
      "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee.jpg"
    ],
    "images_back": [
      "/outer-line-models-uniform-1200x1500/exec-eb174f07-b6e9-4817-9f0e-0086f5a0cb90-4x5.png",
      "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
      "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
      "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee_bac.jpg"
    ],
    "product_variants": [
      {
        "id": "4-white-blue-s",
        "size": "S",
        "color": "White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-717c3829-88e6-44c4-9f77-26fa9a148190-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-eb174f07-b6e9-4817-9f0e-0086f5a0cb90-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-white-blue-m",
        "size": "M",
        "color": "White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-717c3829-88e6-44c4-9f77-26fa9a148190-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-eb174f07-b6e9-4817-9f0e-0086f5a0cb90-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-white-blue-l",
        "size": "L",
        "color": "White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-717c3829-88e6-44c4-9f77-26fa9a148190-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-eb174f07-b6e9-4817-9f0e-0086f5a0cb90-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-white-blue-xl",
        "size": "XL",
        "color": "White/Blue",
        "image": "/outer-line-models-uniform-1200x1500/exec-717c3829-88e6-44c4-9f77-26fa9a148190-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-eb174f07-b6e9-4817-9f0e-0086f5a0cb90-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-white-black-s",
        "size": "S",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-white-black-m",
        "size": "M",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-white-black-l",
        "size": "L",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-white-black-xl",
        "size": "XL",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5a873164-15fe-469d-a7d3-6376501bf0fd-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-4295be89-0ecf-4869-bc2b-77c7bcf3fea8-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-white-s",
        "size": "S",
        "color": "Black/White",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-white-m",
        "size": "M",
        "color": "Black/White",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-white-l",
        "size": "L",
        "color": "Black/White",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-white-xl",
        "size": "XL",
        "color": "Black/White",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-blue-s",
        "size": "S",
        "color": "Black/Blue",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-blue-m",
        "size": "M",
        "color": "Black/Blue",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-blue-l",
        "size": "L",
        "color": "Black/Blue",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "4-black-blue-xl",
        "size": "XL",
        "color": "Black/Blue",
        "image": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee.jpg",
        "image_back": "/been_brooklyn_blk&wht_blk_tee/been_bk&wht_wh_tee/been_bk&wht_wh_tee_bac.jpg",
        "inventory_quantity": 15
      }
    ]
  },
  {
    "id": "5",
    "title": "So New York Donut Emoji Hoodie",
    "slug": "so-ny-donut-emoji-hoodie",
    "price": 55,
    "compare_at_price": null,
    "category": "hoodies",
    "collection": "So New York",
    "collection_slug": "so-new-york",
    "description": "Heavyweight luxury streetwear hoodie featuring our distinctive So New York Donut character artwork.",
    "specs": [
      "10 oz./yd\u00b2 (US) 16.7 oz /L yd (CA), 70/30 ring-spun cotton/polyester blend 3-end fleece with 100% cotton face, 32 singles",
      "Generous fit with fleece lined hood",
      "Split stitch double-needle sewing on all seams",
      "Twill neck tape",
      "1x1 ribbing at cuffs and waistband",
      "Nickel eyelets"
    ],
    "editorial_story": "Heavyweight luxury streetwear hoodie built for NYC winters.",
    "model_image": "/outer-line-models-uniform-1200x1500/exec-0da0b76a-a39d-4a71-9bc2-8a06455309cb-4x5.png",
    "images": [
      "/outer-line-models-uniform-1200x1500/exec-0da0b76a-a39d-4a71-9bc2-8a06455309cb-4x5.png",
      "/pink_doe_sha_blk_hoodie/pink_doe_sha_blk_hoodie.jpg"
    ],
    "images_back": [
      "/outer-line-models-uniform-1200x1500/exec-20eee55f-4150-4590-9719-5a7fcd9a9290-4x5.png",
      "/pink_doe_sha_blk_hoodie/pink_doe_sha_blk_hoodie_back.jpg"
    ],
    "product_variants": [
      {
        "id": "5-black-pink-s",
        "size": "S",
        "color": "Black/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-0da0b76a-a39d-4a71-9bc2-8a06455309cb-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-20eee55f-4150-4590-9719-5a7fcd9a9290-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "5-black-pink-m",
        "size": "M",
        "color": "Black/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-0da0b76a-a39d-4a71-9bc2-8a06455309cb-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-20eee55f-4150-4590-9719-5a7fcd9a9290-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "5-black-pink-l",
        "size": "L",
        "color": "Black/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-0da0b76a-a39d-4a71-9bc2-8a06455309cb-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-20eee55f-4150-4590-9719-5a7fcd9a9290-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "5-black-pink-xl",
        "size": "XL",
        "color": "Black/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-0da0b76a-a39d-4a71-9bc2-8a06455309cb-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-20eee55f-4150-4590-9719-5a7fcd9a9290-4x5.png",
        "inventory_quantity": 15
      }
    ]
  },
  {
    "id": "6",
    "title": "So New York Donut Emoji Tee",
    "slug": "so-ny-donut-emoji-tee",
    "price": 35,
    "compare_at_price": null,
    "category": "tees",
    "collection": "So New York",
    "collection_slug": "so-new-york",
    "description": "Essential ringspun cotton tee featuring our iconic So New York Donut character artwork.",
    "specs": [
      "4.3 oz./yd\u00b2 (US), 7.2 oz./L yd (CA), 100% combed ring-spun cotton, 32 singles",
      "Oatmeal is 99/1 cotton/polyester",
      "Heather Grey is 90/10 cotton/polyester",
      "Regular fit",
      "Self 3/8\u201d shoulder to shoulder binding",
      "3/4\u201d neckband with 1x1 rib",
      "Side seams"
    ],
    "editorial_story": "Designed for the kinetic energy of SoHo and the five boroughs.",
    "model_image": "/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png",
    "images": [
      "/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png",
      "/pink_doe_sha_wht_tee/pink_doe_sha_wht_tee/doe_sha_wht_tee.jpg",
      "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_te.jpg"
    ],
    "images_back": [
      "/outer-line-models-uniform-1200x1500/exec-11cae916-a21a-4ce8-b874-aac8e9dcf1ff-4x5.png",
      "/pink_doe_sha_wht_tee/pink_doe_sha_wht_tee/doe_sha_wht_tee_bac2.jpg",
      "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_tee_bac2.jpg"
    ],
    "product_variants": [
      {
        "id": "6-white-pink-s",
        "size": "S",
        "color": "White/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-11cae916-a21a-4ce8-b874-aac8e9dcf1ff-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "6-white-pink-m",
        "size": "M",
        "color": "White/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-11cae916-a21a-4ce8-b874-aac8e9dcf1ff-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "6-white-pink-l",
        "size": "L",
        "color": "White/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-11cae916-a21a-4ce8-b874-aac8e9dcf1ff-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "6-white-pink-xl",
        "size": "XL",
        "color": "White/Pink",
        "image": "/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-11cae916-a21a-4ce8-b874-aac8e9dcf1ff-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "6-black-pink-s",
        "size": "S",
        "color": "Black/Pink",
        "image": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_te.jpg",
        "image_back": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "6-black-pink-m",
        "size": "M",
        "color": "Black/Pink",
        "image": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_te.jpg",
        "image_back": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "6-black-pink-l",
        "size": "L",
        "color": "Black/Pink",
        "image": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_te.jpg",
        "image_back": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_tee_bac2.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "6-black-pink-xl",
        "size": "XL",
        "color": "Black/Pink",
        "image": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_te.jpg",
        "image_back": "/pink_doe_sha_wht_tee/pink_doe_sha_blk_tee/doe_sha_blk_tee_bac2.jpg",
        "inventory_quantity": 15
      }
    ]
  },
  {
    "id": "7",
    "title": "So New York Emoji Hoodie",
    "slug": "so-ny-emoji-hoodie",
    "price": 55,
    "compare_at_price": null,
    "category": "hoodies",
    "collection": "So New York",
    "collection_slug": "so-new-york",
    "description": "Heavyweight luxury streetwear hoodie featuring the iconic So New York yellow face emoji and collegiate lettering.",
    "specs": [
      "10 oz./yd\u00b2 (US) 16.7 oz /L yd (CA), 70/30 ring-spun cotton/polyester blend 3-end fleece with 100% cotton face, 32 singles",
      "Generous fit with fleece lined hood",
      "Split stitch double-needle sewing on all seams",
      "Twill neck tape",
      "1x1 ribbing at cuffs and waistband",
      "Nickel eyelets"
    ],
    "editorial_story": "Heavyweight luxury streetwear hoodie built for NYC winters.",
    "model_image": "/outer-line-models-uniform-1200x1500/exec-5b39b429-3024-4100-9de4-f573c281da07-4x5.png",
    "images": [
      "/outer-line-models-uniform-1200x1500/exec-5b39b429-3024-4100-9de4-f573c281da07-4x5.png",
      "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie.jpg"
    ],
    "images_back": [
      "/outer-line-models-uniform-1200x1500/exec-19194b5d-1ee6-4fb3-9544-c8fa51f79d0a-4x5.png",
      "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie_bac.jpg"
    ],
    "product_variants": [
      {
        "id": "7-black-white-s",
        "size": "S",
        "color": "Black/White",
        "image": "/outer-line-models-uniform-1200x1500/exec-5b39b429-3024-4100-9de4-f573c281da07-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-19194b5d-1ee6-4fb3-9544-c8fa51f79d0a-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "7-black-white-m",
        "size": "M",
        "color": "Black/White",
        "image": "/outer-line-models-uniform-1200x1500/exec-5b39b429-3024-4100-9de4-f573c281da07-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-19194b5d-1ee6-4fb3-9544-c8fa51f79d0a-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "7-black-white-l",
        "size": "L",
        "color": "Black/White",
        "image": "/outer-line-models-uniform-1200x1500/exec-5b39b429-3024-4100-9de4-f573c281da07-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-19194b5d-1ee6-4fb3-9544-c8fa51f79d0a-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "7-black-white-xl",
        "size": "XL",
        "color": "Black/White",
        "image": "/outer-line-models-uniform-1200x1500/exec-5b39b429-3024-4100-9de4-f573c281da07-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-19194b5d-1ee6-4fb3-9544-c8fa51f79d0a-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "7-black-classic-s",
        "size": "S",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie.jpg",
        "image_back": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "7-black-classic-m",
        "size": "M",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie.jpg",
        "image_back": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "7-black-classic-l",
        "size": "L",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie.jpg",
        "image_back": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "7-black-classic-xl",
        "size": "XL",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie.jpg",
        "image_back": "/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie_bac.jpg",
        "inventory_quantity": 15
      }
    ]
  },
  {
    "id": "8",
    "title": "So New York Emoji Tee",
    "slug": "so-ny-emoji-tee",
    "price": 35,
    "compare_at_price": null,
    "category": "tees",
    "collection": "So New York",
    "collection_slug": "so-new-york",
    "description": "Essential ringspun cotton tee featuring the iconic So New York yellow face emoji and collegiate lettering.",
    "specs": [
      "4.3 oz./yd\u00b2 (US), 7.2 oz./L yd (CA), 100% combed ring-spun cotton, 32 singles",
      "Oatmeal is 99/1 cotton/polyester",
      "Heather Grey is 90/10 cotton/polyester",
      "Regular fit",
      "Self 3/8\u201d shoulder to shoulder binding",
      "3/4\u201d neckband with 1x1 rib",
      "Side seams"
    ],
    "editorial_story": "Designed for the kinetic energy of SoHo and the five boroughs.",
    "model_image": "/outer-line-models-uniform-1200x1500/exec-5aba6f90-c94f-4a3e-8b11-a01d6d1a9d23-4x5.png",
    "images": [
      "/outer-line-models-uniform-1200x1500/exec-5aba6f90-c94f-4a3e-8b11-a01d6d1a9d23-4x5.png",
      "/blk_so_ny_wht_tee/blk_so_ny_wht_tee/so_ny_wht_tee.jpg",
      "/blk_so_ny_blk_tee/blk_so_ny_blk_tee.jpg"
    ],
    "images_back": [
      "/outer-line-models-uniform-1200x1500/exec-cd173aa2-7bc1-4aae-a326-d893b50d8c92-4x5.png",
      "/blk_so_ny_wht_tee/blk_so_ny_wht_tee/so_ny_wht_tee_bac.jpg",
      "/blk_so_ny_blk_tee/blk_so_ny_blk_tee_bac.jpg"
    ],
    "product_variants": [
      {
        "id": "8-white-black-s",
        "size": "S",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5aba6f90-c94f-4a3e-8b11-a01d6d1a9d23-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-cd173aa2-7bc1-4aae-a326-d893b50d8c92-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "8-white-black-m",
        "size": "M",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5aba6f90-c94f-4a3e-8b11-a01d6d1a9d23-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-cd173aa2-7bc1-4aae-a326-d893b50d8c92-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "8-white-black-l",
        "size": "L",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5aba6f90-c94f-4a3e-8b11-a01d6d1a9d23-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-cd173aa2-7bc1-4aae-a326-d893b50d8c92-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "8-white-black-xl",
        "size": "XL",
        "color": "White/Black",
        "image": "/outer-line-models-uniform-1200x1500/exec-5aba6f90-c94f-4a3e-8b11-a01d6d1a9d23-4x5.png",
        "image_back": "/outer-line-models-uniform-1200x1500/exec-cd173aa2-7bc1-4aae-a326-d893b50d8c92-4x5.png",
        "inventory_quantity": 15
      },
      {
        "id": "8-black-classic-s",
        "size": "S",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee.jpg",
        "image_back": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "8-black-classic-m",
        "size": "M",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee.jpg",
        "image_back": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "8-black-classic-l",
        "size": "L",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee.jpg",
        "image_back": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee_bac.jpg",
        "inventory_quantity": 15
      },
      {
        "id": "8-black-classic-xl",
        "size": "XL",
        "color": "Black/Classic",
        "image": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee.jpg",
        "image_back": "/blk_so_ny_blk_tee/blk_so_ny_blk_tee_bac.jpg",
        "inventory_quantity": 15
      }
    ]
  }
];

export function getProductsByCollection(slug: string): Product[] {
  return mockProducts.filter((p) => p.collection_slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}
