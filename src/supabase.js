import { createClient } from '@supabase/supabase-js'

const SUPA_URL = "https://jrvgdrtgbcnldzrdxwgf.supabase.co"
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmdkcnRnYmNubGR6cmR4d2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTU1MDYsImV4cCI6MjEwMzMzMTUwNn0.QJGntFAGMxdeNBIo3oXnfluvUP9vOwOiHOcok6pGcWE"

export const supabase = createClient(SUPA_URL, SUPA_KEY)
