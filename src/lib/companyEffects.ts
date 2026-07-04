import { supabase } from "@/lib/supabase";

/** Notify admins that a company completed registration and is awaiting verification (INTAKE_RECEIVED). */
export async function notifyAdminsNewCompanyIntake(
  companyName: string,
  contactEmail: string,
  companyId: string
) {
  const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (!admins?.length) return;

  const inserts = admins.map((admin) => ({
    user_id: admin.id,
    title: "New company registration",
    body: `${companyName} (${contactEmail}) submitted their registration and is awaiting verification. Review in Admin → Employers.`,
    type: "company_intake_received",
    metadata: { companyId, companyName, contactEmail },
  }));

  await supabase.from("notifications").insert(inserts);
}
