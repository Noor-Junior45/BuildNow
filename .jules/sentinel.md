## 2025-02-28 - Removed hardcoded API keys
**Vulnerability:** Several sensitive keys (Google Maps API Key, Razorpay Key, and Supabase Anon Key) were hardcoded into the source code (`server.ts`, `src/services/maps/GoogleMapsProvider.ts`, `src/services/razorpayService.ts`, and `src/lib/supabaseClient.ts`), posing a serious security risk as they can be extracted easily by an attacker.
**Learning:** These were left as fallbacks for development without a `.env` file, prioritizing ease of development over security.
**Prevention:** Keys should always be loaded exclusively from environment variables or secure credential stores. We must refrain from placing fallback secrets in the repository and provide a good `.env.example` file instead to assist local setups.
