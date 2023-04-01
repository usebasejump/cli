CREATE TABLE IF NOT EXISTS public.{{modelName}}
(
    id uuid unique NOT NULL DEFAULT uuid_generate_v4(),
    -- If your model is owned by an account, you want to make sure you have an account_id column
    -- referencing the account table. Make sure you also set permissions appropriately
    account_id uuid not null references accounts(id),
    -- timestamps are useful for auditing
    -- Basejump has some convenience functions defined below for automatically handling these
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    PRIMARY KEY (id)
);


-- protect the timestamps by setting created_at and updated_at to be read-only and managed by a trigger
CREATE TRIGGER set_{{modelName}}_timestamp
    BEFORE INSERT OR UPDATE ON public.{{modelName}}
    FOR EACH ROW
EXECUTE PROCEDURE basejump.trigger_set_timestamps();


-- enable RLS on the table
ALTER TABLE public.{{modelName}} ENABLE ROW LEVEL SECURITY;


-- Because RLS is enabled, this table will NOT be accessible to any users by default
-- You must create a policy for each user that should have access to the table
-- Here are a few example policies that you may find useful when working with Basejump

----------------
-- Authenticated users should be able to read all records regardless of account
----------------
-- create policy "All logged in users can select" on public.{{modelName}}
--     for select
--     to authenticated
--     using (true);

----------------
-- Authenticated AND Anon users should be able to read all records regardless of account
----------------
-- create policy "All authenticated and anonymous users can select" on public.{{modelName}}
--     for select
--     to authenticated, anon
--     using (true);

-------------
-- Users should be able to read records that are owned by an account they belong to
--------------
-- create policy "Account members can select" on public.{{modelName}}
--     for select
--     to authenticated
--     using (
--     (account_id IN ( SELECT basejump.get_accounts_for_current_user()))
--     );


----------------
-- Users should be able to create records that are owned by an account they belong to
----------------
-- create policy "Account members can insert" on public.{{modelName}}
--     for insert
--     to authenticated
--     with check (
--     (account_id IN ( SELECT basejump.get_accounts_for_current_user()))
--     );

---------------
-- Users should be able to update records that are owned by an account they belong to
---------------
-- create policy "Account members can update" on public.{{modelName}}
--     for update
--     to authenticated
--     using (
--     (account_id IN ( SELECT basejump.get_accounts_for_current_user()))
--     );

----------------
-- Users should be able to delete records that are owned by an account they belong to
----------------
-- create policy "Account members can delete" on public.{{modelName}}
--     for delete
--     to authenticated
--     using (
--     (account_id IN ( SELECT basejump.get_accounts_for_current_user()))
--     );

----------------
-- Only account OWNERS should be able to delete records that are owned by an account they belong to
----------------
-- create policy "Account owners can delete" on public.{{modelName}}
--     for delete
--     to authenticated
--     using (
--     (account_id IN ( SELECT basejump.get_accounts_for_current_user("owner")))
--      );

