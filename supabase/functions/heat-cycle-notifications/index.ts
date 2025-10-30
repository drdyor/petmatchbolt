import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HeatEvent {
  pet_id: string;
  event_date: string;
  event_type: string;
}

interface Pet {
  id: string;
  name: string;
  owner_id: string;
}

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: heatEvents, error: eventsError } = await supabase
      .from("heat_events")
      .select("pet_id, event_date, event_type, pets(id, name, owner_id)")
      .eq("event_type", "bleed")
      .order("event_date", { ascending: false });

    if (eventsError) throw eventsError;

    const petLatestBleed = new Map<string, { date: Date; pet: Pet; owner_id: string }>();

    for (const event of heatEvents || []) {
      const petId = event.pet_id;
      if (!petLatestBleed.has(petId)) {
        petLatestBleed.set(petId, {
          date: new Date(event.event_date),
          pet: event.pets,
          owner_id: event.pets.owner_id,
        });
      }
    }

    const notifications: Array<{ user_id: string; type: string; title: string; message: string; link: string }> = [];

    for (const [petId, { date, pet, owner_id }] of petLatestBleed.entries()) {
      const daysSinceBleed = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = daysSinceBleed + 1;

      if (cycleDay === 6) {
        notifications.push({
          user_id: owner_id,
          type: "heat_cycle",
          title: "Fertile Window Approaching",
          message: `${pet.name}'s fertile window starts in 3 days. Consider scheduling progesterone testing.`,
          link: "/breeder",
        });
      } else if (cycleDay === 9) {
        notifications.push({
          user_id: owner_id,
          type: "heat_cycle",
          title: "Fertile Window Started",
          message: `${pet.name} is now in the optimal breeding window (Day 9/21).`,
          link: "/breeder",
        });
      } else if (cycleDay >= 10 && cycleDay <= 13) {
        notifications.push({
          user_id: owner_id,
          type: "heat_cycle",
          title: "Peak Fertility",
          message: `${pet.name} is in peak fertile window - Day ${cycleDay}/21.`,
          link: "/breeder",
        });
      }
    }

    const { data: preferences } = await supabase
      .from("user_notification_preferences")
      .select("user_id, heat_cycle_reminders")
      .eq("heat_cycle_reminders", true);

    const allowedUsers = new Set((preferences || []).map((p) => p.user_id));

    const filteredNotifications = notifications.filter((n) => allowedUsers.has(n.user_id));

    if (filteredNotifications.length > 0) {
      const { error: insertError } = await supabase
        .from("user_notifications")
        .insert(filteredNotifications);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: filteredNotifications.length,
        message: `Processed ${petLatestBleed.size} pets, created ${filteredNotifications.length} notifications`,
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