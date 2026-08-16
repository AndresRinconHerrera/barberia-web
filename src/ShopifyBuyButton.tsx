import React, { useEffect } from 'react';

export default function ShopifyBuyButton() {
  useEffect(() => {
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    
    if (window.ShopifyBuy) {
      if (window.ShopifyBuy.UI) {
        ShopifyBuyInit();
      } else {
        loadScript();
      }
    } else {
      loadScript();
    }

    function loadScript() {
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptURL;
      document.head.appendChild(script);
      script.onload = ShopifyBuyInit;
    }

    function ShopifyBuyInit() {
      const client = window.ShopifyBuy.buildClient({
        domain: 'la-ganga-ybfzkvue.myshopify.com',
        storefrontAccessToken: '6c2295d3affb5da9bcecae6096d0df2d',
      });

      window.ShopifyBuy.UI.onReady(client).then(function (ui: any) {
        ui.createComponent('product', {
          id: '8096747946083',
          node: document.getElementById('product-component-1785789459170'),
          moneyFormat: '%24%7B%7Bamount%7D%7D',
          options: {
            "product": {
              "styles": {
                "button": {
                  "font-family": "Avant Garde, sans-serif",
                  "font-size": "17px",
                  "padding-top": "16.5px",
                  "padding-bottom": "16.5px",
                  ":hover": { "background-color": "#4fbf16" },
                  "background-color": "#58d418",
                  ":focus": { "background-color": "#4fbf16" },
                  "border-radius": "29px",
                  "padding-left": "87px",
                  "padding-right": "87px"
                }
              },
              "buttonDestination": "checkout",
              "contents": { "img": false, "title": false, "price": false },
              "text": { "button": "Comprar Ahora" }
            },
            "cart": {
              "styles": {
                "button": {
                  "background-color": "#58d418",
                  ":hover": { "background-color": "#4fbf16" }
                }
              }
            }
          }
        });
      });
    }
  }, []);

  return <div id="product-component-1785789459170"></div>;
}

// Declaración global para evitar errores de TypeScript con Shopify
declare global {
  interface Window {
    ShopifyBuy: any;
  }
}