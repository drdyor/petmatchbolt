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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: upcomingLitters, error: littersError } = await supabase
      .from("litters")
      .select(`
        id,
        expected_whelping,
        status,
        pets!litters_mother_pet_id_fkey(name),
        waitlists(
          user_id,
          position
        )
      `)
      .in("status", ["expected", "born"])
      .gte("expected_whelping", today.toISOString().split('T')[0])
      .lte("expected_whelping", sevenDaysFromNow.toISOString().split('T')[0]);

    if (littersError) throw littersError;

    const notifications: Array<{ user_id: string; type: string; title: string; message: string; link: string }> = [];

    for (const litter of upcomingLitters || []) {
      const whelpingDate = new Date(litter.expected_whelping);
      const daysUntil = Math.ceil((whelpingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const petName = litter.pets?.name || "Unknown";

      if (daysUntil === 3 && litter.status === "expected") {
        for (const waitlist of litter.waitlists || []) {
          notifications.push({
            user_id: waitlist.user_id,
            type: "waitlist",
            title: "Litter Expected Soon",
            message: `${petName}'s litter is expected in 3 days. You're #${waitlist.position} on the waitlist!`,
            link: "/buyer",
          });
        }
      }

      if (daysUntil === 0 && litter.status === "expected") {
        for (const waitlist of litter.waitlists || []) {
          notifications.push({
            user_id: waitlist.user_id,
            type: "waitlist",
            title: "Expected Whelping Date Today",
            message: `${petName}'s litter is expected today! Stay tuned for updates.`,
            link: "/buyer",
          });
        }
      }

      if (litter.status === "born") {
        for (const waitlist of litter.waitlists || []) {
          notifications.push({
            user_id: waitlist.user_id,
            type: "waitlist",
            title: "Puppies/Kittens Born!",
            message: `Great news! ${petName}'s litter has been born. The breeder will contact you soon.`,
            link: "/buyer",
          });
        }
      }
    }

    const { data: preferences } = await supabase
      .from("user_notification_preferences")
      .select("user_id, waitlist_updates")
      .eq("waitlist_updates", true);

    const allowedUsers = new Set((preferences || []).map((p) => p.user_id));

    const filteredNotifications = notifications.filter((n) => allowedUsers.has(n.user_id));

    const uniqueNotifications = [];
    const seen = new Set();

    for (const notif of filteredNotifications) {
      const key = `${notif.user_id}-${notif.title}-${notif.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNotifications.push(notif);
      }
    }

    if (uniqueNotifications.length > 0) {
      const { error: insertError } = await supabase
        .from("user_notifications")
        .insert(uniqueNotifications);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: uniqueNotifications.length,
        message: `Processed ${upcomingLitters?.length || 0} litters, created ${uniqueNotifications.length} notifications`,
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