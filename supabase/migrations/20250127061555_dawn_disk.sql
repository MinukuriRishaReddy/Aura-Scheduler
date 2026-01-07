/*
  # Set up authentication and email validation
  
  1. Changes
    - Create email validation function for Anurag University emails
    - Add trigger to enforce email validation
*/

-- Create an email validation function
CREATE OR REPLACE FUNCTION public.is_valid_anurag_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if email ends with @anurag.edu.in
  IF NOT email LIKE '%@anurag.edu.in' THEN
    RETURN FALSE;
  END IF;

  -- Check for special accounts
  IF email IN (
    'blockchain@anurag.edu.in',
    'anurag.hackorio@anurag.edu.in',
    'ieee@anurag.edu.in'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check student roll number pattern
  RETURN email ~ '^\d{2}[A-Za-z]{2}\d{3}[A-Za-z]\d{2}@anurag\.edu\.in$';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to validate emails
CREATE OR REPLACE FUNCTION public.validate_anurag_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_valid_anurag_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format. Must be a valid Anurag University email address.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auth.users table
DROP TRIGGER IF EXISTS ensure_valid_email ON auth.users;
CREATE TRIGGER ensure_valid_email
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_anurag_email();