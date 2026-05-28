/**
 * Custom type declaration for googleapis.
 * The official @types has a broken .d.ts file (syntax error in compute/v1.d.ts)
 * that cannot be parsed by TypeScript. This override provides types for the
 * specific APIs we use (androidpublisher v3).
 */
declare module 'googleapis' {
  interface GoogleAuthOptions {
    credentials: unknown;
    scopes: string[];
  }

  interface GoogleAuth {
    new (options: GoogleAuthOptions): unknown;
  }

  interface ProductPurchase {
    purchaseState?: number;
    orderId?: string;
    [key: string]: unknown;
  }

  interface AndroidPublisherProducts {
    get(params: {
      packageName: string;
      productId: string;
      token: string;
    }): Promise<{ data: ProductPurchase }>;
    acknowledge(params: {
      packageName: string;
      productId: string;
      token: string;
    }): Promise<unknown>;
  }

  interface AndroidPublisher {
    purchases: {
      products: AndroidPublisherProducts;
    };
  }

  export const google: {
    auth: {
      GoogleAuth: GoogleAuth;
    };
    androidpublisher(options: { version: string; auth: unknown }): AndroidPublisher;
  };
}
