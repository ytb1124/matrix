declare namespace Cloudflare {
  interface Env {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
    NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
