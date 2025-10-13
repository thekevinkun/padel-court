import { supabase } from "@/lib/supabase/client";

export default async function TestDB() {
  const { data: courts } = await supabase
    .from("courts")
    .select("*");
    
  return (
    <div className="p-8">
      <h1>Database Test</h1>
      <pre>{JSON.stringify(courts, null, 2)}</pre>
    </div>
  );
}