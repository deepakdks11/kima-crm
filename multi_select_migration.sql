-- Migration to support multi-select for segments and sub-segments

-- 1. Alter segment column to text[] (using text[] for flexibility, or we could define a new array type)
-- Since we are using an ENUM 'lead_segment', we can alter it to lead_segment[] or just text[] to assume flexibility.
-- Given Supabase/Postgres, let's stick to text[] for maximum compatibility with future changes, or convert enum to text.
-- To allow multiple values from the existing enum, we'll change the column type.

ALTER TABLE leads 
  ALTER COLUMN segment TYPE text[] 
  USING ARRAY[segment::text]; -- Convert existing single value to single-item array

ALTER TABLE leads 
  ALTER COLUMN sub_segment TYPE text[] 
  USING CASE 
    WHEN sub_segment IS NULL THEN NULL 
    ELSE ARRAY[sub_segment::text] 
  END;

-- Default to empty array or handled in app? Let's default to NULL or '{}' if preferred, but existing code might expect null. keeping as is.

-- Update comment
COMMENT ON COLUMN leads.segment IS 'Array of segments (Web2, Web3)';
COMMENT ON COLUMN leads.sub_segment IS 'Array of sub-segments';
