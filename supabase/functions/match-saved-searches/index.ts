import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: recentListings, error: listingsError } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        type,
        price,
        location,
        created_at,
        pets(species, breed)
      `)
      .eq("status", "live")
      .gte("created_at", oneDayAgo.toISOString());

    if (listingsError) throw listingsError;

    const { data: savedSearches, error: searchesError } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("notify_on_match", true);

    if (searchesError) throw searchesError;

    const notifications: Array<{ user_id: string; type: string; title: string; message: string; link: string }> = [];
    const searchUpdates: Array<{ id: string; last_notified_at: string }> = [];

    for (const search of savedSearches || []) {
      const criteria = search.criteria || {};
      let matchCount = 0;

      for (const listing of recentListings || []) {
        let matches = true;

        if (criteria.species && listing.pets?.species !== criteria.species) {
          matches = false;
        }

        if (criteria.breed && listing.pets?.breed !== criteria.breed) {
          matches = false;
        }

        if (criteria.location && listing.location !== criteria.location) {
          matches = false;
        }

        if (criteria.priceMax) {
          const maxPrice = parseInt(criteria.priceMax) * 100;
          if (listing.price > maxPrice) {
            matches = false;
          }
        }

        if (matches) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        notifications.push({
          user_id: search.user_id,
          type: "match",
          title: "New Matches Found!",
          message: `${matchCount} new listing${matchCount > 1 ? 's' : ''} match${matchCount === 1 ? 'es' : ''} your saved search "${search.name}".`,
          link: "/buyer",
        });

        searchUpdates.push({
          id: search.id,
          last_notified_at: new Date().toISOString(),
        });
      }
    }

    const { data: preferences } = await supabase
      .from("user_notification_preferences")
      .select("user_id, new_matches")
      .eq("new_matches", true);

    const allowedUsers = new Set((preferences || []).map((p) => p.user_id));

    const filteredNotifications = notifications.filter((n) => allowedUsers.has(n.user_id));

    if (filteredNotifications.length > 0) {
      const { error: insertError } = await supabase
        .from("user_notifications")
        .insert(filteredNotifications);

      if (insertError) throw insertError;
    }

    for (const update of searchUpdates) {
      await supabase
        .from("saved_searches")
        .update({ last_notified_at: update.last_notified_at })
        .eq("id", update.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: filteredNotifications.length,
        message: `Checked ${recentListings?.length || 0} new listings against ${savedSearches?.length || 0} saved searches`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});