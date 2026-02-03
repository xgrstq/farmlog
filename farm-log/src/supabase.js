import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xhhkwasdwsbtdqggjnll.supabase.co"
const supabaseAnonKey = "sb_publishable_naNNWyLv3MmTq7Hcl-4qQw_Acl3xc72"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
