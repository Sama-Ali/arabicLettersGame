import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mabkiogpkhowgxxnjxpy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYmtpb2dwa2hvd2d4eG5qeHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTM0NDIsImV4cCI6MjA3NTY2OTQ0Mn0.XWnym6qHs31ZdpNXunRB8u-Jgxwc6ondbOl42pGt2ik";
export default createClient(supabaseUrl, supabaseKey);
